import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery-couriers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Courier Management</h2>
          <p class="text-gray-600">Manage your fleet of couriers</p>
        </div>
        <button
          (click)="openAddModal()"
          class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          ➕ Add Courier
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Total Couriers</p>
          <p class="text-3xl font-bold text-gray-800">{{ couriers().length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Online Now</p>
          <p class="text-3xl font-bold text-blue-600">{{ getOnlineCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm font-medium">Available</p>
          <p class="text-3xl font-bold text-orange-600">{{ getAvailableCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm font-medium">Avg Rating</p>
          <p class="text-3xl font-bold text-purple-600">{{ getAvgRating() }}/5 ⭐</p>
        </div>
      </div>

      <!-- Couriers Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (couriers().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Deliveries</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acceptance</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (courier of couriers(); track courier._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm">
                    <div class="font-semibold">{{ courier.name }}</div>
                    <div class="text-xs text-gray-500">{{ courier.phone }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <div>{{ getVehicleLabel(courier.vehicleType) }}</div>
                    <div class="text-xs text-gray-500">{{ courier.vehiclePlate }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="flex items-center gap-2">
                      @if (courier.isOnline) {
                        <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                        <span class="text-green-700 font-semibold">Online</span>
                      } @else {
                        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span class="text-gray-600">Offline</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    {{ courier.completedDeliveries }}/{{ courier.totalDeliveries }}
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    {{ courier.avgRating }}/5 ⭐
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        [style.width.%]="courier.acceptanceRate"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ courier.acceptanceRate }}%</span>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      (click)="toggleCourierStatus(courier._id, courier.isOnline)"
                      [class]="courier.isOnline
                        ? 'text-red-600 hover:text-red-800 font-semibold'
                        : 'text-green-600 hover:text-green-800 font-semibold'"
                    >
                      {{ courier.isOnline ? '🔴 Offline' : '🟢 Online' }}
                    </button>
                    <button
                      (click)="viewCourierDetails(courier._id)"
                      class="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading couriers...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">👥 No couriers found</p>
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
export class DeliveryCouriersComponent implements OnInit {
  couriers = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadCouriers();
  }

  loadCouriers(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.deliveryService.getCouriers(1, 100).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.couriers.set(response.data || []);
          console.log('✅ Couriers loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading couriers:', error);
        this.error.set(error.error?.message || 'Failed to load couriers');
        this.isLoading.set(false);
      }
    });
  }

  getOnlineCount(): number {
    return this.couriers().filter(c => c.isOnline).length;
  }

  getAvailableCount(): number {
    return this.couriers().filter(c => c.isAvailable).length;
  }

  getAvgRating(): string {
    if (this.couriers().length === 0) return '0';
    const avg = this.couriers().reduce((sum, c) => sum + (c.avgRating || 0), 0) / this.couriers().length;
    return avg.toFixed(1);
  }

  getVehicleLabel(vehicleType: string): string {
    const labels: { [key: string]: string } = {
      'bike': '🚴 Bike',
      'scooter': '🛴 Scooter',
      'car': '🚗 Car',
      'van': '🚐 Van',
      'truck': '🚚 Truck'
    };
    return labels[vehicleType] || vehicleType;
  }

  toggleCourierStatus(courierId: string, currentStatus: boolean): void {
    this.deliveryService.updateCourierStatus(courierId, currentStatus ? 'inactive' : 'active').subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('✅ Courier status updated');
          this.loadCouriers();
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to update courier');
      }
    });
  }

  viewCourierDetails(courierId: string): void {
    console.log('Viewing courier details:', courierId);
    // Can expand to show detailed courier view
  }

  openAddModal(): void {
    console.log('Opening add courier modal');
    // Can expand to show courier creation form
  }
}
