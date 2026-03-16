import mongoose from 'mongoose';

const ComponentOptionSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

const CustomPCSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: {
    type: String,
    default: 'Custom PC Configuration'
  },
  configuration: {
    CPU: ComponentOptionSchema,
    GPU: ComponentOptionSchema,
    RAM: ComponentOptionSchema,
    SSD: ComponentOptionSchema,
    HDD: ComponentOptionSchema,
    Motherboard: ComponentOptionSchema,
    PowerSupply: ComponentOptionSchema,
    CPUCooler: ComponentOptionSchema,
    ComputerCase: ComponentOptionSchema,
    WiFiCard: ComponentOptionSchema,
    Ports: ComponentOptionSchema
  },
  totalPrice: {
    type: Number,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  compatibilityStatus: {
    type: String,
    enum: ['compatible', 'incompatible', 'unknown'],
    default: 'unknown'
  }
}, { 
  timestamps: true 
});

// Add index for faster queries
CustomPCSchema.index({ userId: 1, createdAt: -1 });

const CustomPC = mongoose.model('CustomPC', CustomPCSchema);
export default CustomPC;