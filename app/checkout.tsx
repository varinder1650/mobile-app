// checkout.tsx - OPTIMIZED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; // ✅ Use CartContext
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
import { authenticatedFetch } from '../utils/authenticatedFetch';

import {
  CheckoutHeader,
  AddressSection,
  SuccessAnimation,
  CartItemCard,
  PromoCodeSection,
  PriceBreakdown,
} from '../components/checkout';

const DEBUG = __DEV__;

interface AddressData {
  _id?: string;
  label?: string;
  street?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile_number?: string;
  phone: string;
  landmark?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

interface PromoCode {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  is_active: boolean;
}

export default function CheckoutScreen() {
  const { token, user } = useAuth();
  const { 
    cartItems,
    cartCount,
    updateQuantity,
    clearCart,
    getTotalPrice: getCartTotal 
  } = useCart(); // ✅ Use CartContext
  
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod] = useState('cod');
  const [updatingQuantity, setUpdatingQuantity] = useState<{[key: string]: boolean}>({});
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Success animation
  const [showSuccess, setShowSuccess] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    const addressFromParams = params.address as string;
    const fullAddressFromParams = params.fullAddress as string;
    
    if (addressFromParams && fullAddressFromParams) {
      setDeliveryAddress({
        _id: params.addressId as string,
        label: params.addressLabel as string,
        street: addressFromParams,
        address: addressFromParams,
        city: params.city as string || '',
        state: params.state as string || '',
        pincode: params.pincode as string || '',
        mobile_number: params.mobile_number as string,
        phone: params.mobile_number as string || params.phone as string || user?.phone || '',
        landmark: params.landmark as string,
        fullAddress: fullAddressFromParams,
        latitude: params.latitude ? Number(params.latitude) : undefined,
        longitude: params.longitude ? Number(params.longitude) : undefined,
        is_default: params.is_default === 'true',
      });
    }
  }, [params]);

  const loadData = async () => {
    try {
      // ✅ No need to fetch cart - CartContext handles it
      
      const settingsResponse = await fetch(API_ENDPOINTS.SETTINGS);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
      
      if (!params.address) {
        await loadDefaultAddress();
      }
      
    } catch (error) {
      if (DEBUG) console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultAddress = async () => {
    try {
      const addressResponse = await authenticatedFetch(API_ENDPOINTS.MY_ADDRESS);
      
      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        
        let addresses = [];
        if (Array.isArray(addressData)) {
          addresses = addressData;
        } else if (addressData.addresses && Array.isArray(addressData.addresses)) {
          addresses = addressData.addresses;
        }
        
        const defaultAddress = addresses.find((addr: any) => addr.is_default) || addresses[0];
        
        if (defaultAddress) {
          setDeliveryAddress({
            _id: defaultAddress._id,
            label: defaultAddress.label,
            street: defaultAddress.street,
            address: defaultAddress.street || defaultAddress.address,
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.pincode || '',
            mobile_number: defaultAddress.mobile_number,
            phone: defaultAddress.mobile_number || defaultAddress.phone || user?.phone || '',
            landmark: defaultAddress.landmark,
            fullAddress: `${defaultAddress.street || defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pincode}`,
            latitude: defaultAddress.latitude,
            longitude: defaultAddress.longitude,
            is_default: defaultAddress.is_default,
          });
        }
      }
    } catch (error) {
      if (DEBUG) console.error('Error loading default address:', error);
    }
  };

  // ✅ Use CartContext updateQuantity
  const updateCartQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
              const cartItem = cartItems.find(item => item._id === itemId);
              if (cartItem) {
                await updateQuantity(cartItem.product.id, 0);
              }
              setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
            }
          }
        ]
      );
      return;
    }

    const cartItem = cartItems.find(item => item._id === itemId);
    if (cartItem && newQuantity > cartItem.product.stock) {
      Alert.alert('Stock Limit', `Only ${cartItem.product.stock} items available in stock`);
      return;
    }

    setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
    if (cartItem) {
      await updateQuantity(cartItem.product.id, newQuantity);
    }
    setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
  }, [cartItems, updateQuantity]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/promocodes/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: promoCode.trim().toUpperCase(),
            order_amount: getSubtotal(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedPromo(data.promocode);
        calculatePromoDiscount(data.promocode);
        Alert.alert('Success', 'Promo code applied successfully!');
      } else {
        Alert.alert('Error', data.message || 'Invalid promo code');
        setAppliedPromo(null);
        setPromoDiscount(0);
      }
    } catch (error) {
      if (DEBUG) console.error('Error applying promo code:', error);
      Alert.alert('Error', 'Failed to apply promo code');
      setAppliedPromo(null);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = useCallback(() => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoDiscount(0);
  }, []);

  const calculatePromoDiscount = useCallback((promo: PromoCode) => {
    const subtotal = getSubtotal();
    let discount = 0;

    if (promo.discount_type === 'percentage') {
      discount = subtotal * (promo.discount_value / 100);
      if (promo.max_discount) {
        discount = Math.min(discount, promo.max_discount);
      }
    } else {
      discount = promo.discount_value;
    }

    setPromoDiscount(discount);
  }, []);

  const showSuccessAnimation = useCallback(() => {
    setPlacingOrder(false);
    setShowSuccess(true);
    
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        clearCart(); // ✅ Clear cart from context
        router.replace('/(tabs)');
      });
    }, 2500);
  }, [scaleAnim, fadeAnim, clearCart]);

  // ✅ Memoized price calculations
  const getSubtotal = useCallback(() => {
    return getCartTotal();
  }, [getCartTotal]);

  const getTax = useMemo(() => {
    if (!settings) return 0;
    const taxableAmount = getSubtotal() - promoDiscount;
    return taxableAmount * (settings.tax_rate / 100);
  }, [settings, getSubtotal, promoDiscount]);

  const getDeliveryCharge = useMemo(() => {
    if (!settings || !settings.delivery_fee) return 0;
    const subtotal = getSubtotal();
    
    if (subtotal >= settings.delivery_fee.free_delivery_threshold) {
      return 0;
    }
    
    return settings.delivery_fee.base_fee;
  }, [settings, getSubtotal]);

  const getAppFee = useMemo(() => {
    if (!settings || !settings.app_fee) return 0;
    const subtotal = getSubtotal() - promoDiscount;
    
    if (settings.app_fee.type === 'percentage') {
      const calculatedFee = subtotal * (settings.app_fee.value / 100);
      return Math.max(
        settings.app_fee.min_fee, 
        Math.min(calculatedFee, settings.app_fee.max_fee)
      );
    }
    
    return settings.app_fee.value;
  }, [settings, getSubtotal, promoDiscount]);

  const getTotal = useMemo(() => {
    const subtotal = getSubtotal();
    return subtotal + getTax + getDeliveryCharge + getAppFee - promoDiscount;
  }, [getSubtotal, getTax, getDeliveryCharge, getAppFee, promoDiscount]);

  const handleSelectAddress = useCallback(() => {
    router.push('/address?from=checkout');
  }, []);

  const handlePlaceOrder = async () => {
    // ✅ Enhanced validation
    if (!deliveryAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please login to place an order');
      return;
    }

    if (!deliveryAddress.address || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.pincode) {
      Alert.alert('Error', 'Please provide complete address information');
      return;
    }

    if (!deliveryAddress.phone && !deliveryAddress.mobile_number) {
      Alert.alert('Error', 'Please provide a phone number for delivery');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setPlacingOrder(true);
    
    try {
      const deliveryAddressData = {
        street: deliveryAddress.street || deliveryAddress.address,
        address: deliveryAddress.address,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
        phone: deliveryAddress.phone || deliveryAddress.mobile_number || user?.phone || '',
        mobile_number: deliveryAddress.mobile_number || deliveryAddress.phone || user?.phone || '',
        label: deliveryAddress.label || 'Home',
        landmark: deliveryAddress.landmark || '',
        ...(deliveryAddress.latitude && deliveryAddress.longitude && {
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude,
          coordinates: {
            latitude: deliveryAddress.latitude,
            longitude: deliveryAddress.longitude,
          }
        }),
      };

      const orderData = {
        items: cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        delivery_address: deliveryAddressData,
        payment_method: paymentMethod,
        subtotal: getSubtotal(),
        tax: getTax,
        delivery_charge: getDeliveryCharge,
        app_fee: getAppFee,
        promo_code: appliedPromo?.code || null,
        promo_discount: promoDiscount,
        total_amount: getTotal,
      };

      if (DEBUG) console.log('📦 Placing order...');

      const response = await authenticatedFetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (DEBUG) console.log('📡 Response status:', response.status);

      if (response.ok) {
        const orderResult = await response.json();
        if (DEBUG) console.log('✅ Order placed successfully:', orderResult);
        
        showSuccessAnimation();
      } else {
        const errorData = await response.json();
        if (DEBUG) console.error('❌ Order placement failed:', errorData);
        Alert.alert('Error', errorData.detail || 'Failed to place order');
        setPlacingOrder(false);
      }
    } catch (error) {
      if (DEBUG) console.error('❌ Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  // ✅ Memoized renderItem for cart items
  const renderCartItem = useCallback((item: any) => (
    <CartItemCard
      key={item._id}
      item={item}
      onUpdateQuantity={updateCartQuantity}
      updating={updatingQuantity[item._id]}
      disabled={placingOrder}
    />
  ), [updateCartQuantity, updatingQuantity, placingOrder]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CheckoutHeader onBack={() => router.back()} disabled={placingOrder} />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!placingOrder}
      >
        {/* Address Section */}
        <AddressSection
          deliveryAddress={deliveryAddress}
          onSelectAddress={handleSelectAddress}
          disabled={placingOrder}
        />

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          {cartItems.map(renderCartItem)}
        </View>

        {/* Promo Code */}
        <PromoCodeSection
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          onApplyPromo={applyPromoCode}
          onRemovePromo={removePromoCode}
          appliedPromo={appliedPromo}
          promoDiscount={promoDiscount}
          loading={promoLoading}
          disabled={placingOrder}
        />

        {/* Price Breakdown */}
        <PriceBreakdown
          subtotal={getSubtotal()}
          tax={getTax}
          taxRate={settings?.tax_rate || 0}
          deliveryCharge={getDeliveryCharge}
          appFee={getAppFee}
          promoDiscount={promoDiscount}
          total={getTotal}
          showFreeDelivery={getSubtotal() >= (settings?.delivery_fee?.free_delivery_threshold || 0)}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, placingOrder && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.placeOrderText}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.placeOrderText}>Place Order - ₹{getTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>

      <SuccessAnimation 
        visible={showSuccess}
        scaleAnim={scaleAnim}
        fadeAnim={fadeAnim}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  placeOrderButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8 },
  disabledButton: { backgroundColor: '#ccc' },
  placeOrderText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 24 },
  shopNowButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopNowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});