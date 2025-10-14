import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order } from '../../types/delivery.types';
import { getStatusColor } from '../../utils/dateUtils';
import { styles } from '../../styles/delivery.styles';

interface OrderDetailsModalProps {
  selectedOrder: Order;
  actionLoading: boolean;
  handleMarkAsDelivered: (orderId: string) => void;
  setIsModalVisible: (visible: boolean) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  selectedOrder,
  actionLoading,
  handleMarkAsDelivered,
  setIsModalVisible,
}) => {
  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
          <Text style={styles.modalCancelText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.modalContentScroll}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>#{selectedOrder.id.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[
              styles.inlineStatusBadge,
              { backgroundColor: getStatusColor(selectedOrder.order_status) }
            ]}>
              <Text style={styles.inlineStatusText}>{selectedOrder.order_status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{selectedOrder.user_info?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{selectedOrder.user_info?.phone || 'N/A'}</Text>
          </View>
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
          <Text style={styles.sectionTitle}>Order Items</Text>
          {(selectedOrder.items || []).map((orderItem, index) => (
            <View key={index} style={styles.orderItemRow}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>
                  {orderItem.product_name || 'Product not available'}
                </Text>
                <Text style={styles.orderItemQuantity}>Qty: {orderItem.quantity || 0}</Text>
              </View>
            </View>
          ))}
        </View>

        {selectedOrder.payment_method === 'cod' && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Cash on Delivery</Text>
            <Text style={styles.codAmount}>₹{(selectedOrder.total_amount || 0).toFixed(2)}</Text>
            <Text style={styles.codNote}>Collect this amount from customer</Text>
          </View>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalDeliveredButton}
            onPress={() => handleMarkAsDelivered(selectedOrder._id)}
            disabled={actionLoading}
          >
            <Text style={styles.modalDeliveredButtonText}>
              {actionLoading ? 'Updating...' : 'Mark as Delivered'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailsModal;