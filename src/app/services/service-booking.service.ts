import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ServiceBookingRequest {
  service: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  durationUnit?: string;
  serviceLocation: {
    address: string;
    city: string;
    area?: string;
    zipCode?: string;
    notes?: string;
  };
  quantity?: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  specialRequirements?: string;
  notes?: string;
}

export interface ServiceBooking {
  _id?: string;
  id?: string;
  bookingNumber: string;
  serviceName: string;
  customerName: string;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  pricing: {
    totalPrice: number;
  };
}

export interface ApiResponse {
  status: string;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceBookingService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/service-bookings'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/service-bookings';

  constructor(private http: HttpClient) {}

  /**
   * Create service booking with payment
   */
  createServiceBooking(booking: ServiceBookingRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, booking).pipe(
      catchError((error) => {
        console.error('Error creating service booking:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get booking details
   */
  getBookingDetails(bookingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${bookingId}`).pipe(
      catchError((error) => {
        console.error('Error fetching booking details:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get customer bookings
   */
  getCustomerBookings(customerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/customer/${customerId}?page=${page}&limit=${limit}`).pipe(
      catchError((error) => {
        console.error('Error fetching customer bookings:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get all bookings (admin)
   */
  getAllBookings(page: number = 1, limit: number = 10): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      catchError((error) => {
        console.error('Error fetching all bookings:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Update booking status
   */
  updateBookingStatus(bookingId: string, status: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${bookingId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating booking status:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking(bookingId: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${bookingId}/cancel`, {}).pipe(
      catchError((error) => {
        console.error('Error cancelling booking:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Verify payment
   */
  verifyPayment(bookingId: string, paymentReference: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/verify`, { bookingId, paymentReference }).pipe(
      catchError((error) => {
        console.error('Error verifying payment:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Rate service
   */
  rateService(bookingId: string, rating: number, review: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${bookingId}/rate`, { rating, review }).pipe(
      catchError((error) => {
        console.error('Error rating service:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

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

  /**
   * Validate expiry date
   */
  validateExpiryDate(month: string, year: string): boolean {
    const now = new Date();
    const expiryDate = new Date(parseInt(year), parseInt(month) - 1);
    return expiryDate > now;
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  }
}
