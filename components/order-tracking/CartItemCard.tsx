// components/checkout/CartItemCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CartItemCard.styles';

interface CartItem {
  _id: string;
  product: {
    id: string;
    name: string;
    price: number;
    brand: { name: string };
    stock: number;
  };
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem;
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