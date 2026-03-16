import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'CPU', 'GPU', 'RAM', 'SSD', 'HDD', 
      'Motherboard', 'PowerSupply', 'CPUCooler', 
      'ComputerCase', 'WiFiCard', 'Ports',
      'Laptop', 'Desktop', 'Accessory', 'Display',
      'PreBuiltPC', 'MiniPC', 'OfficePC', 'RefurbishedLaptop'
    ],
    required: true 
  },
  subCategory: String,
  price: Number,
  finalPrice: Number,
  originalPrice: Number,
  description: String,
  image: [String],
  brand: String,
  stock: { 
    type: Number, 
    default: 0 
  },
  specs: {
    // CPU specific
    socket: String,
    cores: Number,
    threads: Number,
    baseClock: String,
    boostClock: String,
    tdp: Number,
    
    // GPU specific
    memory: String,
    memoryType: String,
    coreClock: String,
    
    // RAM specific
    ramType: String,
    speed: String,
    capacity: String,
    
    // Storage specific
    interface: String,
    formFactor: String,
    
    // Motherboard specific
    formFactor: String,
    cpuSocket: String,
    chipset: String,
    ramType: String,
    ramSlots: Number,
    maxRam: String,
    pcieSlots: String,
    
    // Power Supply specific
    wattage: Number,
    efficiency: String,
    modular: Boolean,
    
    // Case specific
    caseType: String,
    color: String,
    dimensions: String,
    weight: String,
    supportedMotherboard: String,
    
    // Display specific
    screenSize: String,
    resolution: String,
    refreshRate: String,
    panelType: String,
    
    // Laptop/PC specific
    processor: String,
    graphics: String,
    ram: String,
    storage: String,
    os: String,
    
    // Generic
    features: [String],
    warranty: String
  },
  compatibility: {
    socket: [String],
    chipset: [String],
    ramType: [String],
    powerMin: Number,
    formFactor: [String]
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  tags: [String]
}, { 
  timestamps: true 
});

// Add indexes for faster queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;