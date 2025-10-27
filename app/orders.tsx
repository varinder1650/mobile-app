// app/orders.tsx - MINIMAL UPDATE (ONLY ADDED PORTER TAB)
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OrderItem {
  product: string;
  product_name: string;
  product_image: Array<{url: string; thumbnail: string}>;
  quantity: number;
  price: number;
}

interface Order {
  _id?: string;
  id?: string;
  items?: OrderItem[];
  delivery_address?: {
    address: string;
    city: string;
    state?: string;
    pincode: string;
  };
  payment_method?: string;
  subtotal?: number;
  tax?: number;
  delivery_charge?: number;
  app_fee?: number;
  total_amount?: number;
  order_status?: string;
  payment_status?: string;
  created_at?: string;
}

interface ProductRequest {
  _id: string;
  product_name: string;
  brand?: string;
  category?: string;
  description: string;
  status: string;
  votes: number;
  created_at: string;
  updated_at: string;
}

// ✅ NEW: Porter Request Interface
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

export default function OrdersScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'requests' | 'porter'>('orders'); // ✅ Added 'porter'
  const [orders, setOrders] = useState<Order[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [porterRequests, setPorterRequests] = useState<PorterRequest[]>([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPorter, setSelectedPorter] = useState<PorterRequest | null>(null); // ✅ NEW
  const [modalVisible, setModalVisible] = useState(false);
  const [porterModalVisible, setPorterModalVisible] = useState(false); // ✅ NEW

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'requests') {
      fetchProductRequests();
    } else if (activeTab === 'porter') { // ✅ NEW
      fetchPorterRequests();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.MY_ORDERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        const ordersArray = data.orders || [];
        setOrders(ordersArray);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductRequests = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/support/product-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductRequests(data || []);
      } else {
        console.error('Failed to fetch product requests');
      }
    } catch (error) {
      console.error('Error fetching product requests:', error);
      Alert.alert('Error', 'Failed to load product requests');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch Porter Requests
  const fetchPorterRequests = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/porter/porter-requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPorterRequests(data.requests || []);
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
    if (activeTab === 'orders') {
      await fetchOrders();
    } else if (activeTab === 'requests') {
      await fetchProductRequests();
    } else if (activeTab === 'porter') { // ✅ NEW
      await fetchPorterRequests();
    }
    setRefreshing(false);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeOrderDetails = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  // ✅ NEW: Porter Details
  const openPorterDetails = (porter: PorterRequest) => {
    setSelectedPorter(porter);
    setPorterModalVisible(true);
  };

  const closePorterDetails = () => {
    setPorterModalVisible(false);
    setSelectedPorter(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'preparing':
        return '#5856D6';
      case 'out_for_delivery':
        return '#FF2D92';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      case 'assigned': // ✅ Porter status
        return '#007AFF';
      case 'in_transit': // ✅ Porter status
        return '#5856D6';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'assigned': // ✅ Porter status
        return 'Assigned';
      case 'in_transit': // ✅ Porter status
        return 'In Transit';
      default:
        return status;
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'under_review':
        return '#007AFF';
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'added':
        return '#5856D6';
      default:
        return '#8E8E93';
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
        timeZone: 'Asia/Kolkata',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // ✅ NEW: Package size icons
  const getPackageSizeIcon = (size: string) => {
    switch (size) {
      case 'small': return '📦';
      case 'medium': return '📦📦';
      case 'large': return '📦📦📦';
      default: return '📦';
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const orderId = item.id || 'N/A';
    const itemCount = item.items?.length || 0;
    console.log(orderId)
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => openOrderDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>
              Order #{orderId.toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>
              {item.created_at ? formatDate(item.created_at) : 'Date not available'}
            </Text>
            <Text style={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.order_status || 'pending') }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(item.order_status || 'pending')}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.deliveryAddress} numberOfLines={1}>
              {item.delivery_address ? 
                `${item.delivery_address.address}, ${item.delivery_address.city}` : 
                'Address not available'
              }
            </Text>
          </View>
          
          <View style={styles.orderSummary}>
            <Text style={styles.totalAmount}>₹{(item.total_amount || 0).toFixed(2)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductRequest = ({ item }: { item: ProductRequest }) => {
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{item.product_name}</Text>
          <View style={[
            styles.requestStatusBadge,
            { backgroundColor: getRequestStatusColor(item.status) }
          ]}>
            <Text style={styles.requestStatusText}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        {item.brand && (
          <Text style={styles.requestBrand}>Brand: {item.brand}</Text>
        )}
        {item.category && (
          <Text style={styles.requestCategory}>Category: {item.category}</Text>
        )}
        
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    );
  };

  // ✅ NEW: Render Porter Request Card
  const renderPorterRequest = ({ item }: { item: PorterRequest }) => {
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => openPorterDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <View style={styles.porterRoute}>
            <View style={styles.porterLocationRow}>
              <Ionicons name="location" size={14} color="#34C759" />
              <Text style={styles.porterCity} numberOfLines={1}>{item.pickup_address.city}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#999" style={{ marginHorizontal: 6 }} />
            <View style={styles.porterLocationRow}>
              <Ionicons name="location" size={14} color="#FF3B30" />
              <Text style={styles.porterCity} numberOfLines={1}>{item.delivery_address.city}</Text>
            </View>
          </View>
          <View style={[
            styles.requestStatusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.requestStatusText}>
              {getStatusText(item.status).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.porterMeta}>
          <Text style={styles.porterPackageSize}>
            {getPackageSizeIcon(item.package_size)} {item.package_size}
          </Text>
          {item.urgent && (
            <View style={styles.porterUrgentBadge}>
              <Ionicons name="flash" size={10} color="#fff" />
              <Text style={styles.porterUrgentText}>URGENT</Text>
            </View>
          )}
          {item.estimated_cost && (
            <Text style={styles.porterCost}>₹{item.estimated_cost.toFixed(2)}</Text>
          )}
        </View>

        {item.assigned_partner_name && (
          <View style={styles.porterPartner}>
            <Ionicons name="person-circle-outline" size={14} color="#007AFF" />
            <Text style={styles.porterPartnerText}>Partner: {item.assigned_partner_name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;
    
    const orderId = selectedOrder._id || selectedOrder.id || 'N/A';
    
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeOrderDetails}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={closeOrderDetails} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailValue}>#{orderId.toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.created_at ? formatDate(selectedOrder.created_at) : 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[
                  styles.inlineStatusBadge,
                  { backgroundColor: getStatusColor(selectedOrder.order_status || 'pending') }
                ]}>
                  <Text style={styles.inlineStatusText}>
                    {getStatusText(selectedOrder.order_status || 'pending')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Items Ordered</Text>
              {(selectedOrder.items || []).map((orderItem, index) => (
                <View key={index} style={styles.detailItemRow}>
                  <View style={styles.detailItemInfo}>
                    <Text style={styles.detailItemName}>
                      {orderItem.product_name || 'Product not available'}
                    </Text>
                    <Text style={styles.detailItemQuantity}>Quantity: {orderItem.quantity}</Text>
                  </View>
                  <Text style={styles.detailItemPrice}>
                    ₹{(orderItem.price * orderItem.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <Text style={styles.addressText}>
                {selectedOrder.delivery_address?.address}
              </Text>
              <Text style={styles.addressText}>
                {selectedOrder.delivery_address?.city}, {selectedOrder.delivery_address?.state}
              </Text>
              <Text style={styles.addressText}>
                PIN: {selectedOrder.delivery_address?.pincode}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{(selectedOrder.subtotal || 0).toFixed(2)}</Text>
              </View>
              {(selectedOrder.tax || 0) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax:</Text>
                  <Text style={styles.summaryValue}>₹{(selectedOrder.tax || 0).toFixed(2)}</Text>
                </View>
              )}
              {(selectedOrder.delivery_charge || 0) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Charge:</Text>
                  <Text style={styles.summaryValue}>₹{(selectedOrder.delivery_charge || 0).toFixed(2)}</Text>
                </View>
              )}
              {(selectedOrder.app_fee || 0) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Platform Fee:</Text>
                  <Text style={styles.summaryValue}>₹{(selectedOrder.app_fee || 0).toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{(selectedOrder.total_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method:</Text>
                <Text style={styles.summaryValue}>
                  {(selectedOrder.payment_method || 'cod') === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // ✅ NEW: Porter Details Modal
  const PorterDetailsModal = () => {
    if (!selectedPorter) return null;
    
    return (
      <Modal
        visible={porterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePorterDetails}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Porter Request Details</Text>
            <TouchableOpacity onPress={closePorterDetails} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={[
                styles.inlineStatusBadge,
                { backgroundColor: getStatusColor(selectedPorter.status) }
              ]}>
                <Text style={styles.inlineStatusText}>
                  {getStatusText(selectedPorter.status)}
                </Text>
              </View>
              {selectedPorter.urgent && (
                <View style={styles.urgentAlert}>
                  <Ionicons name="flash" size={16} color="#FF9500" />
                  <Text style={styles.urgentAlertText}>Urgent Delivery</Text>
                </View>
              )}
            </View>

            <View style={styles.detailSection}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={18} color="#34C759" />
                <Text style={styles.sectionTitle}>Pickup Location</Text>
              </View>
              <Text style={styles.addressText}>{selectedPorter.pickup_address.address}</Text>
              <Text style={styles.addressText}>
                {selectedPorter.pickup_address.city}, PIN: {selectedPorter.pickup_address.pincode}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={18} color="#FF3B30" />
                <Text style={styles.sectionTitle}>Delivery Location</Text>
              </View>
              <Text style={styles.addressText}>{selectedPorter.delivery_address.address}</Text>
              <Text style={styles.addressText}>
                {selectedPorter.delivery_address.city}, PIN: {selectedPorter.delivery_address.pincode}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Package Details</Text>
              <Text style={styles.addressText}>
                {getPackageSizeIcon(selectedPorter.package_size)} Package Size: {selectedPorter.package_size}
              </Text>
              <Text style={styles.addressText}>Description: {selectedPorter.description}</Text>
              {selectedPorter.estimated_distance && (
                <Text style={styles.addressText}>Distance: {selectedPorter.estimated_distance} km</Text>
              )}
              <Text style={styles.addressText}>Contact: {selectedPorter.phone}</Text>
            </View>

            {selectedPorter.assigned_partner_name && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Delivery Partner</Text>
                <Text style={styles.partnerName}>{selectedPorter.assigned_partner_name}</Text>
              </View>
            )}

            {selectedPorter.estimated_cost && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Estimated Cost</Text>
                <Text style={styles.costAmount}>₹{selectedPorter.estimated_cost.toFixed(2)}</Text>
              </View>
            )}
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* ✅ UPDATED: Added Porter Tab */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'porter' && styles.activeTab]}
          onPress={() => setActiveTab('porter')}
        >
          <Text style={[styles.tabText, activeTab === 'porter' && styles.activeTabText]}>
            Porter
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'orders' ? (
        orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here
            </Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item._id || item.id || `order-${Math.random()}`}
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
            contentContainerStyle={styles.ordersListContent}
          />
        )
      ) : activeTab === 'requests' ? (
        productRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No product requests</Text>
            <Text style={styles.emptySubtitle}>
              Request products you'd like to see in our store
            </Text>
          </View>
        ) : (
          <FlatList
            data={productRequests}
            renderItem={renderProductRequest}
            keyExtractor={(item) => item._id}
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
            contentContainerStyle={styles.ordersListContent}
          />
        )
      ) : (
        // ✅ NEW: Porter Requests Tab Content
        porterRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No porter requests</Text>
            <Text style={styles.emptySubtitle}>
              Request porter service from the home screen
            </Text>
          </View>
        ) : (
          <FlatList
            data={porterRequests}
            renderItem={renderPorterRequest}
            keyExtractor={(item) => item._id}
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
            contentContainerStyle={styles.ordersListContent}
          />
        )
      )}

      <OrderDetailsModal />
      <PorterDetailsModal />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
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
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 13,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    padding: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  requestStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  requestBrand: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 4,
  },
  requestCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  // ✅ NEW: Porter-specific styles
  porterRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  porterLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  porterCity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
    flex: 1,
  },
  porterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  porterPackageSize: {
    fontSize: 13,
    color: '#666',
  },
  porterUrgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  porterUrgentText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  porterCost: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  porterPartner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  porterPartnerText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 6,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inlineStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  inlineStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  detailItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  detailItemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  detailItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  // ✅ NEW: Porter modal styles
  urgentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  urgentAlertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 6,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  costAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
});