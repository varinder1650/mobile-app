import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodSectionProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  disabled?: boolean;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedMethod === 'cod' && styles.paymentOptionSelected,
        ]}
        onPress={() => onSelectMethod('cod')}
        disabled={disabled}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons name="cash-outline" size={24} color="#666" />
          <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
        </View>
        {selectedMethod === 'cod' && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedMethod === 'phonepe' && styles.paymentOptionSelected,
        ]}
        onPress={() => onSelectMethod('phonepe')}
        disabled={disabled}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons name="phone-portrait-outline" size={24} color="#5F259F" />
          <Text style={styles.paymentOptionText}>PhonePe</Text>
        </View>
        {selectedMethod === 'phonepe' && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  paymentOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: { 
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentOptionText: { fontSize: 16, fontWeight: '500', color: '#333' },
});