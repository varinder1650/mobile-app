// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Animated,
//   Modal,
//   Pressable,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { router, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../contexts/AuthContext';
// import { useCart } from '../contexts/CartContext';
// import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
// import { authenticatedFetch } from '../utils/authenticatedFetch';

// import {
//   CheckoutHeader,
//   AddressSection,
//   SuccessAnimation,
//   CartItemCard,
//   PromoCodeSection,
// } from '../components/checkout';

// const DEBUG = __DEV__;

// type OrderType = 'product' | 'porter' | 'printout';

// interface AddressData {
//   _id?: string;
//   label?: string;
//   street?: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
//   mobile_number?: string;
//   phone: string;
//   landmark?: string;
//   fullAddress: string;
//   latitude?: number;
//   longitude?: number;
//   is_default?: boolean;
// }

// interface PromoCode {
//   code: string;
//   discount_type: 'percentage' | 'fixed';
//   discount_value: number;
//   min_order_amount?: number;
//   max_discount?: number;
//   is_active: boolean;
// }

// export default function CheckoutScreen() {
//   const { token, user } = useAuth();
//   const { cartItems, updateQuantity, clearCart, getTotalPrice: getCartTotal } = useCart();
  
//   const params = useLocalSearchParams();
  
//   // ✅ Determine order type
//   const orderType: OrderType = (params.orderType as OrderType) || 'product';
  
//   const [loading, setLoading] = useState(true);
//   const [placingOrder, setPlacingOrder] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState<AddressData | null>(null);
//   const [settings, setSettings] = useState<any>(null);
//   const [paymentMethod, setPaymentMethod] = useState('cod');
//   const [updatingQuantity, setUpdatingQuantity] = useState<{[key: string]: boolean}>({});
  
//   // Promo code states
//   const [promoCode, setPromoCode] = useState('');
//   const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
//   const [promoLoading, setPromoLoading] = useState(false);
//   const [promoDiscount, setPromoDiscount] = useState(0);

//   // Tip states (only for product orders)
//   const [selectedTip, setSelectedTip] = useState<number | null>(null);
//   const [customTipAmount, setCustomTipAmount] = useState('');
//   const [showCustomTipModal, setShowCustomTipModal] = useState(false);
  
//   // Porter-specific data
//   const [porterData, setPorterData] = useState<any>(null);
//   const [porterRequestId, setPorterRequestId] = useState<string | null>(null);
  
//   // Printout-specific data
//   const [printoutData, setPrintoutData] = useState<any>(null);

//   // Success animation
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [scaleAnim] = useState(new Animated.Value(0));
//   const [fadeAnim] = useState(new Animated.Value(0));

//   // ✅ FIXED: Parse order type data on mount with guard condition
//   useEffect(() => {
//     // ✅ Guard against re-running if data is already set
//     if (orderType === 'porter' && params.porterData && porterData === null) {
//       try {
//         const data = JSON.parse(params.porterData as string);
//         setPorterData(data);
//         setPorterRequestId(params.requestId as string);
//         if (DEBUG) console.log('🚚 Porter order data:', data);
//       } catch (error) {
//         console.error('Error parsing porter data:', error);
//         Alert.alert('Error', 'Invalid porter order data');
//         router.back();
//       }
//     } else if (orderType === 'printout' && params.printoutData && printoutData === null) {
//       try {
//         const data = JSON.parse(params.printoutData as string);
//         setPrintoutData(data);
//         if (DEBUG) console.log('🖨️ Printout order data:', data);
//       } catch (error) {
//         console.error('Error parsing printout data:', error);
//         Alert.alert('Error', 'Invalid printout order data');
//         router.back();
//       }
//     }
//   }, [orderType, params.porterData, params.printoutData, params.requestId, porterData, printoutData]);

//   useEffect(() => {
//     if (token) {
//       loadData();
//     }
//   }, [token]);

//   useEffect(() => {
//     const addressFromParams = params.address as string;
//     const fullAddressFromParams = params.fullAddress as string;
    
//     if (addressFromParams && fullAddressFromParams) {
//       setDeliveryAddress({
//         _id: params.addressId as string,
//         label: params.addressLabel as string,
//         street: addressFromParams,
//         address: addressFromParams,
//         city: params.city as string || '',
//         state: params.state as string || '',
//         pincode: params.pincode as string || '',
//         mobile_number: params.mobile_number as string,
//         phone: params.mobile_number as string || params.phone as string || user?.phone || '',
//         landmark: params.landmark as string,
//         fullAddress: fullAddressFromParams,
//         latitude: params.latitude ? Number(params.latitude) : undefined,
//         longitude: params.longitude ? Number(params.longitude) : undefined,
//         is_default: params.is_default === 'true',
//       });
//     }
//   }, [params]);

//   const loadData = async () => {
//     try {
//       const settingsResponse = await fetch(API_ENDPOINTS.SETTINGS);
//       if (settingsResponse.ok) {
//         const settingsData = await settingsResponse.json();
//         setSettings(settingsData);
//       }
      
//       // Only load default address for product and printout orders
//       if (orderType !== 'porter' && !params.address) {
//         await loadDefaultAddress();
//       }
      
//       // For porter, use addresses from porter data
//       if (orderType === 'porter' && porterData) {
//         setDeliveryAddress({
//           address: porterData.delivery_address.address,
//           city: porterData.delivery_address.city,
//           state: '',
//           pincode: porterData.delivery_address.pincode,
//           phone: porterData.delivery_address.phone || user?.phone || '',
//           fullAddress: `${porterData.delivery_address.address}, ${porterData.delivery_address.city} - ${porterData.delivery_address.pincode}`,
//           latitude: porterData.delivery_address.latitude,
//           longitude: porterData.delivery_address.longitude,
//         });
//       }
      
//     } catch (error) {
//       if (DEBUG) console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadDefaultAddress = async () => {
//     try {
//       const addressResponse = await authenticatedFetch(API_ENDPOINTS.MY_ADDRESS);
      
//       if (addressResponse.ok) {
//         const addressData = await addressResponse.json();
        
//         let addresses = [];
//         if (Array.isArray(addressData)) {
//           addresses = addressData;
//         } else if (addressData.addresses && Array.isArray(addressData.addresses)) {
//           addresses = addressData.addresses;
//         }
        
//         const defaultAddress = addresses.find((addr: any) => addr.is_default) || addresses[0];
        
//         if (defaultAddress) {
//           setDeliveryAddress({
//             _id: defaultAddress._id,
//             label: defaultAddress.label,
//             street: defaultAddress.street,
//             address: defaultAddress.street || defaultAddress.address,
//             city: defaultAddress.city || '',
//             state: defaultAddress.state || '',
//             pincode: defaultAddress.pincode || '',
//             mobile_number: defaultAddress.mobile_number,
//             phone: defaultAddress.mobile_number || defaultAddress.phone || user?.phone || '',
//             landmark: defaultAddress.landmark,
//             fullAddress: `${defaultAddress.street || defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pincode}`,
//             latitude: defaultAddress.latitude,
//             longitude: defaultAddress.longitude,
//             is_default: defaultAddress.is_default,
//           });
//         }
//       }
//     } catch (error) {
//       if (DEBUG) console.error('Error loading default address:', error);
//     }
//   };

//   const updateCartQuantity = useCallback(async (itemId: string, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       Alert.alert(
//         'Remove Item',
//         'Are you sure you want to remove this item from your cart?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { 
//             text: 'Remove', 
//             style: 'destructive',
//             onPress: async () => {
//               setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
//               const cartItem = cartItems.find(item => item._id === itemId);
//               if (cartItem) {
//                 await updateQuantity(cartItem.product.id, 0);
//               }
//               setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
//             }
//           }
//         ]
//       );
//       return;
//     }

//     const cartItem = cartItems.find(item => item._id === itemId);
//     if (cartItem && newQuantity > cartItem.product.stock) {
//       Alert.alert('Stock Limit', `Only ${cartItem.product.stock} items available in stock`);
//       return;
//     }

//     setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
//     if (cartItem) {
//       await updateQuantity(cartItem.product.id, newQuantity);
//     }
//     setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
//   }, [cartItems, updateQuantity]);

//   // ✅ Tip handlers (only for product orders)
//   const handleTipSelection = (amount: number) => {
//     if (orderType !== 'product') return; // Tips only for product orders
//     if (amount === 0) {
//       setShowCustomTipModal(true);
//     } else {
//       setSelectedTip(amount);
//     }
//   };

//   const handleCustomTipSubmit = () => {
//     const amount = parseInt(customTipAmount);
    
//     if (isNaN(amount) || amount <= 0) {
//       Alert.alert('Error', 'Please enter a valid tip amount');
//       return;
//     }

//     if (amount > 500) {
//       Alert.alert('Error', 'Maximum tip amount is ₹500');
//       return;
//     }

//     setShowCustomTipModal(false);
//     setSelectedTip(amount);
//     setCustomTipAmount('');
//   };

//   // ✅ Promo code handlers
//   const applyPromoCode = async () => {
//     if (!promoCode.trim()) {
//       Alert.alert('Error', 'Please enter a promo code');
//       return;
//     }

//     setPromoLoading(true);
//     try {
//       const response = await authenticatedFetch(
//         `${API_BASE_URL}/promocodes/validate`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             code: promoCode.trim().toUpperCase(),
//             order_amount: getSubtotal(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.valid) {
//         setAppliedPromo(data.promocode);
//         calculatePromoDiscount(data.promocode);
//         Alert.alert('Success', 'Promo code applied successfully!');
//       } else {
//         Alert.alert('Error', data.message || 'Invalid promo code');
//         setAppliedPromo(null);
//         setPromoDiscount(0);
//       }
//     } catch (error) {
//       if (DEBUG) console.error('Error applying promo code:', error);
//       Alert.alert('Error', 'Failed to apply promo code');
//       setAppliedPromo(null);
//       setPromoDiscount(0);
//     } finally {
//       setPromoLoading(false);
//     }
//   };

//   const removePromoCode = useCallback(() => {
//     setPromoCode('');
//     setAppliedPromo(null);
//     setPromoDiscount(0);
//   }, []);

//   const calculatePromoDiscount = useCallback((promo: PromoCode) => {
//     const subtotal = getSubtotal();
//     let discount = 0;

//     if (promo.discount_type === 'percentage') {
//       discount = subtotal * (promo.discount_value / 100);
//       if (promo.max_discount) {
//         discount = Math.min(discount, promo.max_discount);
//       }
//     } else {
//       discount = promo.discount_value;
//     }

//     setPromoDiscount(discount);
//   }, []);

//   const showSuccessAnimation = useCallback(() => {
//     setPlacingOrder(false);
//     setShowSuccess(true);
    
//     scaleAnim.setValue(0);
//     fadeAnim.setValue(0);
    
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 40,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 400,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     setTimeout(() => {
//       Animated.parallel([
//         Animated.timing(scaleAnim, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         setShowSuccess(false);
//         if (orderType === 'product') {
//           clearCart();
//         }
//         router.replace('/(tabs)');
//       });
//     }, 2500);
//   }, [scaleAnim, fadeAnim, clearCart, orderType]);

//   const getSubtotal = useCallback(() => {
//     if (orderType === 'porter') {
//       return parseFloat(params.estimatedCost as string) || 0;
//     } else if (orderType === 'printout' && printoutData) {
//       return printoutData.totalPrice;
//     }
//     return getCartTotal();
//   }, [orderType, params.estimatedCost, printoutData, getCartTotal]);

//   const getTax = useMemo(() => {
//     if (!settings) return 0;
//     const taxableAmount = getSubtotal() - promoDiscount;
//     return taxableAmount * (settings.tax_rate / 100);
//   }, [settings, getSubtotal, promoDiscount]);

//   const getDeliveryCharge = useMemo(() => {
//     // No delivery charge for porter (already included) or printout (pickup)
//     if (orderType === 'porter' || orderType === 'printout') return 0;
    
//     if (!settings || !settings.delivery_fee) return 0;
//     const subtotal = getSubtotal();
    
//     if (subtotal >= settings.delivery_fee.free_delivery_threshold) {
//       return 0;
//     }
    
//     return settings.delivery_fee.base_fee;
//   }, [settings, getSubtotal, orderType]);

//   const getAppFee = useMemo(() => {
//     if (!settings || !settings.app_fee) return 0;
//     const subtotal = getSubtotal() - promoDiscount;
    
//     if (settings.app_fee.type === 'percentage') {
//       const calculatedFee = subtotal * (settings.app_fee.value / 100);
//       return Math.max(
//         settings.app_fee.min_fee, 
//         Math.min(calculatedFee, settings.app_fee.max_fee)
//       );
//     }
    
//     return settings.app_fee.value;
//   }, [settings, getSubtotal, promoDiscount]);

//   const getTotal = useMemo(() => {
//     const subtotal = getSubtotal();
//     const tipAmount = orderType === 'product' ? (selectedTip || 0) : 0; // Tips only for products
//     return subtotal + getTax + getDeliveryCharge + getAppFee + tipAmount - promoDiscount;
//   }, [getSubtotal, getTax, getDeliveryCharge, getAppFee, selectedTip, promoDiscount, orderType]);

//   const handleSelectAddress = useCallback(() => {
//     router.push('/address?from=checkout');
//   }, []);

//   const handlePlaceOrder = async () => {
//     if (!deliveryAddress && orderType !== 'porter') {
//       Alert.alert('Error', 'Please select a delivery address');
//       return;
//     }

//     if (!token) {
//       Alert.alert('Error', 'Please login to place an order');
//       return;
//     }

//     if (!paymentMethod) {
//       Alert.alert('Error', 'Please select a payment method');
//       return;
//     }

//     setPlacingOrder(true);
    
//     try {
//       // ✅ PORTER ORDER
//       if (orderType === 'porter') {
//         if (paymentMethod === 'phonepe') {
//           // PhonePe payment for porter
//           const response = await authenticatedFetch(
//             `${API_BASE_URL}/porter/porter-requests/${porterRequestId}/pay`,
//             {
//               method: 'POST',
//             }
//           );

//           if (response.ok) {
//             const result = await response.json();
            
//             router.replace({
//               pathname: '/payment-webview',
//               params: {
//                 paymentUrl: result.payment_url,
//                 requestId: porterRequestId,
//                 merchantTransactionId: result.merchant_transaction_id,
//                 requestType: 'porter',
//               }
//             });
//           } else {
//             const errorData = await response.json();
//             Alert.alert('Error', errorData.detail || 'Failed to initiate payment');
//           }
//         } else {
//           // ✅ COD for porter - Use new endpoint
//           const response = await authenticatedFetch(
//             `${API_BASE_URL}/porter/porter-requests/${porterRequestId}/confirm-cod`,
//             {
//               method: 'PATCH',
//               headers: { 'Content-Type': 'application/json' },
//             }
//           );

//           if (response.ok) {
//             const result = await response.json();
//             console.log('✅ Porter COD confirmed:', result);
            
//             // Show success and redirect to porter requests
//             Alert.alert(
//               'Success! 🎉',
//               'Your porter request has been confirmed. You will receive a notification shortly.',
//               [
//                 {
//                   text: 'View Request',
//                   onPress: () => {
//                     router.replace('/porter-requests');
//                   },
//                 },
//               ],
//               { cancelable: false }
//             );
//           } else {
//             const errorData = await response.json();
//             console.error('❌ COD confirmation failed:', errorData);
//             Alert.alert('Error', errorData.detail || 'Failed to confirm request');
//           }
//         }
//         setPlacingOrder(false);
//         return;
//       }

//       // ✅ PRODUCT OR PRINTOUT ORDER
//       const deliveryAddressData = {
//         street: deliveryAddress?.street || deliveryAddress?.address || '',
//         address: deliveryAddress?.address || '',
//         city: deliveryAddress?.city || '',
//         state: deliveryAddress?.state || '',
//         pincode: deliveryAddress?.pincode || '',
//         phone: deliveryAddress?.phone || deliveryAddress?.mobile_number || user?.phone || '',
//         mobile_number: deliveryAddress?.mobile_number || deliveryAddress?.phone || user?.phone || '',
//         label: deliveryAddress?.label || 'Home',
//         landmark: deliveryAddress?.landmark || '',
//         ...(deliveryAddress?.latitude && deliveryAddress?.longitude && {
//           latitude: deliveryAddress.latitude,
//           longitude: deliveryAddress.longitude,
//         }),
//       };

//       let orderData: any = {};

//       if (orderType === 'printout' && printoutData) {
//         orderData = {
//           order_type: 'printout',
//           printout_details: {
//             service_type: printoutData.serviceType,
//             files: printoutData.files,
//             size: printoutData.size,
//             color_option: printoutData.colorOption,
//             copies: printoutData.copies,
//             description: printoutData.description,
//           },
//           delivery_address: deliveryAddressData,
//           payment_method: paymentMethod,
//           subtotal: getSubtotal(),
//           tax: getTax,
//           app_fee: getAppFee,
//           promo_code: appliedPromo?.code || null,
//           promo_discount: promoDiscount,
//           total_amount: getTotal,
//         };
//       } else {
//         // Product order
//         orderData = {
//           order_type: 'product',
//           items: cartItems.map(item => ({
//             product: item.product.id,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//           delivery_address: deliveryAddressData,
//           payment_method: paymentMethod,
//           subtotal: getSubtotal(),
//           tax: getTax,
//           delivery_charge: getDeliveryCharge,
//           app_fee: getAppFee,
//           tip_amount: selectedTip || 0,
//           promo_code: appliedPromo?.code || null,
//           promo_discount: promoDiscount,
//           total_amount: getTotal,
//         };
//       }

//       if (DEBUG) console.log('📦 Placing order:', orderData);

//       const response = await authenticatedFetch(API_ENDPOINTS.ORDERS, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(orderData),
//       });

//       if (response.ok) {
//         const orderResult = await response.json();
//         if (DEBUG) console.log('✅ Order placed successfully:', orderResult);
        
//         if (paymentMethod === 'phonepe') {
//           // Initiate PhonePe payment
//           const paymentResponse = await authenticatedFetch(
//             `${API_BASE_URL}/payment/phonepe/initiate`,
//             {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 order_id: orderResult.id,
//                 amount: getTotal,
//               }),
//             }
//           );

//           if (paymentResponse.ok) {
//             const paymentResult = await paymentResponse.json();
            
//             router.replace({
//               pathname: '/payment-webview',
//               params: {
//                 paymentUrl: paymentResult.payment_url,
//                 orderId: orderResult.id,
//                 merchantTransactionId: paymentResult.merchant_transaction_id,
//                 requestType: 'order',
//               }
//             });
//           }
//         } else {
//           // COD - show success animation
//           showSuccessAnimation();
//         }
//       } else {
//         const errorData = await response.json();
//         if (DEBUG) console.error('❌ Order placement failed:', errorData);
//         Alert.alert('Error', errorData.detail || 'Failed to place order');
//         setPlacingOrder(false);
//       }
//     } catch (error) {
//       if (DEBUG) console.error('❌ Error placing order:', error);
//       Alert.alert('Error', 'Failed to place order. Please try again.');
//       setPlacingOrder(false);
//     }
//   };

//   const renderCartItem = useCallback((item: any) => (
//     <CartItemCard
//       key={item._id}
//       item={item}
//       onUpdateQuantity={updateCartQuantity}
//       updating={updatingQuantity[item._id]}
//       disabled={placingOrder}
//     />
//   ), [updateCartQuantity, updatingQuantity, placingOrder]);

//   // ✅ Render Porter Service Details
//   const renderPorterDetails = () => {
//     if (!porterData) return null;

//     return (
//       <View style={styles.porterDetailsContainer}>
//         <View style={styles.porterHeader}>
//           <Ionicons name="bicycle" size={32} color="#007AFF" />
//           <Text style={styles.porterTitle}>Porter Delivery Service</Text>
//         </View>

//         <View style={styles.porterDetail}>
//           <Ionicons name="location" size={20} color="#34C759" />
//           <View style={styles.porterDetailText}>
//             <Text style={styles.porterDetailLabel}>Pickup</Text>
//             <Text style={styles.porterDetailValue}>
//               {porterData.pickup_address.address}, {porterData.pickup_address.city}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.porterDetail}>
//           <Ionicons name="location" size={20} color="#FF3B30" />
//           <View style={styles.porterDetailText}>
//             <Text style={styles.porterDetailLabel}>Delivery</Text>
//             <Text style={styles.porterDetailValue}>
//               {porterData.delivery_address.address}, {porterData.delivery_address.city}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.porterDetail}>
//           <Ionicons name="cube-outline" size={20} color="#007AFF" />
//           <View style={styles.porterDetailText}>
//             <Text style={styles.porterDetailLabel}>Package</Text>
//             <Text style={styles.porterDetailValue}>{porterData.description}</Text>
//           </View>
//         </View>

//         <View style={styles.porterDetail}>
//           <Ionicons name="resize-outline" size={20} color="#007AFF" />
//           <View style={styles.porterDetailText}>
//             <Text style={styles.porterDetailLabel}>Dimensions</Text>
//             <Text style={styles.porterDetailValue}>
//               {porterData.dimensions.length} × {porterData.dimensions.breadth} × {porterData.dimensions.height}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.porterDetail}>
//           <Ionicons name="barbell-outline" size={20} color="#007AFF" />
//           <View style={styles.porterDetailText}>
//             <Text style={styles.porterDetailLabel}>Weight</Text>
//             <Text style={styles.porterDetailValue}>{porterData.weight_category}</Text>
//           </View>
//         </View>

//         {porterData.urgent && (
//           <View style={styles.urgentBadge}>
//             <Ionicons name="flash" size={16} color="#FF9500" />
//             <Text style={styles.urgentText}>Urgent Delivery (+₹20)</Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   // ✅ Custom Tip Modal
//   const renderCustomTipModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={showCustomTipModal}
//       onRequestClose={() => setShowCustomTipModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <Pressable 
//           style={styles.modalBackdrop} 
//           onPress={() => setShowCustomTipModal(false)}
//         />
//         <View style={styles.customTipModal}>
//           <View style={styles.customTipHeader}>
//             <Text style={styles.customTipTitle}>Enter Tip Amount</Text>
//             <TouchableOpacity onPress={() => setShowCustomTipModal(false)}>
//               <Ionicons name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.customTipContent}>
//             <Text style={styles.customTipLabel}>Amount (₹)</Text>
//             <TextInput
//               style={styles.customTipInput}
//               value={customTipAmount}
//               onChangeText={setCustomTipAmount}
//               keyboardType="numeric"
//               placeholder="Enter amount"
//               autoFocus
//               maxLength={3}
//             />
//             <Text style={styles.customTipHint}>Maximum tip amount: ₹500</Text>
//           </View>
          
//           <View style={styles.customTipButtons}>
//             <TouchableOpacity
//               style={styles.customTipCancelButton}
//               onPress={() => {
//                 setShowCustomTipModal(false);
//                 setCustomTipAmount('');
//               }}
//             >
//               <Text style={styles.customTipCancelText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.customTipConfirmButton}
//               onPress={handleCustomTipSubmit}
//             >
//               <Text style={styles.customTipConfirmText}>Add Tip</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={styles.loadingText}>Loading checkout...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (orderType === 'product' && cartItems.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyTitle}>Your cart is empty</Text>
//           <TouchableOpacity 
//             style={styles.shopNowButton}
//             onPress={() => router.push('/(tabs)')}
//           >
//             <Text style={styles.shopNowText}>Shop Now</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <CheckoutHeader onBack={() => router.back()} disabled={placingOrder} />

//       <ScrollView 
//         style={styles.content} 
//         showsVerticalScrollIndicator={false}
//         scrollEnabled={!placingOrder}
//       >
//         {/* Address Section - Only for product and printout */}
//         {orderType !== 'porter' && (
//           <AddressSection
//             deliveryAddress={deliveryAddress}
//             onSelectAddress={handleSelectAddress}
//             disabled={placingOrder}
//           />
//         )}

//         {/* Order Summary */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>
//               {orderType === 'porter' ? 'Service Details' : 
//                orderType === 'printout' ? 'Printout Details' : 
//                'Order Summary'}
//             </Text>
//           </View>
          
//           {orderType === 'porter' ? (
//             renderPorterDetails()
//           ) : orderType === 'printout' ? (
//             <Text>Printout details here</Text>
//           ) : (
//             cartItems.map(renderCartItem)
//           )}
//         </View>

//         {/* ✅ Tip Section */}
//         {orderType === 'product' || orderType === 'porter' || orderType === 'printout' && (
//           <View style={styles.tipSection}>
//             <View style={styles.tipHeader}>
//               <View style={styles.tipHeaderLeft}>
//                 <Ionicons name="heart" size={20} color="#E74C3C" />
//                 <Text style={styles.tipTitle}>Tip your delivery partner</Text>
//               </View>
//             </View>
//             <Text style={styles.tipDescription}>
//               100% of the tip goes to your delivery partner
//             </Text>
//             <View style={styles.tipOptions}>
//               {[20, 30, 50, 0].map((amount) => (
//                 <TouchableOpacity
//                   key={amount}
//                   style={[
//                     styles.tipButton,
//                     selectedTip === amount && styles.tipButtonSelected,
//                   ]}
//                   onPress={() => handleTipSelection(amount)}
//                   disabled={placingOrder}
//                 >
//                   <Text style={[
//                     styles.tipButtonText,
//                     selectedTip === amount && styles.tipButtonTextSelected,
//                   ]}>
//                     {amount === 0 ? 'Custom' : `₹${amount}`}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             {selectedTip && selectedTip > 0 && (
//               <View style={styles.tipSelectedContainer}>
//                 <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//                 <Text style={styles.tipSelectedText}>
//                   ₹{selectedTip} tip added
//                 </Text>
//                 <TouchableOpacity onPress={() => setSelectedTip(null)} disabled={placingOrder}>
//                   <Ionicons name="close-circle" size={20} color="#999" />
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         )}

//         {/* Payment Method */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Payment Method</Text>
//           </View>
//           <TouchableOpacity
//             style={[
//               styles.paymentOption,
//               paymentMethod === 'cod' && styles.paymentOptionSelected,
//             ]}
//             onPress={() => setPaymentMethod('cod')}
//             disabled={placingOrder}
//           >
//             <View style={styles.paymentOptionLeft}>
//               <Ionicons name="cash-outline" size={24} color="#666" />
//               <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
//             </View>
//             {paymentMethod === 'cod' && (
//               <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.paymentOption,
//               paymentMethod === 'phonepe' && styles.paymentOptionSelected,
//             ]}
//             onPress={() => setPaymentMethod('phonepe')}
//             disabled={placingOrder}
//           >
//             <View style={styles.paymentOptionLeft}>
//               <Ionicons name="phone-portrait-outline" size={24} color="#5F259F" />
//               <Text style={styles.paymentOptionText}>PhonePe</Text>
//             </View>
//             {paymentMethod === 'phonepe' && (
//               <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* ✅ Promo Code - For all order types, only if subtotal >= 100 */}
//         {getSubtotal() >= 0 && (
//           <PromoCodeSection
//             promoCode={promoCode}
//             onPromoCodeChange={setPromoCode}
//             onApplyPromo={applyPromoCode}
//             onRemovePromo={removePromoCode}
//             appliedPromo={appliedPromo}
//             promoDiscount={promoDiscount}
//             loading={promoLoading}
//             disabled={placingOrder}
//           />
//         )}

//         {/* Price Breakdown */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Bill Details</Text>
//           <View style={styles.priceRow}>
//             <Text style={styles.priceLabel}>Subtotal</Text>
//             <Text style={styles.priceValue}>₹{getSubtotal().toFixed(2)}</Text>
//           </View>
//           <View style={styles.priceRow}>
//             <Text style={styles.priceLabel}>
//               Tax ({settings?.tax_rate || 0}%)
//             </Text>
//             <Text style={styles.priceValue}>₹{getTax.toFixed(2)}</Text>
//           </View>
//           {orderType === 'product' && (
//             <View style={styles.priceRow}>
//               <Text style={styles.priceLabel}>Delivery Charge</Text>
//               <Text style={[
//                 styles.priceValue,
//                 getDeliveryCharge === 0 && styles.freeDelivery
//               ]}>
//                 {getDeliveryCharge === 0 ? 'FREE' : `₹${getDeliveryCharge.toFixed(2)}`}
//               </Text>
//             </View>
//           )}
//           <View style={styles.priceRow}>
//             <Text style={styles.priceLabel}>Platform Fee</Text>
//             <Text style={styles.priceValue}>₹{getAppFee.toFixed(2)}</Text>
//           </View>
//           {orderType === 'product' && selectedTip && selectedTip > 0 && (
//             <View style={styles.priceRow}>
//               <Text style={styles.priceLabel}>Delivery Tip</Text>
//               <Text style={styles.priceValue}>₹{selectedTip.toFixed(2)}</Text>
//             </View>
//           )}
//           {promoDiscount > 0 && (
//             <View style={styles.priceRow}>
//               <Text style={[styles.priceLabel, styles.discountText]}>
//                 Promo Discount
//               </Text>
//               <Text style={[styles.priceValue, styles.discountText]}>
//                 -₹{promoDiscount.toFixed(2)}
//               </Text>
//             </View>
//           )}
//           <View style={styles.divider} />
//           <View style={styles.priceRow}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <Text style={styles.totalValue}>₹{getTotal.toFixed(2)}</Text>
//           </View>
//         </View>

//         <View style={{ height: 100 }} />
//       </ScrollView>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[styles.placeOrderButton, placingOrder && styles.disabledButton]}
//           onPress={handlePlaceOrder}
//           disabled={placingOrder}
//         >
//           {placingOrder ? (
//             <>
//               <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
//               <Text style={styles.placeOrderText}>Processing...</Text>
//             </>
//           ) : (
//             <Text style={styles.placeOrderText}>
//               {paymentMethod === 'phonepe' ? 'Proceed to Pay' : 'Place Order'} - ₹{getTotal.toFixed(2)}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       <SuccessAnimation 
//         visible={showSuccess}
//         scaleAnim={scaleAnim}
//         fadeAnim={fadeAnim}
//       />

//       {renderCustomTipModal()}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   content: { flex: 1 },
//   section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
//   sectionHeader: { marginBottom: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  
//   // Porter Details
//   porterDetailsContainer: { gap: 12 },
//   porterHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 8,
//   },
//   porterTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
//   porterDetail: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 12,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   porterDetailText: { flex: 1 },
//   porterDetailLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
//   porterDetailValue: { fontSize: 14, fontWeight: '500', color: '#333' },
//   urgentBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     padding: 12,
//     borderRadius: 8,
//     gap: 8,
//   },
//   urgentText: { fontSize: 14, fontWeight: '600', color: '#FF9500' },
  
//   // Tip Section
//   tipSection: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
//   tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
//   tipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
//   tipTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
//   tipDescription: { fontSize: 13, color: '#666', marginBottom: 16 },
//   tipOptions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
//   tipButton: { 
//     flex: 1, 
//     paddingVertical: 12, 
//     paddingHorizontal: 8,
//     borderRadius: 8, 
//     borderWidth: 1.5, 
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   tipButtonSelected: { 
//     borderColor: '#007AFF', 
//     backgroundColor: '#E3F2FD',
//   },
//   tipButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
//   tipButtonTextSelected: { color: '#007AFF' },
//   tipSelectedContainer: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#F0F8F4',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//     gap: 8,
//   },
//   tipSelectedText: { flex: 1, fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  
//   // Payment Method
//   paymentOption: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//     marginBottom: 12,
//     backgroundColor: '#fff',
//   },
//   paymentOptionSelected: { 
//     borderColor: '#007AFF',
//     backgroundColor: '#E3F2FD',
//   },
//   paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   paymentOptionText: { fontSize: 16, fontWeight: '500', color: '#333' },
  
//   // Price Breakdown
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   priceLabel: { fontSize: 14, color: '#666' },
//   priceValue: { fontSize: 14, fontWeight: '500', color: '#333' },
//   freeDelivery: { color: '#4CAF50', fontWeight: '600' },
//   discountText: { color: '#4CAF50' },
//   divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
//   totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
//   totalValue: { fontSize: 18, fontWeight: '700', color: '#007AFF' },
  
//   // Custom Tip Modal
//   modalOverlay: { flex: 1, justifyContent: 'flex-end' },
//   modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
//   customTipModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
//   customTipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   customTipTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
//   customTipContent: { marginBottom: 20 },
//   customTipLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
//   customTipInput: { 
//     borderWidth: 1, 
//     borderColor: '#e0e0e0', 
//     borderRadius: 8, 
//     padding: 16, 
//     fontSize: 24, 
//     fontWeight: '600', 
//     textAlign: 'center', 
//     backgroundColor: '#f8f9fa' 
//   },
//   customTipHint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
//   customTipButtons: { flexDirection: 'row', gap: 12 },
//   customTipCancelButton: { flex: 1, backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, alignItems: 'center' },
//   customTipCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
//   customTipConfirmButton: { flex: 1, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
//   customTipConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  
//   footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
//   placeOrderButton: { 
//     backgroundColor: '#007AFF', 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     padding: 16, 
//     borderRadius: 8 
//   },
//   disabledButton: { backgroundColor: '#ccc' },
//   placeOrderText: { color: '#fff', fontSize: 18, fontWeight: '600' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { fontSize: 16, color: '#666', marginTop: 16 },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
//   emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 24 },
//   shopNowButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
//   shopNowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// });


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
} from '../components/checkout';

const DEBUG = __DEV__;

type OrderType = 'product' | 'porter' | 'printout';

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
  const { cartItems, updateQuantity, clearCart, getTotalPrice: getCartTotal } = useCart();
  
  const params = useLocalSearchParams();
  const orderType: OrderType = (params.orderType as OrderType) || 'product';
  
  // State management
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
  
  // Order type specific data
  const [porterData, setPorterData] = useState<any>(null);
  const [porterRequestId, setPorterRequestId] = useState<string | null>(null);
  const [printoutData, setPrintoutData] = useState<any>(null);

  // Animation
  const [showSuccess, setShowSuccess] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  // ✅ FIX: Parse order data ONCE on mount only
  useEffect(() => {
    let mounted = true;

    const parseOrderData = () => {
      if (!mounted) return;

      if (orderType === 'porter' && params.porterData && !porterData) {
        try {
          const data = JSON.parse(params.porterData as string);
          setPorterData(data);
          setPorterRequestId(params.requestId as string);
          if (DEBUG) console.log('🚚 Porter data loaded');
        } catch (error) {
          console.error('Error parsing porter data:', error);
          Alert.alert('Error', 'Invalid porter order data');
          router.back();
        }
      } else if (orderType === 'printout' && params.printoutData && !printoutData) {
        try {
          const data = JSON.parse(params.printoutData as string);
          setPrintoutData(data);
          if (DEBUG) console.log('🖨️ Printout data loaded');
        } catch (error) {
          console.error('Error parsing printout data:', error);
          Alert.alert('Error', 'Invalid printout order data');
          router.back();
        }
      }
    };

    parseOrderData();

    return () => {
      mounted = false;
    };
  }, []); // ✅ Empty dependency array - run only once

  // ✅ FIX: Load settings and default address separately
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted || !token) return;

      try {
        // Load settings
        const settingsResponse = await fetch(API_ENDPOINTS.SETTINGS);
        if (settingsResponse.ok && mounted) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }
        
        // Load default address only if not coming from address selection
        if (orderType !== 'porter' && !params.address && mounted) {
          await loadDefaultAddress();
        }
      } catch (error) {
        if (DEBUG) console.error('Error loading data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [token]); // ✅ Only depend on token

  // ✅ FIX: Handle address from params in separate effect
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
  }, [
    params.address,
    params.fullAddress,
    params.addressId,
    params.addressLabel,
    params.city,
    params.state,
    params.pincode,
    params.mobile_number,
    params.phone,
    params.landmark,
    params.latitude,
    params.longitude,
    params.is_default,
  ]); // ✅ Only params that actually change

  // ✅ FIX: Set porter delivery address when porter data is loaded
  useEffect(() => {
    if (orderType === 'porter' && porterData && !deliveryAddress) {
      setDeliveryAddress({
        address: porterData.delivery_address.address,
        city: porterData.delivery_address.city,
        state: '',
        pincode: porterData.delivery_address.pincode,
        phone: porterData.delivery_address.phone || user?.phone || '',
        fullAddress: `${porterData.delivery_address.address}, ${porterData.delivery_address.city} - ${porterData.delivery_address.pincode}`,
        latitude: porterData.delivery_address.latitude,
        longitude: porterData.delivery_address.longitude,
      });
    }
  }, [orderType, porterData]); // ✅ Only when porter data changes

  const loadDefaultAddress = async () => {
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.MY_ADDRESS);
      if (!response.ok) return;
      
      const data = await response.json();
      const addresses = Array.isArray(data) ? data : data.addresses || [];
      const defaultAddr = addresses.find((addr: any) => addr.is_default) || addresses[0];
      
      if (defaultAddr) {
        setDeliveryAddress({
          _id: defaultAddr._id,
          label: defaultAddr.label,
          street: defaultAddr.street,
          address: defaultAddr.street || defaultAddr.address,
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          pincode: defaultAddr.pincode || '',
          mobile_number: defaultAddr.mobile_number,
          phone: defaultAddr.mobile_number || defaultAddr.phone || user?.phone || '',
          landmark: defaultAddr.landmark,
          fullAddress: `${defaultAddr.street || defaultAddr.address}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.pincode}`,
          latitude: defaultAddr.latitude,
          longitude: defaultAddr.longitude,
          is_default: defaultAddr.is_default,
        });
      }
    } catch (error) {
      if (DEBUG) console.error('Error loading default address:', error);
    }
  };

  // Cart quantity update
  const updateCartQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert('Remove Item', 'Remove this item from cart?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
            const item = cartItems.find(i => i._id === itemId);
            if (item) await updateQuantity(item.product.id, 0);
            setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
          }
        }
      ]);
      return;
    }

    const item = cartItems.find(i => i._id === itemId);
    if (item && newQuantity > item.product.stock) {
      Alert.alert('Stock Limit', `Only ${item.product.stock} items available`);
      return;
    }

    setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));
    if (item) await updateQuantity(item.product.id, newQuantity);
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

  // Promo code handlers
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/promocodes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          order_amount: getSubtotal(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedPromo(data.promocode);
        calculatePromoDiscount(data.promocode);
        Alert.alert('Success', 'Promo code applied!');
      } else {
        Alert.alert('Error', data.message || 'Invalid promo code');
        setAppliedPromo(null);
        setPromoDiscount(0);
      }
    } catch (error) {
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
      if (promo.max_discount) discount = Math.min(discount, promo.max_discount);
    } else {
      discount = promo.discount_value;
    }
    setPromoDiscount(discount);
  }, []);

  // Success animation
  const showSuccessAnimation = useCallback(() => {
    setPlacingOrder(false);
    setShowSuccess(true);
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShowSuccess(false);
        if (orderType === 'product') clearCart();
        router.replace('/(tabs)');
      });
    }, 2500);
  }, [scaleAnim, fadeAnim, clearCart, orderType]);

  // Price calculations
  const getSubtotal = useCallback(() => {
    if (orderType === 'porter') return parseFloat(params.estimatedCost as string) || 0;
    if (orderType === 'printout' && printoutData) return printoutData.totalPrice;
    return getCartTotal();
  }, [orderType, params.estimatedCost, printoutData, getCartTotal]);

  const getTax = useMemo(() => {
    if (!settings) return 0;
    return (getSubtotal() - promoDiscount) * (settings.tax_rate / 100);
  }, [settings, getSubtotal, promoDiscount]);

  const getDeliveryCharge = useMemo(() => {
    if (orderType === 'porter' || orderType === 'printout') return 0;
    if (!settings?.delivery_fee) return 0;
    return getSubtotal() >= settings.delivery_fee.free_delivery_threshold ? 0 : settings.delivery_fee.base_fee;
  }, [settings, getSubtotal, orderType]);

  const getAppFee = useMemo(() => {
    if (!settings?.app_fee) return 0;
    const subtotal = getSubtotal() - promoDiscount;
    if (settings.app_fee.type === 'percentage') {
      const fee = subtotal * (settings.app_fee.value / 100);
      return Math.max(settings.app_fee.min_fee, Math.min(fee, settings.app_fee.max_fee));
    }
    return settings.app_fee.value;
  }, [settings, getSubtotal, promoDiscount]);

  const getTotal = useMemo(() => {
    const tipAmount = selectedTip || 0;
    return getSubtotal() + getTax + getDeliveryCharge + getAppFee + tipAmount - promoDiscount;
  }, [getSubtotal, getTax, getDeliveryCharge, getAppFee, selectedTip, promoDiscount]);

  // Order placement
  const handlePlaceOrder = async () => {
    if (!deliveryAddress && orderType !== 'porter') {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!token || !paymentMethod) {
      Alert.alert('Error', 'Please login and select payment method');
      return;
    }

    setPlacingOrder(true);

    try {
      // PORTER ORDER
      if (orderType === 'porter') {
        const endpoint = paymentMethod === 'phonepe' 
          ? `${API_BASE_URL}/porter/porter-requests/${porterRequestId}/pay`
          : `${API_BASE_URL}/porter/porter-requests/${porterRequestId}/confirm-cod`;

        const response = await authenticatedFetch(endpoint, {
          method: paymentMethod === 'phonepe' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          
          if (paymentMethod === 'phonepe') {
            router.replace({
              pathname: '/payment-webview',
              params: {
                paymentUrl: result.payment_url,
                requestId: porterRequestId,
                merchantTransactionId: result.merchant_transaction_id,
                requestType: 'porter',
              }
            });
          } else {
            Alert.alert('Success! 🎉', 'Your porter request has been confirmed.', [
              { text: 'View Request', onPress: () => router.replace('/porter-requests') }
            ], { cancelable: false });
          }
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.detail || 'Failed to process request');
        }
        setPlacingOrder(false);
        return;
      }

      // PRODUCT OR PRINTOUT ORDER
      const addressData = {
        street: deliveryAddress?.street || deliveryAddress?.address || '',
        address: deliveryAddress?.address || '',
        city: deliveryAddress?.city || '',
        state: deliveryAddress?.state || '',
        pincode: deliveryAddress?.pincode || '',
        phone: deliveryAddress?.phone || deliveryAddress?.mobile_number || user?.phone || '',
        mobile_number: deliveryAddress?.mobile_number || deliveryAddress?.phone || user?.phone || '',
        label: deliveryAddress?.label || 'Home',
        landmark: deliveryAddress?.landmark || '',
        ...(deliveryAddress?.latitude && deliveryAddress?.longitude && {
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude,
        }),
      };

      const orderData: any = {
        order_type: orderType,
        delivery_address: addressData,
        payment_method: paymentMethod,
        subtotal: getSubtotal(),
        tax: getTax,
        app_fee: getAppFee,
        promo_code: appliedPromo?.code || null,
        promo_discount: promoDiscount,
        total_amount: getTotal,
      };

      if (orderType === 'printout' && printoutData) {
        orderData.printout_details = {
          service_type: printoutData.serviceType,
          files: printoutData.files,
          size: printoutData.size,
          color_option: printoutData.colorOption,
          copies: printoutData.copies,
          description: printoutData.description,
        };
      } else {
        orderData.items = cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }));
        orderData.delivery_charge = getDeliveryCharge;
        orderData.tip_amount = selectedTip || 0;
      }

      const response = await authenticatedFetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (paymentMethod === 'phonepe') {
          const paymentResponse = await authenticatedFetch(`${API_BASE_URL}/payment/phonepe/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: result.id, amount: getTotal }),
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            router.replace({
              pathname: '/payment-webview',
              params: {
                paymentUrl: paymentResult.payment_url,
                orderId: result.id,
                merchantTransactionId: paymentResult.merchant_transaction_id,
                requestType: 'order',
              }
            });
          }
        } else {
          showSuccessAnimation();
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to place order');
        setPlacingOrder(false);
      }
    } catch (error) {
      console.error('Order placement error:', error);
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

  // Render Porter Details
  const renderPorterDetails = () => {
    if (!porterData) return null;

    return (
      <View style={styles.porterDetailsContainer}>
        <View style={styles.porterHeader}>
          <Ionicons name="bicycle" size={32} color="#007AFF" />
          <Text style={styles.porterTitle}>Porter Delivery Service</Text>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="location" size={20} color="#34C759" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Pickup</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.pickup_address.address}, {porterData.pickup_address.city}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="location" size={20} color="#FF3B30" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Delivery</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.delivery_address.address}, {porterData.delivery_address.city}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="cube-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Package</Text>
            <Text style={styles.porterDetailValue}>{porterData.description}</Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="resize-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Dimensions</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.dimensions.length} × {porterData.dimensions.breadth} × {porterData.dimensions.height}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="barbell-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Weight</Text>
            <Text style={styles.porterDetailValue}>{porterData.weight_category}</Text>
          </View>
        </View>

        {porterData.urgent && (
          <View style={styles.urgentBadge}>
            <Ionicons name="flash" size={16} color="#FF9500" />
            <Text style={styles.urgentText}>Urgent Delivery (+₹20)</Text>
          </View>
        )}
      </View>
    );
  };

  // Render Printout Details
  const renderPrintoutDetails = () => {
    if (!printoutData) return null;

    return (
      <View style={styles.printoutContainer}>
        <View style={styles.printoutHeader}>
          <Ionicons name="print" size={32} color="#007AFF" />
          <Text style={styles.printoutTitle}>
            {printoutData.serviceType === 'photo' ? 'Photo Prints' : 'Document Printouts'}
          </Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Size:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.size.toUpperCase()}</Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Color:</Text>
          <Text style={styles.printoutDetailValue}>
            {printoutData.colorOption === 'bw' ? 'Black & White' : 'Color'}
          </Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Copies:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.copies}</Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Files:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.files.length}</Text>
        </View>

        {printoutData.description && (
          <View style={styles.printoutDetail}>
            <Text style={styles.printoutDetailLabel}>Instructions:</Text>
            <Text style={styles.printoutDetailValue}>{printoutData.description}</Text>
          </View>
        )}
      </View>
    );
  };

  // Custom tip modal
  const renderCustomTipModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCustomTipModal}
      onRequestClose={() => setShowCustomTipModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCustomTipModal(false)} />
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
            <Text style={styles.customTipHint}>Maximum: ₹500</Text>
          </View>
          <View style={styles.customTipButtons}>
            <TouchableOpacity
              style={styles.customTipCancelButton}
              onPress={() => { setShowCustomTipModal(false); setCustomTipAmount(''); }}
            >
              <Text style={styles.customTipCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customTipConfirmButton} onPress={handleCustomTipSubmit}>
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

  if (orderType === 'product' && cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CheckoutHeader onBack={() => router.back()} disabled={placingOrder} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} scrollEnabled={!placingOrder}>
        {/* Address Section - Not for porter */}
        {orderType !== 'porter' && (
          <AddressSection
            deliveryAddress={deliveryAddress}
            onSelectAddress={() => router.push('/address?from=checkout')}
            disabled={placingOrder}
          />
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {orderType === 'porter' ? 'Service Details' : 
               orderType === 'printout' ? 'Printout Details' : 
               'Order Summary'}
            </Text>
          </View>
          
          {orderType === 'porter' && renderPorterDetails()}
          {orderType === 'printout' && renderPrintoutDetails()}
          {orderType === 'product' && cartItems.map(renderCartItem)}
        </View>

        {/* Tip Section - For all order types */}
        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <View style={styles.tipHeaderLeft}>
              <Ionicons name="heart" size={20} color="#E74C3C" />
              <Text style={styles.tipTitle}>Tip your delivery partner</Text>
            </View>
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
              <Text style={styles.tipSelectedText}>₹{selectedTip} tip added</Text>
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

        {/* Promo Code - For orders >= 100 */}
        {getSubtotal() >= 100 && (
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
        )}

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{getSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax ({settings?.tax_rate || 0}%)</Text>
            <Text style={styles.priceValue}>₹{getTax.toFixed(2)}</Text>
          </View>
          {orderType === 'product' && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charge</Text>
              <Text style={[styles.priceValue, getDeliveryCharge === 0 && styles.freeDelivery]}>
                {getDeliveryCharge === 0 ? 'FREE' : `₹${getDeliveryCharge.toFixed(2)}`}
              </Text>
            </View>
          )}
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
              <Text style={[styles.priceLabel, styles.discountText]}>Promo Discount</Text>
              <Text style={[styles.priceValue, styles.discountText]}>-₹{promoDiscount.toFixed(2)}</Text>
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

      <SuccessAnimation visible={showSuccess} scaleAnim={scaleAnim} fadeAnim={fadeAnim} />
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
  
  // Porter Details
  porterDetailsContainer: { gap: 12 },
  porterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  porterTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  porterDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  porterDetailText: { flex: 1 },
  porterDetailLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  porterDetailValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  urgentText: { fontSize: 14, fontWeight: '600', color: '#FF9500' },
  
  // Printout Details
  printoutContainer: { gap: 12 },
  printoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  printoutTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  printoutDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  printoutDetailLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  printoutDetailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  
  // Tip Section
  tipSection: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
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
  tipButtonSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
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
  paymentOptionSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
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
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 16, 
    fontSize: 24, fontWeight: '600', textAlign: 'center', backgroundColor: '#f8f9fa' 
  },
  customTipHint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
  customTipButtons: { flexDirection: 'row', gap: 12 },
  customTipCancelButton: { flex: 1, backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, alignItems: 'center' },
  customTipCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  customTipConfirmButton: { flex: 1, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  customTipConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  placeOrderButton: { 
    backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'center', padding: 16, borderRadius: 8 
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