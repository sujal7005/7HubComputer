import mongoose from "mongoose";

const miniPCSchema = new mongoose.Schema({
    type: { type: String, required: true },
    id: { type: String, required: true },
    productId: { type: String, unique: true },
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: [String], required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    specs: {
        platform: { type: String, required: true },
        cpu: { type: String, required: true },
        motherboard: { type: String, required: true },
        ramOptions: [
            {
                value: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        storage1Options: [
            {
                value: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        graphiccard: { type: String, required: true },
        smps: { type: String, required: true },
        cabinet: { type: String, required: true },
    },
    otherTechnicalDetails: [
        { name: { type: String }, value: { type: String } },
    ],
    condition: {
        type: String,
        enum: ["Excellent", "Good", "Fair", "Poor"],
        required: true,
    },
    notes: { type: [String], required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    category: [{ type: String, required: true }],
    inStock: { type: Boolean, default: true },
    popularity: { type: Number, default: 0 },
    originalPrice: { type: Number },
    discount: { type: Number, default: 20 },
    dateAdded: { type: Date, default: Date.now },
    bonuses: { type: Number, default: 10 },
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            reviewerName: { type: String, required: true },
            rating: { type: Number, required: true },
            review: { type: String, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
});

const MiniPC = mongoose.model("MiniPC", miniPCSchema);

export default MiniPC;