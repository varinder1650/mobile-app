import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Product, CartQuantities } from '../../types/home.types';
import { getImageUrl } from '../../utils/ImageUtils';
import { styles as homeStyles } from '../../styles/home.styles';

interface ProductCardProps {
  item: Product;
  index: number;
  cartQuantities: CartQuantities;
  addingToCart: {[key: string]: boolean};
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, newQuantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  index,
  cartQuantities,
  addingToCart,
  addToCart,
  updateCartQuantity,
}) => {
  const imageUrl = getImageUrl(item.images);
  const isOutOfStock = item.stock <= 0;
  const quantity = cartQuantities[item.id] || 0;
  const isAdding = addingToCart[item.id] || false;
  
  const handleProductPress = () => {
    const productId = item.id;
    
    if (!productId) {
      Alert.alert('Error', 'Product ID not found');
      return;
    }
    
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = () => {
    addToCart(item.id);
  };

  const handleIncrement = () => {
    updateCartQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateCartQuantity(item.id, quantity - 1);
  };

  return (
    <View style={[homeStyles.productCard, isOutOfStock && homeStyles.outOfStockTile]}>
      <TouchableOpacity 
        onPress={handleProductPress}
        disabled={isOutOfStock}
        style={isOutOfStock ? homeStyles.disabledTouchable : undefined}
        activeOpacity={0.7}
      >
        {/* ✅ IMAGE WITH OVERLAY BUTTON */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={[homeStyles.productCardImage, isOutOfStock && homeStyles.dimmedImage]}
            resizeMode="cover"
            onError={() => {
              console.log('Product card image failed to load for:', item.name);
            }}
          />
          
          {/* ✅ OUT OF STOCK OVERLAY */}
          {isOutOfStock && (
            <View style={homeStyles.outOfStockOverlay}>
              <Text style={homeStyles.outOfStockOverlayText}>Out of Stock</Text>
            </View>
          )}

          {/* ✅ ADD BUTTON OVERLAY (Bottom Right of Image) */}
          {!isOutOfStock && (
            <View style={styles.addButtonOverlay}>
              {quantity > 0 ? (
                <View style={styles.quantityControlsOverlay}>
                  <TouchableOpacity
                    style={styles.overlayButton}
                    onPress={handleDecrement}
                    disabled={isAdding}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="remove" size={14} color="#fff" />
                  </TouchableOpacity>
                  
                  <View style={styles.overlayQuantity}>
                    <Text style={styles.overlayQuantityText}>{quantity}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.overlayButton}
                    onPress={handleIncrement}
                    disabled={isAdding || quantity >= item.stock}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="add" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddToCart}
                  disabled={isAdding}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#34C759" />
                  ) : (
                    <Ionicons name="add" size={18} color="#34C759" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ✅ PRODUCT INFO (No cart button here anymore) */}
        <View style={homeStyles.productCardContent}>
          <Text style={[homeStyles.productCardName, isOutOfStock && homeStyles.dimmedText]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[homeStyles.productCardBrand, isOutOfStock && homeStyles.dimmedText]} numberOfLines={1}>
            {item.brand?.name || 'No Brand'}
          </Text>
          <Text style={[homeStyles.productCardPrice, isOutOfStock && homeStyles.dimmedPrice]}>
            ₹{item.price}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;

// ✅ NEW STYLES FOR OVERLAY BUTTON
const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
  },
  addButtonOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityControlsOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 3,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 3,
  },
  overlayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayQuantity: {
    paddingHorizontal: 6,
    minWidth: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayQuantityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34C759',
  },
});