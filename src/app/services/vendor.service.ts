import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface VendorProfile {
  _id?: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  vendorType: 'furniture' | 'hair' | 'pets' | 'gym-equipment';
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  profileImage?: string;
  bannerImage?: string;
  businessLicense?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  stats?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    totalCustomers: number;
  };
  status: string;
  isVerified: boolean;
  openingTime?: string;
  closingTime?: string;
  operatingDays?: string[];
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
  thumbnail?: string;
  images?: string[];
  rating?: { average: number; count: number };
  vendorId?: string;
  vendorName?: string;
}

export interface VendorStats {
  vendor?: any;
  productCounts?: {
    furniture: number;
    hair: number;
    pets: number;
    gymEquipment: number;
  };
  recentOrders?: any[];
}

export interface VendorResponse {
  status: string;
  data?: any;
  message?: string;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/vendors'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/vendors';

  constructor(private http: HttpClient) {}

  /**
   * Get vendor profile
   */
  getVendorProfile(userId: string): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.apiUrl}/profile/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching vendor profile:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to fetch vendor profile'
        });
      })
    );
  }

  /**
   * Create or update vendor profile
   */
  saveVendorProfile(userId: string, profile: Partial<VendorProfile>, files?: any): Observable<VendorResponse> {
    const formData = new FormData();

    // Add profile data
    Object.keys(profile).forEach(key => {
      const value = (profile as any)[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add files if provided
    if (files) {
      if (files.profileImage) {
        formData.append('profileImage', files.profileImage);
      }
      if (files.bannerImage) {
        formData.append('bannerImage', files.bannerImage);
      }
      if (files.businessLicenseImage) {
        formData.append('businessLicenseImage', files.businessLicenseImage);
      }
    }

    return this.http.post<VendorResponse>(`${this.apiUrl}/profile/${userId}`, formData).pipe(
      catchError((error) => {
        console.error('Error saving vendor profile:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to save vendor profile'
        });
      })
    );
  }

  /**
   * Get vendor statistics
   */
  getVendorStats(userId: string): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.apiUrl}/stats/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching vendor stats:', error);
        return of({
          status: 'error',
          data: {
            vendor: {},
            productCounts: {},
            recentOrders: []
          }
        });
      })
    );
  }

  /**
   * Get vendor products
   */
  getVendorProducts(
    userId: string,
    vendorType: string,
    page: number = 1,
    limit: number = 10
  ): Observable<VendorResponse> {
    return this.http
      .get<VendorResponse>(`${this.apiUrl}/products/${userId}/${vendorType}?page=${page}&limit=${limit}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching vendor products:', error);
          return of({
            status: 'error',
            data: [],
            message: error.error?.message || 'Failed to fetch products'
          });
        })
      );
  }

  /**
   * Create new product
   */
  createProduct(userId: string, vendorType: string, product: Partial<Product>, files?: any): Observable<VendorResponse> {
    const formData = new FormData();

    // Add product data
    Object.keys(product).forEach(key => {
      const value = (product as any)[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add files if provided
    if (files) {
      if (files.image) {
        formData.append('image', files.image);
      }
      if (files.images && Array.isArray(files.images)) {
        files.images.forEach((img: any, index: number) => {
          formData.append('images', img);
        });
      }
    }

    return this.http
      .post<VendorResponse>(`${this.apiUrl}/products/${userId}/${vendorType}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error creating product:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to create product'
          });
        })
      );
  }

  /**
   * Update product
   */
  updateProduct(
    userId: string,
    vendorType: string,
    productId: string,
    product: Partial<Product>,
    files?: any
  ): Observable<VendorResponse> {
    const formData = new FormData();

    // Add product data
    Object.keys(product).forEach(key => {
      const value = (product as any)[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add files if provided
    if (files) {
      if (files.image) {
        formData.append('image', files.image);
      }
      if (files.images && Array.isArray(files.images)) {
        files.images.forEach((img: any) => {
          formData.append('images', img);
        });
      }
    }

    return this.http
      .put<VendorResponse>(`${this.apiUrl}/products/${userId}/${vendorType}/${productId}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error updating product:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to update product'
          });
        })
      );
  }

  /**
   * Delete product
   */
  deleteProduct(userId: string, vendorType: string, productId: string): Observable<VendorResponse> {
    return this.http
      .delete<VendorResponse>(`${this.apiUrl}/products/${userId}/${vendorType}/${productId}`)
      .pipe(
        catchError((error) => {
          console.error('Error deleting product:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to delete product'
          });
        })
      );
  }

  /**
   * Get vendor orders
   */
  getVendorOrders(userId: string, page: number = 1, limit: number = 10): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.apiUrl}/orders/${userId}?page=${page}&limit=${limit}`).pipe(
      catchError((error) => {
        console.error('Error fetching vendor orders:', error);
        return of({
          status: 'error',
          data: [],
          message: error.error?.message || 'Failed to fetch orders'
        });
      })
    );
  }

  /**
   * Get analytics dashboard data
   */
  getAnalyticsDashboard(userId: string, period: string = '30'): Observable<any> {
    return this.http.get<any>(`/api/vendor-analytics/analytics/${userId}?period=${period}`).pipe(
      catchError((error) => {
        console.error('Error fetching analytics:', error);
        return of({
          status: 'error',
          data: { summary: {}, dailyRevenue: [], paymentMethods: {} }
        });
      })
    );
  }

  /**
   * Get product reviews
   */
  getProductReviews(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http
      .get<any>(`/api/vendor-analytics/reviews/${userId}?page=${page}&limit=${limit}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching reviews:', error);
          return of({
            status: 'error',
            data: [],
            stats: {}
          });
        })
      );
  }

  /**
   * Respond to review
   */
  respondToReview(reviewId: string, response: string): Observable<any> {
    return this.http
      .post<any>(`/api/vendor-analytics/reviews/${reviewId}/respond`, { response })
      .pipe(
        catchError((error) => {
          console.error('Error responding to review:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to respond'
          });
        })
      );
  }

  /**
   * Create promotion
   */
  createPromotion(userId: string, promotion: any): Observable<any> {
    return this.http.post<any>(`/api/vendor-analytics/promotions/${userId}`, promotion).pipe(
      catchError((error) => {
        console.error('Error creating promotion:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to create promotion'
        });
      })
    );
  }

  /**
   * Get promotions
   */
  getPromotions(userId: string, active: string = 'true'): Observable<any> {
    return this.http
      .get<any>(`/api/vendor-analytics/promotions/${userId}?active=${active}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching promotions:', error);
          return of({
            status: 'error',
            data: []
          });
        })
      );
  }

  /**
   * Update promotion
   */
  updatePromotion(promotionId: string, promotion: any): Observable<any> {
    return this.http
      .put<any>(`/api/vendor-analytics/promotions/${promotionId}`, promotion)
      .pipe(
        catchError((error) => {
          console.error('Error updating promotion:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to update promotion'
          });
        })
      );
  }

  /**
   * Delete promotion
   */
  deletePromotion(promotionId: string): Observable<any> {
    return this.http
      .delete<any>(`/api/vendor-analytics/promotions/${promotionId}`)
      .pipe(
        catchError((error) => {
          console.error('Error deleting promotion:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to delete promotion'
          });
        })
      );
  }

  /**
   * Get inventory alerts
   */
  getAlerts(userId: string, unread: boolean = false): Observable<any> {
    return this.http
      .get<any>(`/api/vendor-analytics/alerts/${userId}?unread=${unread}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching alerts:', error);
          return of({
            status: 'error',
            data: [],
            unreadCount: 0
          });
        })
      );
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId: string): Observable<any> {
    return this.http.put<any>(`/api/vendor-analytics/alerts/${alertId}/read`, {}).pipe(
      catchError((error) => {
        console.error('Error marking alert as read:', error);
        return of({
          status: 'error'
        });
      })
    );
  }

  /**
   * Bulk import products
   */
  bulkImportProducts(userId: string, vendorType: string, products: any[]): Observable<any> {
    return this.http
      .post<any>(`/api/vendor-analytics/import/${userId}/${vendorType}`, { products })
      .pipe(
        catchError((error) => {
          console.error('Error importing products:', error);
          return of({
            status: 'error',
            message: error.error?.message || 'Failed to import products'
          });
        })
      );
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`/api/vendor-analytics/orders/${orderId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating order status:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to update order status'
        });
      })
    );
  }
}
