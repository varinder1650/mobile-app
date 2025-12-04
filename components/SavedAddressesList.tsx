import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddress } from '../types/address.types';

interface SavedAddressesListProps {
  addresses: SavedAddress[];
  loading: boolean;
  selectedAddress: SavedAddress | null;
  settingDefault: string | null;
  isFromPorter: boolean;
  isFromCheckout: boolean;
  addressType?: string;
  onSelectAddress: (address: SavedAddress) => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  onGetDirections: (address: SavedAddress) => void;
  onAddNewAddress: () => void;
}

export default function SavedAddressesList({
  addresses,
  loading,
  selectedAddress,
  settingDefault,
  isFromPorter,
  isFromCheckout,
  addressType,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onGetDirections,
  onAddNewAddress,
}: SavedAddressesListProps) {
  
  const renderSavedAddress = ({ item }: { item: SavedAddress }) => {
    const isSettingThisDefault = settingDefault === item._id;
    
    return (
      <View style={[
        styles.savedAddressCard,
        selectedAddress?._id === item._id && styles.selectedAddressCard
      ]}>
        <TouchableOpacity
          style={styles.addressContent}
          onPress={() => onSelectAddress(item)}
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
        
        <View style={styles.addressActionsContainer}>
          {(isFromPorter || isFromCheckout) && (
            <TouchableOpacity
              style={styles.selectAddressButton}
              onPress={() => onSelectAddress(item)}
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

          {!isFromPorter && !isFromCheckout && (
            <TouchableOpacity
              style={[
                styles.useAddressButton,
                item.is_default && styles.useAddressButtonDefault,
                isSettingThisDefault && styles.useAddressButtonLoading
              ]}
              onPress={() => onSelectAddress(item)}
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
          
          {!isFromPorter && !isFromCheckout && (
            <View style={styles.secondaryActions}>
              {item.latitude && item.longitude && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onGetDirections(item)}
                >
                  <Ionicons name="navigate" size={18} color="#007AFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => onEditAddress(item)}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => onDeleteAddress(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  if (addresses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No saved addresses</Text>
        <Text style={styles.emptySubtext}>Add your first address to get started</Text>
        <TouchableOpacity
          style={styles.addFirstAddressButton}
          onPress={onAddNewAddress}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addFirstAddressText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Addresses</Text>
        <Text style={styles.addressCount}>
          {addresses.length}/5 addresses
        </Text>
      </View>
      
      <FlatList
        data={addresses}
        renderItem={renderSavedAddress}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addressCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listContent: {
    paddingBottom: 20,
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
  addressContent: {
    padding: 16,
  },
  savedAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  savedAddressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  landmarkText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  mobileText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
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
  useAddressButtonDefault: {
    backgroundColor: '#4CAF50',
  },
  useAddressButtonLoading: {
    backgroundColor: '#999',
  },
  useAddressButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  addFirstAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFirstAddressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});