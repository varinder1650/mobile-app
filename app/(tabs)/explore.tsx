// (tabs)/explore.tsx - OPTIMIZED CART SCREEN
import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { View, FlatList, Alert, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext'; // ✅ Use CartContext
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../../styles/cart.styles';

import CartHeader from '../../components/cart/CartHeader';
import CartItemComponent from '../../components/cart/CartItem';
import CartFooter from '../../components/cart/CartFooter';
import EmptyCart from '../../components/cart/EmptyCart';

// ✅ Memoized CartItem wrapper
const MemoizedCartItem = React.memo(CartItemComponent, (prev, next) => {
  return (
    prev.item._id === next.item._id &&
    prev.item.quantity === next.item.quantity &&
    prev.updating === next.updating
  );
});

const CartScreen = () => {
  const { token } = useAuth();
  const { 
    cartItems, 
    cartCount,
    loading,
    updateQuantity,
    removeItem,
    refreshCart,
    getTotalPrice 
  } = useCart(); // ✅ All cart logic from context
  
  const [updating, setUpdating] = useState(false);

  // ✅ Refresh cart when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  // ✅ Optimized update handler with loading state
  const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    setUpdating(true);
    
    // Find the product ID from cart item
    const cartItem = cartItems.find(item => item._id === itemId);
    if (!cartItem) {
      setUpdating(false);
      return;
    }

    await updateQuantity(cartItem.product.id, newQuantity);
    setUpdating(false);
  }, [cartItems, updateQuantity]);

  // ✅ Optimized remove handler
  const handleRemoveItem = useCallback((itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            setUpdating(true);
            await removeItem(itemId);
            setUpdating(false);
          }
        },
      ]
    );
  }, [removeItem]);

  // ✅ Memoized renderItem
  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <MemoizedCartItem 
      item={item}
      index={index}
      updating={updating}
      updateQuantity={handleUpdateQuantity}
      removeItem={handleRemoveItem}
    />
  ), [updating, handleUpdateQuantity, handleRemoveItem]);

  // ✅ Memoized keyExtractor
  const keyExtractor = useCallback((item: any, index: number) => 
    `cart-item-${item._id}-${index}`, 
    []
  );

  if (loading && cartItems.length === 0) {
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
      <CartHeader cartCount={cartCount} />

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
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={loading} 
                onRefresh={refreshCart}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
            // ✅ Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            // ✅ Add getItemLayout for consistent heights
            getItemLayout={(data, index) => ({
              length: 180, // Approximate cart item height
              offset: 180 * index,
              index,
            })}
          />
          
          <CartFooter 
            totalPrice={getTotalPrice()}
            updating={updating}
            cartItemsCount={cartCount}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;