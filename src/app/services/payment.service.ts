import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentTransaction {
  _id?: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_money' | 'wallet';
  paymentGateway?: string; // e.g., 'stripe', 'paypal', 'flutterwave'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  description?: string;
  metadata?: any;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Refund {
  _id?: string;
  refundId: string;
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  refundMethod: string;
  notes?: string;
  vendorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id: string;
  type?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_money' | 'wallet';
  name: string;
  icon?: string;
  description?: string;
  last4?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | string;
  description?: string;
  metadata?: any;
  items?: any[];
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
  };
  mobileMoneyDetails?: {
    provider: string;
    phoneNumber: string;
  };
  walletDetails?: {
    walletProvider?: string;
    walletId: string;
  };
  [key: string]: any; // Allow additional properties
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: PaymentTransaction | PaymentTransaction[] | Refund | Refund[];
  transactionId?: string;
  amount?: number;
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
export class PaymentService {
  private apiUrl = 'http://localhost:5001/payments';
  private refundsUrl = 'http://localhost:5001/refunds';

  constructor(private http: HttpClient) {}

  // ==================== PAYMENT TRANSACTIONS ====================

  /**
   * Get all payments for a vendor
   */
  getVendorPayments(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Observable<PaymentResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaymentResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get payment by transaction ID
   */
  getPaymentByTransactionId(transactionId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/${transactionId}`);
  }

  /**
   * Get payments by status
   */
  getPaymentsByStatus(
    vendorId: string,
    status: string,
    page: number = 1,
    limit: number = 20
  ): Observable<PaymentResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status);

    return this.http.get<PaymentResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get payments for specific order
   */
  getOrderPayments(orderId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  /**
   * Record payment transaction
   */
  recordPayment(payment: Partial<PaymentTransaction>): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}`, payment);
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(transactionId: string, status: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.apiUrl}/${transactionId}/status`, {
      status
    });
  }

  /**
   * Get payment statistics
   */
  getPaymentStats(vendorId: string, dateRange?: string): Observable<any> {
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/stats`, { params });
  }

  /**
   * Get revenue summary
   */
  getRevenueSummary(vendorId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/revenue`, { params });
  }

  // ==================== REFUNDS ====================

  /**
   * Get all refunds for a vendor
   */
  getVendorRefunds(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Observable<PaymentResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaymentResponse>(`${this.refundsUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get refund by ID
   */
  getRefundById(refundId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.refundsUrl}/${refundId}`);
  }

  /**
   * Create refund request
   */
  createRefund(refund: Partial<Refund>): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.refundsUrl}`, refund);
  }

  /**
   * Process refund
   */
  processRefund(refundId: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.refundsUrl}/${refundId}/process`, {});
  }

  /**
   * Update refund status
   */
  updateRefundStatus(refundId: string, status: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.refundsUrl}/${refundId}/status`, {
      status
    });
  }

  /**
   * Get refunds for order
   */
  getOrderRefunds(orderId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.refundsUrl}/order/${orderId}`);
  }

  /**
   * Approve refund
   */
  approveRefund(refundId: string, notes?: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.refundsUrl}/${refundId}/approve`, {
      notes
    });
  }

  /**
   * Reject refund
   */
  rejectRefund(refundId: string, reason: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.refundsUrl}/${refundId}/reject`, {
      reason
    });
  }

  // ==================== ADDITIONAL PAYMENT METHODS ====================

  /**
   * Get available payment methods
   */
  getPaymentMethods(): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/methods`);
  }

  /**
   * Process payment
   */
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, paymentRequest);
  }

  /**
   * Create checkout session (for Stripe/external payment gateways)
   */
  createCheckoutSession(checkoutData: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/checkout-session`, checkoutData);
  }

  /**
   * Redirect to checkout (for external payment gateways)
   */
  redirectToCheckout(sessionId: string): Promise<void> {
    // This would typically redirect to an external checkout page
    return new Promise((resolve, reject) => {
      try {
        if (typeof window !== 'undefined') {
          window.location.href = `${this.apiUrl}/checkout/${sessionId}`;
          resolve();
        } else {
          reject(new Error('Window object not available'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // ==================== VALIDATION UTILITIES ====================

  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);

    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

    return expiryMonth >= 1 && expiryMonth <= 12;
  }
}
