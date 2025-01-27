import mongoose from "mongoose";

const DeviceInfoSchema = new mongoose.Schema({
  userAgent: { type: String, required: true },
  platform: { type: String, required: true },
  screenResolution: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DeviceInfo", DeviceInfoSchema);