import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../../../services/tour.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Tours & Travel Reports</h1>
        <p class="text-slate-600 mt-2">Analytics and performance insights for your tour business</p>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading reports...</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Tours</p>
          <p class="text-3xl font-bold text-slate-900">{{ tours().length }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ activeTours().length }} active</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Bookings</p>
          <p class="text-3xl font-bold text-slate-900">{{ bookings().length }}</p>
          <p class="mt-2 text-sm text-emerald-600">{{ confirmedBookings().length }} confirmed</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Revenue</p>
          <p class="text-3xl font-bold text-slate-900">{{ totalRevenue() | currency }}</p>
          <p class="mt-2 text-sm text-slate-500">From all bookings</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Booking Value</p>
          <p class="text-3xl font-bold text-slate-900">{{ averageBookingValue() | currency }}</p>
          <p class="mt-2 text-sm text-slate-500">Per booking</p>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Performance Metrics</h3>

          @if (tours().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="font-semibold">No tour data available</p>
            </div>
          } @else {
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 border-b border-slate-200">
                <span class="text-slate-700 font-medium">Occupancy Rate</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      class="bg-pink-500 h-2 rounded-full"
                      [style.width.%]="occupancyRate()"
                    ></div>
                  </div>
                  <span class="font-bold text-slate-900 min-w-12">{{ occupancyRate() | number:'1.0-0' }}%</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 border-b border-slate-200">
                <span class="text-slate-700 font-medium">Average Rating</span>
                <span class="font-bold text-slate-900">{{ averageRating() | number:'1.1-1' }}/5.0</span>
              </div>

              <div class="flex items-center justify-between p-3 border-b border-slate-200">
                <span class="text-slate-700 font-medium">Total Participants</span>
                <span class="font-bold text-slate-900">{{ totalParticipants() }}</span>
              </div>

              <div class="flex items-center justify-between p-3">
                <span class="text-slate-700 font-medium">Booking Confirmation Rate</span>
                <span class="font-bold text-slate-900">{{ bookingConfirmationRate() | number:'1.0-0' }}%</span>
              </div>
            </div>
          }
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Tour Guides Performance</h3>

          @if (tourGuides().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="font-semibold">No guides data available</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (guide of topGuides().slice(0, 5); track guide._id) {
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p class="font-medium text-slate-900">{{ guide.name }}</p>
                    <p class="text-sm text-slate-600">{{ guide.expertise || 'Guide' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-slate-900">{{ guide.toursCompleted || 0 }}</p>
                    <p class="text-xs text-slate-500">tours completed</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Booking Status Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Booking Status Breakdown</h3>

          @if (bookings().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="font-semibold">No booking data available</p>
            </div>
          } @else {
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span class="text-slate-700 font-medium">Pending</span>
                <span class="font-bold text-slate-900">{{ pendingBookings().length }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span class="text-slate-700 font-medium">Confirmed</span>
                <span class="font-bold text-slate-900">{{ confirmedBookings().length }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="text-slate-700 font-medium">Completed</span>
                <span class="font-bold text-slate-900">{{ completedBookings().length }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span class="text-slate-700 font-medium">Cancelled</span>
                <span class="font-bold text-slate-900">{{ cancelledBookings().length }}</span>
              </div>
            </div>
          }
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Revenue Distribution</h3>

          @if (bookings().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="font-semibold">No revenue data available</p>
            </div>
          } @else {
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span class="text-slate-700 font-medium">From Pending Bookings</span>
                <span class="font-bold text-slate-900">{{ pendingRevenue() | currency }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span class="text-slate-700 font-medium">From Confirmed Bookings</span>
                <span class="font-bold text-slate-900">{{ confirmedRevenue() | currency }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="text-slate-700 font-medium">From Completed Bookings</span>
                <span class="font-bold text-slate-900">{{ completedRevenue() | currency }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Top Tours -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Top Performing Tours</h3>

        @if (topTours().length === 0) {
          <div class="text-center py-8 text-slate-500">
            <p class="font-semibold">No tour data available</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tour Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Destination</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Participants</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rating</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (tour of topTours().slice(0, 10); track tour._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <span class="font-medium text-slate-900">{{ tour.name }}</span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.destination || '-' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.currentParticipants || 0 }}/{{ tour.maxParticipants || 0 }}</td>
                    <td class="px-6 py-4 text-slate-900 font-medium">{{ tour.rating || 0 | number:'1.1-1' }}/5</td>
                    <td class="px-6 py-4">
                      @if (tour.isActive) {
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                      } @else {
                        <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Inactive</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ToursReportsComponent implements OnInit {
  tours = signal<any[]>([]);
  bookings = signal<any[]>([]);
  tourGuides = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Computed values
  activeTours = computed(() => this.tours().filter(t => t.isActive !== false));
  
  totalParticipants = computed(() => {
    return this.tours().reduce((sum, tour) => sum + (tour.currentParticipants || 0), 0);
  });

  totalRevenue = computed(() => {
    return this.bookings().reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  });

  averageBookingValue = computed(() => {
    const bookingCount = this.bookings().length;
    if (bookingCount === 0) return 0;
    return this.totalRevenue() / bookingCount;
  });

  averageRating = computed(() => {
    const toursWithRating = this.tours().filter(t => t.rating && t.rating > 0);
    if (toursWithRating.length === 0) return 0;
    const totalRating = toursWithRating.reduce((sum, tour) => sum + tour.rating, 0);
    return totalRating / toursWithRating.length;
  });

  occupancyRate = computed(() => {
    const totalCapacity = this.tours().reduce((sum, tour) => sum + (tour.maxParticipants || 0), 0);
    if (totalCapacity === 0) return 0;
    return (this.totalParticipants() / totalCapacity) * 100;
  });

  pendingBookings = computed(() => this.bookings().filter(b => b.status === 'Pending'));
  confirmedBookings = computed(() => this.bookings().filter(b => b.status === 'Confirmed'));
  completedBookings = computed(() => this.bookings().filter(b => b.status === 'Completed'));
  cancelledBookings = computed(() => this.bookings().filter(b => b.status === 'Cancelled'));

  pendingRevenue = computed(() => {
    return this.pendingBookings().reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  });

  confirmedRevenue = computed(() => {
    return this.confirmedBookings().reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  });

  completedRevenue = computed(() => {
    return this.completedBookings().reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  });

  bookingConfirmationRate = computed(() => {
    const totalBookings = this.bookings().length;
    if (totalBookings === 0) return 0;
    return (this.confirmedBookings().length / totalBookings) * 100;
  });

  topTours = computed(() => {
    return [...this.tours()].sort((a, b) => {
      const aParticipants = a.currentParticipants || 0;
      const bParticipants = b.currentParticipants || 0;
      return bParticipants - aParticipants;
    });
  });

  topGuides = computed(() => {
    return [...this.tourGuides()].sort((a, b) => {
      const aCompleted = a.toursCompleted || 0;
      const bCompleted = b.toursCompleted || 0;
      return bCompleted - aCompleted;
    });
  });

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading.set(true);

    this.tourService.getTours(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.tours.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.errorMessage.set('Failed to load tours data');
      }
    });

    this.tourService.getBookings(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.bookings.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });

    this.tourService.getTourGuides().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.tourGuides.set(response.data);
        } else if (Array.isArray(response.data)) {
          this.tourGuides.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading guides:', error);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
