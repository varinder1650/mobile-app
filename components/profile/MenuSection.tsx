import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import MenuItem from './MenuItem';
import { styles } from '../../styles/profile.styles';

const MenuSection: React.FC = () => {
  const handleEditProfile = () => {
    try {
      router.push('/profile-management');
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate to profile management');
    }
  };

  const handleMyOrders = () => {
    try {
      router.push('/orders');
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate to orders');
    }
  };

  const handleMyAddresses = () => {
    try {
      router.push('/address');
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate to addresses');
    }
  };

  const handleHelpSupport = () => {
    try {
      router.push('/help-support');
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate to help & support');
    }
  };

  return (
    <View style={styles.menuSection}>
      <MenuItem 
        icon="person-outline"
        text="Edit Profile"
        onPress={handleEditProfile}
      />
      <MenuItem 
        icon="receipt-outline"
        text="My Orders"
        onPress={handleMyOrders}
      />
      <MenuItem 
        icon="location-outline"
        text="My Addresses"
        onPress={handleMyAddresses}
      />
      <MenuItem 
        icon="help-circle-outline"
        text="Help & Support"
        onPress={handleHelpSupport}
      />
    </View>
  );
};

export default MenuSection;
