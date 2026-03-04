import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

interface ServiceBooking {
  _id: string;
  serviceName: string;
  provider: string;
  serviceDate: string;
  serviceTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
}

@Component({
  selector: 'app-customer-services-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Bookings</p>
          <p class="text-3xl font-bold text-gray-800">{{ serviceBookings().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm">Pending</p>
          <p class="text-3xl font-bold text-gray-800">{{ getPendingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm">In Progress</p>
          <p class="text-3xl font-bold text-gray-800">{{ getInProgressCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Completed</p>
          <p class="text-3xl font-bold text-gray-800">{{ getCompletedCount() }}</p>
        </div>
      </div>

      <!-- Bookings Table -->
      @if (serviceBookings().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (booking of serviceBookings(); track booking._id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm text-gray-700 font-mono">{{ booking._id.slice(0, 8) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700 font-semibold">{{ booking.serviceName }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ booking.provider }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">
                    {{ formatDate(booking.serviceDate) }} @ {{ booking.serviceTime }}
                  </td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ booking.duration }} mins</td>
                  <td class="px-6 py-3 text-sm font-semibold text-gray-900">₦{{ booking.price.toLocaleString() }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span [class]="getStatusBadgeClass(booking.status)">
                      {{ getStatusBadge(booking.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm space-x-2">
                    <button 
                      (click)="viewBookingDetails(booking)"
                      class="text-blue-600 hover:text-blue-800 font-semibold">
                      View
                    </button>
                    @if (booking.status === 'pending') {
                      <button 
                        (click)="cancelBooking(booking)"
                        class="text-red-600 hover:text-red-800 font-semibold">
                        Cancel
                      </button>
                    }
                    @if (booking.status === 'completed') {
                      <button 
                        (click)="rateService(booking)"
                        class="text-yellow-600 hover:text-yellow-800 font-semibold">
                        ⭐ Rate
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-500 text-lg mb-4">💇 No service bookings yet</p>
          <p class="text-gray-400 text-sm">Book a service and get started!</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerServicesBookingsComponent implements OnInit {
  serviceBookings = signal<ServiceBooking[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadServiceBookings();
  }

  loadServiceBookings(): void {
    this.customerService.getServiceBookings().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.serviceBookings.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading service bookings:', error);
      }
    );
  }

  getPendingCount(): number {
    return this.serviceBookings().filter(b => b.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.serviceBookings().filter(b => b.status === 'in-progress').length;
  }

  getCompletedCount(): number {
    return this.serviceBookings().filter(b => b.status === 'completed').length;
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
      pending: '⏳ Pending',
      confirmed: '✓ Confirmed',
      'in-progress': '⚙️ In Progress',
      completed: '✓ Completed',
      cancelled: '✕ Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      'in-progress': 'inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold',
      completed: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewBookingDetails(booking: ServiceBooking): void {
    console.log('View booking details:', booking);
    // TODO: Implement view details modal
  }

  cancelBooking(booking: ServiceBooking): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      console.log('Cancel booking:', booking._id);
      // TODO: Implement cancel booking API call
    }
  }

  rateService(booking: ServiceBooking): void {
    console.log('Rate service:', booking._id);
    // TODO: Implement rating modal
  }
}
