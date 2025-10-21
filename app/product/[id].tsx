// product/[id].tsx - OPTIMIZED VERSION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, IMAGE_BASE_URL, API_ENDPOINTS } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext'; // ✅ Use CartContext

const { width } = Dimensions.get('window');
const DEBUG = __DEV__;

interface ProductImage {
  url?: string;
  secure_url?: string;
  thumbnail?: string;
  public_id?: string;
}

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  images: (string | ProductImage)[];
  category: { name: string; _id: string };
  brand: { name: string; _id: string };
  stock: number;
  status: string;
  keywords?: string[];
}

export default function ProductDetailScreen() {
  const localParams = useLocalSearchParams();
  const { token } = useAuth();
  const { 
    cartCount, 
    cartQuantities,
    addToCart: addToCartContext,
    updateQuantity: updateCartQuantityContext,
  } = useCart(); // ✅ Use CartContext
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const isFetching = useRef(false);
  const productIdRef = useRef<string | null>(null);

  // ✅ Memoized product ID extraction
  const productId = useMemo(() => {
    const id = localParams.id || localParams.productId;
    return Array.isArray(id) ? id[0] : (id as string);
  }, [localParams.id, localParams.productId]);

  // ✅ Get cart quantity for this product from context
  const cartQuantity = useMemo(() => {
    if (!product) return 0;
    return cartQuantities[product.id] || 0;
  }, [product, cartQuantities]);

  // ✅ Optimized fetch with caching
  const fetchProduct = useCallback(async (id: string) => {
    if (isFetching.current || productIdRef.current === id && product) {
      if (DEBUG) console.log('⏭️ Product already loaded or fetching');
      return;
    }

    try {
      isFetching.current = true;
      productIdRef.current = id;
      
      if (!id || id === 'undefined' || id.trim() === '') {
        Alert.alert('Error', 'Invalid product ID');
        router.back();
        return;
      }

      const timestamp = Date.now();
      const apiUrl = `${API_ENDPOINTS.PRODUCTS}/${id}?_t=${timestamp}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert('Error', 'Product not found');
        } else if (response.status === 400) {
          Alert.alert('Error', 'Invalid product ID format');
        } else {
          Alert.alert('Error', `Failed to load product (${response.status})`);
        }
        router.back();
        return;
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      if (DEBUG) console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [product]);

  useEffect(() => {
    if (productId && productId !== 'undefined') {
      fetchProduct(productId);
    } else {
      Alert.alert('Error', 'No product ID provided');
      router.back();
    }
  }, [productId, fetchProduct]);

  // ✅ Memoized image processing
  const imageUrls = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return ['https://via.placeholder.com/400x300?text=No+Image'];
    }
    
    return product.images.map(img => {
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`;
      }
      
      if (typeof img === 'object' && img !== null) {
        const url = img.url || img.secure_url || img.thumbnail;
        if (url) return url;
      }
      
      return 'https://via.placeholder.com/400x300?text=No+Image';
    });
  }, [product?.images]);

  // ✅ Optimized add to cart
  const addToCart = useCallback(async () => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to add items to your cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (!product) return;

    if (product.stock === 0) {
      Alert.alert('Error', 'Product is out of stock');
      return;
    }

    setAddingToCart(true);
    const success = await addToCartContext(product.id);
    
    if (success) {
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 2000);
    }
    
    setAddingToCart(false);
  }, [token, product, addToCartContext]);

  // ✅ Optimized quantity update
  const updateCartQuantity = useCallback(async (newQuantity: number) => {
    if (!product) return;

    setAddingToCart(true);
    await updateCartQuantityContext(product.id, newQuantity);
    setAddingToCart(false);
  }, [product, updateCartQuantityContext]);

  const handleCartPress = useCallback(() => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to view your cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    router.push('/(tabs)/explore');
  }, [token]);

  // ✅ Memoized handlers
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderImageItem = useCallback(({ item }: { item: string }) => (
    <View style={styles.imageItem}>
      <Image
        source={{ uri: item }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    </View>
  ), []);

  const renderDotIndicator = useCallback(() => {
    if (imageUrls.length <= 1) return null;
    
    return (
      <View style={styles.dotContainer}>
        {imageUrls.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              currentImageIndex === index && styles.activeDot
            ]}
          />
        ))}
      </View>
    );
  }, [imageUrls.length, currentImageIndex]);

  // ✅ Memoized cart button
  const renderCartButton = useCallback(() => {
    const isOutOfStock = product?.stock === 0;

    if (isOutOfStock) {
      return (
        <View style={[styles.addToCartButton, styles.outOfStockButton]}>
          <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
        </View>
      );
    }

    if (cartQuantity > 0) {
      return (
        <View style={styles.quantityControlsContainer}>
          <TouchableOpacity
            style={[styles.quantityControlButton, addingToCart && styles.disabledButton]}
            onPress={() => updateCartQuantity(cartQuantity - 1)}
            disabled={addingToCart}
          >
            <Ionicons name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityControlText}>{cartQuantity}</Text>
          <TouchableOpacity
            style={[styles.quantityControlButton, addingToCart && styles.disabledButton]}
            onPress={() => updateCartQuantity(cartQuantity + 1)}
            disabled={addingToCart || cartQuantity >= (product?.stock || 0)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.addToCartButton, addingToCart && styles.disabledButton]}
        onPress={addToCart}
        disabled={addingToCart}
      >
        <Ionicons name="bag-add" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.addToCartText}>
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    );
  }, [product, cartQuantity, addingToCart, addToCart, updateCartQuantity]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Ionicons name="bag-outline" size={24} color="#333" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={imageUrls}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `product-detail-image-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={false}
        />
        {renderDotIndicator()}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
        
        <View style={styles.stockContainer}>
          <Ionicons 
            name={product.stock > 0 ? "checkmark-circle" : "alert-circle"} 
            size={16} 
            color={product.stock > 0 ? "#4CAF50" : "#FF5722"} 
          />
          <Text style={[styles.stockText, { color: product.stock > 0 ? "#4CAF50" : "#FF5722" }]}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </Text>
        </View>
        
        <Text style={styles.productDescription}>{product.description}</Text>
        
        <View style={styles.detailsSection}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{product.category?.name || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{product.brand?.name || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Cart Button */}
      <View style={styles.buttonContainer}>
        {renderCartButton()}
      </View>

      {/* Cart Notification */}
      {showCartNotification && (
        <View style={styles.notification}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.notificationText}>Added to cart!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 32 },
  errorText: { fontSize: 18, color: '#666', textAlign: 'center', marginTop: 16 },
  backToHomeButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  backToHomeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cartButton: { padding: 8, position: 'relative' },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#007AFF', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  carouselContainer: { position: 'relative', width: width, height: width * 0.8, marginBottom: 20, backgroundColor: '#f5f5f5' },
  imageItem: { width: width, height: width * 0.8 },
  carouselImage: { width: '100%', height: '100%' },
  dotContainer: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3 },
  activeDot: { backgroundColor: '#fff' },
  productInfo: { padding: 16 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8, lineHeight: 30 },
  productPrice: { fontSize: 24, fontWeight: '700', color: '#007AFF', marginBottom: 12 },
  stockContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stockText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  productDescription: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  detailsSection: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
  detailLabel: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  detailValue: { fontSize: 16, color: '#666', flex: 2, textAlign: 'right' },
  buttonContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  addToCartButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  outOfStockButton: { backgroundColor: '#f5f5f5', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: '#e0e0e0' },
  outOfStockButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
  addToCartText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  quantityControlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f8ff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  quantityControlButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  quantityControlText: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', minWidth: 50, textAlign: 'center' },
  notification: { position: 'absolute', top: '50%', left: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.95)', padding: 24, borderRadius: 12, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 10, borderWidth: 1, borderColor: '#4CAF50' },
  notificationText: { color: '#4CAF50', fontSize: 18, fontWeight: '600', marginTop: 8 },
});