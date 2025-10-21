// components/home/ProductTile.tsx - MEMOIZED VERSION
import React, { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { styles } from '../../styles/home.styles';
import { getImageUrl } from '../../utils/ImageUtils';
import { Product } from '../../types/home.types';

interface ProductTileProps {
  item: Product;
  index: number;
  cartQuantities: { [key: string]: number };
  addingToCart: { [key: string]: boolean };
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
}

// ✅ MEMOIZED COMPONENT - Only re-renders when props actually change
const ProductTile = memo<ProductTileProps>(({
  item,
  index,
  cartQuantities,
  addingToCart,
  addToCart,
  updateCartQuantity,
}) => {
  const quantity = cartQuantities[item.id] || 0;
  const isAdding = addingToCart[item.id] || false;
  const isOutOfStock = item.stock === 0;

  // ✅ Memoized handlers
  const handlePress = useCallback(() => {
    router.push(`/product/${item.id}`);
  }, [item.id]);

  const handleAddToCart = useCallback(() => {
    addToCart(item.id);
  }, [item.id, addToCart]);

  const handleIncrement = useCallback(() => {
    updateCartQuantity(item.id, quantity + 1);
  }, [item.id, quantity, updateCartQuantity]);

  const handleDecrement = useCallback(() => {
    updateCartQuantity(item.id, quantity - 1);
  }, [item.id, quantity, updateCartQuantity]);

  // ✅ Memoized image URL
  const imageUrl = React.useMemo(() => getImageUrl(item.images), [item.images]);

  return (
    <TouchableOpacity
      style={[
        styles.productTile,
        isOutOfStock && styles.outOfStockTile,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isOutOfStock}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.productTileImage,
            isOutOfStock && styles.dimmedImage,
          ]}
          resizeMode="cover"
        />
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.productTileContent}>
        <Text 
          style={[
            styles.productTileName,
            isOutOfStock && styles.dimmedText,
          ]} 
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text 
          style={[
            styles.productTileBrand,
            isOutOfStock && styles.dimmedText,
          ]} 
          numberOfLines={1}
        >
          {item.brand?.name || 'Unknown'}
        </Text>
        <Text 
          style={[
            styles.productTilePrice,
            isOutOfStock && styles.dimmedPrice,
          ]}
        >
          ₹{item.price.toFixed(2)}
        </Text>
      </View>

      {/* ✅ Cart Button Container */}
      <View style={styles.cartButtonContainer}>
        {isOutOfStock ? (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : quantity > 0 ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, isAdding && styles.disabledButton]}
              onPress={handleDecrement}
              disabled={isAdding}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="remove" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                (isAdding || quantity >= item.stock) && styles.disabledButton,
              ]}
              onPress={handleIncrement}
              disabled={isAdding || quantity >= item.stock}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isAdding && styles.disabledButton,
            ]}
            onPress={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addToCartButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}, 
// ✅ CRITICAL: Custom comparison function - prevents unnecessary re-renders
(prevProps, nextProps) => {
  const prevQty = prevProps.cartQuantities[prevProps.item.id] || 0;
  const nextQty = nextProps.cartQuantities[nextProps.item.id] || 0;
  const prevAdding = prevProps.addingToCart[prevProps.item.id] || false;
  const nextAdding = nextProps.addingToCart[nextProps.item.id] || false;

  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.stock === nextProps.item.stock &&
    prevQty === nextQty &&
    prevAdding === nextAdding
  );
});

ProductTile.displayName = 'ProductTile';

export default ProductTile;

// ✅ Add missing button text style
const addToCartButtonText = {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600' as const,
};