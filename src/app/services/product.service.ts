import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: string;
  images: string[]; // Real image URLs
  thumbnail?: string; // Main product image
  icon?: string; // Fallback emoji icon
  rating: number;
  reviews: number;
  sold: number;
  discount: number;
  inStock: boolean;
  isFreeShipping: boolean;
  stock: number;
  sku?: string;
  vendorId?: string;
  vendorType?: string;
  createdAt?: string;
  updatedAt?: string;
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
  private apiUrl = '/api/products';

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

  // Get vendor products
  getVendorProducts(vendorId: string, vendorType: string, page: number = 1, limit: number = 20): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/vendor/${vendorId}?vendorType=${vendorType}&page=${page}&limit=${limit}`
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
