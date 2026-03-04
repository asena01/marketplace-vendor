import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">My Services</h2>
        <p class="text-gray-600">View and manage your service bookings (hair salons, gyms, deliveries, etc.)</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Total Services</p>
          <p class="text-3xl font-bold text-gray-800">{{ services().length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm font-medium">Pending</p>
          <p class="text-3xl font-bold text-yellow-600">{{ getPendingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm font-medium">In Progress</p>
          <p class="text-3xl font-bold text-orange-600">{{ getInProgressCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Completed</p>
          <p class="text-3xl font-bold text-green-600">{{ getCompletedCount() }}</p>
        </div>
      </div>

      <!-- Services List -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (services().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service Name</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Provider</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date/Time</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (service of services(); track service._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">
                    #{{ service.serviceId || service._id.substring(0, 8) }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="font-semibold text-gray-800">{{ service.serviceName }}</div>
                    <div class="text-xs text-gray-500">{{ service.serviceType }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ service.providerName }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ service.appointmentDate | date: 'short' }}
                    <div class="text-xs text-gray-500">{{ service.appointmentTime }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ service.price?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusClass(service.status)">
                      {{ getStatusLabel(service.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 font-semibold">
                      👁️ View
                    </button>
                    @if (service.status === 'pending' || service.status === 'scheduled') {
                      <button class="text-red-600 hover:text-red-800 font-semibold">
                        ❌ Cancel
                      </button>
                    }
                    @if (service.status === 'completed' && !service.hasRating) {
                      <button class="text-yellow-600 hover:text-yellow-800 font-semibold">
                        ⭐ Rate
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
            <p class="text-gray-600">Loading services...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-2xl mb-2">💇</p>
            <p class="text-lg font-semibold">No service bookings yet</p>
            <p class="text-sm mt-2">Book a hair salon, gym, delivery, or other service to see them here</p>
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
export class CustomerServicesComponent implements OnInit {
  services = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.customerService.getCustomerServices(1, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.services.set(response.data || []);
          console.log('✅ Services loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading services:', error);
        this.error.set(error.error?.message || 'Failed to load services');
        this.isLoading.set(false);
      }
    });
  }

  getPendingCount(): number {
    return this.services().filter(s => s.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.services().filter(s => s.status === 'in-progress' || s.status === 'scheduled').length;
  }

  getCompletedCount(): number {
    return this.services().filter(s => s.status === 'completed').length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'scheduled': '📅 Scheduled',
      'in-progress': '⏳ In Progress',
      'completed': '✅ Completed',
      'cancelled': '❌ Cancelled'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
