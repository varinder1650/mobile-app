// components/PorterRequestSection.tsx - UPDATED VERSION
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export interface PorterRequestRef {
  openPorterRequest: () => void;
  closePorterRequest: () => void;
}

interface PorterRequestSectionProps {
  onRequestSubmitted?: () => void;
}

export const PorterRequestSection = forwardRef<PorterRequestRef, PorterRequestSectionProps>(
  ({ onRequestSubmitted }, ref) => {
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      openPorterRequest: () => {
        setModalVisible(true);
      },
      closePorterRequest: () => {
        setModalVisible(false);
      },
    }));

    const handleCreateRequest = () => {
      setModalVisible(false);
      router.push('/create-porter-request');
    };

    const handleViewRequests = () => {
      setModalVisible(false);
      router.push('/porter-requests');
    };

    return (
      <>
        {/* Porter Service Card */}
        <View style={styles.porterCard}>
          <View style={styles.porterHeader}>
            <View style={styles.porterIconContainer}>
              <Ionicons name="bicycle" size={32} color="#007AFF" />
            </View>
            <View style={styles.porterTextContainer}>
              <Text style={styles.porterTitle}>Porter Service</Text>
              <Text style={styles.porterSubtitle}>
                Quick delivery from pickup to drop location
              </Text>
            </View>
          </View>

          <View style={styles.porterFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={16} color="#34C759" />
              <Text style={styles.featureText}>Same-day delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.featureText}>Secure handling</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={16} color="#34C759" />
              <Text style={styles.featureText}>Real-time tracking</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.requestButtonText}>Request Porter Service</Text>
          </TouchableOpacity>
        </View>

        {/* Porter Options Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Porter Service</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {/* Create New Request */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={handleCreateRequest}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="add-circle" size={40} color="#007AFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Create New Request</Text>
                    <Text style={styles.optionDescription}>
                      Request delivery from pickup to drop location
                    </Text>
                    <View style={styles.optionSteps}>
                      <View style={styles.stepItem}>
                        <View style={styles.stepBullet} />
                        <Text style={styles.stepText}>Select addresses</Text>
                      </View>
                      <View style={styles.stepItem}>
                        <View style={styles.stepBullet} />
                        <Text style={styles.stepText}>Enter package details</Text>
                      </View>
                      <View style={styles.stepItem}>
                        <View style={styles.stepBullet} />
                        <Text style={styles.stepText}>Get cost estimate</Text>
                      </View>
                      <View style={styles.stepItem}>
                        <View style={styles.stepBullet} />
                        <Text style={styles.stepText}>Pay and track</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                {/* View My Requests */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={handleViewRequests}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="list" size={40} color="#34C759" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>My Requests</Text>
                    <Text style={styles.optionDescription}>
                      View and manage your porter requests
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.featureTag}>
                        <Ionicons name="time" size={14} color="#666" />
                        <Text style={styles.featureTagText}>Track status</Text>
                      </View>
                      <View style={styles.featureTag}>
                        <Ionicons name="cash" size={14} color="#666" />
                        <Text style={styles.featureTagText}>View costs</Text>
                      </View>
                      <View style={styles.featureTag}>
                        <Ionicons name="card" size={14} color="#666" />
                        <Text style={styles.featureTagText}>Make payment</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                {/* Info Section */}
                <View style={styles.infoSection}>
                  <Ionicons name="information-circle" size={20} color="#007AFF" />
                  <Text style={styles.infoText}>
                    You'll receive notifications for cost estimates and delivery updates
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  porterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  porterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  porterIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  porterTextContainer: {
    flex: 1,
  },
  porterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  porterSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  porterFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width - 32,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  optionSteps: {
    gap: 6,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  stepText: {
    fontSize: 13,
    color: '#666',
  },
  optionFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureTagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0277BD',
    lineHeight: 18,
  },
});