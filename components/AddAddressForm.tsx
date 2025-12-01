// components/AddAddressForm.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ManualAddressForm } from '../types/address.types';
import AddressMap from './AddressMap';

interface AddAddressFormProps {
  formData: ManualAddressForm;
  latitude: number | null;
  longitude: number | null;
  locationLoading: boolean;
  editMode: boolean;
  loading: boolean;
  addressesCount: number;
  onFormChange: (field: keyof ManualAddressForm, value: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AddAddressForm({
  formData,
  latitude,
  longitude,
  locationLoading,
  editMode,
  loading,
  addressesCount,
  onFormChange,
  onLocationChange,
  onSave,
  onCancel,
}: AddAddressFormProps) {
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>
        {editMode ? 'Edit Address' : 'Add New Address'}
      </Text>
      <Text style={styles.sectionSubtitle}>
        Pin your location on the map or enter details manually
      </Text>
      
      {/* Map Section */}
      <View style={styles.mapSection}>
        <AddressMap
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
          loading={locationLoading}
        />
      </View>

      {/* Manual Entry Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Address Details</Text>

        {/* Address Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address Label</Text>
          <View style={styles.labelButtonsContainer}>
            {['Home', 'Office', 'Other'].map((label) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.labelButton,
                  formData.label === label && styles.labelButtonSelected
                ]}
                onPress={() => onFormChange('label', label)}
              >
                <Ionicons
                  name={
                    label === 'Home' 
                      ? 'home' 
                      : label === 'Office' 
                      ? 'business' 
                      : 'location'
                  }
                  size={16}
                  color={formData.label === label ? '#fff' : '#666'}
                  style={styles.labelIcon}
                />
                <Text style={[
                  styles.labelButtonText,
                  formData.label === label && styles.labelButtonTextSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Street Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Street Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={formData.street}
            onChangeText={(text) => onFormChange('street', text)}
            placeholder="House no, building, street name"
            placeholderTextColor="#999"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* City and State Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => onFormChange('city', text)}
              placeholder="City name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => onFormChange('state', text)}
              placeholder="State name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Mobile Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.phonePrefix}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              value={formData.mobile_number}
              onChangeText={(text) => 
                onFormChange('mobile_number', text.replace(/\D/g, '').substring(0, 10))
              }
              placeholder="10-digit mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Pincode and Landmark Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>
              Pincode <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.pincode}
              onChangeText={(text) => 
                onFormChange('pincode', text.replace(/\D/g, '').substring(0, 6))
              }
              placeholder="6-digit pincode"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Landmark</Text>
            <TextInput
              style={styles.input}
              value={formData.landmark}
              onChangeText={(text) => onFormChange('landmark', text)}
              placeholder="Optional"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Location Coordinates Info */}
        {latitude && longitude && (
          <View style={styles.coordinatesInfo}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <View style={styles.coordinatesTextContainer}>
              <Text style={styles.coordinatesTitle}>Location Detected</Text>
              <Text style={styles.coordinatesText}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              loading && styles.saveButtonDisabled,
              editMode && styles.saveButtonEdit
            ]} 
            onPress={onSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={editMode ? "checkmark" : "save-outline"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Update Address' : 'Save Address'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {editMode && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel}
              disabled={loading}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address Limit Warning */}
        {addressesCount >= 5 && !editMode && (
          <View style={styles.limitWarning}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.limitWarningText}>
              Maximum 5 addresses reached. Delete one to add a new address.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  mapSection: {
    marginBottom: 24,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  labelButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  labelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  labelButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  labelIcon: {
    marginRight: 6,
  },
  labelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  labelButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#e8e8e8',
  },
  phoneInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  coordinatesTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#388E3C',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonEdit: {
    backgroundColor: '#4CAF50',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginTop: 16,
  },
  limitWarningText: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});