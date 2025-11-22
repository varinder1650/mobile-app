export interface ProductImage {
    url?: string;
    secure_url?: string;
    thumbnail?: string;
    public_id?: string;
  }
  
  export interface Product {
    _id: string;
    id: string;
    name: string;
    description: string;
    price: number;
    images: (string | ProductImage)[];
    category: { 
      _id: string;
      id: string;
      name: string;
    } | string;
    brand: { 
      _id: string;
      id: string;
      name: string;
    };
    stock: number;
    status: string;
    allow_user_description: boolean;
    user_description: string;
    mrp: number;
  }
  
  export interface Category {
    _id: string;
    id: string;
    name: string;
    icon?: string;
    image?: string;
    status: string;
  }
  
  export interface CartQuantities {
    [productId: string]: number;
  }