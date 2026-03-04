import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">My Bookings</h2>
        <p class="text-gray-600">Manage your hotel, restaurant, and service bookings</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Total Bookings</p>
          <p class="text-3xl font-bold text-gray-800">{{ bookings().length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Confirmed</p>
          <p class="text-3xl font-bold text-green-600">{{ getConfirmedCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm font-medium">Upcoming</p>
          <p class="text-3xl font-bold text-orange-600">{{ getUpcomingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm font-medium">Completed</p>
          <p class="text-3xl font-bold text-purple-600">{{ getCompletedCount() }}</p>
        </div>
      </div>

      <!-- Bookings List -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (bookings().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Property</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Price</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of bookings(); track booking._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">
                    #{{ booking.bookingNumber || booking._id.substring(0, 8) }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="font-semibold text-gray-800">{{ booking.hotelName || booking.propertyName }}</div>
                    <div class="text-xs text-gray-500">{{ booking.roomType }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ booking.checkInDate | date: 'short' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ booking.numberOfNights }} night(s)
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ booking.totalPrice?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusClass(booking.status)">
                      {{ getStatusLabel(booking.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 font-semibold">
                      👁️ View
                    </button>
                    @if (booking.status === 'confirmed' && isUpcoming(booking.checkInDate)) {
                      <button class="text-red-600 hover:text-red-800 font-semibold">
                        ❌ Cancel
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading bookings...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-2xl mb-2">🏨</p>
            <p class="text-lg font-semibold">No bookings yet</p>
            <p class="text-sm mt-2">Book a hotel, restaurant table, or service to see your bookings here</p>
          </div>
        }
      </div>

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.customerService.getCustomerBookings(1, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings.set(response.data || []);
          console.log('✅ Bookings loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading bookings:', error);
        this.error.set(error.error?.message || 'Failed to load bookings');
        this.isLoading.set(false);
      }
    });
  }

  getConfirmedCount(): number {
    return this.bookings().filter(b => b.status === 'confirmed').length;
  }

  getUpcomingCount(): number {
    return this.bookings().filter(b => this.isUpcoming(b.checkInDate)).length;
  }

  getCompletedCount(): number {
    return this.bookings().filter(b => b.status === 'checked-out' || b.status === 'completed').length;
  }

  isUpcoming(dateString: string): boolean {
    const bookingDate = new Date(dateString);
    return bookingDate > new Date();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'confirmed': '✅ Confirmed',
      'pending': '⏳ Pending',
      'checked-in': '🔓 Checked In',
      'checked-out': '🔐 Checked Out',
      'completed': '✔️ Completed',
      'cancelled': '❌ Cancelled'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'checked-out': 'bg-purple-100 text-purple-800',
      'completed': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
