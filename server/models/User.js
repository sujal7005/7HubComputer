import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  bonusPoints: { type: Number, default: 0 },
  discountCode: { type: String, default: null },
  discountExpiresAt: { type: Date, default: null },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
});

export default mongoose.model('User', userSchema);