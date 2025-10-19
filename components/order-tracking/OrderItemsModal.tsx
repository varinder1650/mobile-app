// components/order-tracking/OrderItemsModal.tsx
import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './OrderItemsModal.styles';

interface OrderItem {
  product_name?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  items?: OrderItem[];
  subtotal?: number;
  delivery_charge?: number;
  tax?: number;
  app_fee?: number;
  promo_discount?: number;
  tip_amount?: number;
  total_amount?: number;
}

interface OrderItemsModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderItemsModal: React.FC<OrderItemsModalProps> = ({ 
  visible, 
  onClose, 
  order 
}) => {
  console.log('🔍 OrderItemsModal render with items:', order?.items);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Order Items</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ScrollView with items */}
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Items Container */}
            <View style={styles.itemsContainer}>
              {order?.items && order.items.length > 0 ? (
                order.items.map((item: OrderItem, index: number) => {
                  console.log(`📦 Rendering item ${index}:`, item.product_name);
                  
                  return (
                    <View key={`item-${index}`} style={styles.orderItemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.vegIconSmall}>
                          <View style={styles.vegDotSmall} />
                        </View>
                        <Text style={styles.itemName}>
                          {item.product_name || 'Unknown Product'}
                        </Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
                        <Text style={styles.itemPrice}>
                          ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyItemsContainer}>
                  <Ionicons name="cart-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyItemsText}>No items found</Text>
                </View>
              )}
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceBreakdownContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Item Total</Text>
                <Text style={styles.priceValue}>
                  ₹{order?.subtotal?.toFixed(2) || '0.00'}
                </Text>
              </View>
              
              {(order?.delivery_charge ?? 0) > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Charge</Text>
                  <Text style={styles.priceValue}>
                    ₹{order?.delivery_charge?.toFixed(2)}
                  </Text>
                </View>
              )}
              
              {(order?.tax ?? 0) > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Taxes & Fees</Text>
                  <Text style={styles.priceValue}>
                    ₹{order?.tax?.toFixed(2)}
                  </Text>
                </View>
              )}
              
              {(order?.app_fee ?? 0) > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Platform Fee</Text>
                  <Text style={styles.priceValue}>
                    ₹{order?.app_fee?.toFixed(2)}
                  </Text>
                </View>
              )}
              
              {(order?.promo_discount ?? 0) > 0 && (
                <View style={[styles.priceRow, styles.discountRow]}>
                  <Text style={styles.discountLabel}>Discount</Text>
                  <Text style={styles.discountValue}>
                    -₹{order?.promo_discount?.toFixed(2)}
                  </Text>
                </View>
              )}
              
              {(order?.tip_amount ?? 0) > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: '#E74C3C' }]}>
                    Tip 💚
                  </Text>
                  <Text style={[styles.priceValue, { color: '#E74C3C', fontWeight: '600' }]}>
                    ₹{order?.tip_amount?.toFixed(2)}
                  </Text>
                </View>
              )}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ₹{order?.total_amount?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};