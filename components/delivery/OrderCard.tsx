import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, TabType } from '../../types/delivery.types';
import { formatDate, getStatusColor } from '../../utils/dateUtils';
import { styles } from '../../styles/delivery.styles';

interface OrderCardProps {
  item: Order;
  currentTab: TabType;
  actionLoading: boolean;
  handleAcceptOrder: (orderId: string) => void;
  handleMarkAsDelivered: (orderId: string) => void;
  openOrderDetails: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  item,
  currentTab,
  actionLoading,
  handleAcceptOrder,
  handleMarkAsDelivered,
  openOrderDetails,
}) => {
  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => currentTab === 'assigned' ? openOrderDetails(item) : undefined}
      activeOpacity={currentTab === 'assigned' ? 0.7 : 1}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id.toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) }]}>
          <Text style={styles.statusText}>{item.order_status}</Text>
        </View>
      </View>

      {currentTab === 'assigned' && (
        <View style={styles.assignedOrderDetails}>
          <View style={styles.customerSection}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.customerName}>{item.user_info?.name || 'N/A'}</Text>
          </View>
          
          <View style={styles.addressSection}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.deliveryAddress} numberOfLines={2}>
              {item.delivery_address ? 
                `${item.delivery_address.address}, ${item.delivery_address.city}, ${item.delivery_address.state} - ${item.delivery_address.pincode}` : 
                'Address not available'
              }
            </Text>
          </View>

          <View style={styles.itemsPreview}>
            <Ionicons name="cube-outline" size={16} color="#666" />
            <Text style={styles.itemsCount}>
              {item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          {item.payment_method === 'cod' && (
            <View style={styles.amountSection}>
              <Ionicons name="cash-outline" size={16} color="#34C759" />
              <Text style={styles.codLabel}>Cash on Delivery</Text>
              <Text style={styles.orderAmount}>₹{(item.total_amount || 0).toFixed(2)}</Text>
            </View>
          )}
        </View>
      )}

      {currentTab === 'available' && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAcceptOrder(item.id);
          }}
          disabled={actionLoading}
        >
          <Text style={styles.acceptButtonText}>
            {actionLoading ? 'Accepting...' : 'Accept Delivery'}
          </Text>
        </TouchableOpacity>
      )}

      {currentTab === 'assigned' && (
        <TouchableOpacity
          style={styles.deliveredButton}
          onPress={(e) => {
            e.stopPropagation();
            handleMarkAsDelivered(item.id);
          }}
          disabled={actionLoading}
        >
          <Text style={styles.deliveredButtonText}>
            {actionLoading ? 'Updating...' : 'Mark as Delivered'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default OrderCard;
