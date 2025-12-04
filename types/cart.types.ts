export interface ProductImage {
    url?: string;
    secure_url?: string;
    thumbnail?: string;
    public_id?: string;
  }
  
  export interface CartItem {
    _id: string;
    product: {
      _id?: string;
      id: string;
      name: string;
      price: number;
      images: (string | ProductImage)[];
      brand: { name: string };
    };
    quantity: number;
  }