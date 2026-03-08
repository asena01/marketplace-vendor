import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  DeliveryServiceDefinition,
  getDeliveryServicesForBusinessType,
  calculateDeliveryPrice,
  getDeliveryServiceById
} from './delivery-service-definitions';

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
  private baseApiUrl = 'http://localhost:5001'; // Base API for non-restaurant endpoints
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

  // ==================== DELIVERY SERVICE DEFINITIONS ====================

  /**
   * Get available delivery services for a business type
   * @param businessType The type of business (restaurant, retail, hotel, etc.)
   */
  getAvailableServices(businessType: 'restaurant' | 'retail' | 'hotel' | 'service' | 'tours' | 'warehouse'): DeliveryServiceDefinition[] {
    return getDeliveryServicesForBusinessType(businessType);
  }

  /**
   * Calculate delivery price based on service and distance/weight
   * @param service The delivery service definition
   * @param distance Distance in kilometers
   * @param weight Weight in kilograms
   */
  calculatePrice(service: DeliveryServiceDefinition, distance: number, weight: number): number {
    return calculateDeliveryPrice(service, distance, weight);
  }

  /**
   * Get delivery service by ID
   * @param serviceId The service ID
   */
  getServiceById(serviceId: string): DeliveryServiceDefinition | undefined {
    return getDeliveryServiceById(serviceId);
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

  // ==================== DRIVER TRACKING ====================

  // Get driver current location
  getDriverLocation(driverId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}/location`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching driver location:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Update driver location
  updateDriverLocation(driverId: string, latitude: number, longitude: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}/location`,
      { latitude, longitude }
    ).pipe(
      catchError((error) => {
        console.error('Error updating driver location:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get active delivery orders with driver location
  getActiveDeliveries(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/orders/active-deliveries`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching active deliveries:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // ==================== DELIVERY ANALYTICS ====================

  // Get delivery performance stats
  getDeliveryPerformanceStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/performance-stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching performance stats:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get driver performance stats
  getDriverPerformanceStats(driverId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/drivers/${driverId}/performance`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching driver performance:', error);
        return of({ status: 'error', data: null });
      })
    );
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

  // Get delivery trends (time-based)
  getDeliveryTrends(days: number = 7): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/trends?days=${days}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery trends:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // ==================== CUSTOMER SUPPORT ====================

  // Get all support tickets
  getSupportTickets(page: number = 1, limit: number = 20, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching support tickets:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Create support ticket
  createSupportTicket(ticketData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets`,
      ticketData
    ).pipe(
      catchError((error) => {
        console.error('Error creating support ticket:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Update support ticket
  updateSupportTicket(ticketId: string, updates: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets/${ticketId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating support ticket:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Add message to support ticket
  addSupportMessage(ticketId: string, message: string, attachments?: string[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets/${ticketId}/messages`,
      { message, attachments }
    ).pipe(
      catchError((error) => {
        console.error('Error adding support message:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get support ticket messages
  getSupportTicketMessages(ticketId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets/${ticketId}/messages`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching support messages:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Close support ticket
  closeSupportTicket(ticketId: string, resolution: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/support-tickets/${ticketId}/close`,
      { resolution }
    ).pipe(
      catchError((error) => {
        console.error('Error closing support ticket:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // ==================== LEGACY DELIVERY METHODS ====================
  // These methods support the old delivery pages and will be replaced
  // when the delivery dashboard is redesigned

  // Get service statistics (legacy)
  getServiceStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching service stats:', error);
        return of({ status: 'error', data: {} });
      })
    );
  }

  // Get couriers list (legacy)
  getCouriers(page: number = 1, limit: number = 20): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/couriers`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching couriers:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Update courier status (legacy)
  updateCourierStatus(courierId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/couriers/${courierId}`,
      { status }
    ).pipe(
      catchError((error) => {
        console.error('Error updating courier status:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get orders (legacy - different from getDeliveryOrders)
  getOrders(page: number = 1, limit: number = 20, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/orders`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get delivery methods (legacy)
  getDeliveryMethods(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/methods`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery methods:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get service types (legacy)
  getServiceTypes(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/service-types`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching service types:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get package sizes (legacy)
  getPackageSizes(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/package-sizes`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching package sizes:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Create delivery (legacy)
  createDelivery(deliveryData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/create`,
      deliveryData
    ).pipe(
      catchError((error) => {
        console.error('Error creating delivery:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Get delivery by ID (legacy)
  getDeliveryById(deliveryId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery/${deliveryId}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // ==================== SERVICE-BASED DELIVERY SYSTEM ====================

  /**
   * Get available delivery services for this business
   * Fetches from backend or returns predefined services
   */
  getDeliveryServices(businessType?: string): Observable<ApiResponse<DeliveryServiceDefinition[]>> {
    const params = new HttpParams()
      .set('businessType', businessType || 'restaurant');

    return this.http.get<ApiResponse<DeliveryServiceDefinition[]>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery services:', error);
        // Return predefined services as fallback
        return of({
          status: 'success',
          data: this.getAvailableServices('restaurant')
        });
      })
    );
  }

  /**
   * Get a specific delivery service by ID
   */
  getDeliveryService(serviceId: string): Observable<ApiResponse<DeliveryServiceDefinition>> {
    return this.http.get<ApiResponse<DeliveryServiceDefinition>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services/${serviceId}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery service:', error);
        const service = this.getServiceById(serviceId);
        return of({
          status: service ? 'success' : 'error',
          data: service as any
        } as any);
      })
    );
  }

  /**
   * Create a custom delivery service
   */
  createDeliveryService(service: Partial<DeliveryServiceDefinition>): Observable<ApiResponse<DeliveryServiceDefinition>> {
    return this.http.post<ApiResponse<DeliveryServiceDefinition>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services`,
      service
    ).pipe(
      catchError((error) => {
        console.error('Error creating delivery service:', error);
        return of({ status: 'error', data: {} } as any);
      })
    );
  }

  /**
   * Update a delivery service
   */
  updateDeliveryService(serviceId: string, updates: Partial<DeliveryServiceDefinition>): Observable<ApiResponse<DeliveryServiceDefinition>> {
    return this.http.put<ApiResponse<DeliveryServiceDefinition>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services/${serviceId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating delivery service:', error);
        return of({ status: 'error', data: {} } as any);
      })
    );
  }

  /**
   * Delete a delivery service
   */
  deleteDeliveryService(serviceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services/${serviceId}`
    ).pipe(
      catchError((error) => {
        console.error('Error deleting delivery service:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Calculate delivery price for a service
   * Can be called on frontend or backend
   */
  calculateDeliveryPrice(serviceId: string, distance: number, weight: number): Observable<ApiResponse<{ price: number; breakdown: any }>> {
    const params = new HttpParams()
      .set('serviceId', serviceId)
      .set('distance', distance.toString())
      .set('weight', weight.toString());

    return this.http.get<ApiResponse<{ price: number; breakdown: any }>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-services/calculate-price`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error calculating delivery price:', error);
        // Fallback to local calculation
        const service = this.getServiceById(serviceId);
        if (service) {
          const price = this.calculatePrice(service, distance, weight);
          return of({
            status: 'success',
            data: { price, breakdown: { service: service.name, distance, weight } }
          });
        }
        return of({ status: 'error', data: { price: 0, breakdown: {} } } as any);
      })
    );
  }

  /**
   * Create a delivery order using a specific service
   */
  createDeliveryOrderWithService(serviceId: string, orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-orders/${serviceId}`,
      orderData
    ).pipe(
      catchError((error) => {
        console.error('Error creating delivery order:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get delivery estimates (time and cost)
   */
  getDeliveryEstimate(serviceId: string, pickupLocation: string, deliveryLocation: string, weight: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('serviceId', serviceId)
      .set('pickupLocation', pickupLocation)
      .set('deliveryLocation', deliveryLocation)
      .set('weight', weight.toString());

    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${this.restaurantId}/delivery-estimate`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error getting delivery estimate:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * ==================== DELIVERY PROVIDER SERVICES ====================
   * Methods for managing services offered by delivery providers
   */

  /**
   * Get all services offered by a delivery provider
   */
  getDeliveryProviderServices(deliveryId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseApiUrl}/delivery-providers/${deliveryId}/services`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching provider services:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Create a new service for delivery provider
   */
  createDeliveryProviderService(deliveryId: string, serviceData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseApiUrl}/delivery-providers/${deliveryId}/services`,
      serviceData
    ).pipe(
      catchError((error) => {
        console.error('Error creating provider service:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Update a service offered by delivery provider
   */
  updateDeliveryProviderService(deliveryId: string, serviceId: string, updates: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseApiUrl}/delivery-providers/${deliveryId}/services/${serviceId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating provider service:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Delete a service offered by delivery provider
   */
  deleteDeliveryProviderService(deliveryId: string, serviceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseApiUrl}/delivery-providers/${deliveryId}/services/${serviceId}`
    ).pipe(
      catchError((error) => {
        console.error('Error deleting provider service:', error);
        return of({ status: 'error', data: null });
      })
    );
  }
}
