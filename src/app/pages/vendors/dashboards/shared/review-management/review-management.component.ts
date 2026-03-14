import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  verified: boolean;
}

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Review Management</h1>
          <p class="text-slate-600 mt-2">Manage customer reviews and ratings</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Reviews</p>
          <p class="text-3xl font-bold text-slate-900">{{ reviews().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All time</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Pending Approval</p>
          <p class="text-3xl font-bold text-yellow-600">{{ getPendingReviews() }}</p>
          <p class="mt-2 text-sm text-yellow-600">Needs review</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Average Rating</p>
          <p class="text-3xl font-bold text-slate-900">{{ getAverageRating() }}/5.0</p>
          <p class="mt-2 text-sm text-emerald-600">{{ getApprovedReviews() }} approved</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Verified</p>
          <p class="text-3xl font-bold text-slate-900">{{ getVerifiedReviews() }}</p>
          <p class="mt-2 text-sm text-slate-500">From customers</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg p-4 shadow-md flex gap-4">
        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          [(ngModel)]="filterRating"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>

        <input 
          type="text" 
          placeholder="Search reviews..." 
          [(ngModel)]="searchQuery"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        @for (review of getFilteredReviews(); track review.id) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4" [ngClass]="{
            'border-yellow-500': review.status === 'pending',
            'border-emerald-500': review.status === 'approved',
            'border-red-500': review.status === 'rejected'
          }">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-slate-900">{{ review.title }}</h3>
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-700': review.status === 'pending',
                    'bg-emerald-100 text-emerald-700': review.status === 'approved',
                    'bg-red-100 text-red-700': review.status === 'rejected'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ review.status | titlecase }}
                  </span>
                  @if (review.verified) {
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">✓ Verified</span>
                  }
                </div>
                <p class="text-sm text-slate-600">{{ review.customerName }} • {{ review.date }}</p>
              </div>
              <div class="text-right">
                <div class="flex items-center justify-end gap-1 mb-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span [ngClass]="{
                      'text-yellow-400': star <= review.rating,
                      'text-slate-300': star > review.rating
                    }">★</span>
                  }
                </div>
                <p class="text-sm font-bold text-slate-900">{{ review.rating }}.0</p>
              </div>
            </div>

            <p class="text-slate-700 mb-4">{{ review.comment }}</p>

            <div class="flex items-center justify-between pt-4 border-t border-slate-200">
              <span class="text-sm text-slate-600">Category: <strong>{{ review.category }}</strong></span>
              @if (review.status === 'pending') {
                <div class="flex gap-2">
                  <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Approve
                  </button>
                  <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Reject
                  </button>
                </div>
              } @else {
                <div class="flex gap-2">
                  <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Edit Response
                  </button>
                  <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              }
            </div>
          </div>
        }
        @if (getFilteredReviews().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No reviews found matching your filters</p>
          </div>
        }
      </div>

      <!-- Rating Distribution -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Rating Distribution</h2>
        <div class="space-y-4">
          @for (rating of [5,4,3,2,1]; track rating) {
            <div class="flex items-center gap-4">
              <div class="w-12 text-right">
                <span class="text-sm font-medium text-slate-900">{{ rating }} ★</span>
              </div>
              <div class="flex-1 bg-slate-200 rounded-full h-2">
                <div class="bg-yellow-400 h-2 rounded-full" [style.width.%]="getRatingPercentage(rating)"></div>
              </div>
              <div class="w-16 text-right">
                <span class="text-sm font-medium text-slate-900">{{ getReviewsByRating(rating).length }} ({{ getRatingPercentage(rating) }}%)</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ReviewManagementComponent implements OnInit {
  reviews = signal<Review[]>([]);

  filterStatus = '';
  filterRating = '';
  searchQuery = '';

  ngOnInit(): void {
    // Load reviews
  }

  getPendingReviews(): number {
    return this.reviews().filter(r => r.status === 'pending').length;
  }

  getApprovedReviews(): number {
    return this.reviews().filter(r => r.status === 'approved').length;
  }

  getVerifiedReviews(): number {
    return this.reviews().filter(r => r.verified).length;
  }

  getAverageRating(): string {
    const reviews = this.reviews();
    if (reviews.length === 0) return '0.0';
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  }

  getReviewsByRating(rating: number): Review[] {
    return this.reviews().filter(r => r.rating === rating);
  }

  getRatingPercentage(rating: number): number {
    const reviews = this.reviews();
    if (reviews.length === 0) return 0;
    const count = this.getReviewsByRating(rating).length;
    return Math.round((count / reviews.length) * 100);
  }

  getFilteredReviews(): Review[] {
    let filtered = this.reviews();

    if (this.filterStatus) {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    if (this.filterRating) {
      const minRating = parseInt(this.filterRating);
      filtered = filtered.filter(r => r.rating >= minRating);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.comment.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }
}
