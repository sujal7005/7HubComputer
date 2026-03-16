import { Router } from "express";
import Discount from "../models/Discount.js"; 
import User from "../models/User.js";

const router = Router();

// CREATE Discount Code (POST)
router.post("/discounts", async (req, res) => {
  try {
    const { code, discountType, value, expirationDate, minPurchase, maxDiscount } = req.body;

    // Validate required fields
    if (!code || !discountType || !value) {
      return res.status(400).json({ error: "Code, discount type, and value are required." });
    }

    // Check if discount code already exists
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({ error: "Discount code already exists." });
    }

    // Create new discount
    const newDiscount = new Discount({
      code: code.toUpperCase(), // Store codes in uppercase for consistency
      discountType,
      value: Number(value),
      expirationDate: expirationDate || null,
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      isActive: true
    });

    await newDiscount.save();

    res.status(201).json({ 
      message: "Discount code created successfully!", 
      discount: newDiscount 
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET All Discounts
router.get("/discounts", async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 }); // Fetch all discounts, newest first
    res.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET Discount by Code
router.get("/discounts/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const discount = await Discount.findOne({ code: code.toUpperCase() });

    if (!discount) {
      return res.status(404).json({ error: "Discount code not found." });
    }

    res.json(discount);
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Apply Discount Code
router.post("/apply-discount", async (req, res) => {
  console.log("Discount route hit");
  try {
    const { code, totalAmount } = req.body;
    console.log("Received data:", code, totalAmount);

    if (!code) {
      return res.status(400).json({ error: "Discount code is required." });
    }

    // Check in both Discount collection and User collection
    let discount = await Discount.findOne({ code: code.toUpperCase() });

    if (!discount) {
      const userWithDiscount = await User.findOne({ discountCode: code.toUpperCase() });

      if (userWithDiscount) {
        discount = {
          code: userWithDiscount.discountCode,
          expirationDate: userWithDiscount.discountExpiresAt,
          discountType: "fixed", // Assume a fixed discount for new users
          value: 500, // Example: ₹500 discount for new users
          minPurchase: 5000, // Example: Minimum purchase requirement
          maxDiscount: 500,
        };
      }
    }

    console.log("Found discount:", discount);

    if (!discount) {
      return res.status(404).json({ error: "Invalid discount code." });
    }

    // Check if the discount has expired
    if (discount.expirationDate && new Date() > new Date(discount.expirationDate)) {
      return res.status(400).json({ error: "Discount code has expired." });
    }

    // Check minimum purchase requirement
    if (discount.minPurchase > totalAmount) {
      return res.status(400).json({
        error: `Minimum purchase of ₹${discount.minPurchase} required.`,
      });
    }

    let discountValue = 0;
    if (discount.discountType === "fixed") {
      discountValue = discount.value;
    } else if (discount.discountType === "percentage") {
      discountValue = (totalAmount * discount.value) / 100;
      if (discount.maxDiscount) {
        discountValue = Math.min(discountValue, discount.maxDiscount);
      }
    }

    const discountedPrice = Math.max(totalAmount - discountValue, 0);

    res.json({ discountedPrice, discountValue });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE Discount Code
router.put("/discounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // If code is being updated, convert to uppercase
    if (updatedData.code) {
      updatedData.code = updatedData.code.toUpperCase();
    }

    const updatedDiscount = await Discount.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedDiscount) {
      return res.status(404).json({ error: "Discount code not found." });
    }

    res.json({ message: "Discount updated successfully!", updatedDiscount });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE Discount Code
router.delete("/discounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDiscount = await Discount.findByIdAndDelete(id);

    if (!deletedDiscount) {
      return res.status(404).json({ error: "Discount code not found." });
    }

    res.json({ message: "Discount deleted successfully!" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;