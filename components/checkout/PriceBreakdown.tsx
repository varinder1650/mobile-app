// components/checkout/PriceBreakdown.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './PriceBreakdown.styles';

interface PriceBreakdownProps {
  subtotal: number;
  tax: number;
  taxRate: number;
  deliveryCharge: number;
  appFee: number;
  promoDiscount: number;
  total: number;
  showFreeDelivery?: boolean;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  tax,
  taxRate,
  deliveryCharge,
  appFee,
  promoDiscount,
  total,
  showFreeDelivery = false,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="calculator-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
      </View>
      
      {promoDiscount > 0 && (
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, styles.discountLabel]}>Promo Discount</Text>
          <Text style={[styles.priceValue, styles.discountValue]}>
            -₹{promoDiscount.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax ({taxRate}% GST)</Text>
        <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          Delivery Charge
          {showFreeDelivery && <Text style={styles.freeDeliveryText}> (Free)</Text>}
        </Text>
        <Text style={styles.priceValue}>₹{deliveryCharge.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>App Fee</Text>
        <Text style={styles.priceValue}>₹{appFee.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};