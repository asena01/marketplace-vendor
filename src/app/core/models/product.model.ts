export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  rating: number;
  reviews: number;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  specifications: { [key: string]: string };
  shipping: {
    weight: number;
    dimensions: string;
    shippingCost: number;
  };
  affiliateCommissionRate: number;
  createdAt: Date;
  updatedAt: Date;
  vendorId: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}