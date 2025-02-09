import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId') || 'guest';

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      if (userId === 'guest') {
        const guestCart = Cookies.get('guestCart');
        setCartItems(guestCart ? JSON.parse(guestCart) : []);
      } else {
        try {
          const response = await axios.get(`http://localhost:4000/api/cart/${userId}`);
          setCartItems(response.data.products || []);
        } catch (error) {
          console.error('Failed to fetch cart data:', error);
        }
      }
      setLoading(false);
    };

    fetchCartItems();
  }, [userId]);

  useEffect(() => {
    if (userId === 'guest') {
      Cookies.set('cartItems', JSON.stringify(cartItems), { expires: 7 });
    }
  }, [cartItems, userId]);

  const addToCart = async (product) => {
    console.log('Adding product to cart:', product); 
    const { configuration, totalPrice, quantity = 1, image } = product;
    const newCartItem = { 
      ...product,
      configuration,
      quantity: product.quantity || 1,
      image: image || product.imagedefilt,
      totalPrice,
    };
  
    if (userId === 'guest') {
      // Check if product already exists in guest cart
      const existingItemIndex = cartItems.findIndex(item => 
        item.name === newCartItem.name && JSON.stringify(item.configuration) === JSON.stringify(configuration)
      );
  
      let updatedCart;
      if (existingItemIndex > -1) {
        updatedCart = cartItems.map((item, index) => 
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedCart = [...cartItems, newCartItem];
      }
      
      setCartItems(updatedCart);
      Cookies.set('guestCart', JSON.stringify(updatedCart), { expires: 7 });
      console.log('Updated guest cart:', cartItems);
    } else {
      try {
        const response = await axios.post(`http://localhost:4000/api/cart/${userId}/add`, newCartItem);
        console.log('Response from addToCart API:', response.data);
        setCartItems(response.data.cartItems || []);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    }
  };  

  const removeFromCart = async (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);

    if (userId === 'guest') {
      Cookies.set('guestCart', JSON.stringify(updatedCart), { expires: 7 });
    } else {
      try {
        await axios.delete(`http://localhost:4000/api/cart/${userId}/remove/${id}`);
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    if (userId === 'guest') {
      Cookies.remove('guestCart');
    } else {
      try {
        await axios.delete(`http://localhost:4000/api/cart/${userId}/clear`);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (userId === 'guest') {
      const updatedCart = cartItems.map((item) => 
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      Cookies.set('guestCart', JSON.stringify(updatedCart), { expires: 7 });
    } else {
      try {
        const response = await axios.patch(`http://localhost:4000/api/cart/${userId}/updateQuantity`, { id, quantity });
        setCartItems(response.data.cartItems || []);
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};