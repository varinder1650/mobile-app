import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';
import { router } from 'expo-router';

interface PorterRequestSectionProps {
  onRequestSubmitted?: () => void;
}

export interface PorterRequestRef {
  openForm: () => void;
}

export const PorterRequestSection = forwardRef<PorterRequestRef, PorterRequestSectionProps>(
  ({ onRequestSubmitted }, ref) => {
    const { token, user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
      pickup_address: '',
      pickup_city: '',
      pickup_pincode: '',
      delivery_address: '',
      delivery_city: '',
      delivery_pincode: '',
      phone: '',
      description: '',
      estimated_distance: '',
      package_size: 'small',
      urgent: false,
    });

    useImperativeHandle(ref, () => ({
      openForm: () => {
        setShowModal(true);
      }
    }));

    const validateForm = () => {
      if (!formData.pickup_address.trim() || formData.pickup_address.trim().length < 10) {
        Alert.alert('Error', 'Please enter a valid pickup address (minimum 10 characters)');
        return false;
      }

      if (!formData.pickup_city.trim()) {
        Alert.alert('Error', 'Please enter pickup city');
        return false;
      }

      if (!formData.pickup_pincode.trim() || !/^\d{6}$/.test(formData.pickup_pincode)) {
        Alert.alert('Error', 'Please enter a valid 6-digit pickup pincode');
        return false;
      }

      if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 10) {
        Alert.alert('Error', 'Please enter a valid delivery address (minimum 10 characters)');
        return false;
      }

      if (!formData.delivery_city.trim()) {
        Alert.alert('Error', 'Please enter delivery city');
        return false;
      }

      if (!formData.delivery_pincode.trim() || !/^\d{6}$/.test(formData.delivery_pincode)) {
        Alert.alert('Error', 'Please enter a valid 6-digit delivery pincode');
        return false;
      }

      if (!formData.phone.trim() || !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return false;
      }

      if (!formData.description.trim() || formData.description.trim().length < 10) {
        Alert.alert('Error', 'Please describe what needs to be delivered (minimum 10 characters)');
        return false;
      }

      if (formData.estimated_distance && parseFloat(formData.estimated_distance) <= 0) {
        Alert.alert('Error', 'Please enter a valid distance');
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login to request porter service',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/auth/login') }
          ]
        );
        return;
      }

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const requestData = {
          pickup_address: {
            address: formData.pickup_address.trim(),
            city: formData.pickup_city.trim(),
            pincode: formData.pickup_pincode.trim(),
          },
          delivery_address: {
            address: formData.delivery_address.trim(),
            city: formData.delivery_city.trim(),
            pincode: formData.delivery_pincode.trim(),
          },
          phone: formData.phone.trim(),
          description: formData.description.trim(),
          estimated_distance: formData.estimated_distance ? parseFloat(formData.estimated_distance) : null,
          package_size: formData.package_size,
          urgent: formData.urgent,
        };

        const response = await fetch(`${API_BASE_URL}/support/porter-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (response.ok) {
          Alert.alert(
            'Porter Request Submitted! 🚚',
            'Your delivery request has been received. A delivery partner will contact you shortly at the provided phone number.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setFormData({
                    pickup_address: '',
                    pickup_city: '',
                    pickup_pincode: '',
                    delivery_address: '',
                    delivery_city: '',
                    delivery_pincode: '',
                    phone: '',
                    description: '',
                    estimated_distance: '',
                    package_size: 'small',
                    urgent: false,
                  });
                  setShowModal(false);
                  onRequestSubmitted?.();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', data.detail || 'Failed to submit porter request');
        }
      } catch (error) {
        console.error('Error submitting porter request:', error);
        Alert.alert('Error', 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.requestSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="bicycle-outline" size={48} color="#007AFF" />
          </View>
          <Text style={styles.title}>Need Porter Service?</Text>
          <Text style={styles.subtitle}>
            Quick delivery from one location to another
          </Text>
          
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="bicycle" size={20} color="#fff" />
            <Text style={styles.requestButtonText}>Request Porter</Text>
          </TouchableOpacity>
        </View>

        {/* Porter Request Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Request Porter Service</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Need something delivered? Our porter service can help you deliver packages from one location to another.
              </Text>

              {/* Pickup Address Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📍 Pickup Location</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pickup Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.pickup_address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, pickup_address: text }))}
                    placeholder="Enter full pickup address"
                    multiline
                    numberOfLines={2}
                    maxLength={300}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.pickup_city}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, pickup_city: text }))}
                      placeholder="City"
                      maxLength={50}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Pincode *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.pickup_pincode}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, pickup_pincode: text }))}
                      placeholder="000000"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>

              {/* Delivery Address Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>🎯 Delivery Location</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.delivery_address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, delivery_address: text }))}
                    placeholder="Enter full delivery address"
                    multiline
                    numberOfLines={2}
                    maxLength={300}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.delivery_city}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, delivery_city: text }))}
                      placeholder="City"
                      maxLength={50}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Pincode *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.delivery_pincode}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, delivery_pincode: text }))}
                      placeholder="000000"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>

              {/* Contact & Package Details */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📦 Package Details</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    placeholder="+91 9876543210"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Package Description *</Text>
                  <TextInput
                    style={styles.textArea}
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                    placeholder="What needs to be delivered? (e.g., Documents, Small package, Food items)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{formData.description.length}/500</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estimated Distance (km)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.estimated_distance}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, estimated_distance: text }))}
                    placeholder="Optional"
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Package Size *</Text>
                  <View style={styles.packageSizeContainer}>
                    {['small', 'medium', 'large'].map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.sizeButton,
                          formData.package_size === size && styles.sizeButtonActive
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, package_size: size }))}
                      >
                        <Text style={[
                          styles.sizeButtonText,
                          formData.package_size === size && styles.sizeButtonTextActive
                        ]}>
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.urgentCheckbox}
                  onPress={() => setFormData(prev => ({ ...prev, urgent: !prev.urgent }))}
                >
                  <Ionicons 
                    name={formData.urgent ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={formData.urgent ? "#007AFF" : "#999"} 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.urgentLabel}>Urgent Delivery</Text>
                    <Text style={styles.urgentSubtext}>Priority delivery with faster response time</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>
                  Our delivery partner will contact you at the provided phone number to confirm the delivery details and provide an estimated cost.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Porter Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
);

PorterRequestSection.displayName = 'PorterRequestSection';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  requestSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalPlaceholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  packageSizeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sizeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sizeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  urgentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 8,
  },
  urgentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  urgentSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});