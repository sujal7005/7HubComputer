// server/controllers/accessoryController.js
import Accessory from '../models/Accessory.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/accessories/');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'accessory-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware for handling multiple image uploads
export const uploadImages = upload.array('images', 5);

// @desc    Get all accessories with filtering, sorting, and pagination
// @route   GET /api/accessories
// @access  Public
export const getAccessories = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      connectivity,
      inStock,
      sortBy,
      page = 1,
      limit = 12,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (connectivity) filter.connectivity = connectivity;
    if (inStock) filter.inStock = inStock === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Accessory.countDocuments(filter);

    // Execute query
    const accessories = await Accessory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: accessories.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: accessories
    });
  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories',
      error: error.message
    });
  }
};

// @desc    Get single accessory by ID
// @route   GET /api/accessories/:id
// @access  Public
export const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      data: accessory
    });
  } catch (error) {
    console.error('Error fetching accessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessory',
      error: error.message
    });
  }
};

// @desc    Create new accessory with image upload
// @route   POST /api/accessories
// @access  Admin
export const createAccessory = async (req, res) => {
  try {
    uploadImages(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      try {
        // Log received data for debugging
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files);

        const accessoryData = { ...req.body };
        
        // Parse JSON fields if they're sent as strings
        if (accessoryData.specs) {
          try {
            accessoryData.specs = JSON.parse(accessoryData.specs);
          } catch (e) {
            console.error('Error parsing specs:', e);
          }
        }
        
        if (accessoryData.features) {
          try {
            accessoryData.features = JSON.parse(accessoryData.features);
          } catch (e) {
            console.error('Error parsing features:', e);
          }
        }
        
        // Handle uploaded files
        if (req.files && req.files.length > 0) {
          accessoryData.images = req.files.map(file => `/uploads/accessories/${file.filename}`);
        }

        // Convert types
        if (accessoryData.price) accessoryData.price = parseFloat(accessoryData.price);
        if (accessoryData.originalPrice) accessoryData.originalPrice = parseFloat(accessoryData.originalPrice);
        if (accessoryData.quantity) accessoryData.quantity = parseInt(accessoryData.quantity) || 0;
        if (accessoryData.rating) accessoryData.rating = parseFloat(accessoryData.rating) || 0;
        if (accessoryData.reviewCount) accessoryData.reviewCount = parseInt(accessoryData.reviewCount) || 0;
        
        // Convert boolean fields
        accessoryData.inStock = accessoryData.inStock === 'true' || accessoryData.inStock === true;

        console.log('Processed accessory data:', accessoryData);

        const accessory = new Accessory(accessoryData);
        await accessory.save();

        res.status(201).json({
          success: true,
          message: 'Accessory created successfully',
          data: accessory
        });
      } catch (error) {
        console.error('Error creating accessory:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create accessory',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in createAccessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accessory',
      error: error.message
    });
  }
};

// @desc    Update accessory with image upload
// @route   PUT /api/accessories/:id
// @access  Admin
export const updateAccessory = async (req, res) => {
  try {
    uploadImages(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      try {
        const accessoryData = { ...req.body };
        
        // Parse JSON fields if they're sent as strings
        if (accessoryData.specs) {
          try {
            accessoryData.specs = JSON.parse(accessoryData.specs);
          } catch (e) {
            console.error('Error parsing specs:', e);
          }
        }
        
        if (accessoryData.features) {
          try {
            accessoryData.features = JSON.parse(accessoryData.features);
          } catch (e) {
            console.error('Error parsing features:', e);
          }
        }

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
          // Get the existing accessory to delete old images
          const existingAccessory = await Accessory.findById(req.params.id);
          
          if (existingAccessory && existingAccessory.images) {
            // Delete old image files
            existingAccessory.images.forEach(imagePath => {
              const fullPath = path.join(__dirname, '..', imagePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            });
          }
          
          accessoryData.images = req.files.map(file => `/uploads/accessories/${file.filename}`);
        }

        // Convert types
        if (accessoryData.price) accessoryData.price = parseFloat(accessoryData.price);
        if (accessoryData.originalPrice) accessoryData.originalPrice = parseFloat(accessoryData.originalPrice);
        if (accessoryData.quantity) accessoryData.quantity = parseInt(accessoryData.quantity);
        if (accessoryData.rating) accessoryData.rating = parseFloat(accessoryData.rating);
        if (accessoryData.reviewCount) accessoryData.reviewCount = parseInt(accessoryData.reviewCount);
        
        // Convert boolean fields
        if (accessoryData.inStock !== undefined) {
          accessoryData.inStock = accessoryData.inStock === 'true' || accessoryData.inStock === true;
        }

        const accessory = await Accessory.findByIdAndUpdate(
          req.params.id,
          accessoryData,
          { new: true, runValidators: true }
        );

        if (!accessory) {
          return res.status(404).json({
            success: false,
            message: 'Accessory not found'
          });
        }

        res.json({
          success: true,
          message: 'Accessory updated successfully',
          data: accessory
        });
      } catch (error) {
        console.error('Error updating accessory:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update accessory',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in updateAccessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accessory',
      error: error.message
    });
  }
};

// @desc    Delete accessory
// @route   DELETE /api/accessories/:id
// @access  Admin
export const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    // Delete associated image files
    if (accessory.images && accessory.images.length > 0) {
      accessory.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Accessory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Accessory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accessory',
      error: error.message
    });
  }
};

// @desc    Get accessories by category
// @route   GET /api/accessories/category/:category
// @access  Public
export const getAccessoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const accessories = await Accessory.find({ category })
      .sort({ rating: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: accessories.length,
      data: accessories
    });
  } catch (error) {
    console.error('Error fetching accessories by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories',
      error: error.message
    });
  }
};

// @desc    Get featured accessories
// @route   GET /api/accessories/featured
// @access  Public
export const getFeaturedAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find({ rating: { $gte: 4.5 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8);

    res.json({
      success: true,
      count: accessories.length,
      data: accessories
    });
  } catch (error) {
    console.error('Error fetching featured accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured accessories',
      error: error.message
    });
  }
};

// @desc    Get all brands
// @route   GET /api/accessories/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const brands = await Accessory.distinct('brand', filter);

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
};

// @desc    Get all categories with counts
// @route   GET /api/accessories/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Accessory.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Update stock
// @route   PUT /api/accessories/:id/stock
// @access  Admin
export const updateStock = async (req, res) => {
  try {
    const { quantity, inStock } = req.body;

    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { quantity, inStock },
      { new: true }
    );

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: accessory
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// @desc    Bulk create accessories (for seeding)
// @route   POST /api/accessories/bulk
// @access  Admin
export const bulkCreateAccessories = async (req, res) => {
  try {
    const accessories = req.body;
    
    if (!Array.isArray(accessories)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of accessories'
      });
    }

    const created = await Accessory.insertMany(accessories);

    res.status(201).json({
      success: true,
      message: `${created.length} accessories created successfully`,
      data: created
    });
  } catch (error) {
    console.error('Error bulk creating accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accessories',
      error: error.message
    });
  }
};