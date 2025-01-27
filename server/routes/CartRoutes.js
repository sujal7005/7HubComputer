import { Router } from "express";
import Cart from "../models/Cart.js";

const router = Router();

// Add to cart
router.post('/cart/:userId/add', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity = 1, configuration, totalPrice } = req.body;
  
  try {
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ 
        userId, 
        items: [{ productId, configuration, quantity, totalPrice }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => 
        JSON.stringify(item.configuration) === JSON.stringify(configuration)
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = price;
      } else {
        cart.items.push({ productId, configuration, quantity, totalPrice });
      }
    }

    cart.calculateTotalPrice();
    await cart.save();
    
    res.cookie('cartActivity', 'active', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    res.status(200).json({ cartItems: cart.items });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove from cart
router.delete('/cart/:userId/remove/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.id !== productId);
      cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
      await cart.save();
    }

    res.json(cart ? cart.items : []);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/cart/:userId/clear', async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }

    res.json([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get cart
router.get('/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Update quantity
router.patch('/cart/:userId/updateQuantity', async (req, res) => {
  const { userId } = req.params;
  const { id, quantity } = req.body;
  
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].price * quantity;
      cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
      await cart.save();
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.status(200).json({ cartItems: cart.items });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

export default router;