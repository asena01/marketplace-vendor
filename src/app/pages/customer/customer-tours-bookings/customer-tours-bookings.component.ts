import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

interface TourBooking {
  _id: string;
  tourName: string;
  destination: string;
  agency: string;
  startDate: string;
  endDate: string;
  duration: number;
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  highlights: string[];
}

@Component({
  selector: 'app-customer-tours-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Bookings</p>
          <p class="text-3xl font-bold text-gray-800">{{ tourBookings().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Confirmed</p>
          <p class="text-3xl font-bold text-gray-800">{{ getConfirmedCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm">Upcoming</p>
          <p class="text-3xl font-bold text-gray-800">{{ getUpcomingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm">Completed</p>
          <p class="text-3xl font-bold text-gray-800">{{ getCompletedCount() }}</p>
        </div>
      </div>

      <!-- Bookings Grid -->
      @if (tourBookings().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (booking of tourBookings(); track booking._id) {
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <!-- Header -->
              <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-bold">{{ booking.tourName }}</h3>
                    <p class="text-sm opacity-90 flex items-center gap-1">
                      <mat-icon class="text-sm">location_on</mat-icon>
                      <span>{{ booking.destination }}</span>
                    </p>
                  </div>
                  <span [class]="getStatusBadgeClass(booking.status)">
                    {{ getStatusBadge(booking.status) }}
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4 space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-600 font-semibold">Agency</p>
                    <p class="text-sm font-semibold text-gray-900">{{ booking.agency }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 font-semibold">Duration</p>
                    <p class="text-sm font-semibold text-gray-900">{{ booking.duration }} Days</p>
                  </div>
                </div>

                <div class="border-t pt-3">
                  <p class="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1">
                    <mat-icon class="text-xs">calendar_today</mat-icon>
                    <span>Dates</span>
                  </p>
                  <p class="text-sm text-gray-700">
                    {{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}
                  </p>
                </div>

                <div class="border-t pt-3">
                  <p class="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1">
                    <mat-icon class="text-xs">star</mat-icon>
                    <span>Highlights</span>
                  </p>
                  <div class="flex flex-wrap gap-2">
                    @for (highlight of booking.highlights.slice(0, 3); track highlight) {
                      <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {{ highlight }}
                      </span>
                    }
                  </div>
                </div>

                <div class="border-t pt-3 flex justify-between items-center">
                  <div>
                    <p class="text-xs text-gray-600 font-semibold">Participants</p>
                    <p class="text-sm font-semibold text-gray-900">{{ booking.participants }} people</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-600 font-semibold">Total Price</p>
                    <p class="text-lg font-bold text-green-600">₦{{ booking.totalPrice.toLocaleString() }}</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="bg-gray-50 px-4 py-3 flex gap-2">
                <button
                  (click)="viewBookingDetails(booking)"
                  class="flex-1 text-blue-600 hover:text-blue-800 font-semibold text-sm py-2 hover:bg-blue-50 rounded transition flex items-center justify-center gap-1">
                  <mat-icon class="text-sm">visibility</mat-icon>
                  <span>View Details</span>
                </button>
                @if (booking.status === 'pending') {
                  <button
                    (click)="cancelBooking(booking)"
                    class="flex-1 text-red-600 hover:text-red-800 font-semibold text-sm py-2 hover:bg-red-50 rounded transition flex items-center justify-center gap-1">
                    <mat-icon class="text-sm">cancel</mat-icon>
                    <span>Cancel</span>
                  </button>
                }
                @if (booking.status === 'completed') {
                  <button
                    (click)="rateExperience(booking)"
                    class="flex-1 text-yellow-600 hover:text-yellow-800 font-semibold text-sm py-2 hover:bg-yellow-50 rounded transition flex items-center justify-center gap-1">
                    <mat-icon class="text-sm">star</mat-icon>
                    <span>Rate</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-400">flight</mat-icon>
          </div>
          <p class="text-gray-500 text-lg mb-2 font-semibold">No tour bookings yet</p>
          <p class="text-gray-400 text-sm">Explore amazing destinations and book your next adventure!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    ::ng-deep mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CustomerToursBookingsComponent implements OnInit {
  tourBookings = signal<TourBooking[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadTourBookings();
  }

  loadTourBookings(): void {
    this.customerService.getMyTourBookings().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.tourBookings.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading tour bookings:', error);
      }
    );
  }

  getConfirmedCount(): number {
    return this.tourBookings().filter(b => b.status === 'confirmed').length;
  }

  getUpcomingCount(): number {
    return this.tourBookings().filter(b => this.isUpcoming(b)).length;
  }

  getCompletedCount(): number {
    return this.tourBookings().filter(b => b.status === 'completed').length;
  }

  isUpcoming(booking: TourBooking): boolean {
    return new Date(booking.startDate) > new Date();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-green-200 text-green-900 text-xs font-semibold',
      'in-progress': 'inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-xs font-semibold',
      completed: 'inline-block px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-200 text-red-900 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900 text-xs font-semibold';
  }

  viewBookingDetails(booking: TourBooking): void {
    console.log('View booking details:', booking);
    // TODO: Implement view details modal
  }

  cancelBooking(booking: TourBooking): void {
    if (confirm('Are you sure you want to cancel this tour booking?')) {
      console.log('Cancel booking:', booking._id);
      // TODO: Implement cancel booking API call
    }
  }

  rateExperience(booking: TourBooking): void {
    console.log('Rate experience:', booking._id);
    // TODO: Implement rating modal
  }
}
