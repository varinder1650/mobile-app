// components/checkout/PromoCodeSection.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './PromoCodeSection.styles';

interface PromoCode {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

interface PromoCodeSectionProps {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  appliedPromo: PromoCode | null;
  promoDiscount: number;
  loading: boolean;
  disabled?: boolean;
}

export const PromoCodeSection: React.FC<PromoCodeSectionProps> = ({
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  onRemovePromo,
  appliedPromo,
  promoDiscount,
  loading,
  disabled
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="pricetag-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Promo Code</Text>
      </View>
      
      {appliedPromo ? (
        <View style={styles.appliedPromoContainer}>
          <View style={styles.appliedPromoInfo}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.appliedPromoText}>
              <Text style={styles.appliedPromoCode}>{appliedPromo.code}</Text>
              <Text style={styles.appliedPromoDiscount}>
                You saved ₹{promoDiscount.toFixed(2)}!
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRemovePromo} disabled={disabled}>
            <Ionicons name="close-circle" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.promoInputContainer}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={onPromoCodeChange}
            autoCapitalize="characters"
            editable={!loading && !disabled}
          />
          <TouchableOpacity
            style={[styles.applyPromoButton, (loading || disabled) && styles.disabledButton]}
            onPress={onApplyPromo}
            disabled={loading || disabled}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyPromoText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};