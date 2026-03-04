import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Live Delivery Tracking</h2>
        <p class="text-gray-600">Real-time location tracking for active deliveries</p>
      </div>

      <!-- Map Placeholder -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
        <div class="text-center">
          <div class="text-6xl mb-4">🗺️</div>
          <p class="text-gray-600 font-semibold mb-2">Live Map View</p>
          <p class="text-sm text-gray-500">Interactive map integration coming soon</p>
          <p class="text-xs text-gray-400 mt-4">Real-time courier locations and delivery progress</p>
        </div>
      </div>

      <!-- Active Deliveries List -->
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-gray-800">Active Deliveries</h3>

        @if (activeDeliveries().length > 0) {
          @for (delivery of activeDeliveries(); track delivery._id) {
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Order Info -->
                <div>
                  <h4 class="font-bold text-gray-800 mb-2">{{ delivery.orderId }}</h4>
                  <p class="text-sm text-gray-600">
                    <strong>Customer:</strong> {{ delivery.customer?.name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <strong>Courier:</strong> {{ delivery.courierName || 'Unassigned' }}
                  </p>
                </div>

                <!-- Location Info -->
                <div>
                  <p class="text-sm mb-2">
                    <strong>Pickup:</strong>
                    <span class="text-gray-600">{{ delivery.pickup?.address?.city }}</span>
                  </p>
                  <p class="text-sm mb-2">
                    <strong>Delivery:</strong>
                    <span class="text-gray-600">{{ delivery.delivery?.address?.city }}</span>
                  </p>
                  <p class="text-sm">
                    <strong>Distance:</strong>
                    <span class="text-gray-600">{{ delivery.distanceKm }} km</span>
                  </p>
                </div>

                <!-- Status -->
                <div>
                  <div class="mb-2">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusClass(delivery.status)">
                      {{ getStatusLabel(delivery.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">
                    <strong>Progress:</strong>
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1 mb-2">
                    <div class="bg-teal-600 h-2 rounded-full" [style.width.%]="getProgressPercentage(delivery.status)"></div>
                  </div>
                  <p class="text-sm font-semibold">{{ getProgressPercentage(delivery.status) }}%</p>
                  <button class="text-teal-600 hover:text-teal-800 font-semibold text-sm mt-2">
                    📍 Track on Map
                  </button>
                </div>
              </div>
            </div>
          }
        } @else {
          <div class="bg-white rounded-lg shadow-md p-12 text-center text-gray-600">
            <p class="text-lg mb-2">📭 No active deliveries</p>
            <p class="text-sm">All deliveries have been completed</p>
          </div>
        }
      </div>

      <!-- Historical Deliveries -->
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-gray-800">Recent Completed Deliveries</h3>

        @if (completedDeliveries().length > 0) {
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Delivered By</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Completed At</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                @for (delivery of completedDeliveries(); track delivery._id) {
                  <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ delivery.orderId }}</td>
                    <td class="px-6 py-4 text-sm text-gray-800">{{ delivery.customer?.name }}</td>
                    <td class="px-6 py-4 text-sm text-gray-800">{{ delivery.courierName }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                      {{ (delivery.deliveredAt | date: 'short') || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold">
                      @if (delivery.rating) {
                        <span>⭐ {{ delivery.rating }}/5</span>
                      } @else {
                        <span class="text-gray-400">No rating</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow-md p-12 text-center text-gray-600">
            <p class="text-lg">No completed deliveries yet</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryTrackingComponent implements OnInit {
  activeDeliveries = signal<any[]>([]);
  completedDeliveries = signal<any[]>([]);
  isLoading = signal(true);

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadTrackingData();
  }

  loadTrackingData(): void {
    // Load active deliveries
    this.deliveryService.getOrders(1, 100, 'in-transit').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.activeDeliveries.set(response.data || []);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading active deliveries:', error);
      }
    });

    // Load completed deliveries
    this.deliveryService.getOrders(1, 20, 'delivered').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.completedDeliveries.set(response.data || []);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading completed deliveries:', error);
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'accepted': '✅ Accepted',
      'picked-up': '📦 Picked Up',
      'in-transit': '🚗 In Transit',
      'arriving': '📍 Arriving',
      'delivered': '✔️ Delivered'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'picked-up': 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-cyan-100 text-cyan-800',
      'arriving': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getProgressPercentage(status: string): number {
    const progress: { [key: string]: number } = {
      'pending': 0,
      'accepted': 20,
      'picked-up': 40,
      'in-transit': 60,
      'arriving': 80,
      'delivered': 100
    };
    return progress[status] || 0;
  }
}
