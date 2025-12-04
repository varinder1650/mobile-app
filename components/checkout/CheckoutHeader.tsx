// components/checkout/CheckoutHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CheckoutHeader.styles';

interface CheckoutHeaderProps {
  onBack: () => void;
  disabled?: boolean;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBack, disabled }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={disabled}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Checkout</Text>
      <View style={styles.placeholder} />
    </View>
  );
};