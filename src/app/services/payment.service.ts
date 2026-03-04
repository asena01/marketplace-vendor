import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CheckoutRequest {
  items: any[];
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CheckoutResponse {
  status: string;
  data?: {
    sessionId: string;
    orderId: string;
    url: string;
  };
  message?: string;
}

export interface SessionDetails {
  id: string;
  paymentStatus: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  clientReferenceId: string;
}

export interface Order {
  orderId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export interface PaymentIntentRequest {
  amount: number;
  email: string;
}

export interface PaymentIntentResponse {
  status: string;
  data?: {
    clientSecret: string;
  };
  message?: string;
}

// Legacy interfaces for compatibility with existing components
export interface PaymentMethod {
  id: string;
  name: string;
  type?: string;
  icon?: string;
  description?: string;
}

export interface PaymentRequest {
  amount?: number;
  currency?: string;
  description?: string;
  orderId?: string;
  paymentMethod?: PaymentMethod | string;
  paymentMethodId?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  cardDetails?: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    cardholderName?: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
  };
  mobileMoneyDetails?: {
    provider?: string;
    phoneNumber?: string;
  };
  walletDetails?: {
    walletId?: string;
  };
  // Cart and customer info
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    image?: string;
  }>;
  userId?: string;
  userEmail?: string;
  customerName?: string;
  storeName?: string;
}

export interface PaymentResponse {
  status: string;
  message: string;
  success?: boolean;
  transactionId?: string;
  amount?: number;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Use relative path for proxy compatibility (works with Builder.io Mac app)
  private apiUrl = 'https://us-central1-uni-backend01.cloudfunctions.net/api/payments';

  constructor(private http: HttpClient) {}

  /**
   * Create a checkout session and redirect to Stripe Checkout
   */
  createCheckoutSession(checkoutData: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, checkoutData).pipe(
      catchError((error) => {
        console.error('Error creating checkout session:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to create checkout session'
        });
      })
    );
  }

  /**
   * Dummy redirect (Stripe replacement)
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    // For dummy API, just log the redirect
    console.log('📍 Redirect to dummy checkout:', sessionId);
  }

  /**
   * Get session details from backend
   */
  getSessionDetails(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/session/${sessionId}`).pipe(
      catchError((error) => {
        console.error('Error retrieving session:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to retrieve session'
        });
      })
    );
  }

  /**
   * Get order details
   */
  getOrder(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/order/${orderId}`).pipe(
      catchError((error) => {
        console.error('Error retrieving order:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to retrieve order'
        });
      })
    );
  }

  /**
   * Get orders by email
   */
  getOrdersByEmail(email: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/orders/${email}?page=${page}&limit=${limit}`)
      .pipe(
        catchError((error) => {
          console.error('Error retrieving orders:', error);
          return of({
            status: 'error',
            data: [],
            message: error.error?.message || 'Failed to retrieve orders'
          });
        })
      );
  }

  /**
   * Create a payment intent for manual payment processing
   */
  createPaymentIntent(data: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/intent`, data).pipe(
      catchError((error) => {
        console.error('Error creating payment intent:', error);
        return of({
          status: 'error',
          message: error.error?.message || 'Failed to create payment intent'
        });
      })
    );
  }

  /**
   * Legacy method: Process payment (for backward compatibility)
   */
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    console.log('🚀 Sending payment request to backend:', request);
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, request).pipe(
      catchError((error) => {
        console.error('❌ HTTP Error processing payment:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        return of({
          status: 'error',
          message: error.error?.message || error.message || 'Payment processing failed'
        });
      })
    );
  }

  /**
   * Legacy method: Get payment methods (for backward compatibility)
   */
  getPaymentMethods(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/methods`).pipe(
      catchError((error) => {
        console.error('Error retrieving payment methods:', error);
        return of({
          status: 'error',
          data: []
        });
      })
    );
  }

  /**
   * Legacy method: Validate card number
   */
  validateCardNumber(cardNumber: string): boolean {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Legacy method: Validate CVV
   */
  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Legacy method: Validate expiry date
   */
  validateExpiryDate(month: string, year: string): boolean {
    const now = new Date();
    // Month should be 0-indexed for Date constructor, so subtract 1
    // Also set day to last day of the month to include the entire month
    const monthNum = parseInt(month, 10) - 1; // Convert 1-12 to 0-11
    const yearNum = parseInt(year, 10);

    // Create date for the last day of the expiry month
    const expiryDate = new Date(yearNum, monthNum + 1, 0);
    return expiryDate > now;
  }
}
