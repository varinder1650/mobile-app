// checkout.tsx - WITH TIP SECTION & PHONEPE PAYMENT
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
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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
  } = useCart();
  
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [updatingQuantity, setUpdatingQuantity] = useState<{[key: string]: boolean}>({});
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Tip states
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [showCustomTipModal, setShowCustomTipModal] = useState(false);

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

  // Tip handlers
  const handleTipSelection = (amount: number) => {
    if (amount === 0) {
      setShowCustomTipModal(true);
    } else {
      setSelectedTip(amount);
    }
  };

  const handleCustomTipSubmit = () => {
    const amount = parseInt(customTipAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid tip amount');
      return;
    }

    if (amount > 500) {
      Alert.alert('Error', 'Maximum tip amount is ₹500');
      return;
    }

    setShowCustomTipModal(false);
    setSelectedTip(amount);
    setCustomTipAmount('');
  };

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
        clearCart();
        router.replace('/(tabs)');
      });
    }, 2500);
  }, [scaleAnim, fadeAnim, clearCart]);

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
    const tipAmount = selectedTip || 0;
    return subtotal + getTax + getDeliveryCharge + getAppFee + tipAmount - promoDiscount;
  }, [getSubtotal, getTax, getDeliveryCharge, getAppFee, selectedTip, promoDiscount]);

  const handleSelectAddress = useCallback(() => {
    router.push('/address?from=checkout');
  }, []);

  const initiatePhonePePayment = async (orderId: string, amount: number) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/payment/phonepe/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: amount,
            callback_url: `${API_BASE_URL}/payment/phonepe/callback`,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.payment_url) {
        // Open PhonePe payment URL
        // You'll need to implement web view or deep linking here
        // For now, we'll show an alert with the URL
        Alert.alert(
          'PhonePe Payment',
          'Redirecting to PhonePe for payment...',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Implement navigation to payment URL
                // Example: Linking.openURL(data.payment_url)
                console.log('Payment URL:', data.payment_url);
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      if (DEBUG) console.error('PhonePe payment error:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
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
        tip_amount: selectedTip || 0,
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
        
        // Handle PhonePe payment
        if (paymentMethod === 'phonepe') {
          await initiatePhonePePayment(orderResult.id, getTotal);
        } else {
          // COD - show success animation
          showSuccessAnimation();
        }
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

  const renderCartItem = useCallback((item: any) => (
    <CartItemCard
      key={item._id}
      item={item}
      onUpdateQuantity={updateCartQuantity}
      updating={updatingQuantity[item._id]}
      disabled={placingOrder}
    />
  ), [updateCartQuantity, updatingQuantity, placingOrder]);

  const renderCustomTipModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCustomTipModal}
      onRequestClose={() => setShowCustomTipModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => setShowCustomTipModal(false)}
        />
        <View style={styles.customTipModal}>
          <View style={styles.customTipHeader}>
            <Text style={styles.customTipTitle}>Enter Tip Amount</Text>
            <TouchableOpacity onPress={() => setShowCustomTipModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.customTipContent}>
            <Text style={styles.customTipLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.customTipInput}
              value={customTipAmount}
              onChangeText={setCustomTipAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              autoFocus
              maxLength={3}
            />
            <Text style={styles.customTipHint}>Maximum tip amount: ₹500</Text>
          </View>
          
          <View style={styles.customTipButtons}>
            <TouchableOpacity
              style={styles.customTipCancelButton}
              onPress={() => {
                setShowCustomTipModal(false);
                setCustomTipAmount('');
              }}
            >
              <Text style={styles.customTipCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.customTipConfirmButton}
              onPress={handleCustomTipSubmit}
            >
              <Text style={styles.customTipConfirmText}>Add Tip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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

        {/* Tip Section */}
        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <View style={styles.tipHeaderLeft}>
              <Ionicons name="heart" size={20} color="#E74C3C" />
              <Text style={styles.tipTitle}>Tip your delivery partner</Text>
            </View>
            {/* <Text style={styles.tipSubtitle}>Optional</Text> */}
          </View>
          <Text style={styles.tipDescription}>
            100% of the tip goes to your delivery partner
          </Text>
          <View style={styles.tipOptions}>
            {[20, 30, 50, 0].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tipButton,
                  selectedTip === amount && styles.tipButtonSelected,
                ]}
                onPress={() => handleTipSelection(amount)}
                disabled={placingOrder}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTip === amount && styles.tipButtonTextSelected,
                ]}>
                  {amount === 0 ? 'Custom' : `₹${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedTip && selectedTip > 0 && (
            <View style={styles.tipSelectedContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipSelectedText}>
                ₹{selectedTip} tip added
              </Text>
              <TouchableOpacity onPress={() => setSelectedTip(null)} disabled={placingOrder}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('cod')}
            disabled={placingOrder}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="cash-outline" size={24} color="#666" />
              <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
            </View>
            {paymentMethod === 'cod' && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'phonepe' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('phonepe')}
            disabled={placingOrder}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="phone-portrait-outline" size={24} color="#5F259F" />
              <Text style={styles.paymentOptionText}>PhonePe</Text>
            </View>
            {paymentMethod === 'phonepe' && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{getSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Tax ({settings?.tax_rate || 0}%)
            </Text>
            <Text style={styles.priceValue}>₹{getTax.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charge</Text>
            <Text style={[
              styles.priceValue,
              getDeliveryCharge === 0 && styles.freeDelivery
            ]}>
              {getDeliveryCharge === 0 ? 'FREE' : `₹${getDeliveryCharge.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceValue}>₹{getAppFee.toFixed(2)}</Text>
          </View>
          {selectedTip && selectedTip > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Tip</Text>
              <Text style={styles.priceValue}>₹{selectedTip.toFixed(2)}</Text>
            </View>
          )}
          {promoDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.discountText]}>
                Promo Discount
              </Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                -₹{promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{getTotal.toFixed(2)}</Text>
          </View>
        </View>

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
            <Text style={styles.placeOrderText}>
              {paymentMethod === 'phonepe' ? 'Proceed to Pay' : 'Place Order'} - ₹{getTotal.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <SuccessAnimation 
        visible={showSuccess}
        scaleAnim={scaleAnim}
        fadeAnim={fadeAnim}
      />

      {renderCustomTipModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  
  // Tip Section
  tipSection: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  tipSubtitle: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  tipDescription: { fontSize: 13, color: '#666', marginBottom: 16 },
  tipOptions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tipButton: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 8,
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tipButtonSelected: { 
    borderColor: '#007AFF', 
    backgroundColor: '#E3F2FD',
  },
  tipButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tipButtonTextSelected: { color: '#007AFF' },
  tipSelectedContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F8F4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  tipSelectedText: { flex: 1, fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  
  // Payment Method
  paymentOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: { 
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentOptionText: { fontSize: 16, fontWeight: '500', color: '#333' },
  
  // Price Breakdown
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  freeDelivery: { color: '#4CAF50', fontWeight: '600' },
  discountText: { color: '#4CAF50' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#007AFF' },
  
  // Custom Tip Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  customTipModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  customTipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  customTipTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  customTipContent: { marginBottom: 20 },
  customTipLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  customTipInput: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 16, 
    fontSize: 24, 
    fontWeight: '600', 
    textAlign: 'center', 
    backgroundColor: '#f8f9fa' 
  },
  customTipHint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
  customTipButtons: { flexDirection: 'row', gap: 12 },
  customTipCancelButton: { flex: 1, backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, alignItems: 'center' },
  customTipCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  customTipConfirmButton: { flex: 1, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  customTipConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  placeOrderButton: { 
    backgroundColor: '#007AFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: 8 
  },
  disabledButton: { backgroundColor: '#ccc' },
  placeOrderText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 24 },
  shopNowButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopNowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});