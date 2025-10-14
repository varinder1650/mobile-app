import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/home.styles';

interface CartNotificationProps {
  showCartNotification: boolean;
}

const CartNotification: React.FC<CartNotificationProps> = ({ showCartNotification }) => {
  if (!showCartNotification) {
    return null;
  }

  return (
    <View style={styles.cartNotification}>
      <Ionicons name="checkmark-circle" size={20} color="#fff" />
      <Text style={styles.cartNotificationText}>Added to cart!</Text>
    </View>
  );
};

export default CartNotification;