import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
export class AdminService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/admin'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/admin';

  constructor(private http: HttpClient) {}

  // Helper method to get admin headers
  private getAdminHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    const adminRole = localStorage.getItem('adminRole');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId || '',
      'x-admin-role': adminRole || ''
    });
  }

  // ============================================
  // ORGANIZATIONS
  // ============================================

  getOrganizations(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/organizations?page=${page}&limit=${limit}`,
      { headers: this.getAdminHeaders() }
    );
  }

  getOrganizationById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/organizations/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createOrganization(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/organizations`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  updateOrganization(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/organizations/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  verifyOrganization(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/organizations/${id}/verify`,
      {},
      { headers: this.getAdminHeaders() }
    );
  }

  suspendOrganization(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/organizations/${id}/suspend`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  deleteOrganization(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/organizations/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // USERS
  // ============================================

  getUsers(page: number = 1, limit: number = 10, userType?: string): Observable<ApiResponse<any[]>> {
    let url = `${this.apiUrl}/users?page=${page}&limit=${limit}`;
    if (userType) {
      url += `&userType=${userType}`;
    }
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getAdminHeaders() });
  }

  getUserById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/users/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  updateUser(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/users/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  suspendUser(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/users/${id}/suspend`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/users/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // PAYMENTS
  // ============================================

  getPayments(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<any[]>> {
    let url = `${this.apiUrl}/payments?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getAdminHeaders() });
  }

  getPaymentById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/payments/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  processPayment(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/payments/process`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  refundPayment(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/payments/${id}/refund`,
      {},
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // DEVICES
  // ============================================

  getDevices(page: number = 1, limit: number = 10, deviceType?: string): Observable<ApiResponse<any[]>> {
    let url = `${this.apiUrl}/devices?page=${page}&limit=${limit}`;
    if (deviceType) {
      url += `&deviceType=${deviceType}`;
    }
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getAdminHeaders() });
  }

  updateDeviceStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/devices/${id}/status`,
      { status },
      { headers: this.getAdminHeaders() }
    );
  }

  createDevice(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/devices`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  deleteDevice(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/devices/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // ANALYTICS
  // ============================================

  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/analytics/stats`,
      { headers: this.getAdminHeaders() }
    );
  }

  getRevenueByType(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/analytics/revenue-by-type`,
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // SETTINGS
  // ============================================

  getSettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/settings`,
      { headers: this.getAdminHeaders() }
    );
  }

  updateSettings(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/settings`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }
}
