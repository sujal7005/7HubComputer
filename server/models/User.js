import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  bonuses: { type: Number, default: 0 },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
});

export default mongoose.model('User', userSchema);