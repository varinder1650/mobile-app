import { useEffect, useRef } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { OrderTrackingProvider } from '../contexts/OrderTrackingContext';
import { PorterRequestProvider } from '../contexts/PorterRequestContext';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

// ✅ Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function RootLayoutNav() {
  const { user, loading, token } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  // ✅ Notification listeners
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // ✅ Setup push notification handlers
  useEffect(() => {
    // Listen for notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      // Notification is automatically shown by the system
    });

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      console.log('👆 Notification tapped:', data);
      
      // Navigate based on notification type
      try {
        if (data.type === 'porter' || data.type === 'porter_estimate' || data.type === 'porter_confirmed' || data.type === 'porter_payment') {
          // Navigate to porter requests
          router.push('/porter-requests');
        } else if (data.type === 'order' || data.type === 'order_payment') {
          // Navigate to specific order tracking
          if (data.order_id) {
            router.push(`/order-tracking/${data.order_id}`);
          } else {
            router.push('/(tabs)/orders');
          }
        } else {
          // Default: go to notifications screen
          router.push('/notifications');
        }
      } catch (error) {
        console.error('Error navigating from notification:', error);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ✅ Original authentication routing logic (unchanged)
  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const inAuthGroup = segments.length > 0 ? segments[0] === 'auth' : false;
    const isPhoneScreen = segments.length > 1 ? segments[1] === 'phone' : false;
    const isLoginScreen = segments.length > 1 ? segments[1] === 'login' : false;
    const isRegisterScreen = segments.length > 1 ? segments[1] === 'register' : false;
    const isVerifyEmailScreen = segments.length > 1 ? segments[1] === 'verify-email' : false;

    if (loading) {
      return;
    }

    if (isPhoneScreen) {
      return;
    }

    if (!token || !user) {
      if (!inAuthGroup) {
        setTimeout(() => {
          router.replace('/auth/login');
        }, 100);
      }
    } else {
      if (inAuthGroup && !isPhoneScreen && !isVerifyEmailScreen) {
        if (isLoginScreen || isRegisterScreen) {
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
        }
      }
    }
  }, [user, loading, token, segments, navigationState?.key]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (!navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Initializing...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="order-tracking" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderTrackingProvider>
          <PorterRequestProvider>
            <RootLayoutNav />
          </PorterRequestProvider>
        </OrderTrackingProvider>
      </CartProvider>
    </AuthProvider>
  );
}