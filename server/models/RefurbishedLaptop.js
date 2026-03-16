import mongoose from "mongoose";

const refurbishedLaptopSchema = new mongoose.Schema({
    type: { 
        type: String,
        enum: ['New', 'Refurbished', 'Refurbished Laptop'],
        required: true, 
    },
    id: { type: String, required: true },
    customId: { type: String, unique: true },
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: [String], required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    additionalImages: { type: [String], default: [] },
    videos: [{
        title: { type: String, default: "" },
        url: { type: String, default: "" }
    }],
    keyFeatures: [{
        title: String,
        description: String
    }],
    specs: {
        cpu: { type: String, required: true },
        ram: { type: String, required: true },
        storage: { type: String, required: true },
        GraphicCard: { type: String, required: true },
        display: { type: String, required: true },
        os: { type: String, required: true },
    },
    otherTechnicalDetails: [
        {
            name: { type: String, required: true },
            value: { type: String, required: true },
        }
    ],
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        required: true,
    },
    specifications: [{
        title: String,
        specs: [{
          name: String,
          value: String
        }]
    }],
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
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            reviewerName: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String },
            reviewimage: { type: String },
            date: { type: Date, default: Date.now },
        }
    ],
});

const RefurbishedLaptop = mongoose.model('RefurbishedLaptop', refurbishedLaptopSchema);
export default RefurbishedLaptop;