import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductReturn {
  _id?: string;
  id?: string;
  orderId: string;
  productId: string;
  customerId: string;
  customerName: string;
  reason: string; // Reason for return
  description: string; // Detailed description
  images?: string[]; // Images of the product
  refundAmount: number;
  returnStatus: 'pending' | 'approved' | 'rejected' | 'shipped' | 'received' | 'completed';
  shippingLabel?: string; // Return shipping label URL
  trackingNumber?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/returns'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/returns';

  constructor(private http: HttpClient) {}

  // Get all returns for a customer
  getMyReturns(page: number = 1, limit: number = 10): Observable<ApiResponse<ProductReturn[]>> {
    const customerId = localStorage.getItem('userId');
    return this.http.get<ApiResponse<ProductReturn[]>>(
      `${this.apiUrl}/customer/${customerId}?page=${page}&limit=${limit}`,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Get a specific return
  getReturnById(returnId: string): Observable<ApiResponse<ProductReturn>> {
    return this.http.get<ApiResponse<ProductReturn>>(
      `${this.apiUrl}/${returnId}`,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Create a return request
  createReturn(returnRequest: Partial<ProductReturn>): Observable<ApiResponse<ProductReturn>> {
    const customerId = localStorage.getItem('userId');
    const customerName = localStorage.getItem('userName') || 'Anonymous';

    const returnData = {
      ...returnRequest,
      customerId,
      customerName
    };

    return this.http.post<ApiResponse<ProductReturn>>(
      `${this.apiUrl}`,
      returnData,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Update return status (admin only)
  updateReturnStatus(returnId: string, status: string, adminNotes?: string): Observable<ApiResponse<ProductReturn>> {
    const data = {
      returnStatus: status,
      adminNotes: adminNotes || ''
    };

    return this.http.put<ApiResponse<ProductReturn>>(
      `${this.apiUrl}/${returnId}/status`,
      data,
      { headers: this.getAdminHeaders() }
    );
  }

  // Cancel a return request
  cancelReturn(returnId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${returnId}/cancel`,
      {},
      { headers: this.getCustomerHeaders() }
    );
  }

  // Get return reasons (predefined options)
  getReturnReasons(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/reasons`);
  }

  // Upload return images
  uploadReturnImage(file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ApiResponse<{ imageUrl: string }>>(
      `${this.apiUrl}/upload-image`,
      formData,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Get customer headers
  private getCustomerHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId || ''
    });
  }

  // Get admin headers
  private getAdminHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    const adminRole = localStorage.getItem('adminRole');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId || '',
      'x-admin-role': adminRole || ''
    });
  }
}
