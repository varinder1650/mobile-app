import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types/cart.types';
import { getImageUrl } from '../../utils/ImageUtils';
import { styles } from '../../styles/cart.styles';

interface CartItemProps {
  item: CartItem;
  index: number;
  updating: boolean;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  index,
  updating,
  updateQuantity,
  removeItem,
}) => {
  const imageUrl = getImageUrl(item.product.images);

  return (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.itemImage}
        resizeMode="cover"
        onError={() => {
          console.log('Cart item image failed to load for:', item.product.name);
        }}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.itemBrand}>{item.product.brand?.name || 'No Brand'}</Text>
        <Text style={styles.itemPrice}>₹{item.product.price}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, updating && styles.disabledButton]}
            onPress={() => updateQuantity(item._id, item.quantity - 1)}
            disabled={updating}
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, updating && styles.disabledButton]}
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
            disabled={updating}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.removeButton, updating && styles.disabledButton]}
        onPress={() => removeItem(item._id)}
        disabled={updating}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

export default CartItemComponent;