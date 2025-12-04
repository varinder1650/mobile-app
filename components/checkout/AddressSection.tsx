// components/checkout/AddressSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AddressSection.styles';

interface AddressData {
  _id?: string;
  label?: string;
  street?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile_number?: string;
  phone: string;
  landmark?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

interface AddressSectionProps {
  deliveryAddress: AddressData | null;
  onSelectAddress: () => void;
  disabled?: boolean;
}

export const AddressSection: React.FC<AddressSectionProps> = ({ 
  deliveryAddress, 
  onSelectAddress,
  disabled 
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="location-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Delivery Address</Text>
      </View>
      
      {deliveryAddress ? (
        <View style={styles.addressCard}>
          <View style={styles.addressInfo}>
            <View style={styles.addressLabelRow}>
              {deliveryAddress.label && (
                <View style={styles.labelBadge}>
                  <Ionicons 
                    name={
                      deliveryAddress.label === 'Home' 
                        ? 'home' 
                        : deliveryAddress.label === 'Office' 
                        ? 'business' 
                        : 'location'
                    } 
                    size={14} 
                    color="#007AFF" 
                  />
                  <Text style={styles.labelText}>{deliveryAddress.label}</Text>
                </View>
              )}
              {deliveryAddress.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{deliveryAddress.fullAddress}</Text>
            {deliveryAddress.phone && (
              <Text style={styles.phoneText}>📱 {deliveryAddress.phone}</Text>
            )}
            {deliveryAddress.latitude && deliveryAddress.longitude && (
              <View style={styles.coordinatesRow}>
                <Ionicons name="navigate" size={12} color="#4CAF50" />
                <Text style={styles.coordinatesText}>
                  GPS: {deliveryAddress.latitude.toFixed(4)}, {deliveryAddress.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changeAddressButton}
            onPress={onSelectAddress}
            disabled={disabled}
          >
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.changeAddressText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.selectAddressButton}
          onPress={onSelectAddress}
          disabled={disabled}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.selectAddressText}>Select Delivery Address</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );
};