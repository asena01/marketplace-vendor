import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface PetProduct {
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
  brand?: string;
  vendorName?: string;
}

export interface PetsResponse {
  status: string;
  data?: PetProduct[] | PetProduct | null;
  pagination?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private apiUrl = 'https://us-central1-uni-backend01.cloudfunctions.net/api/pets';

  constructor(private http: HttpClient) {}

  getAllPets(page: number = 1, limit: number = 10, filters?: any): Observable<PetsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.petType) params = params.set('petType', filters.petType);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);

    return this.http.get<PetsResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching pets:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getFeatured(limit: number = 6): Observable<PetsResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<PetsResponse>(`${this.apiUrl}/featured`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching featured:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByCategory(category: string, page: number = 1, limit: number = 10): Observable<PetsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PetsResponse>(`${this.apiUrl}/category/${category}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by category:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getByPetType(petType: string, page: number = 1, limit: number = 10): Observable<PetsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PetsResponse>(`${this.apiUrl}/pettype/${petType}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching by pet type:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  getPetsById(id: string): Observable<PetsResponse> {
    return this.http.get<PetsResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching item:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  createPets(data: any): Observable<PetsResponse> {
    return this.http.post<PetsResponse>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.error('Error creating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  updatePets(id: string, data: any): Observable<PetsResponse> {
    return this.http.put<PetsResponse>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error) => {
        console.error('Error updating:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  deletePets(id: string): Observable<PetsResponse> {
    return this.http.delete<PetsResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  addReview(id: string, review: any): Observable<PetsResponse> {
    return this.http.post<PetsResponse>(`${this.apiUrl}/${id}/review`, review).pipe(
      catchError((error) => {
        console.error('Error adding review:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  getCategories() {
    return [
      { name: 'Dog Food', id: 'dog-food', icon: '🐕', items: '380+' },
      { name: 'Cat Food', id: 'cat-food', icon: '🐈', items: '320+' },
      { name: 'Pet Toys', id: 'pet-toys', icon: '🎾', items: '450+' },
      { name: 'Beds & Houses', id: 'beds-houses', icon: '🏠', items: '210+' },
      { name: 'Grooming', id: 'grooming', icon: '🛁', items: '150+' },
      { name: 'Healthcare', id: 'healthcare', icon: '💊', items: '180+' },
      { name: 'Accessories', id: 'accessories', icon: '🦴', items: '520+' },
      { name: 'Pet Services', id: 'pet-services', icon: '🐾', items: '120+' }
    ];
  }

  getPetTypes() {
    return ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'];
  }
}
