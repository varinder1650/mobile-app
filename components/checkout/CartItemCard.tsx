import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItemCardProps {
  item: any;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  updating: boolean;
  disabled?: boolean;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ 
  item, 
  onUpdateQuantity, 
  updating,
  disabled 
}) => {
  return (
    <View style={styles.orderItem}>
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName}>{item.product.name}</Text>
        <Text style={styles.orderItemBrand}>{item.product.brand?.name}</Text>
        <Text style={styles.orderItemPrice}>₹{item.product.price} each</Text>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, (updating || disabled) && styles.disabledQuantityButton]}
            onPress={() => onUpdateQuantity(item._id, item.quantity - 1)}
            disabled={updating || disabled}
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.quantityDisplay}>
            {updating ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.quantityText}>{item.quantity}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.quantityButton, 
              (updating || item.quantity >= item.product.stock || disabled) && styles.disabledQuantityButton
            ]}
            onPress={() => onUpdateQuantity(item._id, item.quantity + 1)}
            disabled={updating || item.quantity >= item.product.stock || disabled}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.orderItemRight}>
        <Text style={styles.orderItemTotal}>₹{item.product.price * item.quantity}</Text>
        {item.product.stock <= 5 && (
          <Text style={styles.stockWarning}>Only {item.product.stock} left</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderItemBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stockWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledQuantityButton: {
    opacity: 0.5,
  },
  quantityDisplay: {
    marginHorizontal: 16,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});