// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useAuth } from '../contexts/AuthContext';
// import { usePorterRequest } from '../contexts/PorterRequestContext';
// import { API_BASE_URL } from '../config/apiConfig';
// import { authenticatedFetch } from '../utils/authenticatedFetch';

// const WEIGHT_CATEGORIES = [
//   { id: '1', label: 'Less than 0.5 kg', value: '< 0.5 kg' },
//   { id: '2', label: '0.5 - 1 kg', value: '0.5-1 kg' },
//   { id: '3', label: '1 - 2 kg', value: '1-2 kg' },
//   { id: '4', label: 'More than 2 kg', value: '> 2 kg' },
// ];

// export default function CreatePorterRequestScreen() {
//   const { token } = useAuth();
//   const { pickupAddress, deliveryAddress, clearAddresses } = usePorterRequest();
  
//   const [description, setDescription] = useState('');
//   const [length, setLength] = useState('');
//   const [breadth, setBreadth] = useState('');
//   const [height, setHeight] = useState('');
//   const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
//   const [urgent, setUrgent] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // ✅ Navigate to address page for pickup
//   const handleSelectPickupAddress = () => {
//     router.push({
//       pathname: '/address',
//       params: { 
//         from: 'porter-request',
//         addressType: 'pickup',
//       }
//     });
//   };

//   // ✅ Navigate to address page for delivery
//   const handleSelectDeliveryAddress = () => {
//     router.push({
//       pathname: '/address',
//       params: { 
//         from: 'porter-request',
//         addressType: 'delivery',
//       }
//     });
//   };

//   const handleSubmit = async () => {
//     if (!pickupAddress) {
//       Alert.alert('Error', 'Please select a pickup address');
//       return;
//     }
  
//     if (!deliveryAddress) {
//       Alert.alert('Error', 'Please select a delivery address');
//       return;
//     }
  
//     if (!description.trim()) {
//       Alert.alert('Error', 'Please provide package description');
//       return;
//     }
  
//     if (!length || !breadth || !height) {
//       Alert.alert('Error', 'Please enter package dimensions (L × B × H)');
//       return;
//     }
  
//     if (!selectedWeight) {
//       Alert.alert('Error', 'Please select package weight category');
//       return;
//     }
  
//     setSubmitting(true);
  
//     try {
//       // ✅ Ensure proper data formatting
//       const requestData = {
//         pickup_address: {
//           address: pickupAddress.street || pickupAddress.address || '',
//           city: pickupAddress.city || '',
//           pincode: pickupAddress.pincode || '',
//         },
//         delivery_address: {
//           address: deliveryAddress.street || deliveryAddress.address || '',
//           city: deliveryAddress.city || '',
//           pincode: deliveryAddress.pincode || '',
//         },
//         phone: (pickupAddress.mobile_number || pickupAddress.phone || '').replace(/\D/g, ''),
//         description: description.trim(),
//         dimensions: {
//           length: parseFloat(length),
//           breadth: parseFloat(breadth),
//           height: parseFloat(height),
//           unit: 'cm',
//         },
//         weight_category: selectedWeight,
//         urgent: urgent,
//       };
  
//       // ✅ Log the request data to debug
//       console.log('📤 Submitting porter request:', JSON.stringify(requestData, null, 2));
  
//       // ✅ Validate before sending
//       if (requestData.pickup_address.address.length < 10) {
//         Alert.alert('Error', 'Pickup address must be at least 10 characters');
//         setSubmitting(false);
//         return;
//       }
  
//       if (requestData.delivery_address.address.length < 10) {
//         Alert.alert('Error', 'Delivery address must be at least 10 characters');
//         setSubmitting(false);
//         return;
//       }
  
//       if (requestData.pickup_address.pincode.length !== 6) {
//         Alert.alert('Error', 'Pickup pincode must be exactly 6 digits');
//         setSubmitting(false);
//         return;
//       }
  
//       if (requestData.delivery_address.pincode.length !== 6) {
//         Alert.alert('Error', 'Delivery pincode must be exactly 6 digits');
//         setSubmitting(false);
//         return;
//       }
  
//       if (requestData.phone.length < 10) {
//         Alert.alert('Error', 'Phone number must be at least 10 digits');
//         setSubmitting(false);
//         return;
//       }
  
//       if (isNaN(requestData.dimensions.length) || isNaN(requestData.dimensions.breadth) || isNaN(requestData.dimensions.height)) {
//         Alert.alert('Error', 'Please enter valid dimensions');
//         setSubmitting(false);
//         return;
//       }
  
//       const response = await authenticatedFetch(
//         `${API_BASE_URL}/porter/porter-requests`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(requestData),
//         }
//       );
  
//       console.log('📥 Response status:', response.status);
  
//       if (response.ok) {
//         const responseData = await response.json();
//         console.log('✅ Success response:', responseData);
        
//         // Clear addresses after successful submission
//         clearAddresses();
        
//         // ✅ Show success message and redirect to orders/porter page
//         Alert.alert(
//           'Success! 📦',
//           'Your porter request has been submitted. You will receive a notification once the estimated cost is available.',
//           [
//             {
//               text: 'View Request',
//               onPress: () => {
//                 // Navigate to orders screen with porter tab
//                 router.replace('/orders');
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//       } else {
//         const errorData = await response.json();
//         console.error('❌ Error response:', errorData);
//         Alert.alert('Error', errorData.detail || JSON.stringify(errorData) || 'Failed to submit request');
//       }
//     } catch (error) {
//       console.error('💥 Error submitting porter request:', error);
//       Alert.alert('Error', 'Failed to submit request. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => {
//           clearAddresses();
//           router.back();
//         }}>
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>New Porter Request</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Pickup Address Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Pickup Address</Text>
//           <TouchableOpacity
//             style={styles.addressSelector}
//             onPress={handleSelectPickupAddress}
//           >
//             {pickupAddress ? (
//               <View style={styles.selectedAddressContent}>
//                 <View style={styles.addressIconContainer}>
//                   <Ionicons name="location" size={24} color="#34C759" />
//                 </View>
//                 <View style={styles.selectedAddressInfo}>
//                   <Text style={styles.selectedAddressLabel}>
//                     {pickupAddress.label || 'Pickup Address'}
//                   </Text>
//                   <Text style={styles.selectedAddressText} numberOfLines={2}>
//                     {pickupAddress.street}
//                   </Text>
//                   <Text style={styles.selectedAddressSubtext}>
//                     {pickupAddress.city} - {pickupAddress.pincode}
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={20} color="#007AFF" />
//               </View>
//             ) : (
//               <View style={styles.emptyAddressContent}>
//                 <Ionicons name="location-outline" size={24} color="#999" />
//                 <Text style={styles.emptyAddressText}>Select pickup address</Text>
//                 <Ionicons name="chevron-forward" size={20} color="#ccc" />
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Delivery Address Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Delivery Address</Text>
//           <TouchableOpacity
//             style={styles.addressSelector}
//             onPress={handleSelectDeliveryAddress}
//           >
//             {deliveryAddress ? (
//               <View style={styles.selectedAddressContent}>
//                 <View style={[styles.addressIconContainer, { backgroundColor: '#FFEBEE' }]}>
//                   <Ionicons name="location" size={24} color="#FF3B30" />
//                 </View>
//                 <View style={styles.selectedAddressInfo}>
//                   <Text style={styles.selectedAddressLabel}>
//                     {deliveryAddress.label || 'Delivery Address'}
//                   </Text>
//                   <Text style={styles.selectedAddressText} numberOfLines={2}>
//                     {deliveryAddress.street}
//                   </Text>
//                   <Text style={styles.selectedAddressSubtext}>
//                     {deliveryAddress.city} - {deliveryAddress.pincode}
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={20} color="#007AFF" />
//               </View>
//             ) : (
//               <View style={styles.emptyAddressContent}>
//                 <Ionicons name="location-outline" size={24} color="#999" />
//                 <Text style={styles.emptyAddressText}>Select delivery address</Text>
//                 <Ionicons name="chevron-forward" size={20} color="#ccc" />
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Package Description */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Package Description</Text>
//           <TextInput
//             style={styles.descriptionInput}
//             placeholder="Describe your package (e.g., Documents, Electronics, Groceries)"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             numberOfLines={3}
//             maxLength={500}
//           />
//           <Text style={styles.characterCount}>{description.length}/500</Text>
//         </View>

//         {/* Package Dimensions */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Package Dimensions (cm)</Text>
//           <View style={styles.dimensionsContainer}>
//             <View style={styles.dimensionInput}>
//               <Text style={styles.dimensionLabel}>Length</Text>
//               <TextInput
//                 style={styles.dimensionField}
//                 placeholder="0"
//                 value={length}
//                 onChangeText={setLength}
//                 keyboardType="decimal-pad"
//                 maxLength={5}
//               />
//             </View>
//             <Text style={styles.dimensionSeparator}>×</Text>
//             <View style={styles.dimensionInput}>
//               <Text style={styles.dimensionLabel}>Breadth</Text>
//               <TextInput
//                 style={styles.dimensionField}
//                 placeholder="0"
//                 value={breadth}
//                 onChangeText={setBreadth}
//                 keyboardType="decimal-pad"
//                 maxLength={5}
//               />
//             </View>
//             <Text style={styles.dimensionSeparator}>×</Text>
//             <View style={styles.dimensionInput}>
//               <Text style={styles.dimensionLabel}>Height</Text>
//               <TextInput
//                 style={styles.dimensionField}
//                 placeholder="0"
//                 value={height}
//                 onChangeText={setHeight}
//                 keyboardType="decimal-pad"
//                 maxLength={5}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Weight Category */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Weight Category</Text>
//           <View style={styles.weightContainer}>
//             {WEIGHT_CATEGORIES.map((category) => (
//               <TouchableOpacity
//                 key={category.id}
//                 style={[
//                   styles.weightOption,
//                   selectedWeight === category.value && styles.weightOptionSelected,
//                 ]}
//                 onPress={() => setSelectedWeight(category.value)}
//               >
//                 <View style={[
//                   styles.checkbox,
//                   selectedWeight === category.value && styles.checkboxSelected
//                 ]}>
//                   {selectedWeight === category.value && (
//                     <Ionicons name="checkmark" size={16} color="#fff" />
//                   )}
//                 </View>
//                 <Text
//                   style={[
//                     styles.weightLabel,
//                     selectedWeight === category.value && styles.weightLabelSelected,
//                   ]}
//                 >
//                   {category.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Urgent Delivery */}
//         <View style={styles.section}>
//           <TouchableOpacity
//             style={styles.urgentOption}
//             onPress={() => setUrgent(!urgent)}
//           >
//             <View style={styles.urgentLeft}>
//               <View style={[styles.urgentIcon, urgent && styles.urgentIconActive]}>
//                 <Ionicons name="flash" size={20} color={urgent ? '#fff' : '#FF9500'} />
//               </View>
//               <View>
//                 <Text style={styles.urgentTitle}>Urgent Delivery</Text>
//                 <Text style={styles.urgentSubtitle}>Higher priority processing</Text>
//               </View>
//             </View>
//             <View style={[styles.toggle, urgent && styles.toggleActive]}>
//               <View style={[styles.toggleThumb, urgent && styles.toggleThumbActive]} />
//             </View>
//           </TouchableOpacity>
//         </View>

//         <View style={{ height: 100 }} />
//       </ScrollView>

//       {/* Submit Button */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={submitting}
//         >
//           {submitting ? (
//             <>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.submitButtonText}>Submitting...</Text>
//             </>
//           ) : (
//             <>
//               <Ionicons name="checkmark-circle" size={20} color="#fff" />
//               <Text style={styles.submitButtonText}>Submit Request</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
//   content: { flex: 1 },
//   section: { backgroundColor: '#fff', marginTop: 12, padding: 16 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  
//   addressSelector: {
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//     borderRadius: 12,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//   },
//   selectedAddressContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   addressIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E8F5E9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   selectedAddressInfo: { flex: 1 },
//   selectedAddressLabel: { fontSize: 14, fontWeight: '600', color: '#007AFF', marginBottom: 4 },
//   selectedAddressText: { fontSize: 14, color: '#333', marginBottom: 2, lineHeight: 20 },
//   selectedAddressSubtext: { fontSize: 12, color: '#999' },
//   emptyAddressContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     gap: 12,
//   },
//   emptyAddressText: { flex: 1, fontSize: 15, color: '#999' },
  
//   descriptionInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 15,
//     color: '#333',
//     textAlignVertical: 'top',
//     minHeight: 80,
//     backgroundColor: '#fff',
//   },
//   characterCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  
//   dimensionsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   dimensionInput: { flex: 1 },
//   dimensionLabel: { fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'center' },
//   dimensionField: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: '#333',
//     backgroundColor: '#fff',
//   },
//   dimensionSeparator: { fontSize: 20, color: '#999', marginHorizontal: 8, marginTop: 20 },
  
//   weightContainer: { gap: 12 },
//   weightOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//   },
//   weightOptionSelected: {
//     borderColor: '#007AFF',
//     backgroundColor: '#E3F2FD',
//   },
//   checkbox: {
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     borderWidth: 2,
//     borderColor: '#ddd',
//     marginRight: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   checkboxSelected: {
//     borderColor: '#007AFF',
//     backgroundColor: '#007AFF',
//   },
//   weightLabel: { fontSize: 15, color: '#333' },
//   weightLabelSelected: { fontWeight: '600', color: '#007AFF' },
  
//   urgentOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#FFF3E0',
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: '#FFE0B2',
//   },
//   urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   urgentIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   urgentIconActive: { backgroundColor: '#FF9500' },
//   urgentTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
//   urgentSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
//   toggle: {
//     width: 50,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#e0e0e0',
//     padding: 3,
//   },
//   toggleActive: { backgroundColor: '#FF9500' },
//   toggleThumb: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//   },
//   toggleThumbActive: { transform: [{ translateX: 20 }] },
  
//   footer: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   submitButton: {
//     backgroundColor: '#007AFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     borderRadius: 12,
//     gap: 8,
//   },
//   submitButtonDisabled: { backgroundColor: '#ccc' },
//   submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// });

// app/create-porter-request.tsx - ADDED DISTANCE INPUT & COORDINATES
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { usePorterRequest } from '../contexts/PorterRequestContext';
import { API_BASE_URL } from '../config/apiConfig';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const WEIGHT_CATEGORIES = [
  { id: '1', label: 'Less than 0.5 kg', value: '< 0.5 kg' },
  { id: '2', label: '0.5 - 1 kg', value: '0.5-1 kg' },
  { id: '3', label: '1 - 2 kg', value: '1-2 kg' },
  { id: '4', label: 'More than 2 kg', value: '> 2 kg' },
];

interface Address {
  _id: string;
  label: string;
  street: string;
  address?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  mobile_number?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export default function CreatePorterRequestScreen() {
  const { token } = useAuth();
  const { pickupAddress, deliveryAddress, clearAddresses } = usePorterRequest();
  
  const [description, setDescription] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [height, setHeight] = useState('');
  const [distance, setDistance] = useState(''); // ✅ NEW: Distance field
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Navigate to address page for pickup
  const handleSelectPickupAddress = () => {
    router.push({
      pathname: '/address',
      params: { 
        from: 'porter-request',
        addressType: 'pickup',
      }
    });
  };

  // ✅ Navigate to address page for delivery
  const handleSelectDeliveryAddress = () => {
    router.push({
      pathname: '/address',
      params: { 
        from: 'porter-request',
        addressType: 'delivery',
      }
    });
  };

  const handleSubmit = async () => {
    if (!pickupAddress) {
      Alert.alert('Error', 'Please select a pickup address');
      return;
    }

    if (!deliveryAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide package description');
      return;
    }

    if (!length || !breadth || !height) {
      Alert.alert('Error', 'Please enter package dimensions (L × B × H)');
      return;
    }

    if (!selectedWeight) {
      Alert.alert('Error', 'Please select package weight category');
      return;
    }

    // ✅ Validate distance
    if (!distance || parseFloat(distance) <= 0) {
      Alert.alert('Error', 'Please enter estimated distance in kilometers');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Build request data with coordinates and phone
      const requestData = {
        pickup_address: {
          address: pickupAddress.street || pickupAddress.address || '',
          city: pickupAddress.city || '',
          pincode: pickupAddress.pincode || '',
          latitude: pickupAddress.latitude || null, // ✅ Include coordinates
          longitude: pickupAddress.longitude || null,
        },
        delivery_address: {
          address: deliveryAddress.street || deliveryAddress.address || '',
          city: deliveryAddress.city || '',
          pincode: deliveryAddress.pincode || '',
          latitude: deliveryAddress.latitude || null, // ✅ Include coordinates
          longitude: deliveryAddress.longitude || null,
        },
        phone: (pickupAddress.mobile_number || pickupAddress.phone || '').replace(/\D/g, ''),
        description: description.trim(),
        dimensions: {
          length: parseFloat(length),
          breadth: parseFloat(breadth),
          height: parseFloat(height),
          unit: 'cm',
        },
        weight_category: selectedWeight,
        estimated_distance: parseFloat(distance), // ✅ Include distance
        urgent: urgent,
      };

      console.log('📤 Submitting porter request:', JSON.stringify(requestData, null, 2));

      // ✅ Validate before sending
      if (requestData.pickup_address.address.length < 10) {
        Alert.alert('Error', 'Pickup address must be at least 10 characters');
        setSubmitting(false);
        return;
      }

      if (requestData.delivery_address.address.length < 10) {
        Alert.alert('Error', 'Delivery address must be at least 10 characters');
        setSubmitting(false);
        return;
      }

      if (requestData.pickup_address.pincode.length !== 6) {
        Alert.alert('Error', 'Pickup pincode must be exactly 6 digits');
        setSubmitting(false);
        return;
      }

      if (requestData.delivery_address.pincode.length !== 6) {
        Alert.alert('Error', 'Delivery pincode must be exactly 6 digits');
        setSubmitting(false);
        return;
      }

      if (requestData.phone.length < 10) {
        Alert.alert('Error', 'Phone number must be at least 10 digits');
        setSubmitting(false);
        return;
      }

      if (isNaN(requestData.dimensions.length) || isNaN(requestData.dimensions.breadth) || isNaN(requestData.dimensions.height)) {
        Alert.alert('Error', 'Please enter valid dimensions');
        setSubmitting(false);
        return;
      }

      if (isNaN(requestData.estimated_distance) || requestData.estimated_distance <= 0) {
        Alert.alert('Error', 'Please enter valid distance');
        setSubmitting(false);
        return;
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/porter/porter-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Success response:', responseData);
        
        // Clear addresses after successful submission
        clearAddresses();
        
        Alert.alert(
          'Success! 📦',
          'Your porter request has been submitted. You will receive a notification once the estimated cost is available.',
          [
            {
              text: 'View Request',
              onPress: () => {
                router.replace({
                  pathname: '/orders',
                  params: { tab: 'porter' }
                });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        Alert.alert('Error', errorData.detail || JSON.stringify(errorData) || 'Failed to submit request');
      }
    } catch (error) {
      console.error('💥 Error submitting porter request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          clearAddresses();
          router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Porter Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pickup Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Address</Text>
          <TouchableOpacity
            style={styles.addressSelector}
            onPress={handleSelectPickupAddress}
          >
            {pickupAddress ? (
              <View style={styles.selectedAddressContent}>
                <View style={styles.addressIconContainer}>
                  <Ionicons name="location" size={24} color="#34C759" />
                </View>
                <View style={styles.selectedAddressInfo}>
                  <Text style={styles.selectedAddressLabel}>
                    {pickupAddress.label || 'Pickup Address'}
                  </Text>
                  <Text style={styles.selectedAddressText} numberOfLines={2}>
                    {pickupAddress.street}
                  </Text>
                  <Text style={styles.selectedAddressSubtext}>
                    {pickupAddress.city} - {pickupAddress.pincode}
                  </Text>
                  {pickupAddress.mobile_number && (
                    <Text style={styles.selectedAddressPhone}>
                      📱 {pickupAddress.mobile_number}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </View>
            ) : (
              <View style={styles.emptyAddressContent}>
                <Ionicons name="location-outline" size={24} color="#999" />
                <Text style={styles.emptyAddressText}>Select pickup address</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            style={styles.addressSelector}
            onPress={handleSelectDeliveryAddress}
          >
            {deliveryAddress ? (
              <View style={styles.selectedAddressContent}>
                <View style={[styles.addressIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="location" size={24} color="#FF3B30" />
                </View>
                <View style={styles.selectedAddressInfo}>
                  <Text style={styles.selectedAddressLabel}>
                    {deliveryAddress.label || 'Delivery Address'}
                  </Text>
                  <Text style={styles.selectedAddressText} numberOfLines={2}>
                    {deliveryAddress.street}
                  </Text>
                  <Text style={styles.selectedAddressSubtext}>
                    {deliveryAddress.city} - {deliveryAddress.pincode}
                  </Text>
                  {deliveryAddress.mobile_number && (
                    <Text style={styles.selectedAddressPhone}>
                      📱 {deliveryAddress.mobile_number}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </View>
            ) : (
              <View style={styles.emptyAddressContent}>
                <Ionicons name="location-outline" size={24} color="#999" />
                <Text style={styles.emptyAddressText}>Select delivery address</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ✅ NEW: Estimated Distance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Distance</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate-outline" size={20} color="#007AFF" style={styles.distanceIcon} />
            <TextInput
              style={styles.distanceInput}
              placeholder="Enter distance in kilometers"
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={styles.distanceUnit}>km</Text>
          </View>
          <Text style={styles.distanceHint}>
            Approximate distance between pickup and delivery locations
          </Text>
        </View>

        {/* Package Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your package (e.g., Documents, Electronics, Groceries)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        {/* Package Dimensions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Dimensions (cm)</Text>
          <View style={styles.dimensionsContainer}>
            <View style={styles.dimensionInput}>
              <Text style={styles.dimensionLabel}>Length</Text>
              <TextInput
                style={styles.dimensionField}
                placeholder="0"
                value={length}
                onChangeText={setLength}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
            <Text style={styles.dimensionSeparator}>×</Text>
            <View style={styles.dimensionInput}>
              <Text style={styles.dimensionLabel}>Breadth</Text>
              <TextInput
                style={styles.dimensionField}
                placeholder="0"
                value={breadth}
                onChangeText={setBreadth}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
            <Text style={styles.dimensionSeparator}>×</Text>
            <View style={styles.dimensionInput}>
              <Text style={styles.dimensionLabel}>Height</Text>
              <TextInput
                style={styles.dimensionField}
                placeholder="0"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Weight Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Category</Text>
          <View style={styles.weightContainer}>
            {WEIGHT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.weightOption,
                  selectedWeight === category.value && styles.weightOptionSelected,
                ]}
                onPress={() => setSelectedWeight(category.value)}
              >
                <View style={[
                  styles.checkbox,
                  selectedWeight === category.value && styles.checkboxSelected
                ]}>
                  {selectedWeight === category.value && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.weightLabel,
                    selectedWeight === category.value && styles.weightLabelSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Urgent Delivery */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.urgentOption}
            onPress={() => setUrgent(!urgent)}
          >
            <View style={styles.urgentLeft}>
              <View style={[styles.urgentIcon, urgent && styles.urgentIconActive]}>
                <Ionicons name="flash" size={20} color={urgent ? '#fff' : '#FF9500'} />
              </View>
              <View>
                <Text style={styles.urgentTitle}>Urgent Delivery</Text>
                <Text style={styles.urgentSubtitle}>Higher priority processing</Text>
              </View>
            </View>
            <View style={[styles.toggle, urgent && styles.toggleActive]}>
              <View style={[styles.toggleThumb, urgent && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  
  addressSelector: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectedAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedAddressInfo: { flex: 1 },
  selectedAddressLabel: { fontSize: 14, fontWeight: '600', color: '#007AFF', marginBottom: 4 },
  selectedAddressText: { fontSize: 14, color: '#333', marginBottom: 2, lineHeight: 20 },
  selectedAddressSubtext: { fontSize: 12, color: '#999' },
  selectedAddressPhone: { fontSize: 12, color: '#007AFF', marginTop: 4, fontWeight: '500' }, // ✅ NEW
  emptyAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  emptyAddressText: { flex: 1, fontSize: 15, color: '#999' },
  
  // ✅ NEW: Distance styles
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  distanceIcon: {
    marginRight: 8,
  },
  distanceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  distanceHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#fff',
  },
  characterCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInput: { flex: 1 },
  dimensionLabel: { fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'center' },
  dimensionField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#fff',
  },
  dimensionSeparator: { fontSize: 20, color: '#999', marginHorizontal: 8, marginTop: 20 },
  
  weightContainer: { gap: 12 },
  weightOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  weightOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  weightLabel: { fontSize: 15, color: '#333' },
  weightLabelSelected: { fontWeight: '600', color: '#007AFF' },
  
  urgentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  urgentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentIconActive: { backgroundColor: '#FF9500' },
  urgentTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  urgentSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 3,
  },
  toggleActive: { backgroundColor: '#FF9500' },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: { transform: [{ translateX: 20 }] },
  
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: { backgroundColor: '#ccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});