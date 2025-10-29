import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { openMapsWithAddress } from '../utils/mapUtils';
import { usePorterRequest } from '../contexts/PorterRequestContext';

interface SavedAddress {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  mobile_number?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

interface ManualAddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  mobile_number: string;
}

export default function AddressScreen() {
  const { token, user } = useAuth();
  const params = useLocalSearchParams();
  const { setPickupAddress, setDeliveryAddress } = usePorterRequest();
  // ✅ Get navigation context
  const fromPage = params.from as string; // 'checkout' or 'porter-request'
  const addressType = params.addressType as string; // 'pickup' or 'delivery' (for porter)
  const isFromCheckout = fromPage === 'checkout';
  const isFromPorter = fromPage === 'porter-request';
  
  // Location states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>('');
  
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
  const [currentTab, setCurrentTab] = useState<'saved' | 'add'>('saved');
  
  // Editing states
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleGetDirections = (address: SavedAddress) => {
    openMapsWithAddress({
      latitude: address.latitude,
      longitude: address.longitude,
      label: address.label,
      street: address.street,
    });
  };

  // Get current location and reverse geocode
  const getCurrentLocation = useCallback(async () => {
    console.log('📍 Getting current location...');
    
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your address.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude: lat, longitude: lng } = location.coords;
      console.log('📍 Location received:', lat, lng);
      
      setLatitude(lat);
      setLongitude(lng);
      
      const isInIndia = lat >= 8.4 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25;
      
      if (!isInIndia) {
        Alert.alert(
          'Location Outside India',
          'SmartBag currently operates only in India. Please enter your Indian address manually.'
        );
        setLocationLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('📍 Location error:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your location. Please enter address manually.'
      );
    } finally {
      setLocationLoading(false);
    }
  }, []);

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
    if (!manualAddress.street.trim() || !manualAddress.city.trim() || !manualAddress.pincode.trim() || !manualAddress.mobile_number.trim()) {
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
        setLocationAddress('');
        
        setCurrentTab('saved');
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
    
    if (!manualAddress.street.trim() || !manualAddress.city.trim() || !manualAddress.pincode.trim() || !manualAddress.mobile_number.trim()) {
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

  const selectAddress = async (address: SavedAddress) => {
    console.log('🎯 Address selected for:', fromPage, 'Type:', addressType);

    // ✅ Porter request selection - USE CONTEXT
    if (isFromPorter) {
      if (addressType === 'pickup') {
        console.log('✅ Setting pickup address:', address.label);
        setPickupAddress(address);
      } else if (addressType === 'delivery') {
        console.log('✅ Setting delivery address:', address.label);
        setDeliveryAddress(address);
      }
      
      // ✅ Simply go back - no params needed!
      router.back();
      return;
    }

    // ✅ Checkout selection (existing logic)
    if (isFromCheckout) {
      setSettingDefault(address._id);
      
      try {
        const response = await authenticatedFetch(
          `${API_ENDPOINTS.USER_ADDRESS}/${address._id}/set-default`,
          {
            method: 'POST',
          }
        );
    
        if (response.ok) {
          setSelectedAddress(address);
          
          const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.pincode}`;
          
          Alert.alert(
            'Address Selected',
            'Your delivery address has been updated.',
            [
              {
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
              }
            ]
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

    // ✅ Normal mode - just set as default
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
    setCurrentTab('add');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingAddress(null);
    setEditMode(false);
    setLatitude(null);
    setLongitude(null);
    setLocationAddress('');
    setManualAddress({
      label: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      mobile_number: user?.phone?.replace('+91', '') || '',
    });
    setCurrentTab('saved');
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

  // Render location display
  const renderLocationDisplay = () => {
    return (
      <View style={styles.locationContainer}>
        {locationLoading ? (
          <View style={styles.locationLoadingContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.locationLoadingText}>Detecting your location...</Text>
          </View>
        ) : latitude && longitude ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={48} color="#007AFF" />
            <Text style={styles.locationTitle}>Location Detected</Text>
            {locationAddress ? (
              <Text style={styles.locationAddress} numberOfLines={3}>
                {locationAddress}
              </Text>
            ) : (
              <Text style={styles.locationCoords}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.updateLocationText}>Update Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={48} color="#999" />
            <Text style={styles.locationTitle}>No Location Detected</Text>
            <Text style={styles.locationSubtitle}>
              Tap below to detect your current location
            </Text>
            
            <TouchableOpacity
              style={styles.detectLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.detectLocationText}>Detect My Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ✅ Render saved address card
  const renderSavedAddress = ({ item }: { item: SavedAddress }) => {
    const isSettingThisDefault = settingDefault === item._id;
    
    return (
      <View style={[
        styles.savedAddressCard,
        selectedAddress?._id === item._id && styles.selectedAddressCard
      ]}>
        <TouchableOpacity
          style={styles.addressContent}
          onPress={() => setSelectedAddress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.savedAddressHeader}>
            <View style={styles.addressLabelContainer}>
              <Ionicons 
                name={item.label === 'Home' ? 'home' : item.label === 'Office' ? 'business' : 'location'} 
                size={20} 
                color="#007AFF" 
              />
              <Text style={styles.addressLabel}>{item.label}</Text>
              {item.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            {selectedAddress?._id === item._id && (
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
            )}
          </View>
          
          <Text style={styles.savedAddressText} numberOfLines={2}>
            {item.street}, {item.city}, {item.state}, {item.pincode}
          </Text>
          
          {item.landmark && (
            <Text style={styles.landmarkText}>
              Near: {item.landmark}
            </Text>
          )}
          {item.mobile_number && (
            <Text style={styles.mobileText}>
              📱 {item.mobile_number}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* ✅ Action buttons */}
        <View style={styles.addressActionsContainer}>
          {/* ✅ PRIMARY: Select button for porter/checkout */}
          {(isFromPorter || isFromCheckout) && (
            <TouchableOpacity
              style={styles.selectAddressButton}
              onPress={() => selectAddress(item)}
              disabled={isSettingThisDefault}
            >
              {isSettingThisDefault ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.selectAddressButtonText}>
                    {isFromPorter 
                      ? `Select for ${addressType === 'pickup' ? 'Pickup' : 'Delivery'}`
                      : 'Use This Address'
                    }
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* ✅ SECONDARY: Normal mode buttons */}
          {!isFromPorter && !isFromCheckout && (
            <TouchableOpacity
              style={[
                styles.useAddressButton,
                item.is_default && styles.useAddressButtonDefault,
                isSettingThisDefault && styles.useAddressButtonLoading
              ]}
              onPress={() => selectAddress(item)}
              disabled={isSettingThisDefault}
            >
              {isSettingThisDefault ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={item.is_default ? "checkmark-circle" : "location"} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.useAddressButtonText}>
                    {item.is_default ? 'Default Address' : 'Set as Default'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {/* ✅ Edit/Delete buttons */}
          {!isFromPorter && !isFromCheckout && (
            <View style={styles.secondaryActions}>
              {item.latitude && item.longitude && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleGetDirections(item)}
                >
                  <Ionicons name="navigate" size={18} color="#007AFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => editAddress(item)}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => deleteAddress(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

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

        {/* ✅ Selection mode banner */}
        {(isFromPorter || isFromCheckout) && (
          <View style={styles.selectionBanner}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.selectionBannerText}>
              {isFromPorter 
                ? `Tap an address to select it for ${addressType || 'delivery'}`
                : 'Tap an address to use it for your order delivery'
              }
            </Text>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'saved' && styles.activeTab]}
            onPress={() => setCurrentTab('saved')}
          >
            <Ionicons 
              name="home-outline" 
              size={20} 
              color={currentTab === 'saved' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, currentTab === 'saved' && styles.activeTabText]}>
              Saved Addresses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, currentTab === 'add' && styles.activeTab]}
            onPress={() => setCurrentTab('add')}
          >
            <Ionicons 
              name="add-outline" 
              size={20} 
              color={currentTab === 'add' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, currentTab === 'add' && styles.activeTabText]}>
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Saved Addresses Tab */}
          {currentTab === 'saved' && (
            <View style={styles.savedAddressesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Addresses</Text>
                <Text style={styles.addressCount}>
                  {savedAddresses.length}/5 addresses
                </Text>
              </View>
              
              {loadingSavedAddresses ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : savedAddresses.length > 0 ? (
                <FlatList
                  data={savedAddresses}
                  renderItem={renderSavedAddress}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No saved addresses</Text>
                  <Text style={styles.emptySubtext}>Add your first address to get started</Text>
                  <TouchableOpacity
                    style={styles.addFirstAddressButton}
                    onPress={() => setCurrentTab('add')}
                  >
                    <Text style={styles.addFirstAddressText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Add New Address Tab */}
          {currentTab === 'add' && (
            <View style={styles.addAddressContainer}>
              <Text style={styles.sectionTitle}>
                {editMode ? 'Edit Address' : 'Add New Address'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Detect your location or enter address manually
              </Text>
              
              {/* Location Display */}
              <View style={styles.locationSection}>
                {renderLocationDisplay()}
              </View>

              {/* Manual Entry Form */}
              <View style={styles.manualFormSection}>
                <Text style={styles.formTitle}>Address Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Label</Text>
                  <View style={styles.labelButtonsContainer}>
                    {['Home', 'Office', 'Other'].map((label) => (
                      <TouchableOpacity
                        key={label}
                        style={[
                          styles.labelButton,
                          manualAddress.label === label && styles.labelButtonSelected
                        ]}
                        onPress={() => setManualAddress(prev => ({ ...prev, label }))}
                      >
                        <Text style={[
                          styles.labelButtonText,
                          manualAddress.label === label && styles.labelButtonTextSelected
                        ]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street Address *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={manualAddress.street}
                    onChangeText={(text) => setManualAddress(prev => ({ ...prev, street: text }))}
                    placeholder="House no, building, street name"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={manualAddress.city}
                      onChangeText={(text) => setManualAddress(prev => ({ ...prev, city: text }))}
                      placeholder="City name"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>State</Text>
                    <TextInput
                      style={styles.input}
                      value={manualAddress.state}
                      onChangeText={(text) => setManualAddress(prev => ({ ...prev, state: text }))}
                      placeholder="State name"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={manualAddress.mobile_number}
                    onChangeText={(text) => setManualAddress(prev => ({ ...prev, mobile_number: text.replace(/\D/g, '').substring(0, 10) }))}
                    placeholder="10-digit mobile number"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Pincode *</Text>
                    <TextInput
                      style={styles.input}
                      value={manualAddress.pincode}
                      onChangeText={(text) => setManualAddress(prev => ({ ...prev, pincode: text.replace(/\D/g, '').substring(0, 6) }))}
                      placeholder="6-digit pincode"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>Landmark</Text>
                    <TextInput
                      style={styles.input}
                      value={manualAddress.landmark}
                      onChangeText={(text) => setManualAddress(prev => ({ ...prev, landmark: text }))}
                      placeholder="Optional"
                    />
                  </View>
                </View>

                {latitude && longitude && (
                  <View style={styles.coordinatesInfo}>
                    <Ionicons name="location" size={16} color="#4CAF50" />
                    <Text style={styles.coordinatesText}>
                      ✅ Location coordinates detected
                    </Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.saveButton, 
                      loading && styles.saveButtonDisabled,
                      editMode && { flex: 1 }
                    ]} 
                    onPress={editMode ? updateAddress : saveManualAddress}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editMode ? 'Update Address' : 'Save Address'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  {editMode && (
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={cancelEdit}
                      disabled={loading}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {savedAddresses.length >= 5 && !editMode && (
                <View style={styles.limitWarning}>
                  <Ionicons name="warning-outline" size={16} color="#FF9500" />
                  <Text style={styles.limitWarningText}>
                    Maximum 5 addresses reached. Delete one to add a new address.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  
  // ✅ Selection banner
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#666', marginLeft: 6, fontWeight: '500' },
  activeTabText: { color: '#007AFF', fontWeight: '600' },
  content: { flex: 1 },
  locationSection: { marginBottom: 20 },
  locationContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  locationLoadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLoadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  locationInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  locationTitle: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginTop: 12, marginBottom: 8 },
  locationSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  locationAddress: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16, paddingHorizontal: 20 },
  locationCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateLocationText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  detectLocationText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  savedAddressesContainer: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  addressCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedAddressCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectedAddressCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  addressContent: { padding: 16 },
  savedAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  defaultBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
  defaultText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  savedAddressText: { fontSize: 14, color: '#666', lineHeight: 18, marginBottom: 4 },
  landmarkText: { fontSize: 12, color: '#999', marginTop: 4, fontStyle: 'italic' },
  mobileText: { fontSize: 12, color: '#007AFF', marginTop: 4, fontWeight: '500' },
  
  // ✅ Action buttons
  addressActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectAddressButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  useAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  useAddressButtonDefault: { backgroundColor: '#4CAF50' },
  useAddressButtonLoading: { backgroundColor: '#999' },
  useAddressButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 40,
    alignItems: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#999', marginBottom: 24 },
  addFirstAddressButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  addFirstAddressText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addAddressContainer: { padding: 16 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  manualFormSection: { marginTop: 20 },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  labelButtonsContainer: { flexDirection: 'row' },
  labelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  labelButtonSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  labelButtonText: { fontSize: 14, color: '#666' },
  labelButtonTextSelected: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  coordinatesText: { fontSize: 12, color: '#2E7D32', marginLeft: 8, flex: 1 },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, alignItems: 'center', marginLeft: 12, flex: 1 },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginTop: 16,
  },
  limitWarningText: { fontSize: 14, color: '#856404', marginLeft: 8, flex: 1, lineHeight: 18 },
});