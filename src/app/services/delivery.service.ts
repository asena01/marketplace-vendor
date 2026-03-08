import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending-verification';
  isVerified: boolean;
  activeProviders: number;
  logo?: string;
  capabilities?: {
    maxWeight?: { value: number; unit: string };
    refrigerated?: boolean;
    fragileItemsHandling?: boolean;
  };
}

export interface DeliveryConfiguration {
  _id?: string;
  providerId: string;
  providerType: string;
  businessName: string;
  selectedDeliveryPartners?: Array<{
    partnerId: string | { _id: string; name: string; email: string; phone: string; status: string };
    isDefault: boolean;
    priority: number;
    addedAt: string;
  }>;
  offerDelivery: boolean;
  deliveryOptions?: Array<{
    name: string;
    enabled: boolean;
    deliveryTimeMin: number;
    deliveryTimeMax: number;
    timeUnit: string;
    priceMultiplier: number;
  }>;
  serviceCoverage?: Array<{
    areaName: string;
    zoneId: string;
    enabled: boolean;
    minDeliveryTime: number;
    maxDeliveryTime: number;
    customPricing?: number;
  }>;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  policies?: {
    minOrderValue?: number;
    maxOrderValue?: number;
    freeDeliveryAbove?: number;
  };
  stats?: {
    totalDeliveries: number;
    successfulDeliveries: number;
    averageDeliveryTime: number;
    customerSatisfactionRating: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/delivery-admin'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/delivery-admin';

  constructor(private http: HttpClient) {}

  // Get all active delivery partners
  getDeliveryPartners(): Observable<{ success: boolean; data: DeliveryPartner[] }> {
    return this.http.get<{ success: boolean; data: DeliveryPartner[] }>(`${this.apiUrl}/partners?status=active`);
  }

  // Get vendor's delivery configuration
  getDeliveryConfig(providerId: string): Observable<{ success: boolean; data: DeliveryConfiguration }> {
    return this.http.get<{ success: boolean; data: DeliveryConfiguration }>(`${this.apiUrl}/config/${providerId}`);
  }

  // Update vendor's delivery configuration
  updateDeliveryConfig(providerId: string, config: Partial<DeliveryConfiguration>): Observable<{ success: boolean; data: DeliveryConfiguration }> {
    return this.http.put<{ success: boolean; data: DeliveryConfiguration }>(`${this.apiUrl}/config/${providerId}`, config);
  }

  // Add delivery partner to vendor's list
  selectDeliveryPartner(providerId: string, deliveryPartnerId: string, isDefault: boolean = false): Observable<{ success: boolean; data: DeliveryConfiguration }> {
    return this.http.post<{ success: boolean; data: DeliveryConfiguration }>(
      `${this.apiUrl}/config/${providerId}/select-partner`,
      { deliveryPartnerId, isDefault }
    );
  }

  // Remove delivery partner from vendor's list
  removeDeliveryPartner(providerId: string, partnerId: string): Observable<{ success: boolean; data: DeliveryConfiguration }> {
    return this.http.delete<{ success: boolean; data: DeliveryConfiguration }>(
      `${this.apiUrl}/config/${providerId}/partner/${partnerId}`
    );
  }

  // Set default delivery partner
  setDefaultDeliveryPartner(providerId: string, partnerId: string): Observable<{ success: boolean; data: DeliveryConfiguration }> {
    return this.http.patch<{ success: boolean; data: DeliveryConfiguration }>(
      `${this.apiUrl}/config/${providerId}/default-partner/${partnerId}`,
      {}
    );
  }

  // Calculate delivery cost
  calculateDeliveryCost(request: {
    zoneId: string;
    distance: number;
    weight: number;
    itemCount: number;
    deliveryType: string;
    providerId: string;
  }): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/calculate-cost`, request);
  }

  // Get delivery zones
  getDeliveryZones(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/zones`);
  }

  // ============================================
  // LEGACY DELIVERY SERVICE METHODS (for old pages)
  // ============================================

  getDeliveryMethods(): any {
    return [];
  }

  getServiceTypes(): any {
    return [];
  }

  getPackageSizes(): any {
    return [];
  }

  createDelivery(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deliveries`, orderData);
  }

  getDeliveryById(deliveryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/deliveries/${deliveryId}`);
  }

  getOrders(page: number, limit: number, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/deliveries`, { params });
  }

  getServiceStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`);
  }

  getCouriers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/couriers?page=${page}&limit=${limit}`);
  }

  updateCourierStatus(courierId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/couriers/${courierId}/status`, { status });
  }
}
