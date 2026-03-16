// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  product: { type: Object, required: true },
  userDetails: { type: Object, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Confirmed'],
    default: 'Pending',
  },
  paymentMethod: String,
  deliveryDate: Date,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);  