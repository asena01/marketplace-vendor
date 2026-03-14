import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrackingInfo {
  hasTracking: boolean;
  orderId: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  shippingMethod: string;
  progressPercent: number;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  timeline: TrackingEvent[];
  customerName: string;
  customerAddress: string;
  message?: string;
}

export interface TrackingEvent {
  status: string;
  label: string;
  timestamp: Date | null;
  completed: boolean;
  description: string;
}

export interface TrackingResponse {
  success: boolean;
  data: TrackingInfo;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = 'http://localhost:5001/orders';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/tours';
  constructor(private http: HttpClient) {}

  /**
   * Get tracking information by order ID
   */
  getOrderTracking(orderId: string): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.apiUrl}/${orderId}/tracking`);
  }

  /**
   * Get tracking information by tracking number
   */
  getTrackingByNumber(trackingNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tracking/${trackingNumber}`);
  }

  /**
   * Generate tracking number for order
   */
  generateTracking(orderId: string, carrier?: string, shippingMethod?: string, estimatedDays?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/tracking/generate`, {
      carrier,
      shippingMethod,
      estimatedDays
    });
  }

  /**
   * Update tracking status
   */
  updateTrackingStatus(orderId: string, status: string, carrier?: string, location?: string, actualDelivery?: Date): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/tracking/status`, {
      status,
      carrier,
      location,
      actualDelivery
    });
  }

  /**
   * Get tracking progress percentage
   */
  getProgressPercent(status: string): number {
    const statusProgression = ['pending', 'processing', 'shipped', 'delivered'];
    const index = statusProgression.indexOf(status);
    return ((index + 1) / statusProgression.length) * 100;
  }

  /**
   * Calculate days until delivery
   */
  daysUntilDelivery(estimatedDelivery: Date): number {
    const today = new Date();
    const daysRemaining = Math.ceil((new Date(estimatedDelivery).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Order Placed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return labels[status] || 'Unknown Status';
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'processing': 'bg-blue-50 border-blue-200 text-blue-700',
      'shipped': 'bg-purple-50 border-purple-200 text-purple-700',
      'in_transit': 'bg-orange-50 border-orange-200 text-orange-700',
      'out_for_delivery': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'delivered': 'bg-green-50 border-green-200 text-green-700',
      'cancelled': 'bg-red-50 border-red-200 text-red-700',
      'returned': 'bg-gray-50 border-gray-200 text-gray-700'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-700';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'shopping_cart',
      'processing': 'hourglass_top',
      'shipped': 'local_shipping',
      'in_transit': 'directions_car',
      'out_for_delivery': 'delivery_dining',
      'delivered': 'check_circle',
      'cancelled': 'cancel',
      'returned': 'assignment_return'
    };
    return icons[status] || 'info';
  }
}
