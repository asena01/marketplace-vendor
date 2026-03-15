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
  // NEW: Local Node.js/Express backend 'https://api-qpczzmaezq-uc.a.run.app'
  //private apiUrl = 'http://localhost:5001/admin';
  //private apiUrl = 'http://localhost:5001/admin';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/admin';

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
  // VENDORS
  // ============================================

  getVendors(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse<any[]>> {
    let url = `${this.apiUrl}/vendors?page=${page}&limit=${limit}`;
    if (filters) {
      if (filters.vendorType) url += `&vendorType=${filters.vendorType}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.kycStatus) url += `&kycStatus=${filters.kycStatus}`;
      if (filters.search) url += `&search=${filters.search}`;
    }
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getAdminHeaders() });
  }

  getVendorById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createVendor(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/vendors`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  updateVendor(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  deleteVendor(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  approveVendor(id: string, notes?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}/approve`,
      { notes },
      { headers: this.getAdminHeaders() }
    );
  }

  rejectVendor(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}/reject`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  suspendVendor(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}/suspend`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  blockVendor(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${id}/block`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // VENDOR KYC
  // ============================================

  getVendorKyc(vendorId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/kyc`,
      { headers: this.getAdminHeaders() }
    );
  }

  updateVendorKyc(vendorId: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/kyc`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  approveVendorKyc(vendorId: string, notes?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/kyc/approve`,
      { notes },
      { headers: this.getAdminHeaders() }
    );
  }

  rejectVendorKyc(vendorId: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/kyc/reject`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // VENDOR PERFORMANCE
  // ============================================

  getVendorPerformance(vendorId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/performance`,
      { headers: this.getAdminHeaders() }
    );
  }

  updateVendorPerformance(vendorId: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/performance`,
      data,
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

  // ============================================
  // SETTLEMENT METHODS
  // ============================================

  getSettlements(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/settlements?page=${page}&limit=${limit}`,
      { headers: this.getAdminHeaders() }
    );
  }

  getSettlementById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/settlements/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createSettlement(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/settlements`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  updateSettlement(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/settlements/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  approveSettlement(id: string, notes?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/settlements/${id}/approve`,
      { notes },
      { headers: this.getAdminHeaders() }
    );
  }

  rejectSettlement(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/settlements/${id}/reject`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  deleteSettlement(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/settlements/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  getSettlementStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/settlements/stats`,
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // PAYOUT METHODS
  // ============================================

  getPayouts(page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/payouts?page=${page}&limit=${limit}`,
      { headers: this.getAdminHeaders() }
    );
  }

  getPayoutById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/payouts/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createPayout(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/payouts`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  processPayout(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/payouts/${id}/process`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  completePayout(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/payouts/${id}/complete`,
      {},
      { headers: this.getAdminHeaders() }
    );
  }

  retryPayout(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/payouts/${id}/retry`,
      {},
      { headers: this.getAdminHeaders() }
    );
  }

  cancelPayout(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/payouts/${id}/cancel`,
      { reason },
      { headers: this.getAdminHeaders() }
    );
  }

  // ============================================
  // ROLE & PERMISSION METHODS
  // ============================================

  getRoles(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/roles`,
      { headers: this.getAdminHeaders() }
    );
  }

  getRoleById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/roles/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createRole(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/roles`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  updateRole(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/roles/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/roles/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  getPermissions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/permissions`,
      { headers: this.getAdminHeaders() }
    );
  }

  getPermissionById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/permissions/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }

  createPermission(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/permissions`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  updatePermission(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/permissions/${id}`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  deletePermission(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/permissions/${id}`,
      { headers: this.getAdminHeaders() }
    );
  }
}
