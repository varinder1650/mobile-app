// app/porter-requests.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

interface PorterRequest {
  _id: string;
  id: string;
  pickup_address: {
    address: string;
    city: string;
    pincode: string;
  };
  delivery_address: {
    address: string;
    city: string;
    pincode: string;
  };
  phone: string;
  description: string;
  estimated_distance: number | null;
  package_size: string;
  urgent: boolean;
  status: string;
  assigned_partner_name: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  created_at: string;
  updated_at: string;
}

export default function PorterRequestsScreen() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<PorterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PorterRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPorterRequests();
  }, []);

  const fetchPorterRequests = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/porter/porter-requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        console.error('Failed to fetch porter requests');
      }
    } catch (error) {
      console.error('Error fetching porter requests:', error);
      Alert.alert('Error', 'Failed to load porter requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPorterRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'assigned': return '#007AFF';
      case 'in_transit': return '#5856D6';
      case 'delivered': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPackageSizeIcon = (size: string) => {
    switch (size) {
      case 'small': return '📦';
      case 'medium': return '📦📦';
      case 'large': return '📦📦📦';
      default: return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const openRequestDetails = (request: PorterRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const closeRequestDetails = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const renderRequestCard = ({ item }: { item: PorterRequest }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => openRequestDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <View style={styles.routeInfo}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#34C759" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.pickup_address.city}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#999" style={styles.arrowIcon} />
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FF3B30" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.delivery_address.city}
              </Text>
            </View>
          </View>
          
          <View style={styles.packageInfo}>
            <Text style={styles.packageSize}>
              {getPackageSizeIcon(item.package_size)} {item.package_size}
            </Text>
            {item.urgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.requestDate}>{formatDate(item.created_at)}</Text>
        </View>
        
        <View style={styles.requestStatusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chevronIcon} />
        </View>
      </View>

      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {item.assigned_partner_name && (
        <View style={styles.partnerInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#007AFF" />
          <Text style={styles.partnerText}>Partner: {item.assigned_partner_name}</Text>
        </View>
      )}

      {item.estimated_cost && (
        <View style={styles.costInfo}>
          <Ionicons name="cash-outline" size={16} color="#34C759" />
          <Text style={styles.costText}>Estimated: ₹{item.estimated_cost.toFixed(2)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const RequestDetailsModal = () => {
    if (!selectedRequest) return null;
    
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRequestDetails}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Porter Request Details</Text>
            <TouchableOpacity onPress={closeRequestDetails} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Status Card */}
            <View style={styles.detailSection}>
              <View style={styles.statusHeader}>
                <Text style={styles.sectionTitle}>Current Status</Text>
                <View style={[
                  styles.largeStatusBadge,
                  { backgroundColor: getStatusColor(selectedRequest.status) }
                ]}>
                  <Text style={styles.largeStatusText}>
                    {getStatusText(selectedRequest.status)}
                  </Text>
                </View>
              </View>
              
              {selectedRequest.urgent && (
                <View style={styles.urgentAlert}>
                  <Ionicons name="flash" size={20} color="#FF9500" />
                  <Text style={styles.urgentAlertText}>Urgent Delivery Request</Text>
                </View>
              )}
            </View>

            {/* Pickup Location */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#34C759" />
                <Text style={styles.sectionTitle}>Pickup Location</Text>
              </View>
              <Text style={styles.addressText}>{selectedRequest.pickup_address.address}</Text>
              <Text style={styles.addressText}>
                {selectedRequest.pickup_address.city} - {selectedRequest.pickup_address.pincode}
              </Text>
            </View>

            {/* Delivery Location */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#FF3B30" />
                <Text style={styles.sectionTitle}>Delivery Location</Text>
              </View>
              <Text style={styles.addressText}>{selectedRequest.delivery_address.address}</Text>
              <Text style={styles.addressText}>
                {selectedRequest.delivery_address.city} - {selectedRequest.delivery_address.pincode}
              </Text>
            </View>

            {/* Package Details */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Package Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{selectedRequest.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Package Size:</Text>
                <Text style={styles.detailValue}>
                  {getPackageSizeIcon(selectedRequest.package_size)} {selectedRequest.package_size}
                </Text>
              </View>
              {selectedRequest.estimated_distance && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.estimated_distance} km</Text>
                </View>
              )}
            </View>

            {/* Contact Information */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={18} color="#007AFF" />
                <Text style={styles.contactText}>{selectedRequest.phone}</Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => {
                    Alert.alert(
                      'Call Partner',
                      `Do you want to call ${selectedRequest.phone}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Call', 
                          onPress: () => {
                            const Linking = require('react-native').Linking;
                            Linking.openURL(`tel:${selectedRequest.phone}`);
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Partner & Cost */}
            {(selectedRequest.assigned_partner_name || selectedRequest.estimated_cost) && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Delivery Details</Text>
                {selectedRequest.assigned_partner_name && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assigned Partner:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.assigned_partner_name}</Text>
                  </View>
                )}
                {selectedRequest.estimated_cost && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Cost:</Text>
                    <Text style={styles.detailValueHighlight}>₹{selectedRequest.estimated_cost.toFixed(2)}</Text>
                  </View>
                )}
                {selectedRequest.actual_cost && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Actual Cost:</Text>
                    <Text style={styles.detailValueHighlight}>₹{selectedRequest.actual_cost.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Timeline */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Requested:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedRequest.created_at)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedRequest.updated_at)}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading porter requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Porter Requests</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{requests.length}</Text>
          <Text style={styles.summaryLabel}>Total Requests</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {requests.filter(r => r.status === 'pending').length}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {requests.filter(r => r.status === 'delivered').length}
          </Text>
          <Text style={styles.summaryLabel}>Delivered</Text>
        </View>
      </View>

      {/* Requests List */}
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bicycle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Porter Requests</Text>
          <Text style={styles.emptySubtitle}>
            You haven't requested any porter services yet. Request from the home screen to get started.
          </Text>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item._id || item.id}
          style={styles.requestsList}
          contentContainerStyle={styles.requestsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}

      <RequestDetailsModal />
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
  },
  placeholder: {
    width: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  homeButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsList: {
    flex: 1,
  },
  requestsListContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageSize: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  requestStatusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chevronIcon: {
    marginTop: 4,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 4,
  },
  partnerText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 13,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  largeStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  largeStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  urgentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  urgentAlertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  detailValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    flex: 1,
    textAlign: 'right',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#34C759',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});