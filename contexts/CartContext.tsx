// contexts/CartContext.tsx - CENTRALIZED CART MANAGEMENT
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from './AuthContext';
import { authenticatedFetch } from '../utils/authenticatedFetch';

interface CartItem {
  _id: string;
  product: {
    _id?: string;
    id: string;
    name: string;
    price: number;
    images: any[];
    brand: { name: string };
    stock: number;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartQuantities: { [productId: string]: number };
  loading: boolean;
  addToCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  
  // ✅ Derived state - no separate state needed
  const cartCount = cartItems.length;
  const cartQuantities = cartItems.reduce((acc, item) => {
    acc[item.product.id] = item.quantity;
    return acc;
  }, {} as { [productId: string]: number });

  // ✅ Debounced fetch - prevents rapid consecutive calls
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }

    const now = Date.now();
    if (now - lastFetch < 1000) {
      if (__DEV__) console.log('🛒 Cart fetch debounced');
      return;
    }

    try {
      setLastFetch(now);
      const timestamp = Date.now();
      const response = await fetch(`${API_ENDPOINTS.CART}?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        if (__DEV__) console.log('🛒 Cart: Unauthorized');
        setCartItems([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setCartItems(data.items || []);
      
    } catch (error) {
      if (__DEV__) console.error('🛒 Cart fetch error:', error);
      setCartItems([]);
    }
  }, [token, lastFetch]);

  // ✅ Auto-fetch on token change
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [token]);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    await fetchCart();
    setLoading(false);
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string): Promise<boolean> => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to add items to your cart',
        [
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return false;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.CART_ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: productId,
          quantity: 1 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Optimistic update - update UI immediately
        await fetchCart();
        return true;
      } else {
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again');
        } else {
          Alert.alert('Error', data.message || 'Failed to add to cart');
        }
        return false;
      }
    } catch (error) {
      if (__DEV__) console.error('🛒 Add to cart error:', error);
      Alert.alert('Error', 'Failed to add to cart');
      return false;
    }
  }, [token, fetchCart]);

  const updateQuantity = useCallback(async (productId: string, newQuantity: number): Promise<boolean> => {
    if (!token) {
      Alert.alert('Error', 'Please login to manage cart');
      return false;
    }

    try {
      // Find cart item
      const cartItem = cartItems.find(item => item.product.id === productId);
      if (!cartItem) {
        if (__DEV__) console.log('🛒 Cart item not found:', productId);
        return false;
      }

      if (newQuantity <= 0) {
        return await removeItem(cartItem._id);
      }

      // ✅ Stock check
      if (newQuantity > cartItem.product.stock) {
        Alert.alert('Stock Limit', `Only ${cartItem.product.stock} items available`);
        return false;
      }

      const response = await authenticatedFetch(API_ENDPOINTS.CART_UPDATE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: cartItem._id, quantity: newQuantity }),
      });

      if (response.ok) {
        // ✅ Optimistic update
        setCartItems(prev =>
          prev.map(item =>
            item._id === cartItem._id ? { ...item, quantity: newQuantity } : item
          )
        );
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update quantity');
        return false;
      }
    } catch (error) {
      if (__DEV__) console.error('🛒 Update quantity error:', error);
      Alert.alert('Error', 'Failed to update cart');
      return false;
    }
  }, [token, cartItems]);

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await authenticatedFetch(
        `${API_ENDPOINTS.CART_REMOVE}?item_id=${itemId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // ✅ Optimistic update
        setCartItems(prev => prev.filter(item => item._id !== itemId));
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to remove item');
        return false;
      }
    } catch (error) {
      if (__DEV__) console.error('🛒 Remove item error:', error);
      Alert.alert('Error', 'Failed to remove item');
      return false;
    }
  }, [token]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value: CartContextType = {
    cartItems,
    cartCount,
    cartQuantities,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
    getTotalPrice,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};