import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-hotel-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Reviews & Ratings</h1>
        <p class="text-blue-100">See what your guests are saying</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading reviews...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Stats -->
      @if (reviews().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Average Rating</p>
            <p class="text-3xl font-bold text-slate-900">{{ getAverageRating() }}</p>
            <p class="mt-2 text-sm text-slate-500">out of 5.0</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Total Reviews</p>
            <p class="text-3xl font-bold text-slate-900">{{ reviews().length }}</p>
            <p class="mt-2 text-sm text-slate-500">from guests</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
            <p class="text-slate-600 text-sm font-medium mb-1">5-Star Reviews</p>
            <p class="text-3xl font-bold text-slate-900">{{ count5StarReviews() }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ getPercentage5Star() }}%</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Response Rate</p>
            <p class="text-3xl font-bold text-slate-900">{{ getResponseRate() }}%</p>
            <p class="mt-2 text-sm text-slate-500">responses given</p>
          </div>
        </div>
      }

      <!-- Reviews List -->
      <div class="space-y-4">
        @if (reviews().length === 0) {
          <div class="bg-slate-50 border border-slate-300 text-slate-700 px-4 py-8 rounded-lg text-center">
            <p class="text-lg font-semibold">No reviews yet</p>
            <p class="text-sm text-slate-600 mt-1">Reviews will appear here once your guests leave feedback</p>
          </div>
        } @else {
          @for (review of reviews(); track review._id) {
            <div class="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-slate-900">{{ review.guestName || 'Anonymous Guest' }}</h3>
                  <p class="text-sm text-slate-600">
                    {{ formatDate(review.createdAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getStarRating(review.rating) }}</span>
                  <span class="font-bold text-slate-900">{{ review.rating || 0 }}/5</span>
                </div>
              </div>

              <!-- Review Text -->
              <p class="text-slate-700 mb-4">{{ review.comment || 'No comment' }}</p>

              <!-- Room and Date Info -->
              <div class="flex flex-wrap gap-4 text-sm text-slate-600 border-t pt-4">
                <div>
                  <span class="font-semibold text-slate-900">Room:</span> {{ review.roomNumber || 'N/A' }}
                </div>
                <div>
                  <span class="font-semibold text-slate-900">Check-in:</span> {{ formatDate(review.checkInDate) || 'N/A' }}
                </div>
                <div>
                  <span class="font-semibold text-slate-900">Check-out:</span> {{ formatDate(review.checkOutDate) || 'N/A' }}
                </div>
              </div>

              <!-- Rating Categories -->
              @if (review.categories) {
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  @for (cat of getCategoryArray(review.categories); track cat.name) {
                    <div class="bg-gray-50 p-3 rounded">
                      <p class="text-xs text-slate-600 font-medium">{{ cat.name }}</p>
                      <p class="text-lg font-bold text-slate-900 mt-1">{{ cat.rating }}/5</p>
                    </div>
                  }
                </div>
              }

              <!-- Response -->
              @if (review.response) {
                <div class="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p class="text-sm font-semibold text-blue-900 mb-2">Your Response:</p>
                  <p class="text-sm text-slate-700">{{ review.response }}</p>
                  <p class="text-xs text-slate-600 mt-2">Responded on {{ formatDate(review.responseDate) }}</p>
                </div>
              } @else {
                <div class="mt-4">
                  <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    ➕ Write a Response
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: []
})
export class HotelReviewsComponent implements OnInit {
  reviews = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.hotelService.getReviews(1, 50).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.reviews.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.errorMessage.set('Failed to load reviews');
        this.isLoading.set(false);
      }
    });
  }

  getAverageRating(): string {
    if (this.reviews().length === 0) return '0.0';
    const sum = this.reviews().reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / this.reviews().length).toFixed(1);
  }

  count5StarReviews(): number {
    return this.reviews().filter(r => r.rating === 5).length;
  }

  getPercentage5Star(): number {
    if (this.reviews().length === 0) return 0;
    return Math.round((this.count5StarReviews() / this.reviews().length) * 100);
  }

  getResponseRate(): number {
    if (this.reviews().length === 0) return 0;
    const responded = this.reviews().filter(r => r.response).length;
    return Math.round((responded / this.reviews().length) * 100);
  }

  getStarRating(rating: number): string {
    const stars = Math.round(rating || 0);
    return '⭐'.repeat(Math.max(0, Math.min(5, stars)));
  }

  getCategoryArray(categories: any): any[] {
    if (!categories) return [];
    if (typeof categories === 'object' && !Array.isArray(categories)) {
      return Object.entries(categories).map(([name, rating]) => ({ name, rating }));
    }
    return [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
