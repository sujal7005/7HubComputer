import { Router } from "express";
import { onlineUsers } from "../index.js";  // Access the global onlineUsers set
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import twilio from "twilio";

import User from "../models/User.js";
import PreBuiltPC from "../models/PreBuildPC.js";
import RefurbishedLaptop from "../models/RefurbishedLaptop.js";
import MiniPC from "../models/MiniPC.js";
import Order from "../models/Order.js";
import DeviceInfo from "../models/DeviceInfo.js";
import LocationInfo from "../models/LocationInfo.js";
import LoginHistory from "../models/LoginHistory.js";

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
    const refurbishedCount = await RefurbishedLaptop.countDocuments();
    const miniPC = await MiniPC.countDocuments();
    const pendingOrders = await Order.countDocuments();
    const totalProducts = preBuiltCount + refurbishedCount + miniPC; // Sum the total products

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
    const user = await User.find();
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

export default router;