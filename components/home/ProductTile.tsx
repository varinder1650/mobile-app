import React, { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { styles as homeStyles } from '../../styles/home.styles';
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

  const imageUrl = React.useMemo(() => getImageUrl(item.images), [item.images]);

  return (
    <TouchableOpacity
      style={[
        homeStyles.productTile,
        isOutOfStock && homeStyles.outOfStockTile,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isOutOfStock}
    >
      {/* ✅ IMAGE WITH OVERLAY BUTTON */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            homeStyles.productTileImage,
            isOutOfStock && homeStyles.dimmedImage,
          ]}
          resizeMode="cover"
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
                  <Ionicons name="remove" size={16} color="#fff" />
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
                  <Ionicons name="add" size={16} color="#fff" />
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
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="add" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ✅ PRODUCT INFO (No cart button here anymore) */}
      <View style={homeStyles.productTileContent}>
        <Text 
          style={[
            homeStyles.productTileName,
            isOutOfStock && homeStyles.dimmedText,
          ]} 
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text 
          style={[
            homeStyles.productTileBrand,
            isOutOfStock && homeStyles.dimmedText,
          ]} 
          numberOfLines={1}
        >
          {item.brand?.name || 'Unknown'}
        </Text>
        
        {/* ✅ Price Display - MRP strikethrough + Selling Price + Discount Badge */}
        <View style={styles.priceRow}>
          {item.mrp && item.mrp > item.price && (
            <Text style={styles.mrpPrice}>₹{Math.round(item.mrp)}</Text>
          )}
          <Text 
            style={[
              styles.sellingPrice,
              isOutOfStock && homeStyles.dimmedPrice,
            ]}
          >
            ₹{Math.round(item.price)}
          </Text>
        </View>
        {item.mrp && item.mrp > item.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, 
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

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
  },
  addButtonOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 4,
  },
  overlayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayQuantity: {
    paddingHorizontal: 8,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayQuantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34C759',
  },
});