export interface SavedAddress {
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
  
  export interface ManualAddressForm {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    mobile_number: string;
  }
  
  export interface LocationState {
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    address: string;
  }
  
  export interface AddressScreenParams {
    from?: string;
    addressType?: string;
  }