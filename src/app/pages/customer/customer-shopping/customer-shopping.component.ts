import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

interface ShoppingOrder {
  _id: string;
  storeName: string;
  items: { productName: string; quantity: number; price: number }[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

@Component({
  selector: 'app-customer-shopping',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Orders</p>
          <p class="text-3xl font-bold text-gray-800">{{ shoppingOrders().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm">Processing</p>
          <p class="text-3xl font-bold text-gray-800">{{ getProcessingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm">Shipped</p>
          <p class="text-3xl font-bold text-gray-800">{{ getShippedCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Delivered</p>
          <p class="text-3xl font-bold text-gray-800">{{ getDeliveredCount() }}</p>
        </div>
      </div>

      <!-- Orders Table -->
      @if (shoppingOrders().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Store</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Delivery Date</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (order of shoppingOrders(); track order._id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm text-gray-700 font-mono">{{ order._id.slice(0, 8) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ order.storeName }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">
                    {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                  </td>
                  <td class="px-6 py-3 text-sm font-semibold text-gray-900">₦{{ order.totalPrice.toLocaleString() }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span [class]="getStatusBadgeClass(order.status)">
                      {{ getStatusBadge(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-gray-700">
                    @if (order.deliveryDate) {
                      {{ formatDate(order.deliveryDate) }}
                    } @else {
                      TBD
                    }
                  </td>
                  <td class="px-6 py-3 text-sm space-x-2">
                    <button 
                      (click)="viewOrderDetails(order)"
                      class="text-blue-600 hover:text-blue-800 font-semibold">
                      View
                    </button>
                    @if (order.status === 'pending') {
                      <button 
                        (click)="cancelOrder(order)"
                        class="text-red-600 hover:text-red-800 font-semibold">
                        Cancel
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
          <p class="text-gray-500 text-lg mb-4">🛍️ No shopping orders yet</p>
          <p class="text-gray-400 text-sm">Start shopping and place your first order!</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerShoppingComponent implements OnInit {
  shoppingOrders = signal<ShoppingOrder[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadShoppingOrders();
  }

  loadShoppingOrders(): void {
    const userId = localStorage.getItem('userId');
    console.log('🛍️ Loading shopping orders for user:', userId);

    this.customerService.getShoppingOrders().subscribe(
      (response: any) => {
        console.log('📥 Shopping orders response:', response);
        if (response.success && response.data) {
          console.log('✅ Loaded', response.data.length, 'shopping orders');
          this.shoppingOrders.set(response.data);
        } else {
          console.warn('⚠️ Response missing success or data:', response);
        }
      },
      (error) => {
        console.error('❌ Error loading shopping orders:', error);
      }
    );
  }

  getProcessingCount(): number {
    return this.shoppingOrders().filter(o => o.status === 'processing' || o.status === 'confirmed').length;
  }

  getShippedCount(): number {
    return this.shoppingOrders().filter(o => o.status === 'shipped').length;
  }

  getDeliveredCount(): number {
    return this.shoppingOrders().filter(o => o.status === 'delivered').length;
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
      processing: '⚙️ Processing',
      shipped: '📦 Shipped',
      delivered: '✓ Delivered',
      cancelled: '✕ Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      processing: 'inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold',
      shipped: 'inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      delivered: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewOrderDetails(order: ShoppingOrder): void {
    console.log('View order details:', order);
    // TODO: Implement view details modal
  }

  cancelOrder(order: ShoppingOrder): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      console.log('Cancel order:', order._id);
      // TODO: Implement cancel order API call
    }
  }
}
