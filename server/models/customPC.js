// models/customPC.js
import mongoose from 'mongoose';

const CustomPCSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  id: String,
  name: String,
  basePrice: Number,
  customizableOptions: {
    CPU: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    GPU: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    RAM: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    SSD: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    HDD: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    Motherboard: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    PowerSupply: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    CPUCooler: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    ComputerCase: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    WiFiCard: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
    Ports: [
      {
        name: String,
        price: Number,
        image: String,
      },
    ],
  },
  dateAdded: Date,
  totalPrice: Number,
}, { timestamps: true });

const CustomPC = mongoose.model('CustomPC', CustomPCSchema);
export default CustomPC;