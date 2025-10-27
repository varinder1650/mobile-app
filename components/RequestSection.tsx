// components/RequestSection.tsx - COMBINED PRODUCT & PORTER REQUESTS
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

interface RequestSectionProps {
  onRequestSubmitted?: () => void;
}

export interface RequestSectionRef {
  openForm: (tab?: 'product' | 'porter') => void;
}

export const RequestSection = forwardRef<RequestSectionRef, RequestSectionProps>(
  ({ onRequestSubmitted }, ref) => {
    const { token, user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'product' | 'porter'>('product');
    
    // Product Request Form Data
    const [productFormData, setProductFormData] = useState({
      product_name: '',
      brand: '',
      category: '',
      description: '',
    });

    // Porter Request Form Data
    const [porterFormData, setPorterFormData] = useState({
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
      openForm: (tab = 'product') => {
        setActiveTab(tab);
        setShowModal(true);
      }
    }));

    const validateProductForm = () => {
      if (!productFormData.product_name.trim()) {
        Alert.alert('Error', 'Please enter a product name');
        return false;
      }

      if (!productFormData.description.trim() || productFormData.description.trim().length < 10) {
        Alert.alert('Error', 'Please enter a detailed description (minimum 10 characters)');
        return false;
      }

      return true;
    };

    const validatePorterForm = () => {
      if (!porterFormData.pickup_address.trim() || porterFormData.pickup_address.trim().length < 10) {
        Alert.alert('Error', 'Please enter a valid pickup address (minimum 10 characters)');
        return false;
      }

      if (!porterFormData.pickup_city.trim()) {
        Alert.alert('Error', 'Please enter pickup city');
        return false;
      }

      if (!porterFormData.pickup_pincode.trim() || !/^\d{6}$/.test(porterFormData.pickup_pincode)) {
        Alert.alert('Error', 'Please enter a valid 6-digit pickup pincode');
        return false;
      }

      if (!porterFormData.delivery_address.trim() || porterFormData.delivery_address.trim().length < 10) {
        Alert.alert('Error', 'Please enter a valid delivery address (minimum 10 characters)');
        return false;
      }

      if (!porterFormData.delivery_city.trim()) {
        Alert.alert('Error', 'Please enter delivery city');
        return false;
      }

      if (!porterFormData.delivery_pincode.trim() || !/^\d{6}$/.test(porterFormData.delivery_pincode)) {
        Alert.alert('Error', 'Please enter a valid 6-digit delivery pincode');
        return false;
      }

      if (!porterFormData.phone.trim() || !/^\+?[\d\s-]{10,}$/.test(porterFormData.phone)) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return false;
      }

      if (!porterFormData.description.trim() || porterFormData.description.trim().length < 10) {
        Alert.alert('Error', 'Please describe what needs to be delivered (minimum 10 characters)');
        return false;
      }

      if (porterFormData.estimated_distance && parseFloat(porterFormData.estimated_distance) <= 0) {
        Alert.alert('Error', 'Please enter a valid distance');
        return false;
      }

      return true;
    };

    const handleProductSubmit = async () => {
      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login to request products',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/auth/login') }
          ]
        );
        return;
      }

      if (!validateProductForm()) {
        return;
      }

      setLoading(true);
      try {
        const requestData = {
          product_name: productFormData.product_name.trim(),
          brand: productFormData.brand.trim() || null,
          category: productFormData.category.trim() || null,
          description: productFormData.description.trim(),
        };

        const response = await fetch(`${API_BASE_URL}/support/product-requests`, {
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
            'Request Submitted!',
            'Thank you for your product request. We will review it and get back to you soon!',
            [
              {
                text: 'OK',
                onPress: () => {
                  setProductFormData({
                    product_name: '',
                    brand: '',
                    category: '',
                    description: '',
                  });
                  setShowModal(false);
                  onRequestSubmitted?.();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', data.detail || 'Failed to submit product request');
        }
      } catch (error) {
        console.error('Error submitting product request:', error);
        Alert.alert('Error', 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handlePorterSubmit = async () => {
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

      if (!validatePorterForm()) {
        return;
      }

      setLoading(true);
      try {
        const requestData = {
          pickup_address: {
            address: porterFormData.pickup_address.trim(),
            city: porterFormData.pickup_city.trim(),
            pincode: porterFormData.pickup_pincode.trim(),
          },
          delivery_address: {
            address: porterFormData.delivery_address.trim(),
            city: porterFormData.delivery_city.trim(),
            pincode: porterFormData.delivery_pincode.trim(),
          },
          phone: porterFormData.phone.trim(),
          description: porterFormData.description.trim(),
          estimated_distance: porterFormData.estimated_distance ? parseFloat(porterFormData.estimated_distance) : null,
          package_size: porterFormData.package_size,
          urgent: porterFormData.urgent,
        };

        const response = await fetch(`${API_BASE_URL}/porter/porter-requests`, {
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
                  setPorterFormData({
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

    const renderProductForm = () => (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.tabSubtitle}>
          Can't find what you're looking for? Request it and we'll try to add it to our catalog!
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={productFormData.product_name}
            onChangeText={(text) => setProductFormData(prev => ({ ...prev, product_name: text }))}
            placeholder="What product do you want?"
            maxLength={200}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              style={styles.input}
              value={productFormData.brand}
              onChangeText={(text) => setProductFormData(prev => ({ ...prev, brand: text }))}
              placeholder="Optional"
              maxLength={100}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              value={productFormData.category}
              onChangeText={(text) => setProductFormData(prev => ({ ...prev, category: text }))}
              placeholder="Optional"
              maxLength={100}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={styles.textArea}
            value={productFormData.description}
            onChangeText={(text) => setProductFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe the product in detail..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{productFormData.description.length}/1000</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleProductSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Product Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );

    const renderPorterForm = () => (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.tabSubtitle}>
          Need something delivered? Our porter service can help you deliver packages from one location to another.
        </Text>

        {/* Pickup Address Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📍 Pickup Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Address *</Text>
            <TextInput
              style={styles.input}
              value={porterFormData.pickup_address}
              onChangeText={(text) => setPorterFormData(prev => ({ ...prev, pickup_address: text }))}
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
                value={porterFormData.pickup_city}
                onChangeText={(text) => setPorterFormData(prev => ({ ...prev, pickup_city: text }))}
                placeholder="City"
                maxLength={50}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.input}
                value={porterFormData.pickup_pincode}
                onChangeText={(text) => setPorterFormData(prev => ({ ...prev, pickup_pincode: text }))}
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
              value={porterFormData.delivery_address}
              onChangeText={(text) => setPorterFormData(prev => ({ ...prev, delivery_address: text }))}
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
                value={porterFormData.delivery_city}
                onChangeText={(text) => setPorterFormData(prev => ({ ...prev, delivery_city: text }))}
                placeholder="City"
                maxLength={50}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.input}
                value={porterFormData.delivery_pincode}
                onChangeText={(text) => setPorterFormData(prev => ({ ...prev, delivery_pincode: text }))}
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
              value={porterFormData.phone}
              onChangeText={(text) => setPorterFormData(prev => ({ ...prev, phone: text }))}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Package Description *</Text>
            <TextInput
              style={styles.textArea}
              value={porterFormData.description}
              onChangeText={(text) => setPorterFormData(prev => ({ ...prev, description: text }))}
              placeholder="What needs to be delivered? (e.g., Documents, Small package, Food items)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{porterFormData.description.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Distance (km)</Text>
            <TextInput
              style={styles.input}
              value={porterFormData.estimated_distance}
              onChangeText={(text) => setPorterFormData(prev => ({ ...prev, estimated_distance: text }))}
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
                    porterFormData.package_size === size && styles.sizeButtonActive
                  ]}
                  onPress={() => setPorterFormData(prev => ({ ...prev, package_size: size }))}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    porterFormData.package_size === size && styles.sizeButtonTextActive
                  ]}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.urgentCheckbox}
            onPress={() => setPorterFormData(prev => ({ ...prev, urgent: !prev.urgent }))}
          >
            <Ionicons 
              name={porterFormData.urgent ? "checkbox" : "square-outline"} 
              size={24} 
              color={porterFormData.urgent ? "#007AFF" : "#999"} 
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
          onPress={handlePorterSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="bicycle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Porter Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );

    return (
      <View style={styles.container}>
        <View style={styles.requestSection}>
          <Text style={styles.title}>Can't find what you need?</Text>
          <Text style={styles.subtitle}>
            Request a product or book a porter service
          </Text>
          
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.requestButtonText}>Make a Request</Text>
          </TouchableOpacity>
        </View>

        {/* Combined Modal with Tabs */}
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
              <Text style={styles.modalTitle}>Request Services</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'product' && styles.tabActive]}
                onPress={() => setActiveTab('product')}
              >
                <Ionicons 
                  name="cart-outline" 
                  size={20} 
                  color={activeTab === 'product' ? "#007AFF" : "#999"} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'product' && styles.tabTextActive
                ]}>
                  Product Request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'porter' && styles.tabActive]}
                onPress={() => setActiveTab('porter')}
              >
                <Ionicons 
                  name="bicycle-outline" 
                  size={20} 
                  color={activeTab === 'porter' ? "#007AFF" : "#999"} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'porter' && styles.tabTextActive
                ]}>
                  Porter Service
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'product' ? renderProductForm() : renderPorterForm()}
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
);

RequestSection.displayName = 'RequestSection';

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
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabSubtitle: {
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