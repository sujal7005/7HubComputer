import PreBuildPC from "../models/PreBuildPC.js";
import OfficePC from "../models/Office-PC.js";
import RefurbishedLaptop from "../models/RefurbishedLaptop.js";
import MiniPCs from '../models/MiniPC.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const calculatePriceDetails = (product, selectedSpecs) => {
  if (!product || typeof product.price !== "number") {
    console.error("Invalid product data:", product);
    return null;
  }

  const gstRate = 0.18; // 18% GST
  const discount = product.discount || 0; // Default to 0 if undefined
  const gst = product.price * gstRate;
  let finalPrice = product.price + gst;

  // Add the selected specs prices
  if (selectedSpecs) {
    Object.entries(selectedSpecs).forEach(([category, selectedValue]) => {
      const specOptions = product.specs[category];
      if (specOptions) {
        const selectedOption = specOptions.find(option => option._id === selectedValue);
        if (selectedOption) {
          finalPrice += selectedOption.price || 0;
        }
      }
    });
  }

  const priceWithGST = finalPrice;
  const finalPriceAfterDiscount = priceWithGST - (priceWithGST * discount / 100);
  const roundedPrice = Math.round(finalPriceAfterDiscount * 100) / 100;

  return {
    ...product._doc, // Spread existing product data
    gst,
    discount,
    finalPrice: roundedPrice,
  };
};

export const getProducts = async (req, res) => {
  const { q, category, price, rating, brand, selectedSpecs, page = 1, limit = 10 } = req.query;
  console.log("Received Query Params:", req.query);

  try {
    let query = {};

    // 🔍 Search by name or description (case-insensitive)
    if (q && q.trim() !== "") {
      const regex = new RegExp(q, "i"); // Case-insensitive regex search

      query.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { brand: { $regex: regex } },
        { type: { $regex: regex } },
        { condition: { $regex: regex } },
        { code: { $regex: regex } },
        { os: { $regex: regex } },
        { display: { $regex: regex } },
        { storage: { $regex: regex } },
        { ram: { $regex: regex } },
        { platform: { $regex: regex } },
        { cpu: { $regex: regex } },
        { motherboard: { $regex: regex } },
        { "ramOptions.label": { $regex: regex } },
        { "storage1Options.label": { $regex: regex } },
        { "storage2Options.label": { $regex: regex } },
        { "graphiccard.label": { $regex: regex } },
        { "liquidCooler.label": { $regex: regex } },
        { "smps.label": { $regex: regex } },
        { "cabinet.label": { $regex: regex } },
      ];
    }

    // 🔍 Apply additional filters only if values are valid
    if (category && category !== "all") query.category = category;
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };
    if (rating && !isNaN(rating)) query.rating = { $gte: Number(rating) };
    if (brand && brand !== "all") query.brand = brand;

    // 🔢 Convert pagination values to numbers
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skipNumber = (pageNumber - 1) * limitNumber;

    console.log("Final Query Conditions:", query);

    // 📦 Fetch filtered data with pagination
    const prebuildPC = await PreBuildPC.find(query).skip(skipNumber).limit(limitNumber);
    const officePC = await OfficePC.find(query).skip(skipNumber).limit(limitNumber);
    const refurbishedProducts = await RefurbishedLaptop.find(query).skip(skipNumber).limit(limitNumber);
    const miniPCs = await MiniPCs.find(query).skip(skipNumber).limit(limitNumber);

    console.log("Products Fetched:", {
      total: prebuildPC.length + officePC.length + refurbishedProducts.length + miniPCs.length,
      prebuildPC: prebuildPC.length,
      officePC: officePC.length,
      refurbishedProducts: refurbishedProducts.length,
      miniPCs: miniPCs.length,
    });

    // 🏷️ Add GST and Discount Calculation
    const prebuildPCWithGSTAndDiscount = prebuildPC.map(product =>
      calculatePriceDetails(product, selectedSpecs)
    );
    const officePCWithGSTAndDiscount = officePC.map(product =>
      calculatePriceDetails(product, selectedSpecs)
    );
    const refurbishedProductsWithGSTAndDiscount = refurbishedProducts.map(product =>
      calculatePriceDetails(product, selectedSpecs)
    );
    const miniPCsWithGSTAndDiscount = miniPCs.map(product =>
      calculatePriceDetails(product, selectedSpecs)
    );

    // 📤 Send response
    res.json({
      prebuildPC: prebuildPCWithGSTAndDiscount,
      officePC: officePCWithGSTAndDiscount,
      refurbishedProducts: refurbishedProductsWithGSTAndDiscount,
      miniPCs: miniPCsWithGSTAndDiscount,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  const {
    id, name, price, category, description, popularity, type, otherTechnicalDetails, notes,
    originalPrice, brand, stock, code, condition, discount, bonuses, dateAdded, customId,
    keyFeatures, specifications, additionalImages, videos,
    platform, cpu, motherboard, ramOptions, storage1Options, storage2Options,
    liquidcooler, graphiccard, smps, cabinet,
    os, display, storage, ram,
  } = req.body;

  // Parse otherTechnicalDetails
  let parsedOtherTechnicalDetails = [];
  if (otherTechnicalDetails) {
    if (typeof otherTechnicalDetails === 'string') {
      try {
        parsedOtherTechnicalDetails = JSON.parse(otherTechnicalDetails);
      } catch (err) {
        console.error("Error parsing otherTechnicalDetails:", err);
      }
    } else if (Array.isArray(otherTechnicalDetails)) {
      parsedOtherTechnicalDetails = otherTechnicalDetails;
    }
  }

  // Parse keyFeatures
  let parsedKeyFeatures = [];
  if (keyFeatures) {
    if (typeof keyFeatures === 'string') {
      try {
        parsedKeyFeatures = JSON.parse(keyFeatures);
        console.log("Parsed keyFeatures from string:", parsedKeyFeatures);
      } catch (err) {
        console.error("Error parsing keyFeatures string:", err);
        parsedKeyFeatures = [{ title: keyFeatures, description: "" }];
      }
    } else if (Array.isArray(keyFeatures)) {
      parsedKeyFeatures = keyFeatures;
    }
  }
  
  // Parse specifications
  let parsedSpecifications = [];
  if (specifications) {
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
        console.log("Parsed specifications from string:", parsedSpecifications);
      } catch (err) {
        console.error("Error parsing specifications string:", err);
        parsedSpecifications = [];
      }
    } else if (Array.isArray(specifications)) {
      parsedSpecifications = specifications;
    }
  }
  
  // Parse videos
  let parsedVideos = [];
  if (videos) {
    if (typeof videos === 'string') {
      try {
        parsedVideos = JSON.parse(videos);
        console.log("Parsed videos from string:", parsedVideos);
      } catch (err) {
        console.error("Error parsing videos string:", err);
        parsedVideos = [];
      }
    } else if (Array.isArray(videos)) {
      parsedVideos = videos;
    }
  }

  // Parse options for RAM and Storage
  const parseOptions = (options) => {
    if (typeof options !== 'object' || options === null) return [];
    const parsedOptions = [];
    for (const [index, value] of Object.entries(options)) {
      if (index === '' || !value) continue;
      try {
        const parsedValue = JSON.parse(value);
        if (parsedValue.value && parsedValue.price) {
          parsedOptions.push(parsedValue);
        }
      } catch (err) {
        console.error(`Error parsing option:`, err);
      }
    }
    return parsedOptions;
  };

  const validatedRamOptions = parseOptions(ramOptions);
  const validatedStorage1Options = parseOptions(storage1Options);
  const validatedStorage2Options = parseOptions(storage2Options);

  // Handle files - FIX: req.files is an object with field names as keys
  let mainImageUrls = [];
  let additionalImageUrls = [];

  if (req.files) {
    // Handle case where files are uploaded with field names
    if (req.files.image) {
      // If image is an array
      if (Array.isArray(req.files.image)) {
        mainImageUrls = req.files.image.map(file => file.path);
      } else {
        mainImageUrls = [req.files.image.path];
      }
    }
    
    if (req.files.additionalImages) {
      if (Array.isArray(req.files.additionalImages)) {
        additionalImageUrls = req.files.additionalImages.map(file => file.path);
      } else {
        additionalImageUrls = [req.files.additionalImages.path];
      }
    }
  }

  // Also handle case where files might be in req.files as array (old format)
  if (Array.isArray(req.files) && req.files.length > 0) {
    const mainFiles = req.files.filter(file => file.fieldname === 'image');
    const additionalFiles = req.files.filter(file => file.fieldname === 'additionalImages');
    
    if (mainFiles.length > 0) {
      mainImageUrls = mainFiles.map(file => file.path);
    }
    if (additionalFiles.length > 0) {
      additionalImageUrls = additionalFiles.map(file => file.path);
    }
  }

  if (mainImageUrls.length === 0) {
    return res.status(400).json({ message: 'No valid images or image data provided' });
  }

  const productId = id && id.trim() !== ""
    ? id
    : customId && customId.trim() !== ""
      ? customId
      : uuidv4();

  if (!productId || productId.trim() === null) {
    console.error("Product ID (or customId) is missing!");
    return res.status(400).json({ message: 'Product ID (or customId) is required' });
  }

  // Check if product already exists
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

  console.log("Product ID is unique, proceeding to save the product.");

  // Build product data
  const productDataWithImages = {
    id, productId, name, price, category, description, popularity, type,
    otherTechnicalDetails: parsedOtherTechnicalDetails,
    notes: notes ? (typeof notes === 'string' ? JSON.parse(notes) : notes) : [],
    originalPrice, brand,
    stock: stock === "true" || stock === true,
    code, condition, discount, bonuses, dateAdded, customId, 
    image: mainImageUrls,
    additionalImages: additionalImageUrls,
    keyFeatures: parsedKeyFeatures,
    specifications: parsedSpecifications,
    videos: parsedVideos,
  };

  // Add specs based on product type
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
  } else if (type === "Mini PC" || type === "Office PC") {
    productDataWithImages.specs = {
      platform: platform || "",
      cpu: cpu || "",
      motherboard: motherboard || "",
      ram: ram || "",
      storage: storage || "",
      graphiccard: graphiccard || "",
      smps: smps || "",
      cabinet: cabinet || "",
    };
  } else {
    return res.status(400).json({ message: "Invalid product type" });
  }

  console.log("Product Data to Save:", JSON.stringify(productDataWithImages, null, 2));

  try {
    let newProduct;

    if (type === 'Pre-Built PC') {
      newProduct = new PreBuildPC(productDataWithImages);
    } else if (type === 'Refurbished Laptop') {
      newProduct = new RefurbishedLaptop(productDataWithImages);
    } else if (type === "Mini PC") {
      newProduct = new MiniPCs(productDataWithImages);
    } else if (type === "Office PC") {
      newProduct = new OfficePC(productDataWithImages);
    } else {
      return res.status(400).json({ message: 'Invalid product type' });
    }

    await newProduct.save();
    res.status(201).json({ newProduct });
  } catch (error) {
    console.error("Product submission error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { productType, productId } = req.params;

  const normalizedProductType = productType.toLowerCase().replace(/\s+/g, '-');

  // Select the model based on the productType
  let ProductModel;
  if (normalizedProductType === 'refurbished-laptop') {
    ProductModel = RefurbishedLaptop;
  } else if (normalizedProductType === 'pre-built-pc') {
    ProductModel = PreBuildPC;
  } else if (normalizedProductType === 'mini-pc') {
    ProductModel = MiniPCs;
  } else if (normalizedProductType === 'office-pc') {
    ProductModel = OfficePC;
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
    const query = { _id: validProductId };
    console.log("Querying database with:", query);

    const product = await ProductModel.findOne(query);
    console.log("Database response:", product);

    if (!product) {
      console.log('Product not found.');
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle uploaded files - req.files is an object with fields, not an array
    const files = req.files || {};
    
    // Get files from different fields
    const mainImageFiles = files.image || [];
    const additionalImageFiles = files.additionalImages || [];

    const mainImageUrls = mainImageFiles.map(file => file.path);
    const additionalImageUrls = additionalImageFiles.map(file => file.path);

    console.log('Uploaded files:', { 
      mainImages: mainImageUrls.length, 
      additionalImages: additionalImageUrls.length 
    });

    // Update reviews if new review data is provided
    if (req.body.reviewerName && req.body.rating && req.body.comment) {
      const newReview = {
        userId: req.body.userId || null,
        reviewerName: req.body.reviewerName,
        rating: Number(req.body.rating),
        comment: req.body.comment,
        reviewimage: req.body.reviewImageFile || null,
      };

      product.reviews.push(newReview);
    }

    // Handle keyFeatures - parse if string, otherwise use as is
    let parsedKeyFeatures = product.keyFeatures || [];
    if (req.body.keyFeatures !== undefined) {
      if (typeof req.body.keyFeatures === 'string') {
        try {
          const parsed = JSON.parse(req.body.keyFeatures);
          parsedKeyFeatures = Array.isArray(parsed) ? parsed : [];
          console.log("Parsed keyFeatures from string:", parsedKeyFeatures);
        } catch (err) {
          console.error("Error parsing keyFeatures string:", err);
          parsedKeyFeatures = [];
        }
      } else if (Array.isArray(req.body.keyFeatures)) {
        parsedKeyFeatures = req.body.keyFeatures
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            title: item.title || "",
            description: item.description || ""
          }));
        console.log("Parsed keyFeatures from array:", parsedKeyFeatures);
      }
    }
    
    // Handle specifications - parse if string, otherwise use as is
    let parsedSpecifications = product.specifications || [];
    if (req.body.specifications !== undefined) {
      if (typeof req.body.specifications === 'string') {
        try {
          const parsed = JSON.parse(req.body.specifications);
          parsedSpecifications = Array.isArray(parsed) ? parsed : [];
          console.log("Parsed specifications from string:", parsedSpecifications);
        } catch (err) {
          console.error("Error parsing specifications string:", err);
          parsedSpecifications = [];
        }
      } else if (Array.isArray(req.body.specifications)) {
        parsedSpecifications = req.body.specifications
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            title: item.title || "",
            specs: Array.isArray(item.specs) 
              ? item.specs.map(s => ({ name: s.name || "", value: s.value || "" }))
              : []
          }));
        console.log("Parsed specifications from array:", parsedSpecifications);
      }
    }
    
    // Handle videos - parse if string, otherwise use as is
    let parsedVideos = product.videos || [];
    if (req.body.videos !== undefined) {
      if (typeof req.body.videos === 'string') {
        try {
          const parsed = JSON.parse(req.body.videos);
          parsedVideos = Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.error("Error parsing videos string:", err);
          parsedVideos = [];
        }
      } else if (Array.isArray(req.body.videos)) {
        parsedVideos = req.body.videos
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            title: item.title || "",
            url: item.url || ""
          }));
      }
    }

    // Handle otherTechnicalDetails
    let parsedOtherTechnicalDetails = product.otherTechnicalDetails || [];
    if (req.body.otherTechnicalDetails !== undefined) {
      if (typeof req.body.otherTechnicalDetails === 'string') {
        try {
          const parsed = JSON.parse(req.body.otherTechnicalDetails);
          parsedOtherTechnicalDetails = Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.error("Error parsing otherTechnicalDetails:", err);
          parsedOtherTechnicalDetails = [];
        }
      } else if (Array.isArray(req.body.otherTechnicalDetails)) {
        parsedOtherTechnicalDetails = req.body.otherTechnicalDetails;
      }
    }

    // Build updates object
    const updates = {};

    // Only add fields if they are provided in the request
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.price !== undefined) updates.price = req.body.price;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.brand !== undefined) updates.brand = req.body.brand;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.condition !== undefined) updates.condition = req.body.condition;
    if (req.body.code !== undefined) updates.code = req.body.code;
    if (req.body.popularity !== undefined) updates.popularity = req.body.popularity;
    if (req.body.originalPrice !== undefined) updates.originalPrice = req.body.originalPrice;
    if (req.body.discount !== undefined) updates.discount = req.body.discount;
    if (req.body.bonuses !== undefined) updates.bonuses = req.body.bonuses;
    if (req.body.dateAdded !== undefined) updates.dateAdded = req.body.dateAdded;
    
    // Handle stock
    if (req.body.stock !== undefined) {
      updates.inStock = req.body.stock === "false" || req.body.stock === false ? false : true;
    }

    // Handle images
    if (mainImageUrls.length > 0) {
      updates.image = mainImageUrls;
    }

    // Handle additional images - append new ones to existing
    if (additionalImageUrls.length > 0) {
      updates.additionalImages = [...(product.additionalImages || []), ...additionalImageUrls];
    }

    // CRITICAL FIX: Always set these fields even if empty array
    updates.keyFeatures = parsedKeyFeatures;
    updates.specifications = parsedSpecifications;
    updates.videos = parsedVideos;
    updates.otherTechnicalDetails = parsedOtherTechnicalDetails;

    // Handle specs based on product type
    if (req.body.cpu !== undefined || req.body.ram !== undefined || req.body.storage !== undefined) {
      // Initialize specs object
      const specs = { ...(product.specs || {}) };
      
      // Update individual spec fields if provided
      if (req.body.cpu !== undefined) specs.cpu = req.body.cpu;
      if (req.body.ram !== undefined) specs.ram = req.body.ram;
      if (req.body.storage !== undefined) specs.storage = req.body.storage;
      if (req.body.graphiccard !== undefined) specs.graphiccard = req.body.graphiccard;
      if (req.body.display !== undefined) specs.display = req.body.display;
      if (req.body.os !== undefined) specs.os = req.body.os;
      if (req.body.platform !== undefined) specs.platform = req.body.platform;
      if (req.body.motherboard !== undefined) specs.motherboard = req.body.motherboard;
      if (req.body.smps !== undefined) specs.smps = req.body.smps;
      if (req.body.cabinet !== undefined) specs.cabinet = req.body.cabinet;
      
      updates.specs = specs;
    }

    // If specs is provided as a JSON string, parse it
    if (req.body.specs !== undefined) {
      if (typeof req.body.specs === 'string') {
        try {
          updates.specs = JSON.parse(req.body.specs);
        } catch (err) {
          console.error("Error parsing specs:", err);
        }
      } else if (typeof req.body.specs === 'object') {
        updates.specs = req.body.specs;
      }
    }

    console.log("Updates to apply:", JSON.stringify(updates, null, 2));

    const updatedProduct = await ProductModel.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });
    
    console.log('Updated product successfully');
    console.log('Updated keyFeatures:', updatedProduct.keyFeatures);
    console.log('Updated specifications:', updatedProduct.specifications);
    
    res.status(200).json(updatedProduct);
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
    } else if (productType === "mini-pc") {
      ProductModel = MiniPCs;
    } else if (productType === "office-pc") {
      ProductModel = OfficePC;
    } else {
      return res.status(400).json({ error: "Invalid product type" });
    }

    // Find the product in the database by ID
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete associated images from the file system (if any)
    const allImages = [
      ...(product.image || []),
      ...(product.additionalImages || [])
    ];
    
    allImages.forEach((image) => {
      // Extract filename from path
      const filename = path.basename(image);
      const imagePath = path.resolve('uploads', filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log(`Deleted image: ${imagePath}`);
      }
    });

    // Delete the product from the database
    await ProductModel.findByIdAndDelete(productId);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};

export const downloadQuotation = async (req, res) => {
  const productId = req.params.id;

  // Get the current directory of this script
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid Product ID' });
  }

  try {
    let product = await PreBuildPC.findById(productId) || await MiniPCs.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${product._id}_quotation.pdf`);

    doc.pipe(res);

    // Styling Constants
    const styles = {
      colors: { primary: '#2c3e50', accent: '#e74c3c', text: '#2c3e50', background: '#f8f9fa' },
      fonts: { header: 'Helvetica-Bold', body: 'Helvetica' },
      spacing: { sectionGap: 30, lineHeight: 20, paragraphGap: 15 }
    };

    // Add Company Logo
    const logoPath = path.resolve(__dirname, '..', 'assets', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }

    // Header Section
    doc.fillColor(styles.colors.primary)
      .fontSize(20)
      .font(styles.fonts.header)
      .text('7HubComputer', 110, 57)
      .fontSize(10)
      .text('123 Main Street', 400, 65, { align: 'right' })
      .text('City, State, ZIP Code', 400, 80, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString()}`, 400, 95, { align: 'right' });

    let yPosition = 130; // Initial content position

    // Draw Image Box (Left Side)
    const productImagePath = path.resolve(__dirname, '..', 'public', 'products', Array.isArray(product.image) ? product.image[0] : product.image);
    if (fs.existsSync(productImagePath)) {
      doc.rect(50, yPosition, 200, 200).stroke(styles.colors.primary);
      doc.image(productImagePath, 60, yPosition + 10, { width: 180 });
    }

    // Product Price (Below Image)
    yPosition += 220;
    doc.font(styles.fonts.header).fontSize(14).fillColor(styles.colors.accent)
      .text(`Price: ₹${product.finalPrice}`, 60, yPosition);

    // Right Side - Product Details
    let rightColumnX = 280;
    let detailsY = 130;

    doc.font(styles.fonts.header).fontSize(12).fillColor(styles.colors.primary)
      .text('Product Details:', rightColumnX, detailsY);

    detailsY += 20;

    // Product Name (Handles long text)
    doc.font(styles.fonts.body).fontSize(10).fillColor(styles.colors.text);
    const productNameHeight = doc.heightOfString(product.name, { width: 250 });

    doc.text(`Product Name: ${product.name}`, rightColumnX, detailsY, { width: 250 });
    detailsY += productNameHeight + 10;

    // Category & Condition
    doc.text(`Category: ${product.category || 'N/A'}`, rightColumnX, detailsY)
      .text(`Condition: ${product.condition || 'New'}`, rightColumnX, detailsY + 15);

    yPosition = Math.max(yPosition, detailsY + 50) + 30;

    // Technical Specifications
    doc.font(styles.fonts.header).fontSize(14).fillColor(styles.colors.accent)
      .text('Technical Specifications', 50, yPosition);

    yPosition += 20;
    doc.font(styles.fonts.body).fontSize(10).fillColor(styles.colors.text);

    if (product.specs) {
      doc.rect(50, yPosition, 500, 25).fill('#f0f0f0').stroke();
      doc.fillColor('#000').text('Specification', 60, yPosition + 7)
        .text('Details', 250, yPosition + 7);
      yPosition += 30;

      for (const [key, value] of Object.entries(product.specs)) {
        doc.rect(50, yPosition, 500, 25).stroke();

        doc.fillColor(styles.colors.text)
          .text(key, 60, yPosition + 7, { width: 180 });

        doc.fillColor(styles.colors.primary)
          .text(Array.isArray(value) ? value.map(v => String(v.value)).join(', ') : String(value),
            250, yPosition + 7, { width: 280 });

        yPosition += 30;
      }
    }

    const pageHeight = doc.page.height; // Get page height
    const marginBottom = 50; // Adjust based on footer/header margins
    const lineHeight = 20; // Line height for spacing
    const sectionSpacing = 30; // Space before new sections
    
    // Function to check space before adding content
    const checkPageBreak = (additionalHeight = lineHeight) => {
      if (yPosition + additionalHeight > pageHeight - marginBottom) {
        doc.addPage(); // Add a new page if not enough space
        yPosition = 50; // Reset yPosition for the new page
      }
    };
    
    // ** Add Space Before "Additional Features" **
    yPosition += sectionSpacing; 
    checkPageBreak(40); // Ensure space before adding new section
    
    // Additional Features
    if (product.otherTechnicalDetails?.length) {
      doc.font(styles.fonts.header).fillColor(styles.colors.accent)
        .text('Additional Features:', 50, yPosition);
      yPosition += 15;
    
      doc.font(styles.fonts.body).fillColor(styles.colors.text);
      product.otherTechnicalDetails.forEach(detail => {
        checkPageBreak(); // Check space before adding each line
        doc.text(`• ${detail.name}: ${detail.value}`, 60, yPosition);
        yPosition += lineHeight;
      });
    } else {
      doc.font(styles.fonts.header).fillColor(styles.colors.accent)
        .text('Additional Features:', 50, yPosition);
      yPosition += 20;
    
      doc.font(styles.fonts.body).fillColor(styles.colors.text)
        .text('No additional features available.', 60, yPosition);
    }
    
    // Notes Section
    yPosition += sectionSpacing; // Add space before "Important Notes"
    checkPageBreak(40);
    doc.font(styles.fonts.header).fillColor(styles.colors.accent)
      .text('Important Notes:', 50, yPosition);
    yPosition += 15;
    
    if (product.notes?.length) {
      doc.font(styles.fonts.body).fillColor(styles.colors.text);
      product.notes.forEach((note, index) => {
        checkPageBreak();
        doc.text(`${index + 1}. ${note}`, 60, yPosition);
        yPosition += lineHeight;
      });
    } else {
      doc.font(styles.fonts.body).fillColor(styles.colors.text)
        .text('No additional Notes are available.', 60, yPosition, { width: 480 });
    }    

    // About Us Section
    yPosition += 30;
    doc.rect(50, yPosition, 500, 80).fill(styles.colors.background);
    doc.fillColor(styles.colors.primary).font(styles.fonts.header)
      .text('About 7HubComputer:', 60, yPosition + 10);
    doc.font(styles.fonts.body).fillColor(styles.colors.text).fontSize(9)
      .text('We specialize in providing high-quality computer systems and exceptional customer service.', 60, yPosition + 30, { width: 480 })
      .text('Contact: support@7hubcomputer.com | Phone: +91 98765 43210', 60, yPosition + 50);

    // Footer
    doc.fontSize(8).fillColor('#95a5a6')
      .text('This is a computer-generated document - signature not required', 50, 780, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating quotation PDF' });
  }
};