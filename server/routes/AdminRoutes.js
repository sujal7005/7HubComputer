import { Router } from "express";
import { onlineUsers } from "../index.js";  // Access the global onlineUsers set
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from 'nodemailer';
import twilio from "twilio";

import User from "../models/User.js";
import PreBuiltPC from "../models/PreBuildPC.js";
import RefurbishedLaptop from "../models/RefurbishedLaptop.js";
import MiniPC from "../models/MiniPC.js";
import Order from "../models/Order.js";
import DeviceInfo from "../models/DeviceInfo.js";
import OfficePC from "../models/Office-PC.js";
import LocationInfo from "../models/LocationInfo.js";
import LoginHistory from "../models/LoginHistory.js";
import Sales from "../models/Sales.js";

const router = Router();

// Hardcoded admin credentials (move to environment variables for production)
const adminCredentials = {
  username: "admin",
  password: "admin123",  // This is the hardcoded password
};

// Admin login route
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username matches
    if (username !== adminCredentials.username) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the password matches the plaintext password
    if (password !== adminCredentials.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ username: adminCredentials.username }, process.env.JWT_SECRET || "secretKey", { expiresIn: "1h" });

    // Log the login event with timestamp
    const loginEvent = new LoginHistory({
      username: adminCredentials.username,
      date: new Date().toLocaleString(), // Current date and time
    });

    await loginEvent.save(); // Save login event to the database

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// // OTP verification route
// router.post("/admin/verify-otp", (req, res) => {
//   const { username, emailOtp, phoneOtp } = req.body;

//   try {
//     // Check if OTP matches the one sent to both email and phone
//     if (otpStore[username]) {
//       const storedOtp = otpStore[username];

//       if (storedOtp.emailOtp === parseInt(emailOtp) && storedOtp.phoneOtp === parseInt(phoneOtp)) {
//         // OTPs are valid, generate JWT token
//         const token = jwt.sign({ username: adminCredentials.username }, process.env.JWT_SECRET || "secretKey", { expiresIn: "1h" });

//         // Log the login event with timestamp
//         const loginEvent = {
//           username: adminCredentials.username,
//           date: new Date().toLocaleString(), // Current date and time
//         };
//         loginHistory.unshift(loginEvent); // Add the login event to the history

//         // Clear OTP after successful verification
//         delete otpStore[username];

//         res.json({ token });
//       } else {
//         res.status(401).json({ message: "Invalid OTPs" });
//       }
//     } else {
//       res.status(400).json({ message: "No OTP found for this user" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "OTP verification failed" });
//   }
// });

// Fetch dashboard stats route
router.get("/admin/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const preBuiltCount = await PreBuiltPC.countDocuments();
    const officePCCount = await OfficePC.countDocuments();
    const refurbishedCount = await RefurbishedLaptop.countDocuments();
    const miniPC = await MiniPC.countDocuments();
    const pendingOrders = await Order.countDocuments();
    const totalProducts = preBuiltCount + officePCCount + refurbishedCount + miniPC; // Sum the total products

    const totalOnlineUsers = onlineUsers.size;
    // console.log("Total online users:", totalOnlineUsers);

    res.json({
      totalUsers,
      totalProducts,
      pendingOrders,
      totalOnlineUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Fetch login history route
router.get("/admin/login-history", async (req, res) => {
  try {
    const loginHistory = await LoginHistory.find().sort({ date: -1 }); // Fetch history sorted by most recent
    res.json({ loginHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch login history" });
  }
});

router.delete('/admin/clear-login-history', async (req, res) => {
  try {
    // Delete all login history from the database
    await LoginHistory.deleteMany({});  // This will delete all documents in the 'loginHistory' collection

    // Send a success response
    res.status(200).json({ message: 'All login history has been deleted.' });
  } catch (err) {
    console.error('Error deleting login history:', err);
    res.status(500).json({ message: 'Error deleting login history.' });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post('/admin/users', async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phoneNumber });
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.put('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phoneNumber } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.password = password;

    const updatedUser = await user.save();

    res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/orders/:orderId/delivery-date', async (req, res) => {
  const { orderId } = req.params;
  const { deliveryDate } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryDate },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery date', error });
  }
})

// Update order state (confirm or cancel)
router.put('/orders/:orderId/state', async (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (action === 'confirmed') {
      order.status = 'Confirmed';
    } else if (action === 'cancelled') {
      order.status = 'Cancelled';

      // Get the user associated with this order
      const user = await User.findById(order.userId);

      if (user) {
        const bonusPointsToRemove = order.product.bonuses || 0; // Get bonus points from the order

        if (user.bonusPoints && user.bonusPoints >= bonusPointsToRemove) {
          // If the user has enough bonus points, deduct them
          user.bonusPoints -= bonusPointsToRemove;
          await user.save();
          console.log(`✅ Removed ${bonusPointsToRemove} bonus points from user ${user._id}`);
        } else {
          console.warn(`⚠️ User ${user._id} does not have enough bonus points to deduct`);
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/admin/orders/delete', async (req, res) => {
  const { orderIds } = req.body;

  if (!orderIds || orderIds.length === 0) {
    return res.status(400).json({ message: 'No orders selected for deletion.' });
  }

  try {
    // Delete multiple orders based on orderIds
    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No orders found to delete.' });
    }

    res.status(200).json({ message: 'Orders deleted successfully!' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch all device info
router.get("/admin/device-info", async (req, res) => {
  try {
    const deviceInfos = await DeviceInfo.find();
    res.status(200).json(deviceInfos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch device info" });
  }
});

// Save device info
router.post("/admin/device-info", async (req, res) => {
  try {
    const deviceInfo = new DeviceInfo(req.body);
    await deviceInfo.save();
    res.status(200).json({ message: "Device info saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save device info" });
  }
});

router.delete('/admin/device-info', async (req, res) => {
  try {
    // Delete all device information from the database
    await DeviceInfo.deleteMany({});  // This will delete all documents in the 'deviceInfo' collection

    // Send a success response
    res.status(200).json({ message: 'All device information has been deleted.' });
  } catch (err) {
    console.error('Error deleting device information:', err);
    res.status(500).json({ message: 'Error deleting device information.' });
  }
});

// Fetch all location info
router.get("/admin/location", async (req, res) => {
  try {
    const locationInfos = await LocationInfo.find();
    res.status(200).json(locationInfos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch location info" });
  }
});

// Save location info
router.post("/admin/location", async (req, res) => {
  try {
    const locationInfo = new LocationInfo(req.body);
    await locationInfo.save();
    res.status(200).json({ message: "Location info saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save location info" });
  }
});

router.delete('/admin/location-info', async (req, res) => {
  try {
    // Delete all location information from the database
    await LocationInfo.deleteMany({});  // This will delete all documents in the 'locationInfo' collection

    // Send a success response
    res.status(200).json({ message: 'All location information has been deleted.' });
  } catch (err) {
    console.error('Error deleting location information:', err);
    res.status(500).json({ message: 'Error deleting location information.' });
  }
});

router.get("/admin/sales", async (req, res) => {
  try {
    console.log("🔄 Fetching new orders and updating sales...");

    // 🔍 Fetch all orders
    const orders = await Order.find().lean();

    // ✅ Process orders and create missing sales entries
    for (const order of orders) {
      const existingSale = await Sales.findOne({ orderId: order._id });

      if (!existingSale) {
        const newSale = new Sales({
          orderId: order._id,
          amount: order.totalPrice || 0, // Ensure valid amount
        });

        await newSale.save();
        console.log(`✅ Sale recorded for Order ID: ${order._id}`);
      }
    }

    // 📌 Fetch all sales after processing
    const allSales = await Sales.find().populate("orderId", "date totalPrice");

    if (allSales.length === 0) {
      return res.json({ individualSales: [], salesByMonth: [], totalSales: 0 });
    }

    // 📊 Aggregate sales by month
    const salesByMonth = await Sales.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: { $month: "$orderDetails.date" }, // Group by month
          totalSales: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format month names
    const formattedSales = salesByMonth.map((s) => ({
      month: new Date(2025, s._id - 1).toLocaleString("default", { month: "long" }),
      sales: s.totalSales,
    }));

    // 📊 Calculate total sales
    const totalSales = allSales.reduce((acc, sale) => acc + sale.amount, 0);

    console.log("✅ Sales Data Updated & Fetched Successfully");
    res.json({ individualSales: allSales, salesByMonth: formattedSales, totalSales });

  } catch (error) {
    console.error("❌ Error fetching and updating sales:", error);
    res.status(500).json({ error: "Error fetching sales data" });
  }
});

router.get("/admin/categories", async (req, res) => {
  try {
    const categories = await Order.aggregate([
      { $unwind: "$product" },
      { $group: { _id: "$product.category", totalSales: { $sum: "$totalPrice" } } },
    ]);

    console.log("✅ Category Sales Data:", categories);
    res.json(categories);
  } catch (error) {
    console.error("❌ Error fetching category data:", error);
    res.status(500).json({ error: "Error fetching category data" });
  }
});

export default router;