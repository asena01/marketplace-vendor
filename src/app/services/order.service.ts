import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  _id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id?: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  shippingAddress: ShippingAddress;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  vendorId?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  carrier?: string;
  actualDelivery?: Date | string;
  trackingUrl?: string;
  trackingCreatedAt?: Date | string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: Order | Order[];
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
export class OrderService {
  //private apiUrl = 'http://localhost:5001/orders';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/orders';
  constructor(private http: HttpClient) {}

  /**
   * Get all orders for a vendor
   */
  getVendorOrders(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Observable<OrderResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<OrderResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Get single order by ID
   */
  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(
    vendorId: string,
    status: string,
    page: number = 1,
    limit: number = 20
  ): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status);

    return this.http.get<OrderResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Update order status
   */
  updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Observable<OrderResponse> {
    const payload = {
      status,
      ...(trackingNumber && { trackingNumber })
    };
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/status`, payload);
  }

  /**
   * Update order payment status
   */
  updatePaymentStatus(orderId: string, paymentStatus: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/payment-status`, {
      paymentStatus
    });
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string, reason?: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/cancel`, {
      reason
    });
  }

  /**
   * Get order statistics
   */
  getOrderStats(vendorId: string, dateRange?: string): Observable<any> {
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    return this.http.get<any>(`${this.apiUrl}/vendor/${vendorId}/stats`, { params });
  }

  /**
   * Search orders
   */
  searchOrders(vendorId: string, query: string, page: number = 1): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString());

    return this.http.get<OrderResponse>(`${this.apiUrl}/vendor/${vendorId}`, { params });
  }

  /**
   * Export orders
   */
  exportOrders(vendorId: string, format: 'csv' | 'pdf' = 'csv'): Observable<any> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/vendor/${vendorId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Add order note
   */
  addOrderNote(orderId: string, note: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/${orderId}/notes`, { note });
  }

  /**
   * Get order by custom order ID (not MongoDB _id)
   */
  getByOrderId(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/id/${orderId}`);
  }
}
