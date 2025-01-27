import mongoose from "mongoose";

const LocationInfoSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("LocationInfo", LocationInfoSchema);