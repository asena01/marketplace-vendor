import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { apiConfig } from '../config/api-config';

// ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
// OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api'
// Local development backend for now
//const API_URL = apiConfig.getApiBaseUrl();
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

export interface HotelAmenityService {
  _id?: string;
  hotel?: string;
  category: 'service' | 'laundry' | 'massage' | 'spa' | 'gym' | 'shuttle';
  name: string;
  description: string;
  serviceDetails?: string;
  price: number;
  pricingType?: 'per-request' | 'per-hour' | 'per-session' | 'per-day';
  duration?: string;
  availability?: string;
  icon?: string;
  image?: string;
  requiresScheduling?: boolean;
  available?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface RoomSecuritySummary {
  totalDevices: number;
  assignedDevices: number;
  unassignedDevices: number;
  totalRooms: number;
  contactlessReadyRooms: number;
  monitoredOnlyRooms: number;
}

export interface HotelSecurityDevice {
  _id?: string;
  deviceId?: string;
  name?: string;
  deviceType?: string;
  status?: boolean | string;
  isActive?: boolean;
  lastActive?: string;
  createdAt?: string;
  roomId?: string;
  roomNumber?: string;
  roomType?: string;
  assignmentState: 'assigned' | 'unassigned';
}

export interface HotelSecurityRoom {
  _id: string;
  roomNumber: string;
  roomType: string;
  accessMode: string;
  contactlessReady: boolean;
  monitoringEnabled: boolean;
  smartLockDevice?: { _id?: string; deviceId?: string; status?: boolean | string } | null;
  doorSensorDevice?: { _id?: string; deviceId?: string; status?: boolean | string } | null;
  devices: HotelSecurityDevice[];
}

export interface SmartAccessGrantRecord {
  _id: string;
  room?: { _id?: string; roomNumber?: string; accessMode?: string };
  device?: { _id?: string; deviceId?: string; deviceType?: string };
  subjectStaff?: { _id?: string; name?: string; email?: string; position?: string; department?: string };
  grantType?: string;
  accessCode?: string;
  validFrom?: string;
  validUntil?: string;
  status?: 'active' | 'revoked' | 'expired';
  metadata?: { notes?: string };
}

export interface BookingSmartLockAccessData {
  bookingId: string;
  bookingNumber: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  hotelName: string;
  contactlessCheckInEnabled: boolean;
  room?: any;
  smartLockAccess?: {
    accessToken?: string;
    backupPin?: string;
    qrCode?: string;
    expiresAt?: string;
    enabled?: boolean;
    unlockAttempts?: Array<{
      timestamp: string;
      success: boolean;
      deviceId?: string;
      error?: string;
    }>;
  } | null;
}

export interface StaffKeyAccessWorkspaceData {
  summary: RoomSecuritySummary;
  contactlessRooms: HotelSecurityRoom[];
  grants: SmartAccessGrantRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private hotelId = '69d0eca53b2942a9fc4c58e2'; // Default Hotel ID from user specified seed
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {
    this.setHotelId();
  }

  private getHotelVendorHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-vendor-id': this.hotelId || localStorage.getItem('hotelId') || ''
    });
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
        // Use default from latest seed
        this.hotelId = '69d0eca53b2942a9fc4c58e2';
        localStorage.setItem('hotelId', this.hotelId);
        console.log('📍 Using default hotel ID from latest seed:', this.hotelId);
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

  getDeviceAssignments(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/device-assignments`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch device assignments:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  private getEmptyRoomSecuritySummary(): RoomSecuritySummary {
    return {
      totalDevices: 0,
      assignedDevices: 0,
      unassignedDevices: 0,
      totalRooms: 0,
      contactlessReadyRooms: 0,
      monitoredOnlyRooms: 0
    };
  }

  private mapSecuritySummary(summary: any): RoomSecuritySummary {
    return {
      totalDevices: Number(summary?.totalDevices) || 0,
      assignedDevices: Number(summary?.assignedDevices) || 0,
      unassignedDevices: Number(summary?.unassignedDevices) || 0,
      totalRooms: Number(summary?.totalRooms) || 0,
      contactlessReadyRooms: Number(summary?.contactlessReadyRooms) || 0,
      monitoredOnlyRooms: Number(summary?.monitoredOnlyRooms) || 0
    };
  }

  private mapSecurityDevice(device: any, room?: any, assignmentState: 'assigned' | 'unassigned' = 'assigned'): HotelSecurityDevice {
    return {
      ...device,
      roomId: room?._id,
      roomNumber: room?.roomNumber,
      roomType: room?.roomType,
      name: device?.name || device?.deviceId,
      assignmentState
    };
  }

  private mapSecurityRoom(entry: any): HotelSecurityRoom {
    const room = entry?.room || {};
    const devices = Array.isArray(entry?.devices) ? entry.devices : [];

    return {
      _id: room?._id,
      roomNumber: room?.roomNumber || 'N/A',
      roomType: room?.roomType || 'Standard',
      accessMode: room?.accessMode || 'none',
      contactlessReady: room?.contactlessReady === true,
      monitoringEnabled: room?.monitoringEnabled === true,
      smartLockDevice: room?.smartLockDevice || null,
      doorSensorDevice: room?.doorSensorDevice || null,
      devices: devices.map((device: any) => this.mapSecurityDevice(device, room, 'assigned'))
    };
  }

  getRoomSecurityOverview(): Observable<ApiResponse<{
    summary: RoomSecuritySummary;
    rooms: HotelSecurityRoom[];
    assignedDevices: HotelSecurityDevice[];
    unassignedDevices: HotelSecurityDevice[];
    allDevices: HotelSecurityDevice[];
  }>> {
    return this.getDeviceAssignments().pipe(
      map((response: ApiResponse<any>) => {
        if (response.status !== 'success' || !response.data) {
          return {
            status: response.status,
            message: response.message,
            data: {
              summary: this.getEmptyRoomSecuritySummary(),
              rooms: [],
              assignedDevices: [],
              unassignedDevices: [],
              allDevices: []
            }
          };
        }

        const assignmentMap = response.data?.assignmentMap || {};
        const rooms = Object.values(assignmentMap).map((entry: any) => this.mapSecurityRoom(entry));
        const assignedDevices = rooms.flatMap((room) => room.devices);
        const unassignedDevices = Array.isArray(response.data?.unassignedDevices)
          ? response.data.unassignedDevices.map((device: any) => this.mapSecurityDevice(device, null, 'unassigned'))
          : [];

        return {
          status: 'success',
          message: response.message,
          data: {
            summary: this.mapSecuritySummary(response.data?.summary),
            rooms,
            assignedDevices,
            unassignedDevices,
            allDevices: [...assignedDevices, ...unassignedDevices]
          }
        };
      })
    );
  }

  getRoomSecuritySummary(): Observable<ApiResponse<RoomSecuritySummary>> {
    return this.getRoomSecurityOverview().pipe(
      map((response) => ({
        status: response.status,
        message: response.message,
        data: response.data?.summary || this.getEmptyRoomSecuritySummary()
      }))
    );
  }

  getContactlessRooms(): Observable<ApiResponse<HotelSecurityRoom[]>> {
    return this.getRoomSecurityOverview().pipe(
      map((response) => ({
        status: response.status,
        message: response.message,
        data: (response.data?.rooms || []).filter((room) => room.contactlessReady)
      }))
    );
  }

  getHotelSecurityDevices(): Observable<ApiResponse<HotelSecurityDevice[]>> {
    return this.getRoomSecurityOverview().pipe(
      map((response) => ({
        status: response.status,
        message: response.message,
        data: response.data?.allDevices || []
      }))
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

  getRoomTasks(page = 1, limit = 10, status?: string, taskType?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (taskType) params = params.set('taskType', taskType);

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks`,
      { params }
    );
  }

  createRoomTask(taskData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks`,
      taskData
    );
  }

  upsertSourceTask(taskData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks/source-link`,
      taskData
    );
  }

  assignRoomTask(taskId: string, assignedStaffId?: string, assignedBy?: string, assignedByName?: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks/${taskId}/assign`,
      { assignedStaffId, assignedBy, assignedByName }
    );
  }

  updateRoomTaskStatus(taskId: string, status: string, completionNotes?: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks/${taskId}/status`,
      { status, completionNotes }
    );
  }

  getMyRoomTasks(staffId: string, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/hotels/${this.hotelId}/room-tasks/my/${staffId}`,
      { params }
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
    // Add customer ID to booking data and map field names
    const user = this.authService.getCurrentUser();

    const enrichedBookingData = {
      // Map frontend field names to backend expected names
      customerId: user?._id,
      room: bookingData.roomId,
      checkInDate: new Date(bookingData.checkIn),
      checkOutDate: new Date(bookingData.checkOut),
      numberOfGuests: bookingData.guests,
      numberOfRooms: bookingData.roomCount,
      totalPrice: bookingData.totalPrice,
      customerName: bookingData.customerName,
      customerEmail: user?.email || bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      status: 'confirmed',
      paymentStatus: 'paid'
    };

    console.log('📝 Creating booking with enriched data:', enrichedBookingData);
    console.log('🏨 Hotel ID:', this.hotelId);
    console.log('👤 Customer ID:', user?._id);

    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings`,
      enrichedBookingData
    ).pipe(
      tap((response) => {
        console.log('✅ Booking API Response:', response);
      }),
      catchError((error) => {
        console.error('❌ Booking API Error:', error);
        throw error;
      })
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

  resetStaffPassword(staffId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}/reset-password`,
      {}
    );
  }

  getStaffActivitySummary(staffId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}/activity-summary`
    );
  }

  getStaffSchedule(weekStart: string, weekEnd?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('weekStart', weekStart);
    if (weekEnd) {
      params = params.set('weekEnd', weekEnd);
    }
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/schedule-generator`,
      { params }
    );
  }

  generateStaffSchedule(payload: { weekStart: string; weekEnd?: string; notes?: string; generatedBy?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/schedule-generator`,
      payload
    );
  }

  updateStaffScheduleEntry(scheduleId: string, entryId: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/schedule-generator/${scheduleId}/entries/${entryId}`,
      payload
    );
  }

  deleteStaffScheduleEntry(scheduleId: string, entryId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/schedule-generator/${scheduleId}/entries/${entryId}`
    );
  }

  deleteStaffScheduleWeek(scheduleId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/schedule-generator/${scheduleId}`
    );
  }

  getMyStaffSchedule(staffId: string, weekStart: string): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('weekStart', weekStart);
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}/my-schedule`,
      { params }
    );
  }

  respondToStaffSchedule(staffId: string, entryId: string, responseStatus: 'accepted' | 'rejected', responseNote?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}/schedule-response`,
      { entryId, responseStatus, responseNote }
    );
  }

  requestScheduleSwap(staffId: string, entryId: string, targetEntryId: string, reason?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/staff/${staffId}/request-swap`,
      { entryId, targetEntryId, reason }
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

  getHotelChats(page = 1, limit = 50, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('vendorType', 'hotel')
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<any[]>>(
      `${API_URL}/customers/vendor-chats-by-vendor/${this.hotelId}`,
      { params, headers: this.getHotelVendorHeaders() }
    );
  }

  sendHotelChatReply(chatId: string, message: string, vendorName?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/customers/vendor-chats/${chatId}/vendor-reply`,
      { message, vendorName },
      { headers: this.getHotelVendorHeaders() }
    );
  }

  markHotelChatRead(chatId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/customers/vendor-chats/${chatId}/read-vendor`,
      {},
      { headers: this.getHotelVendorHeaders() }
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

  // ==================== HOTEL AMENITY SERVICES ====================
  getAmenityServices(page = 1, limit = 100, category?: string, includeInactive = false): Observable<ApiResponse<HotelAmenityService[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeInactive', includeInactive.toString());

    if (category) params = params.set('category', category);

    return this.http.get<ApiResponse<HotelAmenityService[]>>(
      `${API_URL}/hotels/${this.hotelId}/amenity-services`,
      { params }
    );
  }

  getAmenityServiceById(serviceId: string): Observable<ApiResponse<HotelAmenityService>> {
    return this.http.get<ApiResponse<HotelAmenityService>>(
      `${API_URL}/hotels/${this.hotelId}/amenity-services/${serviceId}`
    );
  }

  createAmenityService(serviceData: HotelAmenityService): Observable<ApiResponse<HotelAmenityService>> {
    return this.http.post<ApiResponse<HotelAmenityService>>(
      `${API_URL}/hotels/${this.hotelId}/amenity-services`,
      serviceData
    );
  }

  updateAmenityService(serviceId: string, serviceData: Partial<HotelAmenityService>): Observable<ApiResponse<HotelAmenityService>> {
    return this.http.put<ApiResponse<HotelAmenityService>>(
      `${API_URL}/hotels/${this.hotelId}/amenity-services/${serviceId}`,
      serviceData
    );
  }

  deleteAmenityService(serviceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/amenity-services/${serviceId}`
    );
  }

  updateHotelServiceOrderStatus(bookingId: string, orderId: string, status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'): Observable<any> {
    return this.http.put(
      `${API_URL}/hotel-bookings/${bookingId}/hotel-service-orders/${orderId}/status`,
      { status }
    );
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

  createHotelReview(hotelId: string, review: {
    bookingId: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    rating: number;
    title: string;
    comment: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${hotelId}/reviews`, review);
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

  getPublicHotels(page = 1, limit = 10, location?: string, checkIn?: string, checkOut?: string, guests?: number): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (location) params = params.set('location', location);
    if (checkIn) params = params.set('checkIn', checkIn);
    if (checkOut) params = params.set('checkOut', checkOut);
    if (guests) params = params.set('guests', guests.toString());

    const url = `${API_URL}/hotels/public/search`;
    console.log('🔗 Public Hotels Search API Request:', { url, params: { page, limit, location, checkIn, checkOut, guests } });

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

  // ==================== DEVICES ====================
  getAllDevices(page = 1, limit = 10, status?: string, deviceType?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status !== undefined) params = params.set('status', status);
    if (deviceType) params = params.set('deviceType', deviceType);

    return this.http.get<ApiResponse<any[]>>(`${API_URL}/hotels/${this.hotelId}/devices`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch devices:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getDeviceById(deviceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/devices/${deviceId}`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch device:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createDevice(deviceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/devices`, deviceData).pipe(
      catchError((error) => {
        console.error('❌ Failed to create device:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateDevice(deviceId: string, deviceData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/devices/${deviceId}`, deviceData).pipe(
      catchError((error) => {
        console.error('❌ Failed to update device:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateDeviceStatus(deviceId: string, status: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/devices/${deviceId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('❌ Failed to update device status:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  deleteDevice(deviceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/devices/${deviceId}`).pipe(
      catchError((error) => {
        console.error('❌ Failed to delete device:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  registerDevices(devices: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/devices/register`, devices).pipe(
      catchError((error) => {
        console.error('❌ Failed to register devices:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== AVAILABILITY CALENDAR ====================
  updateRoomAvailability(roomId: string, date: Date, status: string): Observable<ApiResponse<any>> {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/availability`,
      { date: dateStr, status }
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to update room availability:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  bulkUpdateAvailability(updates: any[]): Observable<ApiResponse<any>> {
    const formattedUpdates = updates.map(u => ({
      roomId: u.roomId,
      date: u.date.toISOString().split('T')[0],
      status: u.status
    }));

    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/availability/bulk-update`,
      { updates: formattedUpdates }
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to bulk update availability:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getAvailabilityCalendar(month: number, year: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/availability/calendar`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch calendar:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  // ==================== PRICING MANAGEMENT ====================
  getPricingRates(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch pricing rates:', error);
        return of({ status: 'error', data: { baseRates: [], seasonalRates: [], discounts: [], specialOffers: [] }, message: error.message });
      })
    );
  }

  createBaseRate(rateData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/base-rates`,
      rateData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to create base rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateBaseRate(rateId: string, rateData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/base-rates/${rateId}`,
      rateData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to update base rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  deleteRate(rateId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/base-rates/${rateId}`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to delete rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createSeasonalRate(seasonData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/seasonal`,
      seasonData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to create seasonal rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateSeasonalRate(seasonId: string, seasonData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/seasonal/${seasonId}`,
      seasonData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to update seasonal rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  deleteSeason(seasonId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/seasonal/${seasonId}`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to delete seasonal rate:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createDiscount(discountData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/discounts`,
      discountData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to create discount:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateDiscount(discountId: string, discountData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/discounts/${discountId}`,
      discountData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to update discount:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  deleteDiscount(discountId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/discounts/${discountId}`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to delete discount:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createSpecialOffer(offerData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/special-offers`,
      offerData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to create special offer:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateSpecialOffer(offerId: string, offerData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/special-offers/${offerId}`,
      offerData
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to update special offer:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  deleteSpecial(specialId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/pricing/special-offers/${specialId}`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to delete special offer:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== TUYA DEVICES ====================
  /**
   * Get device status from Tuya
   * Returns real-time status of motion sensors and other IoT devices
   */
  getDeviceStatus(deviceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/devices/${deviceId}/status`
    ).pipe(
      tap((data) => {
        console.log('✅ Device status retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch device status:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Get device logs from Tuya
   * Returns logs and calculated durations for motion sensor events
   */
  getDeviceLogs(deviceId: string, startTime?: number, endTime?: number, codes?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();

    if (startTime) params = params.set('start_time', startTime.toString());
    if (endTime) params = params.set('end_time', endTime.toString());
    if (codes) params = params.set('codes', codes);

    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/devices/${deviceId}/logs`,
      { params }
    ).pipe(
      tap((data) => {
        console.log('✅ Device logs retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch device logs:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Get device shadow properties from Tuya
   * Returns detailed device properties and configuration
   */
  getDeviceShadowProperties(deviceId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/devices/${deviceId}/shadow`
    ).pipe(
      tap((data) => {
        console.log('✅ Device shadow properties retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch device shadow properties:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== ROOM AVAILABILITY ====================
  checkRoomAvailability(roomId: string, checkInDate: Date, checkOutDate: Date): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('checkInDate', checkInDate.toISOString())
      .set('checkOutDate', checkOutDate.toISOString());

    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/check-availability/${roomId}`,
      { params }
    ).pipe(
      tap((data) => {
        console.log('✅ Room availability checked:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to check room availability:', error);
        return of({
          status: 'error',
          data: { isAvailable: false },
          message: error.message
        } as ApiResponse<any>);
      })
    );
  }

  // ==================== SMART LOCK ACCESS ====================
  /**
   * Create smart lock access for a confirmed booking
   * Generates access token, backup PIN, and QR code
   */
  createSmartLockAccess(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/smart-lock/create-access/${bookingId}`,
      { hotelId: this.hotelId }
    ).pipe(
      tap((data) => {
        console.log('✅ Smart lock access created:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to create smart lock access:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Unlock room using access token
   */
  unlockRoom(accessToken: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/smart-lock/unlock`,
      { accessToken }
    ).pipe(
      tap((data) => {
        console.log('✅ Room unlocked successfully:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to unlock room:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Unlock room using backup PIN
   */
  unlockWithPin(backupPin: string, bookingNumber: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/smart-lock/unlock-with-pin`,
      { backupPin, bookingNumber }
    ).pipe(
      tap((data) => {
        console.log('✅ Room unlocked with PIN:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to unlock with PIN:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Get unlock attempt history for a booking
   */
  getUnlockHistory(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/smart-lock/history/${bookingId}`
    ).pipe(
      tap((data) => {
        console.log('✅ Unlock history retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch unlock history:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Revoke smart lock access for a booking
   */
  revokeSmartLockAccess(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/smart-lock/revoke/${bookingId}`,
      {}
    ).pipe(
      tap((data) => {
        console.log('✅ Smart lock access revoked:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to revoke smart lock access:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getBookingSmartLockAccess(bookingId: string): Observable<ApiResponse<BookingSmartLockAccessData>> {
    return this.http.get<ApiResponse<BookingSmartLockAccessData>>(
      `${API_URL}/smart-lock/access/${bookingId}`
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch booking smart lock access:', error);
        return of({ status: 'error', data: null as any, message: error.message });
      })
    );
  }

  /**
   * Get smart access grants for this hotel.
   */
  getSmartAccessGrants(subjectType?: 'guest' | 'staff', status = 'active'): Observable<ApiResponse<SmartAccessGrantRecord[]>> {
    let params = new HttpParams().set('status', status);
    if (subjectType) {
      params = params.set('subjectType', subjectType);
    }

    return this.http.get<ApiResponse<SmartAccessGrantRecord[]>>(
      `${API_URL}/hotels/${this.hotelId}/smart-access/grants`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch smart access grants:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getStaffKeyAccessWorkspaceData(): Observable<ApiResponse<StaffKeyAccessWorkspaceData>> {
    return forkJoin({
      security: this.getRoomSecurityOverview(),
      grants: this.getSmartAccessGrants('staff', 'active')
    }).pipe(
      map(({ security, grants }) => ({
        status: security.status === 'success' && grants.status === 'success' ? 'success' : 'error',
        message: security.message || grants.message,
        data: {
          summary: security.data?.summary || this.getEmptyRoomSecuritySummary(),
          contactlessRooms: (security.data?.rooms || []).filter((room) => room.contactlessReady),
          grants: Array.isArray(grants.data) ? grants.data : []
        }
      })),
      catchError((error) => {
        console.error('❌ Failed to load staff key access workspace:', error);
        return of({
          status: 'error',
          message: error.message,
          data: {
            summary: this.getEmptyRoomSecuritySummary(),
            contactlessRooms: [],
            grants: []
          }
        });
      })
    );
  }

  /**
   * Assign a temporary smart lock key to a staff member for a room.
   */
  assignStaffSmartAccess(payload: {
    staffId: string;
    roomId: string;
    validFrom: string;
    validUntil: string;
    notes?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/smart-access/staff`,
      payload
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to assign staff smart access:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Revoke an existing smart access grant.
   */
  revokeSmartAccessGrant(grantId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/smart-access/${grantId}/revoke`,
      {}
    ).pipe(
      catchError((error) => {
        console.error('❌ Failed to revoke smart access grant:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== AUTO-ASSIGNMENT ====================
  /**
   * Get devices assigned to a specific room
   */
  getRoomDevices(roomId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/devices`
    ).pipe(
      tap((data) => {
        console.log('✅ Room devices retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch room devices:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Get auto-assignment suggestion for a room based on type
   */
  getAutoAssignmentSuggestion(roomId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/device-suggestion`
    ).pipe(
      tap((data) => {
        console.log('✅ Auto-assignment suggestion retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to get suggestion:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Get available unassigned devices for a room
   */
  getAvailableDevicesForRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/available-devices`
    ).pipe(
      tap((data) => {
        console.log('✅ Available devices retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to get available devices:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Auto-assign devices to a room
   */
  autoAssignDevices(
    roomId: string,
    options: { includeRequired: boolean; includeRecommended: boolean; includeOptional: boolean }
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/rooms/${roomId}/auto-assign`,
      options
    ).pipe(
      tap((data) => {
        console.log('✅ Devices auto-assigned:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to auto-assign:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Bulk auto-assign devices to multiple rooms
   */
  bulkAutoAssignDevices(roomIds: string[], options: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bulk-auto-assign`,
      { roomIds, ...options }
    ).pipe(
      tap((data) => {
        console.log('✅ Bulk auto-assignment completed:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed bulk auto-assignment:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== AUTO-CONFIRMATION BOOKING ====================

  /**
   * Get hotel auto-confirmation setting
   */
  getHotelAutoConfirmationSetting(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/settings/auto-confirmation`
    ).pipe(
      tap((data) => {
        console.log('✅ Auto-confirmation setting retrieved:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to fetch auto-confirmation setting:', error);
        return of({ status: 'error', data: { autoConfirmationEnabled: false }, message: error.message });
      })
    );
  }

  /**
   * Update hotel auto-confirmation setting
   */
  updateHotelAutoConfirmationSetting(enabled: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/settings/auto-confirmation`,
      { autoConfirmationEnabled: enabled }
    ).pipe(
      tap((data) => {
        console.log('✅ Auto-confirmation setting updated:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to update auto-confirmation setting:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  /**
   * Create booking with auto-confirmation and identity verification
   * This handles the complete flow: create booking -> verify identity -> generate smart lock access
   */
  createBookingWithAutoConfirmation(bookingData: any, identityVerification: any): Observable<ApiResponse<any>> {
    // Add customer ID to booking data and map field names
    const user = this.authService.getCurrentUser();

    const enrichedBookingData = {
      // Map frontend field names to backend expected names
      customerId: user?._id,
      roomId: bookingData.roomId,
      hotelId: bookingData.hotelId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      roomCount: bookingData.roomCount,
      totalPrice: bookingData.totalPrice,
      customerName: bookingData.customerName,
      customerEmail: user?.email || bookingData.customerEmail,
      customerPhone: bookingData.customerPhone
    };

    console.log('📝 Creating contactless booking with enriched data:', enrichedBookingData);
    console.log('🏨 Hotel ID:', this.hotelId);
    console.log('👤 Customer ID:', user?._id);

    return this.http.post<ApiResponse<any>>(
      `${API_URL}/hotels/${this.hotelId}/bookings/auto-confirm`,
      {
        booking: enrichedBookingData,
        identity: identityVerification
      }
    ).pipe(
      tap((data) => {
        console.log('✅ Booking created with auto-confirmation:', data.data);
      }),
      catchError((error) => {
        console.error('❌ Failed to create booking with auto-confirmation:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== REVENUE ====================
  getRevenue(page = 1, limit = 10, type?: string, status?: string, guestName?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    if (guestName) params = params.set('guestName', guestName);

    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch revenue:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getRevenueStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue/stats`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch revenue stats:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getIncomeReport(period: 'daily' | 'monthly' | 'custom', date?: string, endDate?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('period', period);

    if (date) {
      params = params.set('date', date);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue/report`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch income report:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  sendIncomeReportEmail(recipientEmail: string, period: 'daily' | 'monthly' | 'custom', date?: string, endDate?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue/report/email`, {
      recipientEmail,
      period,
      date,
      endDate
    }).pipe(
      catchError((error) => {
        console.error('❌ Failed to send income report email:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createTransaction(transactionData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue`, transactionData).pipe(
      catchError((error) => {
        console.error('❌ Failed to create transaction:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  updateTransactionStatus(transactionId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/revenue/${transactionId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('❌ Failed to update transaction status:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== STAFF LOGS ====================
  getStaffLogs(page = 1, limit = 20, action?: string, staffId?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (action) params = params.set('action', action);
    if (staffId) params = params.set('staffId', staffId);

    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/staff-logs`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch staff logs:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getStaffLogsStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/staff-logs/stats`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch staff logs stats:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createStaffLog(logData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/staff-logs`, logData).pipe(
      catchError((error) => {
        console.error('❌ Failed to create staff log:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== PRE-ARRIVAL CHECK-IN ====================
  getPreCheckins(page = 1, limit = 10, status?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/pre-checkin`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch pre-checkins:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getCheckInStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/pre-checkin/stats`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch check-in stats:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  createPreCheckin(checkinData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/pre-checkin`, checkinData).pipe(
      catchError((error) => {
        console.error('❌ Failed to create pre-checkin:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  verifyGuestIdentity(checkinId: string, verifiedBy: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/pre-checkin/${checkinId}/verify`, { verifiedBy }).pipe(
      catchError((error) => {
        console.error('❌ Failed to verify guest identity:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  completeCheckIn(checkinId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/pre-checkin/${checkinId}/complete`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to complete check-in:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  // ==================== ANALYTICS ====================
  getAnalyticsStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/analytics/stats`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch analytics stats:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

  getOccupancyTrend(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/analytics/occupancy-trend`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch occupancy trend:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getRevenueTrend(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/analytics/revenue-trend`).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch revenue trend:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  getOccupancyData(page = 1, limit = 10): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/analytics/occupancy-data`, { params }).pipe(
      catchError((error) => {
        console.error('❌ Failed to fetch occupancy data:', error);
        return of({ status: 'error', data: [], message: error.message });
      })
    );
  }

  recalculateOccupancy(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/hotels/${this.hotelId}/analytics/recalculate`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to recalculate occupancy:', error);
        return of({ status: 'error', data: null, message: error.message });
      })
    );
  }

}
