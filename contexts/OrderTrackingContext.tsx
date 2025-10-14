import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode} from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

// interface Order {
//   id: string;
//   // restaurant_name: string;
//   order_status: string;
//   estimated_delivery_time?: number;
//   delivery_partner?: any;
//   items?: any[];
//   total_amount?: number;
//   delivery_address?: any;
//   // ... other order fields
// }

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
  estimated_delivery?: string;
  actual_delivery?: string;
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
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
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

interface OrderTrackingProviderProps {
  children: React.ReactNode;
}

export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const fetchActiveOrder = async () => {
    if (!token || !isPollingEnabled) {
      console.log('⏸️ Polling disabled or no token');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}orders/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.log('📦 No active orders');
        setActiveOrder(null);
        setError(null);
        // Reset dismissed order when there's no active order
        setDismissedOrderId(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Active order fetched:', data.id);

      // Check if this is a new order (different from dismissed order)
      if (dismissedOrderId && data.id !== dismissedOrderId) {
        // New order detected, clear dismissed state and resume polling
        setDismissedOrderId(null);
        setIsPollingEnabled(true);
      }

      // Don't show the order if it was dismissed and is delivered
      if (dismissedOrderId === data.id && data.order_status === 'delivered') {
        console.log('🚫 Order dismissed, not showing banner');
        return;
      }

      setActiveOrder(data);
      setError(null);
    } catch (err) {
      console.log('⚠️ Failed to fetch active order:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const refreshActiveOrder = async () => {
    setLoading(true);
    await fetchActiveOrder();
    setLoading(false);
  };

  const dismissBanner = () => {
    console.log('❌ Banner dismissed for delivered order');
    if (activeOrder?.order_status === 'delivered') {
      setDismissedOrderId(activeOrder.id??null);
      setActiveOrder(null);
      // Keep polling to detect new orders, but don't show this dismissed order
    }
  };

  const resumePolling = () => {
    console.log('▶️ Resuming polling');
    setIsPollingEnabled(true);
    setDismissedOrderId(null);
  };

  // Polling effect
  useEffect(() => {
    if (!token || !isPollingEnabled) return;

    // Initial fetch
    fetchActiveOrder();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetchActiveOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, isPollingEnabled, dismissedOrderId]);

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

export function useOrderTracking() {
  const context = useContext(OrderTrackingContext);
  if (!context) {
    throw new Error('useOrderTracking must be used within OrderTrackingProvider');
  }
  return context;
}