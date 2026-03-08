import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ExternalDeliveryProvider {
  id: string;
  name: string;
  description: string;
  logo?: string;
  rating: number;
  totalDeliveries: number;
  
  // Coverage
  serviceCities: string[];
  coverageArea: string;
  
  // Pricing
  basePrice: number;
  perKmRate: number;
  minimumOrder?: number;
  estimatedDeliveryTime: number; // in minutes
  
  // Features
  features: {
    realTimeTracking: boolean;
    insurance: boolean;
    temperature_control: boolean;
    signature_required: boolean;
    scheduled_delivery: boolean;
  };
  
  // Service Types
  supportedCategories: ('food' | 'retail' | 'furniture' | 'packages' | 'pharmacy' | 'grocery')[];
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Contact
  website?: string;
  contactEmail: string;
  contactPhone: string;
  
  // Business Details
  businessName: string;
  taxId: string;
  operatingHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessDeliveryIntegration {
  id: string;
  businessId: string;
  businessType: 'restaurant' | 'retail' | 'hotel' | 'service' | 'warehouse';
  providerId: string;
  provider: ExternalDeliveryProvider;
  
  // Integration Status
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  
  // Custom Configuration
  commissionRate: number; // percentage
  apiKey?: string;
  webhookUrl?: string;
  customPricing?: {
    basePrice: number;
    perKmRate: number;
  };
  
  // Contract
  contractStartDate: Date;
  contractEndDate?: Date;
  autoRenew: boolean;
  
  // Performance Metrics
  totalOrders: number;
  successRate: number;
  averageRating: number;
  
  isDefault: boolean; // Default delivery service if business has multiple
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExternalDeliveryService {
  private apiUrl = 'http://localhost:5001';
  
  constructor(private http: HttpClient) {}

  // ==================== BROWSE AVAILABLE SERVICES ====================

  /**
   * Get all available delivery service providers
   */
  getAvailableProviders(
    city?: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Observable<ApiResponse<ExternalDeliveryProvider[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('isActive', 'true')
      .set('isVerified', 'true');

    if (city) {
      params = params.set('city', city);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ApiResponse<ExternalDeliveryProvider[]>>(
      `${this.apiUrl}/delivery-providers`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching delivery providers:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get provider details
   */
  getProviderDetails(providerId: string): Observable<ApiResponse<ExternalDeliveryProvider>> {
    return this.http.get<ApiResponse<ExternalDeliveryProvider>>(
      `${this.apiUrl}/delivery-providers/${providerId}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching provider details:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  /**
   * Search providers by name or city
   */
  searchProviders(query: string): Observable<ApiResponse<ExternalDeliveryProvider[]>> {
    const params = new HttpParams().set('search', query);
    
    return this.http.get<ApiResponse<ExternalDeliveryProvider[]>>(
      `${this.apiUrl}/delivery-providers/search`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error searching providers:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // ==================== MANAGE INTEGRATIONS ====================

  /**
   * Get business's integrated delivery services
   */
  getBusinessIntegrations(
    businessId: string,
    businessType: string
  ): Observable<ApiResponse<BusinessDeliveryIntegration[]>> {
    const params = new HttpParams().set('businessType', businessType);
    
    return this.http.get<ApiResponse<BusinessDeliveryIntegration[]>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching integrations:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Integrate delivery service with business
   */
  integrateDeliveryService(
    businessId: string,
    businessType: string,
    providerId: string,
    config?: Partial<BusinessDeliveryIntegration>
  ): Observable<ApiResponse<BusinessDeliveryIntegration>> {
    const payload = {
      providerId,
      ...config
    };

    return this.http.post<ApiResponse<BusinessDeliveryIntegration>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations`,
      payload
    ).pipe(
      catchError((error) => {
        console.error('Error integrating delivery service:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  /**
   * Update integration settings
   */
  updateIntegration(
    businessId: string,
    businessType: string,
    integrationId: string,
    updates: Partial<BusinessDeliveryIntegration>
  ): Observable<ApiResponse<BusinessDeliveryIntegration>> {
    return this.http.put<ApiResponse<BusinessDeliveryIntegration>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations/${integrationId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating integration:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  /**
   * Deactivate integration
   */
  deactivateIntegration(
    businessId: string,
    businessType: string,
    integrationId: string
  ): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations/${integrationId}`
    ).pipe(
      catchError((error) => {
        console.error('Error deactivating integration:', error);
        return of({ status: 'error', data: null } as ApiResponse<any>);
      })
    );
  }

  /**
   * Set default delivery service
   */
  setDefaultDeliveryService(
    businessId: string,
    businessType: string,
    integrationId: string
  ): Observable<ApiResponse<BusinessDeliveryIntegration>> {
    return this.http.put<ApiResponse<BusinessDeliveryIntegration>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations/${integrationId}/set-default`,
      {}
    ).pipe(
      catchError((error) => {
        console.error('Error setting default delivery service:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // ==================== PRICING & QUOTES ====================

  /**
   * Get price quote from provider
   */
  getDeliveryQuote(
    providerId: string,
    pickupLocation: string,
    deliveryLocation: string,
    weight: number,
    itemCount: number
  ): Observable<ApiResponse<{ price: number; estimatedTime: number; breakdown: any }>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('pickupLocation', pickupLocation)
      .set('deliveryLocation', deliveryLocation)
      .set('weight', weight.toString())
      .set('itemCount', itemCount.toString());

    return this.http.get<ApiResponse<{ price: number; estimatedTime: number; breakdown: any }>>(
      `${this.apiUrl}/delivery-quote`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error getting delivery quote:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // ==================== PROVIDER REGISTRATION ====================

  /**
   * Register as delivery service provider
   */
  registerAsProvider(providerData: Partial<ExternalDeliveryProvider>): Observable<ApiResponse<ExternalDeliveryProvider>> {
    return this.http.post<ApiResponse<ExternalDeliveryProvider>>(
      `${this.apiUrl}/delivery-providers/register`,
      providerData
    ).pipe(
      catchError((error) => {
        console.error('Error registering as provider:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  /**
   * Update provider profile
   */
  updateProviderProfile(
    providerId: string,
    updates: Partial<ExternalDeliveryProvider>
  ): Observable<ApiResponse<ExternalDeliveryProvider>> {
    return this.http.put<ApiResponse<ExternalDeliveryProvider>>(
      `${this.apiUrl}/delivery-providers/${providerId}`,
      updates
    ).pipe(
      catchError((error) => {
        console.error('Error updating provider profile:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // ==================== STATS & ANALYTICS ====================

  /**
   * Get integration performance stats
   */
  getIntegrationStats(
    businessId: string,
    businessType: string,
    integrationId: string
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${businessType}/${businessId}/delivery-integrations/${integrationId}/stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching integration stats:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get provider performance stats
   */
  getProviderStats(providerId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/delivery-providers/${providerId}/stats`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching provider stats:', error);
        return of({ status: 'error', data: null });
      })
    );
  }
}
