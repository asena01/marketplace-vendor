import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReturnItem {
  _id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  reason: string;
}

export interface Return {
  _id?: string;
  returnId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: ReturnItem[];
  returnReason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'received' | 'completed' | 'closed';
  refundAmount: number;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed';
  shippingLabel?: string;
  trackingNumber?: string;
  vendorId?: string;
  approvedBy?: string;
  approvalDate?: string;
  receivedDate?: string;
  notes?: string;
  images?: string[]; // Images of returned items
  createdAt?: string;
  updatedAt?: string;
}

export interface ReturnReason {
  _id?: string;
  code: string;
  name: string;
  description: string;
  allowsPartialReturn: boolean;
  refundPercentage: number; // e.g., 100 for full refund
}

export interface ReturnResponse {
  success: boolean;
  message: string;
  data?: Return | Return[] | ReturnReason[];
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
export class ReturnService {
  private apiUrl = 'http://localhost:5001/returns';
  private reasonsUrl = 'http://localhost:5001/return-reasons';

  constructor(private http: HttpClient) {}

  // ==================== RETURN MANAGEMENT ====================

  /**
   * Get all returns for a vendor
   */
  getVendorReturns(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Observable<ReturnResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ReturnResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get return by ID
   */
  getReturnById(returnId: string): Observable<ReturnResponse> {
    return this.http.get<ReturnResponse>(`${this.apiUrl}/${returnId}`);
  }

  /**
   * Get returns by order ID
   */
  getOrderReturns(orderId: string): Observable<ReturnResponse> {
    return this.http.get<ReturnResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  /**
   * Create return request
   */
  createReturn(returnRequest: Partial<Return>): Observable<ReturnResponse> {
    return this.http.post<ReturnResponse>(`${this.apiUrl}`, returnRequest);
  }

  /**
   * Update return status
   */
  updateReturnStatus(returnId: string, status: string): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/status`, {
      status
    });
  }

  /**
   * Approve return request
   */
  approveReturn(returnId: string, notes?: string): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/approve`, {
      notes
    });
  }

  /**
   * Reject return request
   */
  rejectReturn(returnId: string, reason: string): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/reject`, {
      reason
    });
  }

  /**
   * Generate return shipping label
   */
  generateShippingLabel(returnId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${returnId}/shipping-label`, {});
  }

  /**
   * Mark return as received
   */
  markAsReceived(returnId: string, condition?: string): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/received`, {
      condition
    });
  }

  /**
   * Process return refund
   */
  processRefund(returnId: string): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/process-refund`, {});
  }

  /**
   * Add return images
   */
  addReturnImages(returnId: string, images: string[]): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.apiUrl}/${returnId}/images`, {
      images
    });
  }

  /**
   * Get returns by status
   */
  getReturnsByStatus(
    vendorId: string,
    status: string,
    page: number = 1,
    limit: number = 20
  ): Observable<ReturnResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status);

    return this.http.get<ReturnResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get return statistics
   */
  getReturnStats(vendorId: string, dateRange?: string): Observable<any> {
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/stats`, { params });
  }

  /**
   * Export returns
   */
  exportReturns(vendorId: string, format: 'csv' | 'pdf' = 'csv'): Observable<any> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/vendor/${vendorId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // ==================== RETURN REASONS ====================

  /**
   * Get all return reasons
   */
  getReturnReasons(): Observable<ReturnResponse> {
    return this.http.get<ReturnResponse>(`${this.reasonsUrl}`);
  }

  /**
   * Create return reason
   */
  createReturnReason(reason: Partial<ReturnReason>): Observable<ReturnResponse> {
    return this.http.post<ReturnResponse>(`${this.reasonsUrl}`, reason);
  }

  /**
   * Update return reason
   */
  updateReturnReason(reasonId: string, reason: Partial<ReturnReason>): Observable<ReturnResponse> {
    return this.http.patch<ReturnResponse>(`${this.reasonsUrl}/${reasonId}`, reason);
  }

  /**
   * Delete return reason
   */
  deleteReturnReason(reasonId: string): Observable<ReturnResponse> {
    return this.http.delete<ReturnResponse>(`${this.reasonsUrl}/${reasonId}`);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get return rate analytics
   */
  getReturnRateAnalytics(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/rate-analytics`);
  }

  /**
   * Get common return reasons
   */
  getCommonReturnReasons(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/common-reasons`);
  }
}
