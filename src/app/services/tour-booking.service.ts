import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface TourBookingRequest {
  tourId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfParticipants: number;
  startDate?: string;
  endDate?: string;
  pricePerPerson: number;
  numberOfDays?: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress?: BillingAddress;
  specialRequirements?: string;
  notes?: string;
}

export interface TourBooking {
  _id?: string;
  id?: string;
  bookingNumber: string;
  tourName: string;
  destination: string;
  numberOfParticipants: number;
  totalPrice: number;
  paymentStatus: string;
  status: string;
  paymentReference: string;
}

export interface ApiResponse {
  status: string;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TourBookingService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/tour-bookings'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/tour-bookings';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/tour-bookings';
  constructor(private http: HttpClient) {}

  /**
   * Create tour booking with payment
   */
  createTourBooking(booking: TourBookingRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, booking).pipe(
      catchError((error) => {
        console.error('Error creating tour booking:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get booking details
   */
  getBookingDetails(bookingId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${bookingId}`).pipe(
      catchError((error) => {
        console.error('Error fetching booking details:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get customer bookings
   */
  getCustomerBookings(customerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/customer/${customerId}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching customer bookings:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get all bookings (admin)
   */
  getAllBookings(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    }

    return this.http.get<ApiResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching bookings:', error);
        return of({ status: 'error', data: [] });
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
   * Validate card number (basic Luhn algorithm)
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned: string = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum: number = 0;
    let isEven: boolean = false;

    for (let i: number = cleaned.length - 1; i >= 0; i--) {
      let digit: number = parseInt(cleaned.charAt(i), 10);

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
   * Validate expiry date
   */
  validateExpiryDate(month: string, year: string): boolean {
    const expMonth: number = parseInt(month, 10);
    const expYear: number = parseInt(year, 10);
    const now: Date = new Date();
    const currentYear: number = now.getFullYear();
    const currentMonth: number = now.getMonth() + 1;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return expMonth >= 1 && expMonth <= 12;
  }

  /**
   * Format card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned: string = cardNumber.replace(/\s/g, '');
    const lastFour: string = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
}
