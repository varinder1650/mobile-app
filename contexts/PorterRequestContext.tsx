import React, { createContext, useContext, useState } from 'react';

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  mobile_number?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

interface PorterRequestContextType {
  pickupAddress: Address | null;
  deliveryAddress: Address | null;
  setPickupAddress: (address: Address | null) => void;
  setDeliveryAddress: (address: Address | null) => void;
  clearAddresses: () => void;
}

const PorterRequestContext = createContext<PorterRequestContextType | undefined>(undefined);

export function PorterRequestProvider({ children }: { children: React.ReactNode }) {
  const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);

  const clearAddresses = () => {
    setPickupAddress(null);
    setDeliveryAddress(null);
  };

  return (
    <PorterRequestContext.Provider 
      value={{ 
        pickupAddress, 
        deliveryAddress, 
        setPickupAddress, 
        setDeliveryAddress,
        clearAddresses 
      }}
    >
      {children}
    </PorterRequestContext.Provider>
  );
}

export function usePorterRequest() {
  const context = useContext(PorterRequestContext);
  if (!context) {
    throw new Error('usePorterRequest must be used within PorterRequestProvider');
  }
  return context;
}