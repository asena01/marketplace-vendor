import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

// Force recompile

export interface ServiceFeatures {
  id?: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  serviceProvider: string;
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  basePrice: number;
  pricePerUnit?: number;
  priceUnit?: string;
  duration: string;
  serviceArea: string;
  location?: {
    city: string;
    area?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviews: number;
  features?: string[];
  certifications?: string[];
  cancellationPolicy?: string;
  refundPolicy?: string;
  insuranceIncluded?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  image?: string;
  _id?: string;
}

export interface ApiResponse {
  status: string;
  data: ServiceFeatures[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'https://us-central1-uni-backend01.cloudfunctions.net/api/services';

  constructor(private http: HttpClient) {}

  /**
   * Get all services with pagination and filters
   */
  getAllServices(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.city) {
        params = params.set('city', filters.city);
      }
      if (filters.minPrice) {
        params = params.set('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params = params.set('maxPrice', filters.maxPrice);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<ApiResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching services:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get featured services (top-rated)
   */
  getFeaturedServices(limit: number = 6): Observable<ApiResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured services:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get single service by ID
   */
  getServiceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching service:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string, page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/category/${category}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching services by category:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get services by city
   */
  getServicesByCity(city: string, page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/city/${city}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching services by city:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Search services
   */
  searchServices(query: string, category?: string, minPrice?: number, maxPrice?: number): Observable<ApiResponse> {
    let params = new HttpParams().set('q', query);

    if (category) {
      params = params.set('category', category);
    }
    if (minPrice) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/search`, { params }).pipe(
      catchError((error) => {
        console.error('Error searching services:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get provider services
   */
  getProviderServices(providerId: string, page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/provider/${providerId}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching provider services:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Create new service
   */
  createService(service: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, service).pipe(
      catchError((error) => {
        console.error('Error creating service:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update service
   */
  updateService(id: string, service: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, service).pipe(
      catchError((error) => {
        console.error('Error updating service:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete service
   */
  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting service:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update service rating
   */
  updateServiceRating(id: string, rating: number, reviews: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/rating`, { rating, reviews }).pipe(
      catchError((error) => {
        console.error('Error updating service rating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update service availability
   */
  updateServiceAvailability(id: string, availability: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/availability`, { availability }).pipe(
      catchError((error) => {
        console.error('Error updating service availability:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }
}
