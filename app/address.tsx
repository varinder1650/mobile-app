import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { openMapsWithAddress } from '../utils/mapUtils';
import { usePorterRequest } from '../contexts/PorterRequestContext';
import { SavedAddress, ManualAddressForm } from '../types/address.types';
import SavedAddressesList from '../components/SavedAddressesList';
import AddAddressForm from '../components/AddAddressForm';

export default function AddressScreen() {
  const { token, user } = useAuth();
  const params = useLocalSearchParams();
  const { setPickupAddress, setDeliveryAddress } = usePorterRequest();
  
  // Refs
  const pagerRef = useRef<PagerView>(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  
  // Navigation context
  const fromPage = params.from as string;
  const addressType = params.addressType as string;
  const isFromCheckout = fromPage === 'checkout';
  const isFromPorter = fromPage === 'porter-request';
  
  // Location states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Manual address form states
  const [manualAddress, setManualAddress] = useState<ManualAddressForm>({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    mobile_number: user?.phone?.replace('+91', '') || '',
  });
  
  // Saved addresses states
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  
  // General states
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Editing states
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Handle page change
  const handlePageChange = (page: number) => {
    pagerRef.current?.setPage(page);
    setCurrentPage(page);
    
    // Animate tab indicator
    Animated.spring(tabIndicatorAnim, {
      toValue: page,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  };

  // Handle form field changes
  const handleFormChange = (field: keyof ManualAddressForm, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));
  };

  // Handle location change from map
  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // Fetch saved addresses
  const fetchSavedAddresses = useCallback(async () => {
    if (!token) return;
    
    setLoadingSavedAddresses(true);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.MY_ADDRESS);
      
      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);
        
        const defaultAddress = addresses.find((addr: SavedAddress) => addr.is_default);
        if (defaultAddress && !selectedAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingSavedAddresses(false);
    }
  }, [token, selectedAddress]);

  // Save new address
  const saveManualAddress = async () => {
    if (!manualAddress.street.trim() || !manualAddress.city.trim() || 
        !manualAddress.pincode.trim() || !manualAddress.mobile_number.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Street, City, Pincode, and Mobile Number)');
      return;
    }

    if (manualAddress.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    if (manualAddress.mobile_number.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (savedAddresses.length >= 5) {
      Alert.alert('Address Limit Reached', 'You can only save up to 5 addresses.');
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        ...manualAddress,
        latitude: latitude || 0,
        longitude: longitude || 0,
      };

      const response = await authenticatedFetch(API_ENDPOINTS.USER_ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Address saved successfully!');
        await fetchSavedAddresses();
        
        setManualAddress({
          label: 'Home',
          street: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          mobile_number: user?.phone?.replace('+91', '') || '',
        });
        
        setLatitude(null);
        setLongitude(null);
        handlePageChange(0);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing address
  const updateAddress = async () => {
    if (!editingAddress) return;
    
    if (!manualAddress.street.trim() || !manualAddress.city.trim() || 
        !manualAddress.pincode.trim() || !manualAddress.mobile_number.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        ...manualAddress,
        latitude: latitude || editingAddress.latitude || 0,
        longitude: longitude || editingAddress.longitude || 0,
      };

      const response = await authenticatedFetch(
        `${API_ENDPOINTS.USER_ADDRESS}/${editingAddress._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Address updated successfully!');
        await fetchSavedAddresses();
        cancelEdit();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select address handler
  const selectAddress = async (address: SavedAddress) => {
    console.log('🎯 Address selected for:', fromPage, 'Type:', addressType);

    if (isFromPorter) {
      if (addressType === 'pickup') {
        console.log('✅ Setting pickup address:', address.label);
        setPickupAddress(address);
      } else if (addressType === 'delivery') {
        console.log('✅ Setting delivery address:', address.label);
        setDeliveryAddress(address);
      }
      router.back();
      return;
    }

    if (isFromCheckout) {
      setSettingDefault(address._id);
      
      try {
        const response = await authenticatedFetch(
          `${API_ENDPOINTS.USER_ADDRESS}/${address._id}/set-default`,
          { method: 'POST' }
        );
    
        if (response.ok) {
          setSelectedAddress(address);
          const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.pincode}`;
          
          Alert.alert(
            'Address Selected',
            'Your delivery address has been updated.',
            [{
              text: 'OK',
              onPress: () => {
                router.back();
                setTimeout(() => {
                  router.setParams({
                    addressId: address._id,
                    addressLabel: address.label,
                    address: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    mobile_number: address.mobile_number || '',
                    phone: address.mobile_number || '',
                    landmark: address.landmark || '',
                    fullAddress: fullAddress,
                    latitude: address.latitude?.toString() || '',
                    longitude: address.longitude?.toString() || '',
                    is_default: 'true',
                  });
                }, 100);
              }
            }]
          );
        } else {
          Alert.alert('Error', 'Failed to set default address');
        }
      } catch (error) {
        console.error('Error setting default address:', error);
        Alert.alert('Error', 'Network error. Please try again.');
      } finally {
        setSettingDefault(null);
      }
      return;
    }

    setSettingDefault(address._id);
    try {
      const response = await authenticatedFetch(
        `${API_ENDPOINTS.USER_ADDRESS}/${address._id}/set-default`,
        { method: 'POST' }
      );

      if (response.ok) {
        Alert.alert('Success', `${address.label} is now your default address`);
        await fetchSavedAddresses();
      } else {
        Alert.alert('Error', 'Failed to set default address');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSettingDefault(null);
    }
  };

  // Edit address
  const editAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setEditMode(true);
    setLatitude(address.latitude || null);
    setLongitude(address.longitude || null);
    setManualAddress({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      mobile_number: address.mobile_number || '',
    });
    handlePageChange(1);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingAddress(null);
    setEditMode(false);
    setLatitude(null);
    setLongitude(null);
    setManualAddress({
      label: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      mobile_number: user?.phone?.replace('+91', '') || '',
    });
    handlePageChange(0);
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await authenticatedFetch(
                `${API_ENDPOINTS.USER_ADDRESS}/${addressId}`,
                { method: 'DELETE' }
              );

              if (response.ok) {
                Alert.alert('Success', 'Address deleted successfully');
                await fetchSavedAddresses();
              } else {
                Alert.alert('Error', 'Failed to delete address');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  // Calculate tab indicator position
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on screen width if needed
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isFromPorter 
              ? `Select ${addressType === 'pickup' ? 'Pickup' : 'Delivery'} Address`
              : isFromCheckout 
              ? 'Select Delivery Address' 
              : 'Manage Addresses'
            }
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Selection mode banner */}
        {(isFromPorter || isFromCheckout) && (
          <View style={styles.selectionBanner}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.selectionBannerText}>
              {isFromPorter 
                ? `Swipe or tap to select ${addressType || 'delivery'} address`
                : 'Swipe or tap to select delivery address'
              }
            </Text>
          </View>
        )}

        {/* Tab Navigation with Swipe Indicator */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity
              style={[styles.tab, currentPage === 0 && styles.activeTab]}
              onPress={() => handlePageChange(0)}
            >
              <Ionicons 
                name="home" 
                size={20} 
                color={currentPage === 0 ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.tabText, currentPage === 0 && styles.activeTabText]}>
                Saved Addresses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentPage === 1 && styles.activeTab]}
              onPress={() => handlePageChange(1)}
            >
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={currentPage === 1 ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.tabText, currentPage === 1 && styles.activeTabText]}>
                Add New Address
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Animated indicator */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX: indicatorTranslateX }]
              }
            ]} 
          />
        </View>

        {/* Swipeable Content */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => {
            const page = e.nativeEvent.position;
            setCurrentPage(page);
            Animated.spring(tabIndicatorAnim, {
              toValue: page,
              useNativeDriver: true,
              friction: 8,
              tension: 60,
            }).start();
          }}
        >
          {/* Page 0: Saved Addresses */}
          <View key="saved" style={styles.pageContainer}>
            <SavedAddressesList
              addresses={savedAddresses}
              loading={loadingSavedAddresses}
              selectedAddress={selectedAddress}
              settingDefault={settingDefault}
              isFromPorter={isFromPorter}
              isFromCheckout={isFromCheckout}
              addressType={addressType}
              onSelectAddress={selectAddress}
              onEditAddress={editAddress}
              onDeleteAddress={deleteAddress}
              onGetDirections={openMapsWithAddress}
              onAddNewAddress={() => handlePageChange(1)}
            />
          </View>

          {/* Page 1: Add/Edit Address */}
          <View key="add" style={styles.pageContainer}>
            <AddAddressForm
              formData={manualAddress}
              latitude={latitude}
              longitude={longitude}
              locationLoading={locationLoading}
              editMode={editMode}
              loading={loading}
              addressesCount={savedAddresses.length}
              onFormChange={handleFormChange}
              onLocationChange={handleLocationChange}
              onSave={editMode ? updateAddress : saveManualAddress}
              onCancel={cancelEdit}
            />
          </View>
        </PagerView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  selectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#90CAF9',
  },
  selectionBannerText: {
    fontSize: 14,
    color: '#0277BD',
    fontWeight: '500',
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  activeTab: {
    // No border needed, indicator handles it
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});