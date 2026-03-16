import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: Date,
    default: null
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

const Discount = mongoose.model('Discount', discountSchema);
export default Discount;