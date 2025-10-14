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
import { useAuth } from '../contexts/AuthContext';

export default function OrderTrackingScreen() {
  const { activeOrder, loading, refreshActiveOrder } = useOrderTracking();
  const { token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

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

  const getStatusColor = () => {
    return '#00A65A';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Preparing your order';
      case 'assigning':
        return 'Assigning delivery partner shortly';
      case 'assigned':
        return 'Delivery partner assigned';
      case 'out_for_delivery':
        return 'On the way';
      case 'delivered':
        return 'Order delivered';
      default:
        return 'Order in progress';
    }
  };

  if (loading && !activeOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A65A" />
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
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          {/* <Text style={styles.headerTitle}>{activeOrder?.restaurant_name || 'Restaurant'}</Text> */}
          {/* <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity> */}
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
    <View style={styles.container}>
      {/* Green Header */}
      <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            {/* <Text style={styles.headerTitle}>{activeOrder.restaurant_name || 'Restaurant'}</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity> */}
          </View>

          {/* Status Section */}
          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>{getStatusText(activeOrder.order_status)}</Text>
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryText}>
                Arriving in {activeOrder.estimated_delivery_time || '30'} mins • On time
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshIcon}>
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Promotional Banner Carousel */}
        {/* <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Apply now ▸</Text>
          </View>
          <View style={styles.carouselDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View> */}

        {/* Tip Section - Show when assigning */}
        {activeOrder.order_status === 'assigning' && (
          <View style={styles.tipSection}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="person-circle-outline" size={40} color="#E74C3C" />
              </View>
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Assigning delivery partner shortly</Text>
              </View>
            </View>
            <Text style={styles.tipDescription}>
              Make their day by leaving a tip. 100% of the amount will go to them after delivery
            </Text>
            <View style={styles.tipOptions}>
              <TouchableOpacity
                style={[styles.tipButton, selectedTip === 20 && styles.tipButtonSelected]}
                onPress={() => setSelectedTip(20)}
              >
                <Text style={[styles.tipButtonText, selectedTip === 20 && styles.tipButtonTextSelected]}>
                  ₹20
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipButton, selectedTip === 30 && styles.tipButtonSelected]}
                onPress={() => setSelectedTip(30)}
              >
                <Text style={[styles.tipButtonText, selectedTip === 30 && styles.tipButtonTextSelected]}>
                  ₹30
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipButton, selectedTip === 50 && styles.tipButtonSelected]}
                onPress={() => setSelectedTip(50)}
              >
                <Text style={[styles.tipButtonText, selectedTip === 50 && styles.tipButtonTextSelected]}>
                  ₹50
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipButton, selectedTip === 0 && styles.tipButtonSelected]}
                onPress={() => setSelectedTip(0)}
              >
                <Text style={[styles.tipButtonText, selectedTip === 0 && styles.tipButtonTextSelected]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.safetyLink}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              <Text style={styles.safetyLinkText}>Learn about delivery partner safety</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Details Card */}
        <View style={styles.deliveryDetailsCard}>
          <View style={styles.deliveryDetailsHeader}>
            <Text style={styles.deliveryDetailsTitle}>
              All your delivery details in one place 👇
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailTitle}>
                {activeOrder.delivery_address?.phone || 'Phone Number'}
              </Text>
              <Text style={styles.detailSubtitle}>Delivery partner may call this number</Text>
            </View>
            {/* <TouchableOpacity>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity> */}
          </View>

          {/* Delivery Address */}
          <View style={styles.detailRow}>
            <Ionicons name="home-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              {/* <Text style={styles.detailTitle}>
                {activeOrder.delivery_address?.label || 'Delivery at Home'}
              </Text> */}
              <Text style={styles.detailSubtitle} numberOfLines={2}>
                {activeOrder.delivery_address?.address || 'Address not available'}
              </Text>
            </View>
            {/* <TouchableOpacity>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity> */}
          </View>

          {/* Delivery Instructions */}
          {/* <TouchableOpacity style={styles.instructionsRow}>
            <Ionicons name="bicycle-outline" size={24} color="#666" />
            <Text style={styles.instructionsText}>Add delivery instructions</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity> */}
        </View>

        {/* Restaurant Card */}
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantHeader}>
            {/* <View style={styles.restaurantAvatar}>
              <Ionicons name="restaurant" size={28} color="#fff" />
            </View> */}
            {/* <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{activeOrder.restaurant_name}</Text>
              <Text style={styles.restaurantLocation}>
                {activeOrder.restaurant?.location || 'Location'}
              </Text>
            </View> */}
            {activeOrder.delivery_partner && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDeliveryPartner}
              >
                <Ionicons name="call" size={24} color="#00A65A" />
              </TouchableOpacity>
            )}
          </View>

          {/* Order Details */}
          <TouchableOpacity style={styles.orderDetailsRow}>
            <Ionicons name="receipt-outline" size={24} color="#666" />
            <View style={styles.orderDetailsText}>
              <Text style={styles.orderNumber}>Order #{activeOrder.id}</Text>
              <View style={styles.orderItemsPreview}>
                <View style={styles.vegIcon}>
                  <View style={styles.vegDot} />
                </View>
                <Text style={styles.orderItemsText} numberOfLines={1}>
                  {activeOrder.items?.length || 0} x items
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Add cooking requests */}
          {/* <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="chatbox-outline" size={24} color="#ccc" />
            <Text style={styles.optionTextDisabled}>Add cooking requests</Text>
          </TouchableOpacity> */}

          {/* Add more items */}
          {/* <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="add-circle-outline" size={24} color="#666" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Add more items</Text>
              <Text style={styles.optionSubtext}>Get free delivery on additional items</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity> */}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpRow}
          onPress={() => router.push('/help-support')}
          >
            <View style={styles.helpIconContainer}>
              <Ionicons name="headset-outline" size={28} color="#E74C3C" />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need help with your order?</Text>
              <Text style={styles.helpSubtitle}>Get help & support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.cancelRow}>
            <Ionicons name="close-circle-outline" size={24} color="#666" />
            <Text style={styles.cancelText}>Cancel order</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity> */}
        </View>

        {/* Notifications Section */}
        {/* <View style={styles.notificationsSection}>
          <TouchableOpacity style={styles.notificationRow}>
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications-outline" size={28} color="#FF9500" />
            </View>
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationTitle}>Get live order updates</Text>
              <Text style={styles.notificationSubtitle}>Enable notifications to get updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View> */}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#00A65A',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 4,
  },
  statusSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginRight: 8,
  },
  refreshIcon: {
    padding: 4,
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
    backgroundColor: '#00A65A',
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
  bannerContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 12,
  },
  banner: {
    paddingHorizontal: 16,
  },
  bannerText: {
    fontSize: 14,
    color: '#666',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
  },
  activeDot: {
    backgroundColor: '#00A65A',
  },
  tipSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tipButtonSelected: {
    backgroundColor: '#00A65A',
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipButtonTextSelected: {
    color: '#fff',
  },
  safetyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  safetyLinkText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  deliveryDetailsCard: {
    backgroundColor: '#FFF9E6',
    marginTop: 8,
    padding: 16,
  },
  deliveryDetailsHeader: {
    marginBottom: 16,
  },
  deliveryDetailsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A65A',
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 13,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderDetailsText: {
    flex: 1,
    marginLeft: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  orderItemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegIcon: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#00A65A',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A65A',
  },
  orderItemsText: {
    fontSize: 13,
    color: '#666',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionTextDisabled: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    marginLeft: 12,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
    color: '#666',
  },
  helpSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  notificationsSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});