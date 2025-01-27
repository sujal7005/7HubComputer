import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, required: true },
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

export default LoginHistory;