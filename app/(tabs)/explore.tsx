import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { View, FlatList, Alert, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { CartItem } from '../../types/cart.types';
import { styles } from '../../styles/cart.styles';

import CartHeader from '../../components/cart/CartHeader';
import CartItemComponent from '../../components/cart/CartItem';
import CartFooter from '../../components/cart/CartFooter';
import EmptyCart from '../../components/cart/EmptyCart';

const CartScreen = () => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      console.log('Fetching cart with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const timestamp = Date.now();
      const response = await fetch(`${API_ENDPOINTS.CART}?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Cart response status:', response.status);
      
      if (response.status === 401) {
        console.log('Cart: Authentication failed, token may be expired');
        Alert.alert(
          'Session Expired',
          'Please login again to access your cart',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/auth/login') }
          ]
        );
        setCartItems([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Cart data received:', data);
      
      const items = data.items || [];
      setCartItems(items);

    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!token) {
      Alert.alert('Error', 'Please login to manage cart');
      return;
    }

    setUpdating(true);
    try {
      if (newQuantity <= 0) {
        const response = await fetch(`${API_ENDPOINTS.CART_REMOVE}?item_id=${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setCartItems(prev => prev.filter(item => item._id !== itemId));
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to remove item');
        }
      } else {
        const response = await fetch(API_ENDPOINTS.CART_UPDATE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ itemId, quantity: newQuantity }),
        });

        if (response.ok) {
          setCartItems(prev => 
            prev.map(item => 
              item._id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to update quantity');
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      Alert.alert('Error', 'Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          updateQuantity(itemId, 0);
        }},
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <CartHeader cartCount={0} />
        <EmptyCart 
          message="Login to save your cart and track orders"
          buttonText="Login"
          onPress={() => router.push('/auth/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CartHeader cartCount={cartItems.length} />

      {cartItems.length === 0 ? (
        <EmptyCart 
          message="Add some products to get started"
          buttonText="Shop Now"
          onPress={() => router.push('/(tabs)')}
        />
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={({ item, index }) => (
              <CartItemComponent 
                item={item}
                index={index}
                updating={updating}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            )}
            keyExtractor={(item, index) => `cart-item-${item._id}-${index}`}
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={updating} onRefresh={fetchCart} />
            }
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
          
          <CartFooter 
            totalPrice={getTotalPrice()}
            updating={updating}
            cartItemsCount={cartItems.length}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;