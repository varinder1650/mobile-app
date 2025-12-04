// components/order-tracking/DeliveryPartnerCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DeliveryPartnerCard.styles';

interface DeliveryPartner {
  name?: string;
  phone?: string;
  rating?: number;
  deliveries?: number;
}

interface DeliveryPartnerCardProps {
  partner: DeliveryPartner;
}

export const DeliveryPartnerCard: React.FC<DeliveryPartnerCardProps> = ({ partner }) => {
  const handleCall = () => {
    if (partner.phone) {
      Linking.openURL(`tel:${partner.phone}`);
    } else {
      Alert.alert('Info', 'Delivery partner contact not available yet');
    }
  };

  return (
    <View style={styles.deliveryPartnerSection}>
      <View style={styles.partnerHeader}>
        <View style={styles.partnerAvatar}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerLabel}>Your Delivery Partner</Text>
          <Text style={styles.partnerName}>
            {partner.name || 'Delivery Partner'}
          </Text>
          {partner.rating && (
            <View style={styles.partnerRatingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.partnerRatingText}>
                {partner.rating.toFixed(1)}
              </Text>
              {partner.deliveries && partner.deliveries > 0 && (
                <Text style={styles.deliveriesText}>
                  • {partner.deliveries} deliveries
                </Text>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.callPartnerButton}
          onPress={handleCall}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};