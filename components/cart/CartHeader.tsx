import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { styles } from '../../styles/cart.styles';

interface CartHeaderProps {
  cartCount: number;
}

const CartHeader: React.FC<CartHeaderProps> = ({ cartCount }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Shopping Cart</Text>
      <Text style={styles.itemCount}>
        {cartCount} {cartCount === 1 ? 'item' : 'items'}
      </Text>
    </View>
  );
};

export default CartHeader;