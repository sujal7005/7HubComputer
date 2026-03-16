// server/models/Accessory.js
import mongoose from "mongoose";

const accessorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'pendrive',
      'heatsink',
      'keyboard-wired',
      'keyboard-wireless',
      'mouse-wired',
      'mouse-wireless',
      'mousepad',
      'headphone-wired',
      'headphone-wireless'
    ]
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  brand: {
    type: String,
    required: true
  },
  specs: [{
    type: String
  }],
  connectivity: {
    type: String
  },
  compatibility: {
    type: String
  },
  size: {
    type: String
  },
  color: {
    type: String
  },
  features: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  warranty: {
    type: String,
    default: '1 Year'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
accessorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Accessory = mongoose.model('Accessory', accessorySchema);
export default Accessory;