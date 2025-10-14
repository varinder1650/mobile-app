import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/cart.styles';

interface EmptyCartProps {
  message: string;
  buttonText: string;
  onPress: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ message, buttonText, onPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>{message}</Text>
      <TouchableOpacity style={styles.shopNowButton} onPress={onPress}>
        <Text style={styles.shopNowText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyCart;