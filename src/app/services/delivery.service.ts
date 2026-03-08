import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Driver {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: 'bike' | 'car' | 'truck';
  vehicleNumber?: string;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  currentOrders?: number;
  joinDate?: string;
}

export interface DeliveryOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: any[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryType: 'delivery' | 'pickup';
  assignedDriver?: Driver | string;
  driverId?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = 'http://localhost:5001/restaurants';
  private restaurantId: string = '';
  
  // Observable for real-time notifications
  private notificationsSubject = new BehaviorSubject<any>(null);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.setRestaurantId();
  }

  setRestaurantId(id?: string) {
    if (id) {
      this.restaurantId = id;
      localStorage.setItem('restaurantId', id);
    } else {
      const storedId = localStorage.getItem('restaurantId');
      if (storedId) {
        this.restaurantId = storedId;
      }
    }
  }

  // ==================== DELIVERY ORDERS ====================
  
  // Get all delivery orders
  getDeliveryOrders(page: number = 1, limit: number = 20, status?: string): Observable<ApiResponse<DeliveryOrder[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('deliveryType', 'delivery');

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<DeliveryOrder[]>>(
      `${this.apiUrl}/${this.restaurantId}/orders`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery orders:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get single delivery order
  getDeliveryOrder(orderId: string): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.get<ApiResponse<DeliveryOrder>>(
      `${this.apiUrl}/${this.restaurantId}/orders/${orderId}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery order:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // Update delivery order status
  updateDeliveryOrderStatus(orderId: string, status: string): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.put<ApiResponse<DeliveryOrder>>(
      `${this.apiUrl}/${this.restaurantId}/orders/${orderId}/status`,
      { status }
    ).pipe(
      catchError((error) => {
        console.error('Error updating order status:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // Assign driver to delivery order
  assignDriverToOrder(orderId: string, driverId: string): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.put<ApiResponse<DeliveryOrder>>(
      `${this.apiUrl}/${this.restaurantId}/orders/${orderId}/assign-driver`,
      { driverId }
    ).pipe(
      catchError((error) => {
        console.error('Error assigning driver:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // ==================== DRIVERS ====================

  // Get all drivers
  getDrivers(page: number = 1, limit: number = 20): Observable<ApiResponse<Driver[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Driver[]>>(
      `${this.apiUrl}/${this.restaurantId}/drivers`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching drivers:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get single driver
  getDriver(driverId: string): Observable<ApiResponse<Driver>> {
    return this.http.get<ApiResponse<Driver>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching driver:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // Create driver
  createDriver(driverData: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.http.post<ApiResponse<Driver>>(
      `${this.apiUrl}/${this.restaurantId}/drivers`,
      driverData
    ).pipe(
      catchError((error) => {
        console.error('Error creating driver:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // Update driver
  updateDriver(driverId: string, updates: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.http.put<ApiResponse<Driver>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating driver:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // Delete driver
  deleteDriver(driverId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}`
    ).pipe(
      catchError((error) => {
        console.error('Error deleting driver:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get driver stats
  getDriverStats(driverId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}/stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching driver stats:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // ==================== NOTIFICATIONS ====================

  // Emit notification
  emitNotification(notification: any) {
    this.notificationsSubject.next(notification);
  }

  // Get delivery stats
  getDeliveryStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery stats:', error);
        return of({ status: 'error', data: null });
      })
    );
  }
}
