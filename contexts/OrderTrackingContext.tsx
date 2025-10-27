// contexts/OrderTrackingContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from './AuthContext';

const DEBUG = __DEV__;

interface DeliveryPartner {
  name: string;
  phone: string;
  rating?: number;
  deliveries?: number;
}

interface Order {
  _id: string;
  id?: string;
  order_status: 'preparing' | 'assigning' | 'assigned' | 'out_for_delivery' | 'delivered' | 'arrived';
  delivery_partner?: DeliveryPartner;
  estimated_delivery_time?: number;
  actual_delivery?: number;
  delivery_partner_location?: {
    latitude: number;
    longitude: number;
  };
  status_message?: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    message?: string;
  }>;
  items?: Array<{
    product_name?: string;
    product?: string;
    quantity: number;
    price: number;
  }>;
  subtotal?: number;
  tax?: number;
  delivery_charge?: number;
  app_fee?: number;
  promo_discount?: number;
  total_amount?: number;
  delivery_address?: {
    label: string;
    street: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  status_change_history?: Array<{
    status: string;
    changed_at: string;
  }>;
  delivered_at?: string;
  arrived_at?: string;
  out_for_delivery_at?: string;
  assigned_at?: string;
  preparing_at?: string;
  confirmed_at?: string;
  created_at?: string;
  tip_amount?: number;
}

interface OrderTrackingContextType {
  activeOrder: Order | null;
  loading: boolean;
  error: string | null;
  refreshActiveOrder: () => Promise<void>;
  dismissBanner: () => void;
  resumePolling: () => void;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export function useOrderTracking() {
  const context = useContext(OrderTrackingContext);
  if (!context) {
    throw new Error('useOrderTracking must be used within OrderTrackingProvider');
  }
  return context;
}

export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);
  
  const pollIntervalRef = useRef(10000);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const currentTokenRef = useRef(token); // ✅ Track current token

  // ✅ Update token ref whenever token changes
  useEffect(() => {
    currentTokenRef.current = token;
  }, [token]);

  // ✅ Use useCallback to ensure we always get fresh token
  const fetchActiveOrder = useCallback(async () => {
    const currentToken = currentTokenRef.current; // ✅ Get fresh token from ref
    
    if (!currentToken || !user || !isPollingEnabled) {
      return;
    }

    try {
      if (DEBUG) console.log('📡 Fetching active order with fresh token...');
      
      const response = await fetch(`${API_BASE_URL}/orders/active`, {
        headers: {
          Authorization: `Bearer ${currentToken}`, // ✅ Use fresh token
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        if (DEBUG) console.log('📦 No active orders (404)');
        setActiveOrder(null);
        setError(null);
        setDismissedOrderId(null);
        consecutiveErrorsRef.current = 0;
        pollIntervalRef.current = Math.min(pollIntervalRef.current * 1.5, 60000);
        return;
      }

      if (response.status === 401) {
        if (DEBUG) console.log('🔒 Token expired (401) - will retry with refreshed token');
        consecutiveErrorsRef.current++;
        
        // ✅ Stop aggressive polling on auth errors
        if (consecutiveErrorsRef.current > 2) {
          pollIntervalRef.current = 30000; // Slow down to 30s
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data) {
        setActiveOrder(null);
        return;
      }

      if (dismissedOrderId && data.id !== dismissedOrderId) {
        setDismissedOrderId(null);
        setIsPollingEnabled(true);
      }

      if (dismissedOrderId === data.id && data.order_status === 'delivered') {
        if (DEBUG) console.log('🚫 Order dismissed');
        return;
      }

      setActiveOrder(data);
      setError(null);
      consecutiveErrorsRef.current = 0;
      pollIntervalRef.current = 10000;
      
    } catch (err) {
      if (DEBUG) console.error('⚠️ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      consecutiveErrorsRef.current++;
      
      if (consecutiveErrorsRef.current > 3) {
        pollIntervalRef.current = Math.min(pollIntervalRef.current * 2, 60000);
      }
    }
  }, [user, isPollingEnabled, dismissedOrderId]); // ✅ Removed token from deps

  const refreshActiveOrder = async () => {
    setLoading(true);
    await fetchActiveOrder();
    setLoading(false);
  };

  const dismissBanner = () => {
    if (DEBUG) console.log('❌ Dismissing banner');
    if (activeOrder?.order_status === 'delivered') {
      setDismissedOrderId(activeOrder.id || null);
      setActiveOrder(null);
    }
  };

  const resumePolling = () => {
    if (DEBUG) console.log('▶️ Resuming polling');
    setIsPollingEnabled(true);
    setDismissedOrderId(null);
    pollIntervalRef.current = 10000;
    consecutiveErrorsRef.current = 0; // ✅ Reset error counter
  };

  // ✅ Smart polling with cleanup
  useEffect(() => {
    if (!token || !user || !isPollingEnabled) {
      if (DEBUG) console.log('⏸️ Polling paused (no token/user or disabled)');
      return;
    }

    if (DEBUG) console.log('▶️ Starting smart polling');

    // Initial fetch
    fetchActiveOrder();

    const poll = async () => {
      await fetchActiveOrder();
      
      const interval = pollIntervalRef.current;
      if (DEBUG) console.log(`⏰ Next poll in ${interval / 1000}s`);
      
      timeoutRef.current = setTimeout(poll, interval);
    };

    timeoutRef.current = setTimeout(poll, pollIntervalRef.current);

    return () => {
      if (DEBUG) console.log('⏹️ Stopping polling - cleanup');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [token, user, isPollingEnabled, fetchActiveOrder]); // ✅ Include fetchActiveOrder

  return (
    <OrderTrackingContext.Provider
      value={{
        activeOrder,
        loading,
        error,
        refreshActiveOrder,
        dismissBanner,
        resumePolling,
      }}
    >
      {children}
    </OrderTrackingContext.Provider>
  );
}