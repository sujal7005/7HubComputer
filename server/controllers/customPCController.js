// server/controllers/customPCController.js
import CustomPC from '../models/customPC.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all component options (Public)
export const getComponentOptions = async (req, res) => {
  try {
    // Fetch all components from Product model
    const components = await Product.find({ 
      category: { 
        $in: ['CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PowerSupply', 'CPUCooler', 'ComputerCase', 'WiFiCard', 'Ports'] 
      },
      isActive: true
    });

    // Organize components by category
    const options = {
      CPU: [],
      GPU: [],
      RAM: [],
      SSD: [],
      HDD: [],
      Motherboard: [],
      PowerSupply: [],
      CPUCooler: [],
      ComputerCase: [],
      WiFiCard: [],
      Ports: []
    };

    components.forEach(component => {
      if (options[component.category]) {
        options[component.category].push({
          _id: component._id,
          name: component.name,
          price: component.finalPrice || component.price || 0,
          image: component.image?.[0] || null,
          specs: component.specs || {},
          brand: component.brand,
          stock: component.stock || 0
        });
      }
    });

    // Create prices object for compatibility with frontend
    const prices = {};
    Object.keys(options).forEach(category => {
      prices[category] = {};
      options[category].forEach(item => {
        prices[category][item.name] = item.price;
      });
    });

    res.json({
      success: true,
      options,
      prices
    });

  } catch (error) {
    console.error("Error fetching components:", error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
};

// Get specific component by category (Public)
export const getComponentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const components = await Product.find({ 
      category,
      isActive: true 
    }).select('name finalPrice price image specs brand stock');
    
    res.json({
      success: true,
      category,
      components
    });
  } catch (error) {
    console.error("Error fetching components by category:", error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
};

// Get single component by ID (Public)
export const getComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const component = await Product.findById(id);
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json({
      success: true,
      component
    });
  } catch (error) {
    console.error("Error fetching component:", error);
    res.status(500).json({ error: 'Failed to fetch component' });
  }
};

// Save custom PC configuration (Protected)
export const saveCustomPC = async (req, res) => {
  try {
    const { userId, configuration, totalPrice, name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check compatibility before saving
    const compatibilityIssues = checkComponentCompatibility(configuration);
    const compatibilityStatus = compatibilityIssues.length === 0 ? 'compatible' : 'incompatible';

    const customPC = new CustomPC({
      userId,
      name: name || 'Custom PC Configuration',
      configuration,
      totalPrice,
      compatibilityStatus,
      dateAdded: new Date()
    });

    await customPC.save();

    res.json({
      success: true,
      message: 'Configuration saved successfully',
      customPC
    });

  } catch (error) {
    console.error("Error saving custom PC:", error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
};

// Get user's saved custom PCs (Protected)
export const getUserCustomPCs = async (req, res) => {
  try {
    const { userId } = req.params;

    const customPCs = await CustomPC.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      customPCs
    });

  } catch (error) {
    console.error("Error fetching user custom PCs:", error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
};

// Delete a custom PC configuration (Protected)
export const deleteCustomPC = async (req, res) => {
  try {
    const { id } = req.params;

    await CustomPC.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting custom PC:", error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
};

// Helper function to check compatibility
const checkComponentCompatibility = (configuration) => {
  const issues = [];
  
  // Required components for a basic PC
  const requiredComponents = ['CPU', 'Motherboard', 'RAM', 'PowerSupply', 'ComputerCase'];
  const missingComponents = requiredComponents.filter(comp => !configuration[comp]);
  
  if (missingComponents.length > 0) {
    issues.push(`Missing required components: ${missingComponents.join(', ')}`);
  }
  
  // Check if we have at least one storage device
  if (!configuration.SSD && !configuration.HDD) {
    issues.push('At least one storage device (SSD or HDD) is required');
  }
  
  // CPU and Motherboard compatibility
  if (configuration.CPU && configuration.Motherboard) {
    const cpuSocket = configuration.CPU.specs?.socket;
    const mbSocket = configuration.Motherboard.specs?.cpuSocket;
    
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push(`CPU socket (${cpuSocket}) is not compatible with motherboard socket (${mbSocket})`);
    }
  }
  
  // RAM compatibility
  if (configuration.RAM && configuration.Motherboard) {
    const ramType = configuration.RAM.specs?.ramType;
    const mbRamType = configuration.Motherboard.specs?.ramType;
    
    if (ramType && mbRamType && ramType !== mbRamType) {
      issues.push(`RAM type (${ramType}) is not compatible with motherboard (${mbRamType})`);
    }
  }
  
  // Power Supply wattage check
  if (configuration.PowerSupply) {
    let totalWattage = 100; // Base system power
    
    if (configuration.CPU?.specs?.tdp) {
      totalWattage += configuration.CPU.specs.tdp;
    }
    
    if (configuration.GPU?.specs?.tdp) {
      totalWattage += configuration.GPU.specs.tdp;
    }
    
    // Add overhead for other components
    totalWattage += 150;
    
    const psuWattage = configuration.PowerSupply.specs?.wattage || 0;
    
    if (psuWattage < totalWattage) {
      issues.push(`Power supply (${psuWattage}W) may not be sufficient. Recommended: ${totalWattage}W`);
    }
  }
  
  return issues;
};

// Check component compatibility (Public)
export const checkCompatibility = async (req, res) => {
  try {
    const { configuration } = req.body;
    
    const issues = checkComponentCompatibility(configuration || {});
    
    if (issues.length > 0) {
      return res.json({
        success: true,
        compatible: false,
        issues
      });
    }

    res.json({
      success: true,
      compatible: true,
      message: 'All components are compatible'
    });

  } catch (error) {
    console.error("Error checking compatibility:", error);
    res.status(500).json({ error: 'Failed to check compatibility' });
  }
};

// ============= ADMIN FUNCTIONS =============

// Get all components for admin (with pagination and filters)
export const adminGetAllComponents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    let query = { 
      category: { 
        $in: ['CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PowerSupply', 'CPUCooler', 'ComputerCase', 'WiFiCard', 'Ports'] 
      }
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await Product.countDocuments(query);
    
    const components = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      components,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching admin components:", error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
};

// Create new component (Admin only)
export const adminCreateComponent = async (req, res) => {
  try {
    const componentData = JSON.parse(JSON.stringify(req.body));
    
    // Handle images
    if (req.files && req.files.length > 0) {
      componentData.image = req.files.map(file => file.filename);
    }
    
    // Parse JSON fields
    if (componentData.specs && typeof componentData.specs === 'string') {
      componentData.specs = JSON.parse(componentData.specs);
    }
    
    if (componentData.compatibility && typeof componentData.compatibility === 'string') {
      componentData.compatibility = JSON.parse(componentData.compatibility);
    }
    
    if (componentData.tags && typeof componentData.tags === 'string') {
      componentData.tags = JSON.parse(componentData.tags);
    }
    
    // Set final price if not provided
    if (!componentData.finalPrice && componentData.price) {
      componentData.finalPrice = componentData.price;
    }
    
    const component = new Product(componentData);
    await component.save();
    
    res.json({
      success: true,
      message: 'Component created successfully',
      component
    });
    
  } catch (error) {
    console.error("Error creating component:", error);
    res.status(500).json({ error: 'Failed to create component' });
  }
};

// Update component (Admin only)
export const adminUpdateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = JSON.parse(JSON.stringify(req.body));
    
    // Handle images
    if (req.files && req.files.length > 0) {
      // Get old component to delete old images
      const oldComponent = await Product.findById(id);
      if (oldComponent && oldComponent.image) {
        // Delete old images
        oldComponent.image.forEach(img => {
          const imagePath = path.join(__dirname, '../uploads', img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
      updateData.image = req.files.map(file => file.filename);
    }
    
    // Parse JSON fields
    if (updateData.specs && typeof updateData.specs === 'string') {
      updateData.specs = JSON.parse(updateData.specs);
    }
    
    if (updateData.compatibility && typeof updateData.compatibility === 'string') {
      updateData.compatibility = JSON.parse(updateData.compatibility);
    }
    
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }
    
    const component = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json({
      success: true,
      message: 'Component updated successfully',
      component
    });
    
  } catch (error) {
    console.error("Error updating component:", error);
    res.status(500).json({ error: 'Failed to update component' });
  }
};

// Delete component (Admin only)
export const adminDeleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const component = await Product.findById(id);
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    // Delete associated images
    if (component.image && component.image.length > 0) {
      component.image.forEach(img => {
        const imagePath = path.join(__dirname, '../../uploads', img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Component deleted successfully'
    });
    
  } catch (error) {
    console.error("Error deleting component:", error);
    res.status(500).json({ error: 'Failed to delete component' });
  }
};

// Bulk delete components (Admin only)
export const adminBulkDeleteComponents = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No component IDs provided' });
    }
    
    // Delete images for all components
    const components = await Product.find({ _id: { $in: ids } });
    
    components.forEach(component => {
      if (component.image && component.image.length > 0) {
        component.image.forEach(img => {
          const imagePath = path.join(__dirname, '../../uploads', img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
    });
    
    await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${ids.length} components deleted successfully`
    });
    
  } catch (error) {
    console.error("Error bulk deleting components:", error);
    res.status(500).json({ error: 'Failed to delete components' });
  }
};

// Update stock (Admin only)
export const adminUpdateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    const component = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true }
    );
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      component
    });
    
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

// Get component categories with counts (Admin only)
export const adminGetCategories = async (req, res) => {
  try {
    const categories = [
      'CPU', 'GPU', 'RAM', 'SSD', 'HDD', 
      'Motherboard', 'PowerSupply', 'CPUCooler', 
      'ComputerCase', 'WiFiCard', 'Ports'
    ];
    
    const counts = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category });
        return { category, count };
      })
    );
    
    res.json({
      success: true,
      categories: counts
    });
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};