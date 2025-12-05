import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceBreakdownSectionProps {
  subtotal: number;
  tax: number;
  taxRate: number;
  deliveryCharge: number;
  appFee: number;
  tipAmount?: number;
  promoDiscount: number;
  total: number;
  showDeliveryCharge?: boolean;
}

export const PriceBreakdownSection: React.FC<PriceBreakdownSectionProps> = ({
  subtotal,
  tax,
  taxRate,
  deliveryCharge,
  appFee,
  tipAmount = 0,
  promoDiscount,
  total,
  showDeliveryCharge = true,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bill Details</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax ({taxRate}%)</Text>
        <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
      </View>
      
      {showDeliveryCharge && (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charge</Text>
          <Text style={[
            styles.priceValue,
            deliveryCharge === 0 && styles.freeDelivery
          ]}>
            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
          </Text>
        </View>
      )}
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Platform Fee</Text>
        <Text style={styles.priceValue}>₹{appFee.toFixed(2)}</Text>
      </View>
      
      {tipAmount > 0 && (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Tip</Text>
          <Text style={styles.priceValue}>₹{tipAmount.toFixed(2)}</Text>
        </View>
      )}
      
      {promoDiscount > 0 && (
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, styles.discountText]}>
            Promo Discount
          </Text>
          <Text style={[styles.priceValue, styles.discountText]}>
            -₹{promoDiscount.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={styles.divider} />
      
      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  freeDelivery: { color: '#4CAF50', fontWeight: '600' },
  discountText: { color: '#4CAF50' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#007AFF' },
});