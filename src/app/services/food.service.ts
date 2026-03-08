import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: number;
}

export interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
  icon: string;
  address: string;
  phone: string;
  hours?: string;
  isOpen: boolean;
  operatingHours?: {
    open: string;
    close: string;
  };
  menus?: MenuItem[];
}

export interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api/restaurants'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001/restaurants';

  constructor(private http: HttpClient) {}

  // GET all restaurants with filters and pagination
  getRestaurants(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse<Restaurant[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.city) params = params.set('city', filters.city);
      if (filters.cuisine) params = params.set('cuisine', filters.cuisine);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.isOpen !== undefined) params = params.set('isOpen', filters.isOpen.toString());
    }

    return this.http.get<ApiResponse<Restaurant[]>>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching restaurants:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // GET single restaurant with its menus
  getRestaurantById(restaurantId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}`).pipe(
      catchError((error) => {
        console.error('Error fetching restaurant:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // GET restaurant menu items
  getRestaurantMenus(restaurantId: string, page: number = 1, limit: number = 50, category?: string): Observable<ApiResponse<MenuItem[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ApiResponse<MenuItem[]>>(`${this.apiUrl}/${restaurantId}/menus`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching menus:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // POST create menu item (admin/restaurant)
  addMenuItem(restaurantId: string, menuItem: any): Observable<ApiResponse<MenuItem>> {
    return this.http.post<ApiResponse<MenuItem>>(`${this.apiUrl}/${restaurantId}/menus`, menuItem).pipe(
      catchError((error) => {
        console.error('Error adding menu item:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // PUT update menu item (admin/restaurant)
  updateMenuItem(restaurantId: string, menuItemId: string, updates: any): Observable<ApiResponse<MenuItem>> {
    return this.http.put<ApiResponse<MenuItem>>(`${this.apiUrl}/${restaurantId}/menus/${menuItemId}`, updates).pipe(
      catchError((error) => {
        console.error('Error updating menu item:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // DELETE menu item (admin/restaurant)
  deleteMenuItem(restaurantId: string, menuItemId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}/menus/${menuItemId}`).pipe(
      catchError((error) => {
        console.error('Error deleting menu item:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // POST create order
  createOrder(restaurantId: string, orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}/orders`, orderData).pipe(
      catchError((error) => {
        console.error('Error creating order:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // GET restaurant orders (admin/restaurant)
  getRestaurantOrders(restaurantId: string, page: number = 1, limit: number = 20, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${restaurantId}/orders`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  // GET single order
  getOrderById(restaurantId: string, orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}/orders/${orderId}`).pipe(
      catchError((error) => {
        console.error('Error fetching order:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // PUT update order status
  updateOrderStatus(restaurantId: string, orderId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}/orders/${orderId}/status`, { status }).pipe(
      catchError((error) => {
        console.error('Error updating order status:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  // POST create restaurant (admin)
  createRestaurant(restaurantData: any): Observable<ApiResponse<Restaurant>> {
    return this.http.post<ApiResponse<Restaurant>>(this.apiUrl, restaurantData).pipe(
      catchError((error) => {
        console.error('Error creating restaurant:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // PUT update restaurant (admin/restaurant)
  updateRestaurant(restaurantId: string, updates: any): Observable<ApiResponse<Restaurant>> {
    return this.http.put<ApiResponse<Restaurant>>(`${this.apiUrl}/${restaurantId}`, updates).pipe(
      catchError((error) => {
        console.error('Error updating restaurant:', error);
        return of({ status: 'error', data: null as any });
      })
    );
  }

  // DELETE restaurant (admin)
  deleteRestaurant(restaurantId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${restaurantId}`).pipe(
      catchError((error) => {
        console.error('Error deleting restaurant:', error);
        return of({ status: 'error', data: null });
      })
    );
  }
}
