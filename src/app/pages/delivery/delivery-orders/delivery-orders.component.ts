import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Delivery Orders</h2>
          <p class="text-gray-600">Manage all delivery orders and assignments</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          ➕ New Order
        </button>
      </div>

      <!-- Filter and Search -->
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search orders..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="picked-up">Picked Up</option>
          <option value="in-transit">In Transit</option>
          <option value="arriving">Arriving</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
        <button
          (click)="loadOrders()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (orders().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pickup → Delivery</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Courier</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ order.orderId }}</td>
                  <td class="px-6 py-4 text-sm">
                    <div class="font-semibold">{{ order.customer?.name }}</div>
                    <div class="text-xs text-gray-500">{{ order.customer?.phone }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <div>📍 {{ order.pickup?.address?.city }}</div>
                    <div>→ {{ order.delivery?.address?.city }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    @if (order.courierName) {
                      <div class="font-semibold">{{ order.courierName }}</div>
                      <div class="text-xs text-gray-500">⭐ {{ order.courierRating }}/5</div>
                    } @else {
                      <span class="text-gray-400">Unassigned</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ order.totalAmount?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    @if (!order.courier && order.status === 'pending') {
                      <button
                        (click)="assignCourier(order._id)"
                        class="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        👥 Assign
                      </button>
                    }
                    @if (order.status !== 'delivered' && order.status !== 'failed' && order.status !== 'cancelled') {
                      <button
                        (click)="updateStatus(order._id)"
                        class="text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        ▶️ Progress
                      </button>
                    }
                    <button
                      (click)="viewDetails(order._id)"
                      class="text-orange-600 hover:text-orange-800 font-semibold"
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
            <p class="text-gray-600">Loading orders...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">📦 No orders found</p>
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
export class DeliveryOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  searchTerm = '';
  filterStatus = '';

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set('');

    const status = this.filterStatus || undefined;
    this.deliveryService.getOrders(1, 100, status).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.orders.set(response.data || []);
          console.log('✅ Orders loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading orders:', error);
        this.error.set(error.error?.message || 'Failed to load orders');
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
      'delivered': '✔️ Delivered',
      'failed': '❌ Failed',
      'cancelled': '🔴 Cancelled'
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
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  assignCourier(orderId: string): void {
    console.log('Assigning courier to order:', orderId);
    // Can expand to show courier selection modal
  }

  updateStatus(orderId: string): void {
    console.log('Updating order status:', orderId);
    // Can expand to show status progression options
  }

  viewDetails(orderId: string): void {
    console.log('Viewing order details:', orderId);
    // Can expand to show detailed order view
  }

  openCreateModal(): void {
    console.log('Opening create order modal');
    // Can expand to show order creation form
  }
}
