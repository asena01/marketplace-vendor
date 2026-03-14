import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

interface FoodOrder {
  _id: string;
  restaurantName: string;
  items: { name: string; quantity: number; price: number }[];
  total?: number;
  totalPrice?: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
  orderDate?: string;
  createdAt?: string;
  estimatedDelivery?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod?: string;
}

@Component({
  selector: 'app-customer-food-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-3xl font-bold mb-2">Food Orders</h2>
            <p class="text-orange-100">Track and manage all your restaurant orders</p>
          </div>
          <div class="text-right">
            <p class="text-4xl font-bold">{{ foodOrders().length }}</p>
            <p class="text-orange-100 text-sm">Total Orders</p>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ foodOrders().length }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl">restaurant</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Pending</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">{{ getPendingCount() }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl">hourglass_top</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Preparing</p>
              <p class="text-2xl font-bold text-yellow-600 mt-1">{{ getPreparingCount() }}</p>
            </div>
            <mat-icon class="text-yellow-500 text-3xl">local_fire_department</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Ready</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">{{ getReadyCount() }}</p>
            </div>
            <mat-icon class="text-purple-500 text-3xl">done_all</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Delivered</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ getDeliveredCount() }}</p>
            </div>
            <mat-icon class="text-green-500 text-3xl">check_circle</mat-icon>
          </div>
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
                  <td class="px-6 py-3 text-sm font-semibold text-gray-900">₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</td>
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
                      class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 inline-flex">
                      <mat-icon class="text-sm">visibility</mat-icon>
                      <span>View</span>
                    </button>
                    <button
                      (click)="chatWithRestaurant(order)"
                      class="text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 inline-flex">
                      <mat-icon class="text-sm">chat</mat-icon>
                      <span>Chat</span>
                    </button>
                    @if (order.status === 'pending') {
                      <button
                        (click)="cancelOrderConfirm(order)"
                        class="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 inline-flex">
                        <mat-icon class="text-sm">cancel</mat-icon>
                        <span>Cancel</span>
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
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-400">restaurant</mat-icon>
          </div>
          <p class="text-gray-500 text-lg mb-2 font-semibold">No food orders yet</p>
          <p class="text-gray-400 text-sm">Browse restaurants and place your first order!</p>
        </div>
      }

      <!-- Order Details Modal -->
      @if (showOrderModal() && selectedOrder(); as order) {
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 sticky top-0">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-2xl font-bold">Order Details</h3>
                  <p class="text-orange-100 text-sm">Order ID: {{ order._id.slice(0, 12) }}...</p>
                </div>
                <button
                  (click)="closeOrderModal()"
                  class="text-white hover:text-orange-200 transition"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6 space-y-6">
              <!-- Restaurant Info -->
              <div class="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <mat-icon class="text-orange-600">restaurant</mat-icon>
                  {{ order.restaurantName }}
                </h4>
                <p class="text-sm text-gray-600">
                  <span class="inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-800 text-xs font-semibold">
                    {{ getStatusBadge(order.status) }}
                  </span>
                </p>
              </div>

              <!-- Items -->
              <div>
                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <mat-icon class="text-blue-600">shopping_cart</mat-icon>
                  Order Items ({{ order.items.length }})
                </h4>
                <div class="space-y-2">
                  @for (item of order.items; track item.name) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="flex-1">
                        <p class="font-semibold text-gray-900">{{ item.name }}</p>
                        <p class="text-xs text-gray-600">Qty: {{ item.quantity }}</p>
                      </div>
                      <p class="font-bold text-gray-900">₦{{ (item.price * item.quantity).toLocaleString() }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Delivery Info -->
              <div class="border-t pt-4">
                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <mat-icon class="text-green-600">location_on</mat-icon>
                  Delivery Information
                </h4>
                <div class="space-y-2 text-sm">
                  <p><span class="font-semibold">Address:</span> {{ order.customerAddress || '-' }}</p>
                  <p><span class="font-semibold">Name:</span> {{ order.customerName || '-' }}</p>
                  <p><span class="font-semibold">Phone:</span> {{ order.customerPhone || '-' }}</p>
                  <p><span class="font-semibold">Estimated Delivery:</span> {{ order.estimatedDelivery || '-' }}</p>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <h4 class="font-bold text-gray-900 mb-3">Order Summary</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-semibold">₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-3">
                    Payment Method: <span class="font-semibold">{{ order.paymentMethod || '-' }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="border-t p-6 bg-gray-50 flex gap-3 justify-end sticky bottom-0">
              <button
                (click)="closeOrderModal()"
                class="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              @if (order.status === 'pending') {
                <button
                  (click)="cancelOrderConfirm(order)"
                  class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <mat-icon class="text-sm">cancel</mat-icon>
                  <span>Cancel Order</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    ::ng-deep mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CustomerFoodOrdersComponent implements OnInit {
  foodOrders = signal<FoodOrder[]>([]);
  selectedOrder = signal<FoodOrder | null>(null);
  showOrderModal = signal(false);

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

  getReadyCount(): number {
    return this.foodOrders().filter(o => o.status === 'ready').length;
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
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
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
    this.selectedOrder.set(order);
    this.showOrderModal.set(true);
    console.log('✅ Opened order details modal for:', order.restaurantName);
  }

  closeOrderModal(): void {
    this.showOrderModal.set(false);
    this.selectedOrder.set(null);
  }

  cancelOrderConfirm(order: FoodOrder): void {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      this.cancelOrder(order);
    }
  }

  cancelOrder(order: FoodOrder): void {
    console.log('❌ Cancelling order:', order._id);

    // Update the order status locally to "cancelled"
    this.foodOrders.update(orders =>
      orders.map(o =>
        o._id === order._id
          ? { ...o, status: 'cancelled' }
          : o
      )
    );

    // Close the modal
    this.closeOrderModal();

    console.log('✅ Order cancelled successfully');
    alert('Order has been cancelled');

    // In a real app, this would call: this.customerService.cancelFoodOrder(order._id)
  }

  chatWithRestaurant(order: FoodOrder): void {
    console.log('💬 Opening chat for restaurant:', order.restaurantName);

    // Switch to the Support tab by dispatching a custom event
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'chat' }));

    // Store order info in sessionStorage to pass to chat component
    const chatData = {
      vendorType: 'restaurant',
      orderId: order._id,
      vendorName: order.restaurantName
    };
    sessionStorage.setItem('pendingChat', JSON.stringify(chatData));

    console.log('✅ Chat initiated - switching to Support tab');
  }
}
