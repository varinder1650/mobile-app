import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export default function PrintoutOrdersTab() {
  const { token } = useAuth();
  const [printoutOrders, setPrintoutOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrintoutOrders();
  }, []);

  const fetchPrintoutOrders = async () => {
    if (!token) return;

    try {
      const response = await authenticatedFetch(`${API_ENDPOINTS.ORDERS}/my`);
      if (response.ok) {
        const data = await response.json();
        // Filter only printout orders
        const printouts = data.orders?.filter(
          (order: any) => order.order_type === 'printout'
        ) || [];
        setPrintoutOrders(printouts);
      }
    } catch (error) {
      console.error('Error fetching printout orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrintoutOrders();
    setRefreshing(false);
  };

  const renderPrintoutCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order-tracking/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Ionicons name="print" size={24} color="#007AFF" />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) }]}>
          <Text style={styles.statusText}>{item.order_status}</Text>
        </View>
      </View>

      <View style={styles.printoutDetails}>
        <Text style={styles.detailText}>
          {item.printout_details?.service_type === 'photo' ? '📷 Photo Prints' : '📄 Documents'}
        </Text>
        <Text style={styles.detailText}>
          {item.printout_details?.size?.toUpperCase()} • {item.printout_details?.color_option === 'bw' ? 'B&W' : 'Color'}
        </Text>
        <Text style={styles.detailText}>
          {item.printout_details?.copies} copies • {item.printout_details?.files?.length} files
        </Text>
      </View>

      <Text style={styles.amount}>₹{item.total_amount?.toFixed(2)}</Text>

      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FF9500',
      confirmed: '#007AFF',
      preparing: '#5856D6',
      ready: '#34C759',
      completed: '#34C759',
      cancelled: '#FF3B30',
    };
    return colors[status] || '#8E8E93';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (printoutOrders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="print-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Printout Orders</Text>
        <Text style={styles.emptySubtitle}>
          Your printout orders will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={printoutOrders}
      renderItem={renderPrintoutCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  listContent: { padding: 16 },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  printoutDetails: { marginBottom: 12, gap: 4 },
  detailText: { fontSize: 14, color: '#666' },
  amount: { fontSize: 18, fontWeight: '700', color: '#007AFF', marginBottom: 8 },
  orderDate: { fontSize: 12, color: '#999' },
});