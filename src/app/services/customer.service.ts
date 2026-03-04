import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Get customer ID from localStorage
  private getCustomerId(): string {
    return localStorage.getItem('userId') || '';
  }

  // ============================================
  // ORDERS
  // ============================================

  getCustomerOrders(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders?customerId=${customerId}&page=${page}&limit=${limit}`
    );
  }

  getOrderById(orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/${orderId}`);
  }

  // ============================================
  // BOOKINGS
  // ============================================

  getCustomerBookings(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/bookings?customerId=${customerId}&page=${page}&limit=${limit}`
    );
  }

  getBookingById(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  cancelBooking(bookingId: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/bookings/${bookingId}/cancel`,
      { reason }
    );
  }

  // ============================================
  // SERVICES / APPOINTMENTS
  // ============================================

  getCustomerServices(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/services?customerId=${customerId}&page=${page}&limit=${limit}`
    );
  }

  getServiceById(serviceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/services/${serviceId}`);
  }

  bookService(serviceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/services/book`, serviceData);
  }

  // ============================================
  // CUSTOMER PROFILE
  // ============================================

  getProfile(): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/${customerId}`);
  }

  updateProfile(data: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/${customerId}`, data);
  }

  // ============================================
  // WISHLIST / FAVORITES
  // ============================================

  getWishlist(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/wishlist?customerId=${customerId}`);
  }

  addToWishlist(itemId: string, itemType: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/wishlist`, {
      itemId,
      itemType
    });
  }

  removeFromWishlist(itemId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/wishlist/${itemId}`);
  }

  // ============================================
  // REVIEWS & RATINGS
  // ============================================

  submitReview(entityId: string, entityType: string, rating: number, review: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reviews`, {
      entityId,
      entityType,
      rating,
      review
    });
  }

  getMyReviews(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reviews?customerId=${customerId}`);
  }

  // ============================================
  // HOTEL BOOKINGS (with room service & drinks)
  // ============================================

  getHotels(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/hotels?page=${page}&limit=${limit}`
    );
  }

  getHotelById(hotelId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/hotels/${hotelId}`);
  }

  getHotelRooms(hotelId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/hotels/${hotelId}/rooms`);
  }

  bookHotelRoom(hotelId: string, bookingData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/hotels/${hotelId}/bookings`,
      { ...bookingData, customerId }
    );
  }

  getMyHotelBookings(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders/customer/${customerId}?type=hotel`
    );
  }

  // Room Service & Drinks
  getHotelMenus(hotelId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/hotels/${hotelId}/menus`);
  }

  getRoomService(hotelId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/hotels/${hotelId}/room-service`);
  }

  orderRoomService(hotelId: string, bookingId: string, orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/hotels/${hotelId}/food-orders`,
      { ...orderData, bookingId }
    );
  }

  // Chat with Admin (placeholder for future implementation)
  sendAdminMessage(hotelId: string, bookingId: string, message: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/hotels/${hotelId}/chat`,
      { bookingId, customerId, message }
    );
  }

  // ============================================
  // FOOD ORDERS (from restaurants)
  // ============================================

  getFoodOrders(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders/customer/${customerId}?type=food`
    );
  }

  orderFood(orderData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { ...orderData, customerId, type: 'food' }
    );
  }

  // ============================================
  // SHOPPING / RETAIL ORDERS
  // ============================================

  getRetailProducts(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/products?category=retail&page=${page}&limit=${limit}`
    );
  }

  getProductById(productId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/products/${productId}`);
  }

  getShoppingOrders(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    const endpoint = `${this.apiUrl}/orders/customer/${customerId}?type=shopping`;
    console.log('🔗 Calling API endpoint:', endpoint);
    console.log('👤 Customer ID:', customerId);

    return this.http.get<ApiResponse<any[]>>(endpoint);
  }

  createShoppingOrder(orderData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { ...orderData, customerId, type: 'shopping' }
    );
  }

  // ============================================
  // SERVICES BOOKINGS
  // ============================================

  getAvailableServices(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/products?service=true&page=${page}&limit=${limit}`
    );
  }

  getServiceBookings(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders/customer/${customerId}?type=service`
    );
  }

  bookAService(serviceData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { ...serviceData, customerId, type: 'service' }
    );
  }

  // ============================================
  // TOURS & TRAVEL BOOKINGS
  // ============================================

  getAvailableTours(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/tour-operators/packages?page=${page}&limit=${limit}`
    );
  }

  getTourById(tourId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/tour-operators/packages/${tourId}`);
  }

  getMyTourBookings(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders/customer/${customerId}?type=tour`
    );
  }

  bookTour(tourData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { ...tourData, customerId, type: 'tour' }
    );
  }

  // ============================================
  // DELIVERY ORDERS
  // ============================================

  getDeliveryOrders(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/orders/customer/${customerId}?type=delivery`
    );
  }

  createDeliveryOrder(orderData: any): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { ...orderData, customerId, type: 'delivery' }
    );
  }

  trackDeliveryOrder(orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/${orderId}`);
  }

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/users/${customerId}/change-password`,
      { currentPassword, newPassword }
    );
  }

  // ============================================
  // CHAT & SUPPORT
  // ============================================

  // ============================================
  // VENDOR-SPECIFIC CHAT
  // ============================================

  getVendorChats(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/chat/vendor-chats?customerId=${customerId}`
    );
  }

  startVendorChat(vendorType: string, bookingId: string, vendorName: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/chat/vendor-chats`,
      { customerId, vendorType, bookingId, vendorName }
    );
  }

  sendVendorChatMessage(chatId: string, message: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/chat/vendor-chats/${chatId}/messages`,
      { customerId, message }
    );
  }

  getVendorChatById(chatId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/chat/vendor-chats/${chatId}`
    );
  }

  closeVendorChat(chatId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/chat/vendor-chats/${chatId}/close`,
      {}
    );
  }

  // Legacy general support (keeping for backwards compatibility)
  getConversations(): Observable<ApiResponse<any[]>> {
    const customerId = this.getCustomerId();
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/chat/conversations?customerId=${customerId}`
    );
  }

  createConversation(subject: string, message: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/chat/conversations`,
      { customerId, subject, initialMessage: message }
    );
  }

  sendChatMessage(conversationId: string, message: string): Observable<ApiResponse<any>> {
    const customerId = this.getCustomerId();
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      { customerId, message }
    );
  }
}
