/* eslint-disable react-refresh/only-export-components */
// context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Load from localStorage on initial render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    if (parsedCart.length === 0) return null;

    const savedCoupon = localStorage.getItem('appliedCoupon');
    return savedCoupon ? JSON.parse(savedCoupon) : null;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save applied coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon && cart.length > 0) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon, cart.length]);

  const addToCart = (service) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === service.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(item =>
          item.id === service.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...service, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => {
      const nextCart = prevCart.filter(item => item.id !== id);
      if (nextCart.length === 0) {
        setAppliedCoupon(null);
      }
      return nextCart;
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const clearAppliedCoupon = () => {
    setAppliedCoupon(null);
  };

  const effectiveAppliedCoupon = cart.length > 0 ? appliedCoupon : null;

  const cartTotal = cart.reduce(
    (total, item) => total + (item.price * (item.quantity || 1)),
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon: effectiveAppliedCoupon,
        setAppliedCoupon,
        clearAppliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
