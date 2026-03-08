import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

// ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
// OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api'
// NEW: Local Node.js/Express backend
const API_URL = 'http://localhost:5001';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private hotelId = '69a72226003a6f0406e3afb1'; // Default Hotel ID from seed
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {
    this.setHotelId();
  }

  setHotelId(id?: string) {
    if (id) {
      this.hotelId = id;
      localStorage.setItem('hotelId', id);
      console.log('✅ Hotel ID set to:', id);
    } else {
      // Get from localStorage first
      const storedHotelId = localStorage.getItem('hotelId');
      if (storedHotelId) {
        this.hotelId = storedHotelId;
        console.log('📍 Using hotel ID from localStorage:', storedHotelId);
      } else {
        // Use default from seed
        this.hotelId = '69a72226003a6f0406e3afb1';
        localStorage.setItem('hotelId', this.hotelId);
        console.log('📍 Using default hotel ID:', this.hotelId);
      }
    }
  }

  // ==================== HOTEL DETAILS ====================
  getHotelDetails(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}`).pipe(
      tap((data) => {
        console.log('✅ Hotel details retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch hotel details:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getHotelStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/stats`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch hotel stats:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getHotelBookings(page = 1, limit = 10, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any[]>>(`${API_URL}/hotels/${this.hotelId}/bookings`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch bookings:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  // ==================== ROOMS ====================
  getRooms(page = 1, limit = 10, status?: string, type?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (type) params = params.set('roomType', type);

    const url = `${API_URL}/hotels/${this.hotelId}/rooms`;
    console.log('🔗 Rooms API Request:', {
      url,
      hotelId: this.hotelId,
      params: { page, limit, status, type }
    });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Rooms API Success - Received', data.data?.length, 'rooms');
      }),
      catchError((error) => {
        console.error('❌ Rooms API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          body: error.error,
          type: error.type
        });
        throw error;
      })
    );
  }

  getRoomById(roomId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}`
    );
  }

  createRoom(roomData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms`,
      roomData
    );
  }

  updateRoom(roomId: string, roomData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}`,
      roomData
    );
  }

  updateRoomStatus(roomId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/status`,
      { status }
    );
  }

  deleteRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}`
    );
  }

  // ==================== BOOKINGS ====================
  getBookings(page = 1, limit = 10, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/bookings`,
      { params }
    );
  }

  getBookingById(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/${bookingId}`
    );
  }

  createBooking(bookingData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings`,
      bookingData
    );
  }

  updateBooking(bookingId: string, bookingData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/${bookingId}`,
      bookingData
    );
  }

  updateBookingStatus(bookingId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/${bookingId}/status`,
      { status }
    );
  }

  updatePaymentStatus(bookingId: string, paymentStatus: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/${bookingId}/payment-status`,
      { paymentStatus }
    );
  }

  deleteBooking(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/${bookingId}`
    );
  }

  // ==================== STAFF ====================
  getStaff(page = 1, limit = 10, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/staff`,
      { params }
    );
  }

  getStaffById(staffId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}`
    );
  }

  createStaff(staffData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff`,
      staffData
    );
  }

  updateStaff(staffId: string, staffData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}`,
      staffData
    );
  }

  deleteStaff(staffId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}`
    );
  }

  // ==================== MAINTENANCE ====================
  getMaintenance(page = 1, limit = 10, status?: string, priority?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance`,
      { params }
    );
  }

  getMaintenanceById(maintenanceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance/${maintenanceId}`
    );
  }

  createMaintenance(maintenanceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance`,
      maintenanceData
    );
  }

  updateMaintenance(maintenanceId: string, maintenanceData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance/${maintenanceId}`,
      maintenanceData
    );
  }

  updateMaintenanceStatus(maintenanceId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance/${maintenanceId}/status`,
      { status }
    );
  }

  deleteMaintenance(maintenanceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/maintenance/${maintenanceId}`
    );
  }

  // ==================== INVOICES ====================
  getInvoices(page = 1, limit = 10, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/invoices`,
      { params }
    );
  }

  getInvoiceById(invoiceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/invoices/${invoiceId}`
    );
  }

  createInvoice(invoiceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/invoices`,
      invoiceData
    );
  }

  updateInvoice(invoiceId: string, invoiceData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/invoices/${invoiceId}`,
      invoiceData
    );
  }

  updateInvoiceStatus(invoiceId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/invoices/${invoiceId}/status`,
      { status }
    );
  }

  deleteInvoice(invoiceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/invoices/${invoiceId}`
    );
  }

  // ==================== FOOD ORDERS ====================
  getFoodOrders(page = 1, limit = 10, status?: string, category?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category);

    const url = `${API_URL}/hotels/${this.hotelId}/food-orders`;
    console.log('🔗 Food Orders API Request:', {
      url,
      hotelId: this.hotelId,
      params: { page, limit, status, category }
    });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Food Orders API Success - Received', data.data?.length, 'orders');
      }),
      catchError((error) => {
        console.error('❌ Food Orders API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        throw error;
      })
    );
  }

  getFoodOrderById(orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/food-orders/${orderId}`
    );
  }

  createFoodOrder(orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/food-orders`,
      orderData
    );
  }

  updateFoodOrder(orderId: string, orderData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/food-orders/${orderId}`,
      orderData
    );
  }

  updateFoodOrderStatus(orderId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/food-orders/${orderId}/status`,
      { status }
    );
  }

  deleteFoodOrder(orderId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/food-orders/${orderId}`
    );
  }

  // ==================== MENUS ====================
  getMenus(page = 1, limit = 10, type?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (type) params = params.set('type', type);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/menus`,
      { params }
    );
  }

  getMenuById(menuId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/menus/${menuId}`
    );
  }

  createMenu(menuData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/menus`,
      menuData
    );
  }

  updateMenu(menuId: string, menuData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/menus/${menuId}`,
      menuData
    );
  }

  toggleMenuActive(menuId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/menus/${menuId}/toggle-active`,
      {}
    );
  }

  deleteMenu(menuId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/menus/${menuId}`
    );
  }

  // ==================== ROOM SERVICE ====================
  getRoomServiceItems(page = 1, limit = 10, category?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (category) params = params.set('category', category);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/room-service`,
      { params }
    );
  }

  getRoomServiceItemById(itemId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-service/${itemId}`
    );
  }

  createRoomServiceItem(itemData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-service`,
      itemData
    );
  }

  updateRoomServiceItem(itemId: string, itemData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-service/${itemId}`,
      itemData
    );
  }

  deleteRoomServiceItem(itemId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-service/${itemId}`
    );
  }

  // ==================== DEVICES ====================
  getDevices(page = 1, limit = 10, status?: string, type?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('hotelId', this.hotelId);

    if (status !== undefined) params = params.set('status', status);
    if (type) params = params.set('deviceType', type);

    const url = `${API_URL}/devices`;
    console.log('🔗 Devices API Request:', {
      url,
      hotelId: this.hotelId,
      params: { page, limit, status, type }
    });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Devices API Success - Received', data.data?.length, 'devices');
      }),
      catchError((error) => {
        console.error('❌ Devices API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        throw error;
      })
    );
  }

  getDeviceById(deviceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/devices/${deviceId}`);
  }

  registerDevices(devicesData: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/devices`, devicesData);
  }

  createDevice(deviceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/devices`, [deviceData]);
  }

  updateDevice(deviceId: string, deviceData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/devices/${deviceId}`, deviceData);
  }

  updateDeviceStatus(deviceId: string, status: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/devices/${deviceId}/status`,
      { status }
    );
  }

  deleteDevices(ids: string[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/devices/remove`, { ids });
  }

  // ==================== REVIEWS ====================
  getReviews(page = 1, limit = 10): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    const url = `${API_URL}/hotels/${this.hotelId}/reviews`;
    console.log('🔗 Reviews API Request:', {
      url,
      hotelId: this.hotelId,
      params: { page, limit }
    });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Reviews API Success - Received', data.data?.length, 'reviews');
      }),
      catchError((error) => {
        console.error('❌ Reviews API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        throw error;
      })
    );
  }

  // ==================== HOTELS ====================
  getHotels(page = 1, limit = 10): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    const url = `${API_URL}/hotels`;
    console.log('🔗 Hotels List API Request:', { url, params: { page, limit } });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Hotels API Success - Received', data.data?.length, 'hotels');
      }),
      catchError((error) => {
        console.error('❌ Hotels API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        // Return empty array on error so app doesn't break
        return of({ status: 'error', data: [], message: 'Failed to load hotels' } as ApiResponse<any[]>);
      })
    );
  }

  getPublicHotels(page = 1, limit = 10, location?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (location) params = params.set('location', location);

    const url = `${API_URL}/hotels/public/search`;
    console.log('🔗 Public Hotels Search API Request:', { url, params: { page, limit, location } });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Public Hotels Search API Success - Received', data.data?.length, 'hotels');
      }),
      catchError((error) => {
        console.error('❌ Public Hotels Search API Failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        // Return empty array on error
        return of({ status: 'error', data: [], message: 'Failed to load hotels' } as ApiResponse<any[]>);
      })
    );
  }

  getHotelById(hotelId: string): Observable<ApiResponse<any>> {
    const url = `${API_URL}/hotels/${hotelId}`;
    console.log('🔗 Hotel Details API Request:', { url, hotelId });

    return this.http.get<ApiResponse<any>>(url).pipe(
      tap((data) => {
        console.log('✅ Hotel Details API Success for', hotelId);
      }),
      catchError((error) => {
        console.error('❌ Hotel Details API Failed:', {
          status: error.status,
          hotelId,
          message: error.message
        });
        throw error;
      })
    );
  }

  searchHotels(filters: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
    propertyTypes?: string[];
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();

    if (filters.location) params = params.set('location', filters.location);
    if (filters.checkIn) params = params.set('checkIn', filters.checkIn);
    if (filters.checkOut) params = params.set('checkOut', filters.checkOut);
    if (filters.guests) params = params.set('guests', filters.guests.toString());
    if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
    if (filters.amenities && filters.amenities.length > 0) {
      params = params.set('amenities', filters.amenities.join(','));
    }
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      params = params.set('propertyTypes', filters.propertyTypes.join(','));
    }

    params = params.set('page', (filters.page || 1).toString());
    params = params.set('limit', (filters.limit || 10).toString());

    const url = `${API_URL}/hotels/public/search`;
    console.log('🔗 Hotels Filter Search API Request:', { url, filters });

    return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
      tap((data) => {
        console.log('✅ Hotels Search API Success - Received', data.data?.length, 'hotels');
      }),
      catchError((error) => {
        console.error('❌ Hotels Search API Failed:', {
          status: error.status,
          message: error.message
        });
        return of({ status: 'error', data: [], message: 'Failed to search hotels' } as ApiResponse<any[]>);
      })
    );
  }

  createHotel(hotelData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels`, hotelData);
  }

  updateHotel(hotelId: string, hotelData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${hotelId}`, hotelData);
  }

  deleteHotel(hotelId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${API_URL}/hotels/${hotelId}`);
  }

  // ==================== NOTIFICATIONS ====================
  getNotifications(page = 1, limit = 20): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<any[]>>(`${API_URL}/hotels/${this.hotelId}/notifications`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch notifications:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getUnreadNotificationsCount(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/notifications/unread-count`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch unread count:', error);
        return of({ status: 'error', data: { count: 0 }, message: error.message });
      })
    );
  }

  markNotificationAsRead(notificationId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/notifications/${notificationId}/read`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to mark notification as read:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  markAllNotificationsAsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/notifications/mark-all-read`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to mark all notifications as read:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== ROOM STATUS SUMMARY ====================
  getRoomStatusSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/rooms/status-summary`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch room status summary:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }
}
