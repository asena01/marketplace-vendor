import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Furniture {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: 'living-room' | 'bedroom' | 'kitchen' | 'office' | 'outdoor' | 'decor';
  icon?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: { average: number; count: number };
  images?: string[];
  thumbnail?: string;
  features?: string[];
  material?: string[];
  color?: string[];
  dimensions?: { width: number; height: number; depth: number; unit: string };
  weight?: { value: number; unit: string };
  vendorName?: string;
  isFeatured?: boolean;
}

export interface FurnitureResponse {
  status: string;
  data?: Furniture[] | Furniture | null;
  pagination?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FurnitureService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/furniture'
  // NEW: Local Node.js/Express backend
  //private apiUrl = 'http://localhost:5001/furniture';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/furniture';
  constructor(private http: HttpClient) {}

  // Get all furniture with filters
  getAllFurniture(page: number = 1, limit: number = 10, filters?: any): Observable<FurnitureResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<FurnitureResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching furniture:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get featured furniture
  getFeaturedFurniture(limit: number = 6): Observable<FurnitureResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<FurnitureResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured furniture:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get by category
  getByCategory(category: string, page: number = 1, limit: number = 10): Observable<FurnitureResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<FurnitureResponse>(`${this.apiUrl}/category/${category}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching furniture by category:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // Get single furniture
  getFurnitureById(id: string): Observable<FurnitureResponse> {
    return this.http.get<FurnitureResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching furniture:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // Create furniture
  createFurniture(data: any): Observable<FurnitureResponse> {
    return this.http.post<FurnitureResponse>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.error('Error creating furniture:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  // Update furniture
  updateFurniture(id: string, data: any): Observable<FurnitureResponse> {
    return this.http.put<FurnitureResponse>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating furniture:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  // Delete furniture
  deleteFurniture(id: string): Observable<FurnitureResponse> {
    return this.http.delete<FurnitureResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting furniture:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  // Add review
  addReview(id: string, review: any): Observable<FurnitureResponse> {
    return this.http.post<FurnitureResponse>(`${this.apiUrl}/${id}/review`, review).pipe(
      catchError((error) => {
        console.error('Error adding review:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  // Get categories
  getCategories() {
    return [
      { name: 'Living Room', id: 'living-room', icon: '🛋️', count: '320+ items' },
      { name: 'Bedroom', id: 'bedroom', icon: '🛏️', count: '215+ items' },
      { name: 'Kitchen', id: 'kitchen', icon: '🪑', count: '180+ items' },
      { name: 'Office', id: 'office', icon: '🪑', count: '150+ items' },
      { name: 'Outdoor', id: 'outdoor', icon: '🏡', count: '95+ items' },
      { name: 'Decor', id: 'decor', icon: '🖼️', count: '420+ items' }
    ];
  }
}
