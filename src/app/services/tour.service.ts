import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Itinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Location {
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Tour {
  _id?: string;
  id?: string;
  name: string;
  destination: string;
  price: number;
  duration: string;
  difficulty: string;
  groupSize: string;
  highlights: string[];
  includes: string[];
  image?: string;
  images?: string[];
  rating: number;
  reviews: number;
  maxParticipants?: number;
  currentParticipants?: number;
  description?: string;
  tourOperator?: string;
  operatorName?: string;
  operatorPhone?: string;
  operatorEmail?: string;
  location?: Location;
  itinerary?: Itinerary[];
  amenities?: string[];
  languages?: string[];
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse {
  status: string;
  data: Tour[];
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
export class TourService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/tours'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/tours';
  private agencyId: string = '';

  constructor(private http: HttpClient) {}

  /**
   * Set agency ID for tour operator
   */
  setAgencyId(id: string): void {
    this.agencyId = id;
  }

  /**
   * Get agency info
   */
  getAgencyInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/agency/${this.agencyId}`).pipe(
      catchError((error) => {
        console.error('Error fetching agency info:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get tour bookings
   */
  getBookings(page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/bookings`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching bookings:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get tour packages
   */
  getTourPackages(page: number = 1, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(`${this.apiUrl}/packages`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching tour packages:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get all tours with pagination and filters
   */
  getTours(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.destination) {
        params = params.set('destination', filters.destination);
      }
      if (filters.difficulty) {
        params = params.set('difficulty', filters.difficulty);
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
        console.error('Error fetching tours:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get featured tours (top-rated)
   */
  getFeaturedTours(limit: number = 4): Observable<ApiResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured tours:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get single tour by ID
   */
  getTourById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching tour:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Search tours
   */
  searchTours(query: string): Observable<ApiResponse> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse>(`${this.apiUrl}/search`, { params }).pipe(
      catchError((error) => {
        console.error('Error searching tours:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get tours by destination
   */
  getToursByDestination(destination: string, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse>(`${this.apiUrl}/destination/${destination}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching tours by destination:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Get tours by difficulty
   */
  getToursByDifficulty(difficulty: string, limit: number = 10): Observable<ApiResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse>(`${this.apiUrl}/difficulty/${difficulty}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching tours by difficulty:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Create new tour
   */
  createTour(tour: Tour): Observable<any> {
    return this.http.post<any>(this.apiUrl, tour).pipe(
      catchError((error) => {
        console.error('Error creating tour:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tour
   */
  updateTour(id: string, tour: Partial<Tour>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tour).pipe(
      catchError((error) => {
        console.error('Error updating tour:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete tour
   */
  deleteTour(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting tour:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tour rating
   */
  updateTourRating(id: string, rating: number, reviews: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/rating`, { rating, reviews }).pipe(
      catchError((error) => {
        console.error('Error updating tour rating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tour participants
   */
  updateTourParticipants(id: string, currentParticipants: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/participants`, { currentParticipants }).pipe(
      catchError((error) => {
        console.error('Error updating tour participants:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get destinations
   */
  getDestinations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/destinations`).pipe(
      catchError((error) => {
        console.error('Error fetching destinations:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Create destination
   */
  createDestination(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/destinations`, data).pipe(
      catchError((error) => {
        console.error('Error creating destination:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update destination
   */
  updateDestination(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/destinations/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating destination:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete destination
   */
  deleteDestination(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/destinations/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting destination:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get itinerary by ID
   */
  getItineraryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/itineraries/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching itinerary:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update itinerary
   */
  updateItinerary(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/itineraries/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating itinerary:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Create itinerary
   */
  createItinerary(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/itineraries`, data).pipe(
      catchError((error) => {
        console.error('Error creating itinerary:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get tour guides
   */
  getTourGuides(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tour-guides`).pipe(
      catchError((error) => {
        console.error('Error fetching tour guides:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Update tour guide
   */
  updateTourGuide(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tour-guides/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating tour guide:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Create tour guide
   */
  createTourGuide(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tour-guides`, data).pipe(
      catchError((error) => {
        console.error('Error creating tour guide:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete tour guide
   */
  deleteTourGuide(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tour-guides/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting tour guide:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tour package
   */
  updateTourPackage(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/packages/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating tour package:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Create tour package
   */
  createTourPackage(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/packages`, data).pipe(
      catchError((error) => {
        console.error('Error creating tour package:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tour package status
   */
  updateTourPackageStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/packages/${id}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating tour package status:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete tour package
   */
  deleteTourPackage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/packages/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting tour package:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Get travel documents
   */
  getTravelDocuments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/travel-documents`).pipe(
      catchError((error) => {
        console.error('Error fetching travel documents:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Update travel document status
   */
  updateTravelDocumentStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/travel-documents/${id}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating travel document status:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }
}
