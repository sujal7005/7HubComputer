import mongoose from 'mongoose';

// const cartItemSchema = new mongoose.Schema({
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//     configuration: { type: Object, required: true },
//     quantity: { type: Number, default: 1 },
//     price: { type: Number, required: true },
// })

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        configuration: { type: Object, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
    }],
    totalPrice: { type: Number, default: 0 }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;