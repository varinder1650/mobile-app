import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

export default function OrderTrackingScreen() {
  const { activeOrder, loading, refreshActiveOrder } = useOrderTracking();
  const { token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshActiveOrder();
    setRefreshing(false);
  };

  const handleCallDeliveryPartner = () => {
    if (activeOrder?.delivery_partner?.phone) {
      Linking.openURL(`tel:${activeOrder.delivery_partner.phone}`);
    } else {
      Alert.alert('Info', 'Delivery partner contact not available yet');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return '#007AFF';
      case 'preparing':
      case 'assigning':
      case 'accepted':
        return '#5856D6';
      case 'assigned':
      case 'out_for_delivery':
        return '#FF9500';
      case 'arrived':
      case 'delivered':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  // Helper to get timestamp from status_change_history
  const getStatusTimestamp = (status: string) => {
    const historyItem = activeOrder?.status_change_history?.find(
      (item: any) => item.status === status
    );
    return historyItem?.changed_at || null;
  };

  // Helper to check if status is completed
  const isStatusCompleted = (checkStatus: string) => {
    const statusOrder = [
      'confirmed', 
      'preparing',
      'assigning',
      'assigned',
      'out_for_delivery',
      'arrived',
      'delivered'
    ];
    
    const currentIndex = statusOrder.indexOf(activeOrder?.order_status || 'pending');
    const checkIndex = statusOrder.indexOf(checkStatus);
    
    return checkIndex <= currentIndex;
  };

  if (loading && !activeOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading order status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Active Orders</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any orders being delivered right now
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Order #{activeOrder.id?.slice(-6)}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[
                styles.statusTitle,
                { color: getStatusColor(activeOrder.order_status) }
              ]}>
                {activeOrder.order_status?.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[
              styles.statusIconContainer,
              { backgroundColor: getStatusColor(activeOrder.order_status) + '20' }
            ]}>
              <Ionicons 
                name="checkmark-circle" 
                size={48} 
                color={getStatusColor(activeOrder.order_status)} 
              />
            </View>
          </View>

          {/* {activeOrder.status_message && (
            <View style={styles.messageContainer}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.messageText}>{activeOrder.status_message}</Text>
            </View>
          )} */}

          {/* {activeOrder.estimated_delivery_time && (
            <View style={styles.estimatedTime}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.estimatedTimeText}>
                Estimated: {formatTime(activeOrder.estimated_delivery_time)}
              </Text>
            </View>
          )} */}
        </View>

        {/* Delivery Partner Card */}
        {activeOrder.delivery_partner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Partner</Text>
            <View style={styles.partnerCard}>
              <View style={styles.partnerInfo}>
                <View style={styles.partnerAvatar}>
                  <Ionicons name="person" size={28} color="#fff" />
                </View>
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerName}>
                    {activeOrder.delivery_partner.name || 'Delivery Partner'}
                  </Text>
                  {activeOrder.delivery_partner.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {activeOrder.delivery_partner.rating.toFixed(1)}
                      </Text>
                      {activeOrder.delivery_partner.deliveries && (
                        <Text style={styles.deliveriesText}>
                          • {activeOrder.delivery_partner.deliveries} deliveries
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDeliveryPartner}
              >
                <Ionicons name="call" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Items Summary */}
        {activeOrder.items && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items ({activeOrder.items.length})</Text>
            <View style={styles.itemsCard}>
              {activeOrder.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product_name || item.product} x{item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              
              {/* Pricing Breakdown */}
              <View style={styles.pricingSection}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Subtotal</Text>
                  <Text style={styles.pricingValue}>₹{activeOrder.subtotal?.toFixed(2)}</Text>
                </View>
                {activeOrder.tax > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Tax</Text>
                    <Text style={styles.pricingValue}>₹{activeOrder.tax?.toFixed(2)}</Text>
                  </View>
                )}
                {activeOrder.delivery_charge > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Delivery</Text>
                    <Text style={styles.pricingValue}>₹{activeOrder.delivery_charge?.toFixed(2)}</Text>
                  </View>
                )}
                {activeOrder.app_fee > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Service Fee</Text>
                    <Text style={styles.pricingValue}>₹{activeOrder.app_fee?.toFixed(2)}</Text>
                  </View>
                )}
                {activeOrder.promo_discount > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={[styles.pricingLabel, { color: '#34C759' }]}>Promo Discount</Text>
                    <Text style={[styles.pricingValue, { color: '#34C759' }]}>
                      -₹{activeOrder.promo_discount?.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ₹{activeOrder.total_amount?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timelineCard}>
            {renderTimelineItem(
              'delivered',
              'Delivered', 
              activeOrder.delivered_at || getStatusTimestamp('delivered'),
              isStatusCompleted('delivered')
            )}
            {renderTimelineItem(
              'arrived',
              'Arrived at location',
              activeOrder.arrived_at || getStatusTimestamp('arrived'),
              isStatusCompleted('arrived')
            )}
            {renderTimelineItem(
              'out_for_delivery',
              'Out for delivery',
              activeOrder.out_for_delivery_at || getStatusTimestamp('out_for_delivery'),
              isStatusCompleted('out_for_delivery')
            )}
            {renderTimelineItem(
              'assigned',
              'Partner assigned',
              activeOrder.assigned_at || getStatusTimestamp('assigned'),
              isStatusCompleted('assigned')
            )}
            {renderTimelineItem(
              'preparing',
              'Being prepared',
              activeOrder.preparing_at || getStatusTimestamp('preparing'),
              isStatusCompleted('preparing')
            )}
            {renderTimelineItem(
              'confirmed',
              'Order confirmed',
              activeOrder.confirmed_at || activeOrder.created_at,
              true
            )}
          </View>
        </View>

        {/* Delivery Address */}
        {activeOrder.delivery_address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location" size={24} color="#007AFF" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {activeOrder.delivery_address.address}
                </Text>
                <Text style={styles.addressSubtext}>
                  {activeOrder.delivery_address.city}, {activeOrder.delivery_address.state} {activeOrder.delivery_address.pincode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Help Section */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push('/help-support')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.helpText}>Need help with this order?</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );

  function renderTimelineItem(
    status: string,
    label: string,
    time: string | null,
    isCompleted: boolean
  ) {
    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineIndicator}>
          <View style={[
            styles.timelineDot,
            isCompleted && styles.timelineDotCompleted
          ]}>
            {isCompleted && (
              <Ionicons name="checkmark" size={12} color="#fff" />
            )}
          </View>
          {status !== 'confirmed' && (
            <View style={[
              styles.timelineLine,
              isCompleted && styles.timelineLineCompleted
            ]} />
          )}
        </View>
        <View style={styles.timelineContent}>
          <Text style={[
            styles.timelineLabel,
            isCompleted && styles.timelineLabelCompleted
          ]}>
            {label}
          </Text>
          {time && isCompleted && (
            <Text style={styles.timelineTime}>{formatTime(time)}</Text>
          )}
          {!isCompleted && (
            <Text style={styles.timelinePending}>Pending</Text>
          )}
        </View>
      </View>
    );
  }
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
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  estimatedTimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  partnerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  deliveriesText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  itemsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pricingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timelineCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#34C759',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    minHeight: 20,
  },
  timelineLineCompleted: {
    backgroundColor: '#34C759',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: 15,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#333',
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  timelinePending: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 13,
    color: '#666',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
});