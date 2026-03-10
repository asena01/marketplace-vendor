import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  currency?: string;
  category: string;
  categoryId?: string;
  images?: string[]; // Real image URLs
  thumbnail?: string; // Main product image
  icon?: string; // Fallback emoji icon
  rating?: {
    average?: number;
    count?: number;
    reviews?: any[];
  } | number; // Support both old number format and new object format
  reviews?: number;
  sold?: number;
  discount?: number;
  inStock?: boolean;
  isFreeShipping?: boolean;
  stock: number;
  sku?: string;
  vendorId?: string;
  vendorType?: string;
  createdAt?: string;
  updatedAt?: string;
  features?: string[];
  vendorName?: string;
  tags?: string[];

  // Furniture specific
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  material?: string[];
  color?: string[];
  finish?: string;
  warranty?: {
    duration: number;
    type: string;
  };
  shipping?: {
    available: boolean;
    estimatedDays: number;
    shippingCost: number;
    freeShippingAbove: number;
  };
  assembly?: {
    required: boolean;
    assemblyTime: string;
    instructions: string;
  };

  // Gym Equipment specific
  specifications?: {
    type: string;
    material: string[];
    weight: {
      value: number;
      unit: string;
    };
    dimensions: {
      width: number;
      height: number;
      depth: number;
      unit: string;
    };
    capacity: {
      value: number;
      unit: string;
    };
    resistance: string;
    resistanceLevels: number;
    color: string[];
    warranty: {
      duration: number;
      coverage: string;
    };
  };
  targetMuscles?: string[];
  fitnessLevel?: string;

  // Pets & Supplies specific
  quantity?: {
    value: number;
    unit: string;
  };
  petSpecification?: {
    petType: string;
    suitableFor: string[];
    ageRange: {
      min: number;
      max: number;
      unit: string;
    };
    ingredients: string[];
    nutritionalInfo: {
      protein: string;
      fat: string;
      fiber: string;
      moisture: string;
    };
    allergienFree: string[];
    organic: boolean;
  };
  brand?: string;
  manufacturer?: string;

  // Form control
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/products'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/products';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/products';
  constructor(private http: HttpClient) {}

  // Get all products with optional filters
  getProducts(page: number = 1, limit: number = 20, category?: string, search?: string): Observable<ApiResponse<Product[]>> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    
    return this.http.get<ApiResponse<Product[]>>(url);
  }

  // Get product by ID
  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  // Get products by category
  getProductsByCategory(categoryId: string, page: number = 1, limit: number = 20): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/category/${categoryId}?page=${page}&limit=${limit}`
    );
  }

  // Search products
  searchProducts(query: string, page: number = 1, limit: number = 20): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/search?q=${query}&page=${page}&limit=${limit}`
    );
  }

  // Get trending products
  getTrendingProducts(limit: number = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/trending?limit=${limit}`);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  // Create product (for vendors)
  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    const headers = this.getVendorHeaders();
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}`, data, { headers });
  }

  // Update product (for vendors)
  updateProduct(id: string, data: Partial<Product>): Observable<ApiResponse<Product>> {
    const headers = this.getVendorHeaders();
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, data, { headers });
  }

  // Delete product (for vendors)
  deleteProduct(id: string): Observable<ApiResponse<any>> {
    const headers = this.getVendorHeaders();
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { headers });
  }

  // Get vendor's own products (authenticated)
  getVendorProducts(vendorId: string, page: number = 1, limit: number = 20, category?: string): Observable<ApiResponse<Product[]>> {
    const headers = this.getVendorHeaders();
    let url = `${this.apiUrl}/vendor/${vendorId}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return this.http.get<ApiResponse<Product[]>>(url, { headers });
  }

  // Get vendor's own products with search (authenticated)
  searchVendorProducts(vendorId: string, query: string, page: number = 1, limit: number = 20): Observable<ApiResponse<Product[]>> {
    const headers = this.getVendorHeaders();
    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/vendor/${vendorId}?search=${query}&page=${page}&limit=${limit}`,
      { headers }
    );
  }

  // Upload product image
  uploadProductImage(file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getVendorHeaders();
    
    return this.http.post<ApiResponse<{ imageUrl: string }>>(`${this.apiUrl}/upload-image`, formData, { headers });
  }

  // Get vendor headers for authenticated requests
  private getVendorHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    const vendorId = localStorage.getItem('hotelId') || 
                     localStorage.getItem('restaurantId') || 
                     localStorage.getItem('storeId') ||
                     localStorage.getItem('serviceId') ||
                     localStorage.getItem('agencyId') ||
                     localStorage.getItem('deliveryId');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId || '',
      'x-vendor-id': vendorId || ''
    });
  }

  // Get products by IDs (for cart)
  getProductsByIds(ids: string[]): Observable<ApiResponse<Product[]>> {
    return this.http.post<ApiResponse<Product[]>>(`${this.apiUrl}/batch`, { ids });
  }
}
