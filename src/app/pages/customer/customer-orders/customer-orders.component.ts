import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">My Orders</h2>
        <p class="text-gray-600">Track and manage all your orders</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Total Orders</p>
          <p class="text-3xl font-bold text-gray-800">{{ orders().length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm font-medium">Pending</p>
          <p class="text-3xl font-bold text-yellow-600">{{ getPendingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm font-medium">Processing</p>
          <p class="text-3xl font-bold text-orange-600">{{ getProcessingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Delivered</p>
          <p class="text-3xl font-bold text-green-600">{{ getDeliveredCount() }}</p>
        </div>
      </div>

      <!-- Orders List -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (orders().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">
                    #{{ order.orderId || order._id.substring(0, 8) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ order.createdAt | date: 'short' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ order.items?.length || 0 }} item(s)
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ order.totalAmount?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 font-semibold">
                      👁️ View
                    </button>
                    @if (order.status === 'pending') {
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
            <p class="text-gray-600">Loading orders...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-2xl mb-2">📦</p>
            <p class="text-lg font-semibold">No orders yet</p>
            <p class="text-sm mt-2">Start shopping to see your orders here</p>
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
export class CustomerOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.customerService.getCustomerOrders(1, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders.set(response.data || []);
          console.log('✅ Orders loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.error.set(error.error?.message || 'Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  getPendingCount(): number {
    return this.orders().filter(o => o.status === 'pending').length;
  }

  getProcessingCount(): number {
    return this.orders().filter(o => o.status === 'processing' || o.status === 'shipped').length;
  }

  getDeliveredCount(): number {
    return this.orders().filter(o => o.status === 'delivered').length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'processing': '📦 Processing',
      'shipped': '🚚 Shipped',
      'delivered': '✅ Delivered',
      'cancelled': '❌ Cancelled'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
