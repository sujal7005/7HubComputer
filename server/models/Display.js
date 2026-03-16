import mongoose from "mongoose";

const displaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['gaming', 'professional', 'ultrawide', 'office', 'portable']
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
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  brand: {
    type: String,
    required: true
  },
  specs: {
    size: String,
    resolution: String,
    panel: String,
    refreshRate: String,
    responseTime: String,
    aspectRatio: String,
    brightness: String,
    contrast: String,
    colorGamut: String
  },
  features: [{
    type: String
  }],
  ports: [{
    type: String
  }],
  color: String,
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

displaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Display = mongoose.model('Display', displaySchema);
export default Display;