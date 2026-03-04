import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface GymEquipment {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  discountPrice?: number;
  icon?: string;
  stock: number;
  rating: { average: number; count: number };
  images?: string[];
  thumbnail?: string;
  features?: string[];
  targetMuscles?: string[];
  specifications?: any;
  vendorName?: string;
  isFeatured?: boolean;
}

export interface GymResponse {
  status: string;
  data?: GymEquipment[] | GymEquipment | null;
  pagination?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymEquipmentService {
  private apiUrl = 'https://us-central1-uni-backend01.cloudfunctions.net/api/gym-equipment';

  constructor(private http: HttpClient) {}

  getAllEquipment(page: number = 1, limit: number = 10, filters?: any): Observable<GymResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.fitnessLevel) params = params.set('fitnessLevel', filters.fitnessLevel);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);

    return this.http.get<GymResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching equipment:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getFeatured(limit: number = 6): Observable<GymResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<GymResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByCategory(category: string, page: number = 1, limit: number = 10): Observable<GymResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<GymResponse>(`${this.apiUrl}/category/${category}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by category:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByFitnessLevel(level: string, page: number = 1, limit: number = 10): Observable<GymResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<GymResponse>(`${this.apiUrl}/fitness-level/${level}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by fitness level:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByTargetMuscle(muscle: string, page: number = 1, limit: number = 10): Observable<GymResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<GymResponse>(`${this.apiUrl}/target-muscle/${muscle}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by target muscle:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getEquipmentById(id: string): Observable<GymResponse> {
    return this.http.get<GymResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching item:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  createEquipment(data: any): Observable<GymResponse> {
    return this.http.post<GymResponse>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.error('Error creating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  updateEquipment(id: string, data: any): Observable<GymResponse> {
    return this.http.put<GymResponse>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  deleteEquipment(id: string): Observable<GymResponse> {
    return this.http.delete<GymResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  addReview(id: string, review: any): Observable<GymResponse> {
    return this.http.post<GymResponse>(`${this.apiUrl}/${id}/review`, review).pipe(
      catchError((error) => {
        console.error('Error adding review:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  getCategories() {
    return [
      { name: 'Dumbbells', id: 'dumbbells', icon: '🏋️', items: '320+' },
      { name: 'Cardio', id: 'cardio', icon: '🏃', items: '180+' },
      { name: 'Barbells', id: 'barbells', icon: '⚒️', items: '120+' },
      { name: 'Resistance', id: 'resistance', icon: '🤸', items: '210+' },
      { name: 'Benches', id: 'benches', icon: '🪑', items: '95+' },
      { name: 'Racks', id: 'racks', icon: '📦', items: '85+' },
      { name: 'Machines', id: 'machines', icon: '⚙️', items: '150+' },
      { name: 'Accessories', id: 'accessories', icon: '🎽', items: '380+' }
    ];
  }

  getFitnessLevels() {
    return ['beginner', 'intermediate', 'advanced', 'all-levels'];
  }

  getTargetMuscles() {
    return ['chest', 'back', 'biceps', 'triceps', 'shoulders', 'legs', 'core', 'glutes', 'cardio'];
  }
}
