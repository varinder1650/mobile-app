import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { styles } from '../../styles/delivery.styles';

interface DeliveryHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

const DeliveryHeader: React.FC<DeliveryHeaderProps> = ({ loading, refreshing, onRefresh }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Delivery Dashboard</Text>
      <TouchableOpacity onPress={onRefresh} disabled={loading || refreshing}>
        <Ionicons 
          name="refresh" 
          size={24} 
          color={loading || refreshing ? "#ccc" : "#007AFF"} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default DeliveryHeader;