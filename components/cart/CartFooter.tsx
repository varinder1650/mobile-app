import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { styles } from '../../styles/cart.styles';

interface CartFooterProps {
  totalPrice: number;
  updating: boolean;
  cartItemsCount: number;
}

const CartFooter: React.FC<CartFooterProps> = ({
  totalPrice,
  updating,
  cartItemsCount,
}) => {
  const handleCheckout = () => {
    if (cartItemsCount === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  return (
    <View style={styles.footerWithPadding}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.checkoutButton, updating && styles.disabledButton]}
        onPress={handleCheckout}
        disabled={updating || cartItemsCount === 0}
      >
        <Text style={styles.checkoutText}>
          {updating ? 'Processing...' : 'Proceed to Checkout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartFooter;