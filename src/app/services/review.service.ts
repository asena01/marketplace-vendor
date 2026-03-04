import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductReview {
  _id?: string;
  id?: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[]; // Review images
  helpful: number; // Number of helpful votes
  verified: boolean; // Verified purchase
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'https://us-central1-uni-backend01.cloudfunctions.net/api/reviews';

  constructor(private http: HttpClient) {}

  // Get all reviews for a product
  getProductReviews(productId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<ProductReview[]>> {
    return this.http.get<ApiResponse<ProductReview[]>>(
      `${this.apiUrl}/product/${productId}?page=${page}&limit=${limit}`
    );
  }

  // Get average rating for a product
  getProductRating(productId: string): Observable<ApiResponse<{ rating: number; reviewCount: number }>> {
    return this.http.get<ApiResponse<{ rating: number; reviewCount: number }>>(
      `${this.apiUrl}/product/${productId}/rating`
    );
  }

  // Get customer's reviews
  getMyReviews(page: number = 1, limit: number = 10): Observable<ApiResponse<ProductReview[]>> {
    const customerId = localStorage.getItem('userId');
    return this.http.get<ApiResponse<ProductReview[]>>(
      `${this.apiUrl}/customer/${customerId}?page=${page}&limit=${limit}`,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Create a review
  createReview(review: Partial<ProductReview>): Observable<ApiResponse<ProductReview>> {
    const customerId = localStorage.getItem('userId');
    const customerName = localStorage.getItem('userName') || 'Anonymous';
    const customerEmail = localStorage.getItem('userEmail') || '';

    const reviewData = {
      ...review,
      customerId,
      customerName,
      customerEmail
    };

    return this.http.post<ApiResponse<ProductReview>>(
      `${this.apiUrl}`,
      reviewData,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Update a review
  updateReview(reviewId: string, review: Partial<ProductReview>): Observable<ApiResponse<ProductReview>> {
    return this.http.put<ApiResponse<ProductReview>>(
      `${this.apiUrl}/${reviewId}`,
      review,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Delete a review
  deleteReview(reviewId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${reviewId}`,
      { headers: this.getCustomerHeaders() }
    );
  }

  // Mark review as helpful
  markHelpful(reviewId: string): Observable<ApiResponse<ProductReview>> {
    return this.http.post<ApiResponse<ProductReview>>(
      `${this.apiUrl}/${reviewId}/helpful`,
      {},
      { headers: this.getCustomerHeaders() }
    );
  }

  // Get customer headers
  private getCustomerHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId || ''
    });
  }
}
