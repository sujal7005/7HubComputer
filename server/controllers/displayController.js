import Display from "../models/Display.js";
import multer from "multer";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'display-' + uniqueSuffix + ext);
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
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware for handling multiple image uploads
const uploadImages = upload.array('images', 5);

// @desc    Create new display
// @route   POST /api/displays
// @access  Admin
const createDisplay = async (req, res) => {
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

        const displayData = { ...req.body };
        
        // Parse JSON fields
        if (displayData.specs) {
          try {
            displayData.specs = JSON.parse(displayData.specs);
          } catch (e) {
            console.error('Error parsing specs:', e);
          }
        }
        
        if (displayData.features) {
          try {
            displayData.features = JSON.parse(displayData.features);
          } catch (e) {
            console.error('Error parsing features:', e);
          }
        }
        
        if (displayData.ports) {
          try {
            displayData.ports = JSON.parse(displayData.ports);
          } catch (e) {
            console.error('Error parsing ports:', e);
          }
        }
        
        // Handle uploaded files
        if (req.files && req.files.length > 0) {
          displayData.images = req.files.map(file => file.filename);
          displayData.image = req.files[0].filename; // Set first image as main image
        } else {
          return res.status(400).json({
            success: false,
            message: 'At least one image is required'
          });
        }

        // Convert boolean fields
        displayData.inStock = displayData.inStock === 'true' || displayData.inStock === true;
        
        // Convert quantity to number
        if (displayData.quantity) {
          displayData.quantity = parseInt(displayData.quantity) || 0;
        }
        
        // Convert price to number
        if (displayData.price) {
          displayData.price = parseFloat(displayData.price);
        }
        
        if (displayData.originalPrice) {
          displayData.originalPrice = parseFloat(displayData.originalPrice);
        }

        console.log('Processed display data:', displayData);

        const display = new Display(displayData);
        await display.save();

        res.status(201).json({
          success: true,
          message: 'Display created successfully',
          data: display
        });
      } catch (error) {
        console.error('Error creating display:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create display',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in createDisplay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create display',
      error: error.message
    });
  }
};

// @desc    Get all displays with filtering, sorting, and pagination
// @route   GET /api/displays
// @access  Public
const getDisplays = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      resolution,
      inStock,
      sortBy,
      page = 1,
      limit = 12,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (brand) filter.brand = brand;
    if (inStock) filter.inStock = inStock === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Size filter
    if (size && size !== 'all') {
      const sizeNum = parseInt(filter.specs?.size);
      if (size === 'small') filter['specs.size'] = { $lt: '24"' };
      if (size === 'medium') filter['specs.size'] = { $gte: '24"', $lte: '30"' };
      if (size === 'large') filter['specs.size'] = { $gt: '30"' };
    }

    // Resolution filter
    if (resolution && resolution !== 'all') {
      if (resolution === 'fhd') filter['specs.resolution'] = /1080|FHD/i;
      if (resolution === 'qhd') filter['specs.resolution'] = /1440|QHD|2K/i;
      if (resolution === '4k') filter['specs.resolution'] = /2160|4K|UHD/i;
      if (resolution === 'uw') filter['specs.resolution'] = /3440|5120|Ultrawide/i;
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
    const total = await Display.countDocuments(filter);

    // Execute query
    const displays = await Display.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: displays.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: displays
    });
  } catch (error) {
    console.error('Error fetching displays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch displays',
      error: error.message
    });
  }
};

// @desc    Get single display by ID
// @route   GET /api/displays/:id
// @access  Public
const getDisplayById = async (req, res) => {
  try {
    const display = await Display.findById(req.params.id);

    if (!display) {
      return res.status(404).json({
        success: false,
        message: 'Display not found'
      });
    }

    res.json({
      success: true,
      data: display
    });
  } catch (error) {
    console.error('Error fetching display:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch display',
      error: error.message
    });
  }
};

// @desc    Update display
// @route   PUT /api/displays/:id
// @access  Admin
const updateDisplay = async (req, res) => {
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
        const displayData = { ...req.body };
        
        // Parse JSON fields
        if (displayData.specs) {
          try {
            displayData.specs = JSON.parse(displayData.specs);
          } catch (e) {
            console.error('Error parsing specs:', e);
          }
        }
        
        if (displayData.features) {
          try {
            displayData.features = JSON.parse(displayData.features);
          } catch (e) {
            console.error('Error parsing features:', e);
          }
        }
        
        if (displayData.ports) {
          try {
            displayData.ports = JSON.parse(displayData.ports);
          } catch (e) {
            console.error('Error parsing ports:', e);
          }
        }

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
          // Get the existing display to delete old images
          const existingDisplay = await Display.findById(req.params.id);
          
          if (existingDisplay && existingDisplay.images) {
            // Delete old image files
            existingDisplay.images.forEach(image => {
              const imagePath = path.join(__dirname, '../../uploads/', image);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            });
          }
          
          displayData.images = req.files.map(file => file.filename);
          displayData.image = req.files[0].filename;
        }

        // Convert boolean fields
        displayData.inStock = displayData.inStock === 'true' || displayData.inStock === true;
        
        // Convert quantity to number
        if (displayData.quantity) {
          displayData.quantity = parseInt(displayData.quantity) || 0;
        }
        
        // Convert price to number
        if (displayData.price) {
          displayData.price = parseFloat(displayData.price);
        }
        
        if (displayData.originalPrice) {
          displayData.originalPrice = parseFloat(displayData.originalPrice);
        }

        // Remove undefined fields
        Object.keys(displayData).forEach(key => 
          displayData[key] === undefined && delete displayData[key]
        );

        const display = await Display.findByIdAndUpdate(
          req.params.id,
          displayData,
          { new: true, runValidators: true }
        );

        if (!display) {
          return res.status(404).json({
            success: false,
            message: 'Display not found'
          });
        }

        res.json({
          success: true,
          message: 'Display updated successfully',
          data: display
        });
      } catch (error) {
        console.error('Error updating display:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update display',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in updateDisplay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update display',
      error: error.message
    });
  }
};

// @desc    Delete display
// @route   DELETE /api/displays/:id
// @access  Admin
const deleteDisplay = async (req, res) => {
  try {
    const display = await Display.findById(req.params.id);

    if (!display) {
      return res.status(404).json({
        success: false,
        message: 'Display not found'
      });
    }

    // Delete associated image files
    if (display.images && display.images.length > 0) {
      display.images.forEach(image => {
        const imagePath = path.join(__dirname, '../../uploads/', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await Display.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Display deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting display:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete display',
      error: error.message
    });
  }
};

// @desc    Get displays by category
// @route   GET /api/displays/category/:category
// @access  Public
const getDisplaysByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const displays = await Display.find({ category })
      .sort({ rating: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: displays.length,
      data: displays
    });
  } catch (error) {
    console.error('Error fetching displays by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch displays',
      error: error.message
    });
  }
};

// @desc    Get featured displays
// @route   GET /api/displays/featured
// @access  Public
const getFeaturedDisplays = async (req, res) => {
  try {
    const displays = await Display.find({ rating: { $gte: 4.5 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8);

    res.json({
      success: true,
      count: displays.length,
      data: displays
    });
  } catch (error) {
    console.error('Error fetching featured displays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured displays',
      error: error.message
    });
  }
};

// @desc    Get all brands
// @route   GET /api/displays/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const brands = await Display.distinct('brand', filter);

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

// @desc    Get categories with stats
// @route   GET /api/displays/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Display.aggregate([
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

// @desc    Bulk create displays (for seeding)
// @route   POST /api/displays/bulk
// @access  Admin
const bulkCreateDisplays = async (req, res) => {
  try {
    const displays = req.body;
    
    if (!Array.isArray(displays)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of displays'
      });
    }

    const created = await Display.insertMany(displays);

    res.status(201).json({
      success: true,
      message: `${created.length} displays created successfully`,
      data: created
    });
  } catch (error) {
    console.error('Error bulk creating displays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create displays',
      error: error.message
    });
  }
};

export {
  getDisplays,
  getDisplayById,
  createDisplay,
  updateDisplay,
  deleteDisplay,
  getDisplaysByCategory,
  getFeaturedDisplays,
  getBrands,
  getCategories,
  bulkCreateDisplays
};