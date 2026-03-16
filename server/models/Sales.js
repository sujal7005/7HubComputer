import mongoose from "mongoose";

const SalesSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
});

const Sales = mongoose.model("Sales", SalesSchema);

export default Sales;