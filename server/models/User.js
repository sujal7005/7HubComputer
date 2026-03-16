import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  facebookId: { type: String, unique: true, sparse: true },
  twitterId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  password: { type: String, required: true, default: 'facebook_user' },
  phoneNumber: { type: String, default: '' },
  bonusPoints: { type: Number, default: 0 },
  discountCode: { type: String, default: null },
  discountExpiresAt: { type: Date, default: null },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
});

export default mongoose.model('User', userSchema);