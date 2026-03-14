import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  isAvailable: boolean;
  preparationTime?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very-hot';
  allergens?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
  tags?: string[];
  ratings?: {
    average: number;
    count: number;
  };
}

export interface Menu {
  _id?: string;
  restaurantId: string;
  name: string;
  description?: string;
  items: MenuItem[];
  isActive: boolean;
  categories: string[];
  preparationTimeEstimate: {
    min: number;
    max: number;
  };
  lastUpdated?: Date;
}

export interface RestaurantSettings {
  _id?: string;
  restaurantId: string;
  name: string;
  description?: string;
  logo?: string;
  logoStoragePath?: string;
  bannerImage?: string;
  bannerStoragePath?: string;
  cuisineType?: string[];
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  operatingHours?: any;
  deliverySettings?: {
    minOrderValue: number;
    deliveryFee: number;
    deliveryTime: { min: number; max: number };
    acceptsDelivery: boolean;
  };
  takeawaySettings?: {
    acceptsTakeaway: boolean;
    preparationTime: { min: number; max: number };
  };
  averageRating?: number;
  totalReviews?: number;
  totalOrders?: number;
  monthlyRevenue?: number;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5001/restaurants';
  private uploadUrl = 'http://localhost:5001/api/upload';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/pets';
  constructor(private http: HttpClient) {}

  /**
   * Get vendor headers with restaurant ID
   */
  private getVendorHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-vendor-id': userId || ''
    });
  }

  /**
   * Upload image to backend storage
   * @param file - Image file to upload
   * @param restaurantId - Restaurant ID (for folder organization)
   * @param imageType - Type of image (menu-item, logo, banner)
   * @returns Promise with the image URL
   */
  async uploadImage(file: File, restaurantId: string, imageType: 'menu-item' | 'logo' | 'banner'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('images', file);

      // Determine folder based on image type
      const folder = imageType === 'menu-item' ? 'products' : imageType === 'logo' ? 'vendor-profiles' : 'vendor-banners';

      console.log(`📤 Uploading ${imageType} for restaurant ${restaurantId}`);

      const response = await fetch(`${this.uploadUrl}/multiple/${folder}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        const url = data.urls[0];
        // Ensure it's an absolute URL
        const absoluteUrl = url.startsWith('http') ? url : `http://localhost:5001${url}`;
        console.log(`✅ File uploaded: ${absoluteUrl}`);
        return absoluteUrl;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image to backend:', error);
      throw error;
    }
  }

  /**
   * Delete image from backend storage
   * @param downloadUrl - The image URL to delete
   */
  async deleteImage(downloadUrl: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting image: ${downloadUrl}`);

      const response = await fetch(`${this.uploadUrl}/delete-by-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: downloadUrl })
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ File deleted: ${downloadUrl}`);
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting image from backend:', error);
      throw error;
    }
  }

  /**
   * Get restaurant settings
   */
  getRestaurantSettings(restaurantId: string): Observable<ApiResponse<RestaurantSettings>> {
    return this.http.get<ApiResponse<RestaurantSettings>>(
      `${this.apiUrl}/${restaurantId}/settings`
    );
  }

  /**
   * Save restaurant settings
   */
  saveRestaurantSettings(restaurantId: string, settings: Partial<RestaurantSettings>): Observable<ApiResponse<RestaurantSettings>> {
    const headers = this.getVendorHeaders();
    return this.http.post<ApiResponse<RestaurantSettings>>(
      `${this.apiUrl}/${restaurantId}/settings`,
      settings,
      { headers }
    );
  }

  /**
   * Get restaurant menu
   */
  getMenu(restaurantId: string): Observable<ApiResponse<Menu>> {
    return this.http.get<ApiResponse<Menu>>(
      `${this.apiUrl}/${restaurantId}/menu`
    );
  }

  /**
   * Get menu items by category
   */
  getMenuByCategory(restaurantId: string, category: string): Observable<ApiResponse<MenuItem[]>> {
    return this.http.get<ApiResponse<MenuItem[]>>(
      `${this.apiUrl}/${restaurantId}/menu/category/${category}`
    );
  }

  /**
   * Add menu item
   */
  addMenuItem(restaurantId: string, item: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    const headers = this.getVendorHeaders();
    return this.http.post<ApiResponse<MenuItem>>(
      `${this.apiUrl}/${restaurantId}/menu/item`,
      item,
      { headers }
    );
  }

  /**
   * Update menu item
   */
  updateMenuItem(restaurantId: string, itemId: string, item: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    const headers = this.getVendorHeaders();
    return this.http.put<ApiResponse<MenuItem>>(
      `${this.apiUrl}/${restaurantId}/menu/item/${itemId}`,
      item,
      { headers }
    );
  }

  /**
   * Delete menu item
   */
  deleteMenuItem(restaurantId: string, itemId: string): Observable<ApiResponse<any>> {
    const headers = this.getVendorHeaders();
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${restaurantId}/menu/item/${itemId}`,
      { headers }
    );
  }

  /**
   * Update item availability
   */
  updateItemAvailability(restaurantId: string, itemId: string, isAvailable: boolean): Observable<ApiResponse<MenuItem>> {
    const headers = this.getVendorHeaders();
    return this.http.patch<ApiResponse<MenuItem>>(
      `${this.apiUrl}/${restaurantId}/menu/item/${itemId}/availability`,
      { isAvailable },
      { headers }
    );
  }

  /**
   * Get restaurant orders
   */
  getRestaurantOrders(restaurantId: string, page: number = 1, limit: number = 20, status?: string): Observable<any> {
    let url = `${this.apiUrl}/${restaurantId}/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<any>(url);
  }

  /**
   * Get restaurant dashboard stats
   */
  getRestaurantStats(restaurantId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${restaurantId}/stats`
    );
  }

  /**
   * Update order status (vendor dashboard)
   */
  updateOrderStatus(restaurantId: string, orderId: string, status: string): Observable<ApiResponse<any>> {
    const headers = this.getVendorHeaders();
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${restaurantId}/orders/${orderId}/status`,
      { status },
      { headers }
    );
  }

  /**
   * Get chats for vendor (restaurant)
   */
  getVendorChats(vendorId: string, vendorType: string = 'restaurant', page: number = 1, limit: number = 20): Observable<ApiResponse<any>> {
    const headers = this.getVendorHeaders();
    const apiUrl = 'http://localhost:5001/customers';
    return this.http.get<ApiResponse<any>>(
      `${apiUrl}/vendor-chats-by-vendor/${vendorId}?vendorType=${vendorType}&page=${page}&limit=${limit}`,
      { headers }
    );
  }

  /**
   * Send vendor reply in chat
   */
  sendVendorReply(chatId: string, message: string, vendorName: string): Observable<ApiResponse<any>> {
    const headers = this.getVendorHeaders();
    const apiUrl = 'http://localhost:5001/customers';
    return this.http.post<ApiResponse<any>>(
      `${apiUrl}/vendor-chats/${chatId}/vendor-reply`,
      { message, vendorName },
      { headers }
    );
  }
}
