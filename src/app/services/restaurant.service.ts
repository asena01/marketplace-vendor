import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { environment } from '../../environments/environment';

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

// Initialize Firebase
const firebaseApp = initializeApp(environment.firebaseConfig);
const storage = getStorage(firebaseApp);

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5001/restaurants';
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
   * Upload image to Firebase Storage
   */
  async uploadImage(file: File, restaurantId: string, imageType: 'menu-item' | 'logo' | 'banner'): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${imageType}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
      const filePath = `restaurants/${restaurantId}/${imageType}/${filename}`;

      // Create reference
      const fileRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(fileRef, file);
      console.log(`✅ File uploaded: ${snapshot.metadata.name}`);

      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`✅ Download URL: ${downloadUrl}`);

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
      throw error;
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(storagePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      console.log(`✅ File deleted: ${storagePath}`);
    } catch (error) {
      console.error('Error deleting image from Firebase:', error);
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
