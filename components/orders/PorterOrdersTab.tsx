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
import { API_BASE_URL } from '../../config/apiConfig';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export default function PorterOrdersTab() {
  const { token } = useAuth();
  const [porterRequests, setPorterRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPorterRequests();
  }, []);

  const fetchPorterRequests = async () => {
    if (!token) return;

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/porter/porter-requests/my-requests`
      );
      if (response.ok) {
        const data = await response.json();
        setPorterRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching porter requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPorterRequests();
    setRefreshing(false);
  };

  const renderPorterCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push('/porter-requests')}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Ionicons name="bicycle" size={24} color="#007AFF" />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#34C759" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup_address?.city}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#999" />
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#FF3B30" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.delivery_address?.city}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={1}>
        {item.description}
      </Text>

      {item.estimated_cost && (
        <Text style={styles.amount}>₹{item.estimated_cost.toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FF9500',
      assigned: '#007AFF',
      in_transit: '#5856D6',
      delivered: '#34C759',
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

  if (porterRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bicycle-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Porter Requests</Text>
        <Text style={styles.emptySubtitle}>
          Your porter delivery requests will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={porterRequests}
      renderItem={renderPorterCard}
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
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 },
  locationText: { fontSize: 14, color: '#333', flex: 1 },
  description: { fontSize: 14, color: '#666', marginBottom: 8 },
  amount: { fontSize: 18, fontWeight: '700', color: '#007AFF' },
});