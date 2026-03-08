import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface HairProduct {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  serviceType: 'product' | 'service';
  price: number;
  icon?: string;
  rating: { average: number; count: number };
  images?: string[];
  thumbnail?: string;
  features?: string[];
  vendorName?: string;
}

export interface HairResponse {
  status: string;
  data?: HairProduct[] | HairProduct | null;
  pagination?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HairService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/hair'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/hair';

  constructor(private http: HttpClient) {}

  getAllHair(page: number = 1, limit: number = 10, filters?: any): Observable<HairResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.serviceType) params = params.set('serviceType', filters.serviceType);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);

    return this.http.get<HairResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching hair products:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getFeatured(limit: number = 6): Observable<HairResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<HairResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByCategory(category: string, page: number = 1, limit: number = 10): Observable<HairResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<HairResponse>(`${this.apiUrl}/category/${category}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by category:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByType(type: 'product' | 'service', page: number = 1, limit: number = 10): Observable<HairResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<HairResponse>(`${this.apiUrl}/type/${type}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by type:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getHairById(id: string): Observable<HairResponse> {
    return this.http.get<HairResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching item:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  createHair(data: any): Observable<HairResponse> {
    return this.http.post<HairResponse>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.error('Error creating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  updateHair(id: string, data: any): Observable<HairResponse> {
    return this.http.put<HairResponse>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  deleteHair(id: string): Observable<HairResponse> {
    return this.http.delete<HairResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  addReview(id: string, review: any): Observable<HairResponse> {
    return this.http.post<HairResponse>(`${this.apiUrl}/${id}/review`, review).pipe(
      catchError((error) => {
        console.error('Error adding review:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  getCategories() {
    return [
      { name: 'Human Hair', id: 'human-hair', icon: '💇', items: '450+' },
      { name: 'Extensions', id: 'extensions', icon: '✨', items: '320+' },
      { name: 'Wigs', id: 'wigs', icon: '👩‍🦰', items: '280+' },
      { name: 'Braiding Services', id: 'braiding-services', icon: '🪡', items: '120+' },
      { name: 'Styling Services', id: 'styling-services', icon: '💅', items: '95+' }
    ];
  }
}
