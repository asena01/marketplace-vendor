import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Appointment Interface
export interface Appointment {
  _id?: string;
  id?: string;
  providerId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  durationUnit: 'minutes' | 'hours';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Staff Interface
export interface ServiceStaff {
  _id?: string;
  id?: string;
  providerId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string; // e.g., "Haircut", "Massage", "Training"
  bio?: string;
  profileImage?: string;
  experience: number; // years
  rating: number;
  reviews: number;
  status: 'active' | 'inactive' | 'on-leave';
  certifications?: string[];
  workingHours?: {
    dayOfWeek: number; // 0-6 (Sun-Sat)
    startTime: string;
    endTime: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

// Service Provider Profile Interface
export interface ServiceProvider {
  _id?: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
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
    totalAppointments: number;
    completedAppointments: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    totalStaff: number;
    totalClients: number;
  };
  status: string;
  isVerified: boolean;
  openingTime?: string;
  closingTime?: string;
  operatingDays?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response Interface
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
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
export class ServiceProviderService {
  private apiUrl = 'http://localhost:5001/service-providers';
  private appointmentsUrl = 'http://localhost:5001/appointments';
  private staffUrl = 'http://localhost:5001/service-staff';
  /*private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/service-providers';
  private appointmentsUrl = 'https://api-qpczzmaezq-uc.a.run.app/appointments';
  private staffUrl = 'https://api-qpczzmaezq-uc.a.run.app/service-staff';*/

  constructor(private http: HttpClient) {}

  // ============ PROVIDER PROFILE METHODS ============

  /**
   * Get service provider profile
   */
  getProviderProfile(providerId: string): Observable<ApiResponse<ServiceProvider>> {
    return this.http.get<ApiResponse<ServiceProvider>>(`${this.apiUrl}/${providerId}`).pipe(
      catchError((error) => {
        console.error('Error fetching provider profile:', error);
        return of({ status: 'error', data: undefined });
      })
    );
  }

  /**
   * Update service provider profile
   */
  updateProviderProfile(providerId: string, profile: Partial<ServiceProvider>): Observable<ApiResponse<ServiceProvider>> {
    return this.http.put<ApiResponse<ServiceProvider>>(`${this.apiUrl}/${providerId}`, profile).pipe(
      catchError((error) => {
        console.error('Error updating provider profile:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Get provider statistics
   */
  getProviderStats(providerId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${providerId}/stats`).pipe(
      catchError((error) => {
        console.error('Error fetching provider stats:', error);
        return of({ status: 'error', data: undefined });
      })
    );
  }

  // ============ APPOINTMENT METHODS ============

  /**
   * Get all appointments for a provider
   */
  getProviderAppointments(providerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Appointment[]>>(this.appointmentsUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching appointments:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get appointment by ID
   */
  getAppointmentById(appointmentId: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.appointmentsUrl}/${appointmentId}`).pipe(
      catchError((error) => {
        console.error('Error fetching appointment:', error);
        return of({ status: 'error', data: undefined });
      })
    );
  }

  /**
   * Create new appointment
   */
  createAppointment(appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.appointmentsUrl, appointment).pipe(
      catchError((error) => {
        console.error('Error creating appointment:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Update appointment
   */
  updateAppointment(appointmentId: string, appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.appointmentsUrl}/${appointmentId}`, appointment).pipe(
      catchError((error) => {
        console.error('Error updating appointment:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Update appointment status
   */
  updateAppointmentStatus(appointmentId: string, status: string): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.appointmentsUrl}/${appointmentId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating appointment status:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Cancel appointment
   */
  cancelAppointment(appointmentId: string, reason?: string): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.appointmentsUrl}/${appointmentId}/cancel`, { reason }).pipe(
      catchError((error) => {
        console.error('Error cancelling appointment:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Delete appointment
   */
  deleteAppointment(appointmentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.appointmentsUrl}/${appointmentId}`).pipe(
      catchError((error) => {
        console.error('Error deleting appointment:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Assign staff to appointment
   */
  assignStaffToAppointment(appointmentId: string, staffId: string): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.appointmentsUrl}/${appointmentId}/assign-staff`, { staffId }).pipe(
      catchError((error) => {
        console.error('Error assigning staff:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Get available time slots for a service
   */
  getAvailableSlots(providerId: string, serviceId: string, date: string): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('serviceId', serviceId)
      .set('date', date);

    return this.http.get<ApiResponse<any>>(`${this.appointmentsUrl}/available-slots`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching available slots:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // ============ STAFF METHODS ============

  /**
   * Get all staff members for a provider
   */
  getProviderStaff(providerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<ServiceStaff[]>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<ServiceStaff[]>>(this.staffUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching staff:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get staff member by ID
   */
  getStaffById(staffId: string): Observable<ApiResponse<ServiceStaff>> {
    return this.http.get<ApiResponse<ServiceStaff>>(`${this.staffUrl}/${staffId}`).pipe(
      catchError((error) => {
        console.error('Error fetching staff member:', error);
        return of({ status: 'error', data: undefined });
      })
    );
  }

  /**
   * Create new staff member
   */
  createStaff(staff: Partial<ServiceStaff>): Observable<ApiResponse<ServiceStaff>> {
    return this.http.post<ApiResponse<ServiceStaff>>(this.staffUrl, staff).pipe(
      catchError((error) => {
        console.error('Error creating staff member:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Update staff member
   */
  updateStaff(staffId: string, staff: Partial<ServiceStaff>): Observable<ApiResponse<ServiceStaff>> {
    return this.http.put<ApiResponse<ServiceStaff>>(`${this.staffUrl}/${staffId}`, staff).pipe(
      catchError((error) => {
        console.error('Error updating staff member:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Update staff status
   */
  updateStaffStatus(staffId: string, status: 'active' | 'inactive' | 'on-leave'): Observable<ApiResponse<ServiceStaff>> {
    return this.http.put<ApiResponse<ServiceStaff>>(`${this.staffUrl}/${staffId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating staff status:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Delete staff member
   */
  deleteStaff(staffId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.staffUrl}/${staffId}`).pipe(
      catchError((error) => {
        console.error('Error deleting staff member:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  // ============ CLIENT METHODS (using CustomerService pattern) ============

  /**
   * Get clients (customers) for a provider
   * Note: This integrates with customer service - provider gets list of customers who booked
   */
  getProviderClients(providerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${providerId}/clients`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching clients:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get client details
   */
  getClientDetails(clientId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/clients/${clientId}`).pipe(
      catchError((error) => {
        console.error('Error fetching client details:', error);
        return of({ status: 'error', data: undefined });
      })
    );
  }

  /**
   * Add note to client
   */
  addClientNote(clientId: string, note: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/clients/${clientId}/notes`, { note }).pipe(
      catchError((error) => {
        console.error('Error adding client note:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Get client booking history
   */
  getClientAppointmentHistory(clientId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/clients/${clientId}/appointments`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching client appointment history:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // ============ BADGE COUNT METHODS ============

  /**
   * Get badge counts for sidenav
   */
  getBadgeCounts(providerId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${providerId}/badge-counts`).pipe(
      catchError((error) => {
        console.error('Error fetching badge counts:', error);
        return of({
          status: 'error',
          data: {
            pendingAppointments: 0,
            pendingReviews: 0,
            activeIncidents: 0,
            unreadNotifications: 0
          }
        });
      })
    );
  }

  /**
   * Get unread notifications count
   */
  getUnreadNotificationsCount(providerId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${providerId}/notifications/unread-count`).pipe(
      catchError((error) => {
        console.error('Error fetching unread count:', error);
        return of({ status: 'error', data: { count: 0 } });
      })
    );
  }

  /**
   * Get notifications for provider
   */
  getNotifications(providerId: string, page: number = 1, limit: number = 20): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${providerId}/notifications`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching notifications:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.appointmentsUrl}/../notifications/${notificationId}/read`, {}).pipe(
      catchError((error) => {
        console.error('Error marking notification as read:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(providerId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${providerId}/notifications/mark-all-read`, {}).pipe(
      catchError((error) => {
        console.error('Error marking all as read:', error);
        return of({ status: 'error', message: error.error?.message });
      })
    );
  }
}
