import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Customer {
  _id?: string;
  businessId: string;
  businessType: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: string;
  firstPurchaseDate?: string;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  notes?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  createdAt?: string;
}

export interface CustomerResponse<T> {
  success: boolean;
  data?: T;
  stats?: {
    totalCustomers: number;
    totalRevenue: number;
    averageSpent: number;
    vipCount: number;
    activeCount: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:5001/customers';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/customers';
  constructor(private http: HttpClient) {}

  // Get business customers
  getBusinessCustomers(
    businessId: string,
    businessType: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    sortBy: string = 'recent',
    search?: string
  ): Observable<CustomerResponse<Customer[]>> {
    let url = `${this.apiUrl}/business/${businessId}?businessType=${businessType}&page=${page}&limit=${limit}&sortBy=${sortBy}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${search}`;
    return this.http.get<CustomerResponse<Customer[]>>(url);
  }

  // Get top customers
  getTopCustomers(
    businessId: string,
    businessType: string,
    limit: number = 10
  ): Observable<CustomerResponse<Customer[]>> {
    return this.http.get<CustomerResponse<Customer[]>>(
      `${this.apiUrl}/business/${businessId}/top?businessType=${businessType}&limit=${limit}`
    );
  }

  // Get single customer
  getCustomer(customerId: string): Observable<CustomerResponse<Customer>> {
    return this.http.get<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}`
    );
  }

  // Create customer
  createCustomer(customerData: Partial<Customer>): Observable<CustomerResponse<Customer>> {
    return this.http.post<CustomerResponse<Customer>>(
      this.apiUrl,
      customerData
    );
  }

  // Update customer
  updateCustomer(customerId: string, updates: Partial<Customer>): Observable<CustomerResponse<Customer>> {
    return this.http.put<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}`,
      updates
    );
  }

  // Update customer purchase stats
  updateCustomerPurchases(customerId: string, orderAmount: number): Observable<CustomerResponse<Customer>> {
    return this.http.put<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}/purchases`,
      { orderAmount }
    );
  }

  // Delete customer
  deleteCustomer(customerId: string): Observable<CustomerResponse<any>> {
    return this.http.delete<CustomerResponse<any>>(
      `${this.apiUrl}/${customerId}`
    );
  }

  // Customer profile methods
  getProfile(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<CustomerResponse<any>> {
    return this.http.put<CustomerResponse<any>>(`${this.apiUrl}/profile`, profileData);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<CustomerResponse<any>> {
    return this.http.post<CustomerResponse<any>>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Wishlist methods
  getWishlist(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/wishlist`);
  }

  removeFromWishlist(itemId: string): Observable<CustomerResponse<any>> {
    return this.http.delete<CustomerResponse<any>>(`${this.apiUrl}/wishlist/${itemId}`);
  }

  // Orders methods
  getCustomerOrders(page: number = 1, limit: number = 20): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ No user ID found in localStorage');
      return this.http.get<CustomerResponse<any>>(
        `http://localhost:5001/orders?page=${page}&limit=${limit}`
      );
    }
    // Call the orders API with customer ID endpoint
    return this.http.get<CustomerResponse<any>>(
      `http://localhost:5001/orders/customer/${userId}`
    );
  }

  // Food orders - fetch from restaurant service by customer ID
  getFoodOrders(): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ No user ID found in localStorage for food orders');
      // Return empty response
      return of({
        success: false,
        data: [],
        message: 'No user ID found'
      } as any);
    }
    // Call restaurants API to get orders by customer ID
    return this.http.get<CustomerResponse<any>>(
      `http://localhost:5001/restaurants/customer/${userId}`
    );
  }

  // Shopping orders - use same endpoint as getCustomerOrders but filtered for shopping
  getShoppingOrders(): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ No user ID found in localStorage for shopping orders');
      return this.http.get<CustomerResponse<any>>(
        `http://localhost:5001/orders?type=shopping`
      );
    }
    // Call the orders API with customer ID endpoint filtered by shopping service type
    return this.http.get<CustomerResponse<any>>(
      `http://localhost:5001/orders/customer/${userId}?type=shopping`
    );
  }

  // Hotel bookings
  getMyHotelBookings(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/hotel-bookings`);
  }

  orderRoomService(roomServiceData: any): Observable<CustomerResponse<any>> {
    return this.http.post<CustomerResponse<any>>(`${this.apiUrl}/room-service`, roomServiceData);
  }

  // Service bookings
  getServiceBookings(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/service-bookings`);
  }

  getCustomerServices(page: number = 1, limit: number = 20): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(
      `${this.apiUrl}/services?page=${page}&limit=${limit}`
    );
  }

  // Bookings
  getCustomerBookings(page: number = 1, limit: number = 20): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(
      `${this.apiUrl}/bookings?page=${page}&limit=${limit}`
    );
  }

  // Tour bookings
  getMyTourBookings(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/tour-bookings`);
  }

  // Reviews
  getMyReviews(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/reviews`);
  }

  // Chat support methods
  getDeliveryOrders(): Observable<CustomerResponse<any>> {
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/delivery-orders`);
  }

  getVendorChats(): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    const params = userId ? `?userId=${userId}` : '';
    return this.http.get<CustomerResponse<any>>(`${this.apiUrl}/vendor-chats${params}`);
  }

  startVendorChat(vendorType?: string, bookingId?: string, vendorName?: string): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    const params = userId ? `?userId=${userId}` : '';
    return this.http.post<CustomerResponse<any>>(`${this.apiUrl}/vendor-chats${params}`, {
      vendorType,
      bookingId,
      vendorName,
      userId
    });
  }

  sendVendorChatMessage(chatId: string, message: string): Observable<CustomerResponse<any>> {
    const userId = localStorage.getItem('userId');
    const params = userId ? `?userId=${userId}` : '';
    return this.http.post<CustomerResponse<any>>(`${this.apiUrl}/vendor-chats/${chatId}/message${params}`, {
      message
    });
  }
}
