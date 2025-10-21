// contexts/OrderTrackingContext.tsx - OPTIMIZED WITH SMART POLLING
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  
  // ✅ Smart polling with exponential backoff
  const pollIntervalRef = useRef(10000); // Start at 10s
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrorsRef = useRef(0);

  const fetchActiveOrder = async () => {
    if (!token || !user || !isPollingEnabled) {
      return;
    }

    try {
      if (DEBUG) console.log('📡 Fetching active order...');
      
      const response = await fetch(`${API_BASE_URL}/orders/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        if (DEBUG) console.log('📦 No active orders (404)');
        setActiveOrder(null);
        setError(null);
        setDismissedOrderId(null);
        consecutiveErrorsRef.current = 0;
        
        // ✅ Slow down polling when no active order
        pollIntervalRef.current = Math.min(pollIntervalRef.current * 1.5, 60000);
        return;
      }

      if (response.status === 401) {
        if (DEBUG) console.log('🔒 Unauthorized (401)');
        setActiveOrder(null);
        consecutiveErrorsRef.current++;
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

      // Check dismissed orders
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
      
      // ✅ Reset to fast polling when order is active
      pollIntervalRef.current = 10000;
      
    } catch (err) {
      if (DEBUG) console.error('⚠️ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      consecutiveErrorsRef.current++;
      
      // ✅ Slow down on errors
      if (consecutiveErrorsRef.current > 3) {
        pollIntervalRef.current = Math.min(pollIntervalRef.current * 2, 60000);
      }
    }
  };

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
    pollIntervalRef.current = 10000; // Reset to fast polling
  };

  // ✅ Smart polling with dynamic interval
  useEffect(() => {
    if (!token || !user || !isPollingEnabled) {
      return;
    }

    if (DEBUG) console.log('▶️ Starting smart polling');

    // Initial fetch
    fetchActiveOrder();

    // ✅ Recursive setTimeout with dynamic interval
    const poll = async () => {
      await fetchActiveOrder();
      
      const interval = pollIntervalRef.current;
      if (DEBUG) console.log(`⏰ Next poll in ${interval / 1000}s`);
      
      timeoutRef.current = setTimeout(poll, interval);
    };

    timeoutRef.current = setTimeout(poll, pollIntervalRef.current);

    return () => {
      if (DEBUG) console.log('⏹️ Stopping polling');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, user, isPollingEnabled, dismissedOrderId]);

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