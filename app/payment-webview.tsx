// app/payment-webview.tsx - PhonePe Payment WebView Screen
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { API_BASE_URL } from '../config/apiConfig';

export default function PaymentWebViewScreen() {
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  
  const paymentUrl = params.paymentUrl as string;
  const orderId = params.orderId as string;
  const merchantTransactionId = params.merchantTransactionId as string;

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    
    console.log('Navigation URL:', url);
    
    // Check if URL contains callback parameters indicating payment completion
    if (url.includes('/payment/callback') || url.includes('payment-status')) {
      setVerifying(true);
      
      // Wait a bit for PhonePe to send callback to backend
      setTimeout(async () => {
        await verifyPaymentStatus();
      }, 2000);
    }
  };

  const verifyPaymentStatus = async () => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/payment/phonepe/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchant_transaction_id: merchantTransactionId,
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        if (result.status === 'PAYMENT_SUCCESS') {
          Alert.alert(
            'Payment Successful',
            'Your payment has been completed successfully!',
            [
              {
                text: 'View Order',
                onPress: () => {
                  router.replace({
                    pathname: '/order-tracking',
                    params: { orderId: result.order_id }
                  });
                }
              }
            ]
          );
        } else if (result.status === 'PAYMENT_ERROR' || result.status === 'PAYMENT_DECLINED') {
          Alert.alert(
            'Payment Failed',
            'Your payment was not successful. Please try again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        } else {
          // Payment still pending
          Alert.alert(
            'Payment Pending',
            'Your payment is being processed. Please check your order status.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        }
      } else {
        throw new Error(result.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert(
        'Verification Error',
        'Unable to verify payment status. Please contact support if amount was debited.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verifyingContainer}>
          <ActivityIndicator size="large" color="#5F259F" />
          <Text style={styles.verifyingText}>Verifying payment...</Text>
          <Text style={styles.verifyingSubtext}>Please wait while we confirm your payment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhonePe Payment</Text>
        <View style={{ width: 28 }} />
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5F259F" />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert(
            'Error',
            'Failed to load payment page. Please try again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  verifyingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  verifyingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});