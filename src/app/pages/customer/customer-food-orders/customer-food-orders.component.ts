import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

interface FoodOrder {
  _id: string;
  restaurantName: string;
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
}

@Component({
  selector: 'app-customer-food-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Orders</p>
          <p class="text-3xl font-bold text-gray-800">{{ foodOrders().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm">Pending</p>
          <p class="text-3xl font-bold text-gray-800">{{ getPendingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm">Preparing</p>
          <p class="text-3xl font-bold text-gray-800">{{ getPreparingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Delivered</p>
          <p class="text-3xl font-bold text-gray-800">{{ getDeliveredCount() }}</p>
        </div>
      </div>

      <!-- Orders Table -->
      @if (foodOrders().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Restaurant</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Delivery</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (order of foodOrders(); track order._id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm text-gray-700 font-mono">{{ order._id.slice(0, 8) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ order.restaurantName }}</td>
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
                    @if (order.estimatedDelivery) {
                      {{ formatTime(order.estimatedDelivery) }}
                    } @else {
                      -
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
          <p class="text-gray-500 text-lg mb-4">🍕 No food orders yet</p>
          <p class="text-gray-400 text-sm">Browse restaurants and place your first order!</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerFoodOrdersComponent implements OnInit {
  foodOrders = signal<FoodOrder[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadFoodOrders();
  }

  loadFoodOrders(): void {
    this.customerService.getFoodOrders().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.foodOrders.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading food orders:', error);
      }
    );
  }

  getPendingCount(): number {
    return this.foodOrders().filter(o => o.status === 'pending').length;
  }

  getPreparingCount(): number {
    return this.foodOrders().filter(o => o.status === 'preparing').length;
  }

  getDeliveredCount(): number {
    return this.foodOrders().filter(o => o.status === 'delivered').length;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: '⏳ Pending',
      confirmed: '✓ Confirmed',
      preparing: '👨‍🍳 Preparing',
      ready: '📦 Ready',
      delivered: '✓ Delivered',
      cancelled: '✕ Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      preparing: 'inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold',
      ready: 'inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      delivered: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewOrderDetails(order: FoodOrder): void {
    console.log('View order details:', order);
    // TODO: Implement view details modal
  }

  cancelOrder(order: FoodOrder): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      console.log('Cancel order:', order._id);
      // TODO: Implement cancel order API call
    }
  }
}
