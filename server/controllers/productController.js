import PreBuildPC from "../models/PreBuildPC.js";
import RefurbishedLaptop from "../models/RefurbishedLaptop.js";
import MiniPCs from '../models/MiniPC.js';
import fs from 'fs';
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import MiniPC from "../models/MiniPC.js";

export const getProducts = async (req, res) => {
  const { q, category, price, rating, brand } = req.query;

  try {
    let query = {};

    // Text search
    if (q) {
      const regex = new RegExp(q, 'i'); // 'i' makes it case-insensitive
      query.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price filter (up to the provided price)
    if (price) {
      query.price = { $lte: price };
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: rating };
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }
    
    const prebuildPC = await PreBuildPC.find();
    const refurbishedProducts = await RefurbishedLaptop.find();
    const miniPCs = await MiniPCs.find();

    // Helper function to calculate GST and discount
    const calculatePriceDetails = (product) => {
      const gst = product.price * 0.18; // Example GST rate of 18%
      const discount = product.discount || 0; // Default to 0 if no discount
      const priceWithGST = product.price + gst; // Add GST to the original price
      const finalPrice = priceWithGST - (priceWithGST * discount / 100); // Apply discount
      const roundedPrice = Math.round(finalPrice * 100) / 100; // Round off to 2 decimal places

      return {
        ...product._doc, // Spread the existing product data
        gst,
        discount,
        finalPrice: roundedPrice, // Add the final price after GST and discount
      };
    };

    const prebuildPCWithGSTAndDiscount = prebuildPC.map(calculatePriceDetails);
    const refurbishedProductsWithGSTAndDiscount = refurbishedProducts.map(calculatePriceDetails);
    const miniPCsWithGSTAndDiscount = miniPCs.map(calculatePriceDetails);

    res.json({ 
      prebuildPC: prebuildPCWithGSTAndDiscount,
      refurbishedProducts: refurbishedProductsWithGSTAndDiscount,
      miniPCs: miniPCsWithGSTAndDiscount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseOptions = (key, options) => {
  if (typeof options !== 'object' || options === null) return [];
  const parsedOptions = [];
  for (const [index, value] of Object.entries(options)) {
    if (index === '' || !value) continue; // Skip empty keys or empty values
    try {
      const parsedValue = JSON.parse(value);
      if (parsedValue.value && parsedValue.price) {
        parsedOptions.push(parsedValue);
      }
    } catch (err) {
      console.error(`Error parsing ${key} at index ${index}:`, err);
    }
  }
  return parsedOptions;
};

export const createProducts = async (req, res) => {
  console.log("Request body:", req.body);  // Logs form fields like customId, name, etc.

  const {
    id,
    name,
    price,
    category,
    description,
    popularity,
    type,
    otherTechnicalDetails,
    notes,
    originalPrice,
    brand,
    stock,
    code,
    condition,
    discount,
    bonuses,
    dateAdded,
    customId,
    // Pre-Built PC-specific fields
    platform,
    cpu,
    motherboard,
    ramOptions,
    storage1Options,
    storage2Options,
    liquidcooler,
    graphiccard,
    smps,
    cabinet,
    // Refurbished Laptop-specific fields
    os,
    display,
    storage,
    ram,
  } = req.body;

  // Parse otherTechnicalDetails and notes if they are strings resembling JSON
  if (typeof otherTechnicalDetails === 'string') {
    try {
      req.body.otherTechnicalDetails = JSON.parse(otherTechnicalDetails);
    } catch (err) {
      console.error("Error parsing otherTechnicalDetails:", err);
      return res.status(400).json({ message: 'Invalid otherTechnicalDetails format' });
    }
  }

  // req.body.ramOptions = parseJsonIfString(ramOptions);
  // req.body.storage1Options = parseJsonIfString(storage1Options);
  // req.body.storage2Options = parseJsonIfString(storage2Options);

  const validatedRamOptions = parseOptions('ramOptions', ramOptions);
  const validatedStorage1Options = parseOptions('storage1Options', storage1Options);
  const validatedStorage2Options = parseOptions('storage2Options', storage2Options);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No valid images or image data provided' });
  }

  const productId = id && id.trim() !== ""
    ? id
    : customId && customId.trim() !== ""
      ? customId
      : uuidv4(); // Generate a new UUID if both id and customId are missing

  console.log("Final Product ID:", productId);

  if (!productId || productId.trim() === null) {
    console.error("Product ID (or customId) is missing!");
    return res.status(400).json({ message: 'Product ID (or customId) is required' });
  }

  // Check if a product with the same productId already exists
  try {
    const existingProduct = await RefurbishedLaptop.findOne({ productId });
    if (existingProduct) {
      console.error("Product with this ID already exists:", productId);
      return res.status(400).json({ message: "Product with this ID already exists" });
    }
  } catch (error) {
    console.error("Error checking product ID:", error);
    return res.status(500).json({ message: "Error checking product uniqueness" });
  }

  const imageUrls = req.files.map((file) => file.path); // Collect paths of all uploaded files

  console.log("Product ID is unique, proceeding to save the product.");

  // Validate uploaded files
  if (imageUrls.length === 0) {
    return res.status(400).json({ message: "No valid images or image data provided" });
  }

  // Include specs in your product data
  const productDataWithImages = {
    id,
    productId,
    name,
    price,
    category,
    description,
    popularity,
    type,
    otherTechnicalDetails: req.body.otherTechnicalDetails,
    notes,
    originalPrice,
    brand,
    stock,
    code,
    condition,
    discount,
    bonuses,
    dateAdded,
    customId,
    image: imageUrls,
  };

  if (type === "Pre-Built PC") {
    productDataWithImages.specs = {
      platform: platform || "",
      cpu: cpu || "",
      motherboard: motherboard || "",
      ramOptions: validatedRamOptions,
      storage1Options: validatedStorage1Options,
      storage2Options: validatedStorage2Options,
      liquidcooler: liquidcooler || "",
      graphiccard: graphiccard || "",
      smps: smps || "",
      cabinet: cabinet || "",
    };
  } else if (type === "Refurbished Laptop") {
    productDataWithImages.specs = {
      os: os || "",
      display: display || "",
      GraphicCard: graphiccard,
      storage: storage || "",
      ram: ram || "",
      cpu: cpu || "",
    };
  } else if (type === "Mini PC") {
    productDataWithImages.specs = {
      platform: platform || "",
      cpu: cpu || "",
      motherboard: motherboard || "",
      ramOptions: validatedRamOptions,
      storage1Options: validatedStorage1Options,
      graphiccard: graphiccard || "",
      smps: smps || "",
      cabinet: cabinet || "",
    };
  } else {
    return res.status(400).json({ message: "Invalid product type" });
  }

  console.log("Product Data to Save:", productDataWithImages);

  // Verify that the productId is not null or undefined before creating the new product
  if (!productDataWithImages.id || productDataWithImages.id.trim() === "") {
    return res.status(400).json({ message: "ID is required and cannot be empty" });
  }

  try {
    let newProduct;

    // Check productType and create the appropriate product
    if (type === 'Pre-Built PC') {
      newProduct = new PreBuildPC(productDataWithImages);
      await newProduct.save();
    } else if (type === 'Refurbished Laptop') {
      newProduct = new RefurbishedLaptop(productDataWithImages);
      await newProduct.save();
    } else if (type === "Mini PC"){
      newProduct = new MiniPC(productDataWithImages);
      await newProduct.save();
    } else {
      return res.status(400).json({ message: 'Invalid product type' });
    }
    console.log(newProduct);

    // Return the created product
    res.status(201).json({ newProduct });
  } catch (error) {
    console.error("Product submission error:", error);
    res.status(400).json({ message: error.message });
  }
};

// export const seedDatabase = async () => {
//   try {
//     const product = {
//       type: "Refurbished",
//       customId: "RF-DL-001",
//       productId: 17361575705071846,
//       name: "Refurbished Dell Latitude",
//       description: "A high-quality refurbished laptop ideal for office tasks.",
//       image: ["image1.jpg", "image2.jpg"],
//       brand: "Dell",
//       specs: {
//         cpu: "Intel Core i5",
//         ram: "8GB",
//         storage: "256GB SSD",
//         GraphicCard: "Integrated Intel UHD Graphics",
//         display: "14-inch FHD",
//         os: "Windows 10 Pro",
//       },
//       otherTechnicalDetails: [{ name: "Weight", value: "1.6kg" }],
//       condition: "Excellent",
//       notes: ["Tested and certified", "6-month warranty"],
//       code: "DELL-RF-001",
//       price: 499.99,
//       category: ["Laptops", "Refurbished"],
//     };

//     const existingProduct = await RefurbishedLaptop.findOne({ productId: product.productId });
//     if (existingProduct) {
//       console.log("Product already exists:", existingProduct);
//       return;
//     }

//     const newProduct = new RefurbishedLaptop(product);
//     await newProduct.save();
//     console.log("Product inserted successfully:", newProduct);
//   } catch (error) {
//     console.error("Error seeding database:", error.message);
//   }
// };

// seedDatabase();

export const updateProduct = async (req, res) => {
  const { productType, productId } = req.params;

  console.log("Received productId:", productId);

  const normalizedProductType = productType.toLowerCase().replace(/\s+/g, '-');
  // console.log("Normalized Product Type:", normalizedProductType);

  // console.log("Route Params:", req.params);
  // console.log("Received productId:", productId);
  // console.log("Product Type:", productType);

  // Select the model based on the productType
  let ProductModel;
  if (normalizedProductType === 'refurbished-laptop') {
    ProductModel = RefurbishedLaptop;
  } else if (normalizedProductType === 'pre-built-pc') {
    ProductModel = PreBuildPC;
  } else if (normalizedProductType === 'mini-pc') { // Add support for MiniPC
    ProductModel = MiniPC;
  } else {
    return res.status(400).json({ message: 'Invalid product type' });
  }

  // If productId is numeric, convert it to ObjectId, or ensure it's in the proper format
  let validProductId = productId;

  if (mongoose.Types.ObjectId.isValid(productId)) {
    validProductId = new mongoose.Types.ObjectId(productId);
  } else {
    console.log("Invalid productId format:", productId);
    return res.status(400).json({ message: 'Invalid productId format' });
  }

  console.log("Using valid productId:", validProductId);

  // Now you can query with a valid ObjectId
  try {
    const query = { _id: validProductId }; // Correct ObjectId usage
    console.log("Querying database with:", query);

    const product = await ProductModel.findOne(query);
    console.log("Database response:", product);

    if (!product) {
      console.log('Product not found.');
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle uploaded files
    const files = req.files || [];
    const filePaths = files.map(file => file.path);
    const reviewImageFile = req.body.reviewImageFile || null;
    console.log('Uploaded files:', filePaths);

    // Update reviews if new review data is provided
    if (req.body.reviewerName && req.body.rating && req.body.comment) {
      const newReview = {
        userId: req.body.userId || null,
        reviewerName: req.body.reviewerName,
        rating: Number(req.body.rating),
        comment: req.body.comment,
        reviewimage: reviewImageFile ? reviewImageFile : null, // Save review image if available
      };

      product.reviews.push(newReview);
    }

    // Update product with new data
    const updates = {
      ...req.body,
      image: filePaths.length > 0 ? filePaths : product.image, // Update images if new files are uploaded
      reviews: product.reviews, // Ensure the reviews array is updated
      otherTechnicalDetails: Array.isArray(req.body.otherTechnicalDetails)
        ? req.body.otherTechnicalDetails
        : JSON.parse(req.body.otherTechnicalDetails) // Correcting the format if it's a string
    };

    const updatedProduct = await ProductModel.findOneAndUpdate(query, updates, {
      new: true,
    });
    console.log('Updated product:', updatedProduct);

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res, next) => {
  const { productId, productType } = req.params;

  try {
    // Determine the model to use based on the productType
    let ProductModel;
    if (productType === 'prebuild') {
      ProductModel = PreBuildPC;
    } else if (productType === 'refurbished') {
      ProductModel = RefurbishedLaptop;
    } else if (productType === "mini-pc") { // Add support for MiniPC
      ProductModel = MiniPC;
    } else {
      return res.status(400).json({ error: "Invalid product type" });
    }

    // Find the product in the database by ID
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete associated images from the file system (if any)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((image) => {
        const imagePath = path.resolve('uploads', image); // Assuming 'image' is the filename stored in DB
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the image file
        }
      });
    }

    // Delete the product from the database
    await ProductModel.findByIdAndDelete(productId);

    // Call next middleware if no error
    next();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};