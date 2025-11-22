import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

import { RequestSection, RequestSectionRef } from '../../components/RequestSection';
import TopBar from '../../components/home/TopBar';
import SearchBar from '../../components/home/SearchBar';
import CategoryFilterRow from '../../components/home/CategoryFilterRow';
import ProductTile from '../../components/home/ProductTile';
import CategorySection from '../../components/home/CategorySection';
import AnimatedLogo from '../../components/home/AnimatedLogo';
import CartNotification from '../../components/home/CartNotification';
import { ShopClosedBanner } from '../../components/home/ShopClosedBanner';

import { Product, Category } from '../../types/home.types';
import { styles } from '../../styles/home.styles';

const DEBUG = __DEV__;

interface ShopStatus {
  is_open: boolean;
  reopen_time: string | null;
  reason: string | null;
}

const HomeScreen = () => {
  const { user, token, loading: authLoading } = useAuth();
  const { 
    cartCount, 
    cartQuantities, 
    addToCart: addToCartContext,
    updateQuantity: updateCartQuantityContext,
  } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('Add Address');
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  const [shopStatus, setShopStatus] = useState<ShopStatus | null>(null);
  
  const initialDataFetched = useRef(false);
  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);
  const requestFormRef = useRef<RequestSectionRef>(null);

  const isGridMode = useMemo(() => {
    return Boolean(searchQuery.trim() || selectedCategory);
  }, [searchQuery, selectedCategory]);

  const fetchShopStatus = useCallback(async () => {
    try {
      if (DEBUG) console.log('🏪 Fetching shop status...');
      const response = await fetch(`${API_BASE_URL}/shop/status`);
      
      if (response.ok) {
        const status = await response.json();
        if (DEBUG) console.log('🏪 Shop status:', status);
        setShopStatus(status);
      } else {
        if (DEBUG) console.log('⚠️ Failed to fetch shop status, assuming open');
        setShopStatus({ is_open: true, reopen_time: null, reason: null });
      }
    } catch (error) {
      if (DEBUG) console.error('❌ Error fetching shop status:', error);
      setShopStatus({ is_open: true, reopen_time: null, reason: null });
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (isFetching.current) {
      if (DEBUG) console.log('⏭️ Fetch already in progress, skipping...');
      return;
    }
    
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) {
      if (DEBUG) console.log('⏭️ Too soon since last fetch, skipping...');
      return;
    }
    
    try {
      isFetching.current = true;
      lastFetchTime.current = now;
      setLoading(true);
      
      if (DEBUG) console.log('📡 Fetching initial data...');
      const timestamp = Date.now();
      
      const results = await Promise.allSettled([
        fetch(`${API_ENDPOINTS.PRODUCTS}?_t=${timestamp}`),
        fetch(`${API_ENDPOINTS.CATEGORIES}?_t=${timestamp}`),
      ]);
      
      if (results[0].status === 'fulfilled' && results[0].value.ok) {
        const productsData = await results[0].value.json();
        const productsArray = productsData.products || productsData || [];
        const activeProducts = productsArray.filter((p: Product) => 
          p.status === 'active' || p.status === undefined
        );
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } else {
        if (DEBUG) console.error('❌ Products fetch failed');
        Alert.alert('Error', 'Failed to load products');
      }
      
      if (results[1].status === 'fulfilled' && results[1].value.ok) {
        const categoriesData = await results[1].value.json();
        const categoriesArray = categoriesData.categories || categoriesData || [];
        const activeCategories = categoriesArray.filter((c: Category) => 
          c.status === 'active' || c.status === undefined
        );
        setCategories(activeCategories);
      } else {
        if (DEBUG) console.error('❌ Categories fetch failed');
      }
      
      initialDataFetched.current = true;
      
    } catch (error) {
      if (DEBUG) console.error('❌ Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const fetchFilteredProducts = useCallback(async (
    search: string = '', 
    categoryId: string | null = null
  ) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      
      if (categoryId && !search) {
        if (DEBUG) console.log('🎯 Filtering locally by category');
        const filtered = products.filter(product => {
          if (typeof product.category === 'object') {
            return product.category.id === categoryId;
          }
          return product.category === categoryId;
        });
        setFilteredProducts(filtered);
        return;
      }
      
      const timestamp = Date.now();
      let productsUrl = `${API_ENDPOINTS.PRODUCTS}?_t=${timestamp}`;
      
      if (search) productsUrl += `&search=${encodeURIComponent(search)}`;
      if (categoryId) productsUrl += `&category=${encodeURIComponent(categoryId)}`;
  
      const response = await fetch(productsUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const productsData = await response.json();
      const productsArray = productsData.products || productsData || [];
      const activeProducts = productsArray.filter((p: Product) => 
        p.status === 'active' || p.status === undefined
      );
      
      setFilteredProducts(activeProducts);
      
    } catch (error) {
      if (DEBUG) console.error('❌ Error fetching filtered products:', error);
    } finally {
      isFetching.current = false;
    }
  }, [products]);

  const fetchUserAddress = useCallback(async () => {
    if (!token) {
      setUserAddress('Add Address');
      return;
    }
    
    try {
      const profileResponse = await fetch(`${API_ENDPOINTS.MY_ADDRESS}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        let displayAddress = null;
        
        if (Array.isArray(userData)) {
          const defaultAddress = userData.find(addr => addr.is_default) || userData[0];
          if (defaultAddress) {
            const addressParts = [
              defaultAddress.street,
              defaultAddress.city,
              defaultAddress.state,
              defaultAddress.pincode
            ].filter(Boolean);
            
            if (addressParts.length > 0) {
              displayAddress = addressParts.join(', ');
              if (displayAddress.length > 30) {
                displayAddress = displayAddress.substring(0, 27) + '...';
              }
            }
          }
        }
        
        setUserAddress(displayAddress || 'Add Address');
      } else {
        setUserAddress('Add Address');
      }
      
    } catch (error) {
      if (DEBUG) console.error('Error fetching user address:', error);
      setUserAddress('Add Address');
    }
  }, [token]);

  const addToCart = useCallback(async (productId: string) => {
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

    const product = [...products, ...filteredProducts].find(p => p.id === productId);
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }

    if (product.stock === 0) {
      Alert.alert('Error', 'Product is out of stock');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    const success = await addToCartContext(productId);
    
    if (success) {
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 2000);
    }
    
    setAddingToCart(prev => ({ ...prev, [productId]: false }));
  }, [token, products, filteredProducts, addToCartContext]);

  const updateCartQuantity = useCallback(async (productId: string, newQuantity: number) => {
    if (!token) {
      Alert.alert('Error', 'Please login to manage cart');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    await updateCartQuantityContext(productId, newQuantity);
    setAddingToCart(prev => ({ ...prev, [productId]: false }));
  }, [token, updateCartQuantityContext]);

  useEffect(() => {
    fetchShopStatus();
  }, [fetchShopStatus]);

  useEffect(() => {
    if (!initialDataFetched.current && !isFetching.current) {
      if (DEBUG) console.log('🚀 Initial data fetch triggered');
      fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading) {
      if (DEBUG) console.log('🔐 Auth state changed, fetching user data');
      fetchUserAddress();
    }
  }, [authLoading, fetchUserAddress]);

  useFocusEffect(
    useCallback(() => {
      if (token && !authLoading) {
        fetchShopStatus();
      }
    }, [token, authLoading, fetchShopStatus])
  );

  useEffect(() => {
    if (!initialDataFetched.current) return;
    
    const handler = setTimeout(() => {
      if (searchQuery.length === 0 || searchQuery.length > 2) {
        if (DEBUG) console.log('🔎 Search/filter triggered');
        fetchFilteredProducts(searchQuery, selectedCategory);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory, fetchFilteredProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    initialDataFetched.current = false;
    
    await Promise.all([
      fetchData(),
      fetchUserAddress(),
      fetchShopStatus(),
    ]);
    
    setRefreshing(false);
  }, [fetchData, fetchUserAddress, fetchShopStatus]);

  const retryConnection = useCallback(() => {
    initialDataFetched.current = false;
    fetchData();
  }, [fetchData]);

  const handleCategoryPress = useCallback((categoryId: string | null) => {
    if (DEBUG) console.log('📂 Category pressed:', categoryId);
    setSelectedCategory(categoryId);
  }, []);

  const handleRequestSubmitted = useCallback(() => {
    Alert.alert('Thank you!', 'Your request has been submitted.');
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AnimatedLogo />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        userAddress={userAddress}
        cartCount={cartCount}
        authLoading={authLoading}
        token={token}
      />
      
      {/* ✅ Shop Closed Banner */}
      {shopStatus && !shopStatus.is_open && (
        <ShopClosedBanner 
          reason={shopStatus.reason}
          reopenTime={shopStatus.reopen_time}
        />
      )}
      
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <CategoryFilterRow 
        categories={categories}
        selectedCategory={selectedCategory}
        handleCategoryPress={handleCategoryPress}
        requestFormRef={requestFormRef}
      />
      
      {isGridMode ? (
        <FlatList
          key="products-grid-view"
          data={filteredProducts}
          renderItem={({ item, index }) => (
            <ProductTile 
              item={item}
              index={index}
              cartQuantities={cartQuantities}
              addingToCart={addingToCart}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
            />
          )}
          keyExtractor={(item, index) => `grid-product-${item.id || index}-${index}`}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 8 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>No products found.</Text>
            </View>
          }
          ListFooterComponent={() => (
            <RequestSection 
              ref={requestFormRef}
              onRequestSubmitted={handleRequestSubmitted}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 180 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={6}
          windowSize={5}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <FlatList
          key="categories-browse-view"
          data={categories}
          renderItem={({ item, index }) => (
            <CategorySection 
              category={item}
              index={index}
              products={products}
              cartQuantities={cartQuantities}
              addingToCart={addingToCart}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
              handleCategoryPress={handleCategoryPress}
            />
          )}
          keyExtractor={(item, index) => `category-section-${item.id}-${index}`}
          ListFooterComponent={() => (
            <RequestSection 
              ref={requestFormRef}
              onRequestSubmitted={handleRequestSubmitted}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>No categories found.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
                <Text style={styles.retryButtonText}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 180 }}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          updateCellsBatchingPeriod={50}
        />
      )}
      
      <CartNotification showCartNotification={showCartNotification} />
    </SafeAreaView>
  );
};

export default HomeScreen;