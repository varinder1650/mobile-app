import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

interface DeliveryPartner {
  name: string;
  phone: string;
  rating?: number;
  deliveries?: number;
}

interface OrderStatusUpdate {
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
  activeOrder: OrderStatusUpdate | null;
  loading: boolean;
  error: string | null;
  refreshActiveOrder: () => Promise<void>;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export const useOrderTracking = () => {
  const context = useContext(OrderTrackingContext);
  if (!context) {
    // Return default values instead of throwing during initialization
    return {
      activeOrder: null,
      loading: false,
      error: null,
      refreshActiveOrder: async () => {},
    };
  }
  return context;
};

interface OrderTrackingProviderProps {
  children: React.ReactNode;
}

export function OrderTrackingProvider({ children }: OrderTrackingProviderProps) {
  const { token } = useAuth();
  const [activeOrder, setActiveOrder] = useState<OrderStatusUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActiveOrder = useCallback(async () => {
    if (!token) {
      setActiveOrder(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}orders/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Active order data:', data);
        
        const activeStatuses = ['preparing', 'assigned', 'assigning', 'out_for_delivery', 'delivered'];

        if (data && activeStatuses.includes(data.order_status)) {
          setActiveOrder(data);
          console.log('✅ Active order set:', data.order_status);
        } else {
          setActiveOrder(null);
          console.log('ℹ️ Order status not active:', data?.order_status);
        }
      } else if (response.status === 404) {
        // No active order - this is fine
        setActiveOrder(null);
        setError(null);
        console.log('ℹ️ No active order found');
      } else {
        console.log('⚠️ Failed to fetch active order:', response.status);
        setError(`Failed to fetch order: ${response.status}`);
        setActiveOrder(null);
      }
    } catch (error) {
      console.error('❌ Error fetching active order:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch on mount and set up polling
  useEffect(() => {
    fetchActiveOrder();
    
    // Poll every 30 seconds for updates
    intervalRef.current = setInterval(() => {
      fetchActiveOrder();
    }, 30000);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchActiveOrder]);

  const value = {
    activeOrder,
    loading,
    error,
    refreshActiveOrder: fetchActiveOrder,
  };

  return (
    <OrderTrackingContext.Provider value={value}>
      {children}
    </OrderTrackingContext.Provider>
  );
}