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
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, IMAGE_BASE_URL, API_ENDPOINTS } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

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
  allow_user_images?: boolean;
  allow_user_description?: boolean;
}

export default function ProductDetailScreen() {
  const localParams = useLocalSearchParams();
  const { token, user } = useAuth();
  const { 
    cartCount, 
    cartQuantities,
    addToCart: addToCartContext,
    updateQuantity: updateCartQuantityContext,
  } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // ✅ User upload states
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userReview, setUserReview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const isFetching = useRef(false);
  const productIdRef = useRef<string | null>(null);

  const productId = useMemo(() => {
    const id = localParams.id || localParams.productId;
    return Array.isArray(id) ? id[0] : (id as string);
  }, [localParams.id, localParams.productId]);

  const cartQuantity = useMemo(() => {
    if (!product) return 0;
    return cartQuantities[product.id] || 0;
  }, [product, cartQuantities]);

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

  // ✅ Handle image upload
  const handleImageUpload = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to upload images');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImage(result.assets[0].uri);
        setShowImageUpload(true);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraCapture = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to upload images');
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImage(result.assets[0].uri);
        setShowImageUpload(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const submitUserImage = async () => {
    if (!uploadedImage || !product) return;

    setUploading(true);
    try {
      // Convert image to base64
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          const uploadResponse = await authenticatedFetch(
            `${API_BASE_URL}/products/${product.id}/user-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64data,
                user_id: user?.id,
              }),
            }
          );

          if (uploadResponse.ok) {
            Alert.alert('Success', 'Your image has been uploaded!');
            setShowImageUpload(false);
            setUploadedImage(null);
          } else {
            Alert.alert('Error', 'Failed to upload image');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to process image');
      setUploading(false);
    }
  };

  const submitUserReview = async () => {
    if (!userReview.trim() || !product) return;

    setUploading(true);
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/products/${product.id}/user-review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            review: userReview.trim(),
            user_id: user?.id,
            user_name: user?.name,
          }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Your review has been submitted!');
        setShowReviewModal(false);
        setUserReview('');
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setUploading(false);
    }
  };

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

        {/* ✅ USER INTERACTION SECTION - Conditional */}
        {(product.allow_user_images || product.allow_user_description) && token && (
          <View style={styles.userInteractionSection}>
            <Text style={styles.interactionTitle}>Share Your Experience</Text>
            
            {product.allow_user_images && (
              <View style={styles.interactionButtons}>
                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={() => {
                    Alert.alert(
                      'Upload Photo',
                      'Choose photo source',
                      [
                        { text: 'Camera', onPress: handleCameraCapture },
                        { text: 'Gallery', onPress: handleImageUpload },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Ionicons name="camera" size={20} color="#007AFF" />
                  <Text style={styles.interactionButtonText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {product.allow_user_description && (
              <View style={styles.interactionButtons}>
                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Ionicons name="create" size={20} color="#007AFF" />
                  <Text style={styles.interactionButtonText}>Write Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Cart Button */}
      <View style={styles.buttonContainer}>
        {renderCartButton()}
      </View>

      {/* ✅ IMAGE UPLOAD MODAL */}
      <Modal
        visible={showImageUpload}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageUpload(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Product Photo</Text>
              <TouchableOpacity onPress={() => setShowImageUpload(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {uploadedImage && (
              <Image source={{ uri: uploadedImage }} style={styles.uploadPreview} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowImageUpload(false);
                  setUploadedImage(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, uploading && styles.disabledButton]}
                onPress={submitUserImage}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ REVIEW MODAL */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write Your Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your thoughts about this product..."
              value={userReview}
              onChangeText={setUserReview}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowReviewModal(false);
                  setUserReview('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, (uploading || !userReview.trim()) && styles.disabledButton]}
                onPress={submitUserReview}
                disabled={uploading || !userReview.trim()}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  
  // ✅ User Interaction Section
  userInteractionSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  interactionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  interactionButtons: {
    marginTop: 8,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    marginBottom: 8,
  },
  interactionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  uploadPreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
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