import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodService } from '../../../../../services/food.service';

interface OrderItem {
  itemName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeout' | 'delivery';
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p class="text-slate-600 mt-1">Track and manage restaurant orders</p>
        </div>
        <button
          (click)="openAddOrderModal()"
          class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ New Order
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterOrders()"
              placeholder="Search by order # or customer..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Order Type</label>
            <select
              [(ngModel)]="selectedType"
              (change)="filterOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              <option value="dine-in">Dine-In</option>
              <option value="takeout">Takeout</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <p class="text-slate-600 text-sm font-medium">Total Orders</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredOrders().length }}</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Pending</p>
          <p class="text-2xl font-bold text-blue-600">{{ countByStatus('pending') }}</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">Preparing</p>
          <p class="text-2xl font-bold text-orange-600">{{ countByStatus('preparing') }}</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Ready</p>
          <p class="text-2xl font-bold text-yellow-600">{{ countByStatus('ready') }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Completed</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countByStatus('completed') }}</p>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order #</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Items</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredOrders().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No orders found
                  </td>
                </tr>
              } @else {
                @for (order of filteredOrders(); track order._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ order.orderNumber }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ order.customerName }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ order.items.length }} items</td>
                    <td class="px-6 py-4 font-medium text-slate-900">
                      <span class="currency-prefix">$</span>{{ order.totalAmount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-slate-600">
                      <span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                        {{ order.orderType | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': order.status === 'pending',
                          'bg-orange-100 text-orange-700': order.status === 'preparing',
                          'bg-yellow-100 text-yellow-700': order.status === 'ready',
                          'bg-emerald-100 text-emerald-700': order.status === 'served' || order.status === 'completed',
                          'bg-red-100 text-red-700': order.status === 'cancelled'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="editOrder(order)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteOrder(order._id)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showOrderModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Order' : 'Create New Order' }}
            </h2>

            <form (ngSubmit)="saveOrder()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Customer Name -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="newOrder.customerName"
                    name="customerName"
                    placeholder="e.g., John Smith"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <!-- Table Number (optional) -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Table # (Dine-In)</label>
                  <input
                    type="text"
                    [(ngModel)]="newOrder.tableNumber"
                    name="tableNumber"
                    placeholder="e.g., 5"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <!-- Order Type -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Order Type *</label>
                  <select
                    [(ngModel)]="newOrder.orderType"
                    name="orderType"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="dine-in">Dine-In</option>
                    <option value="takeout">Takeout</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                  <select
                    [(ngModel)]="newOrder.status"
                    name="status"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <!-- Items Section -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Order Items</h3>
                
                <div class="space-y-3 mb-4">
                  @for (item of newOrder.items; track $index) {
                    <div class="flex gap-3 items-end">
                      <input
                        type="text"
                        [(ngModel)]="item.itemName"
                        name="itemName_{{$index}}"
                        placeholder="Item name"
                        class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        [(ngModel)]="item.quantity"
                        name="quantity_{{$index}}"
                        placeholder="Qty"
                        min="1"
                        class="w-20 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        [(ngModel)]="item.price"
                        name="price_{{$index}}"
                        placeholder="Price"
                        step="0.01"
                        class="w-24 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        (click)="removeItem($index)"
                        class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    </div>
                  }
                </div>

                <button
                  type="button"
                  (click)="addItem()"
                  class="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  + Add Item
                </button>
              </div>

              <!-- Total Amount -->
              <div class="bg-slate-50 p-4 rounded-lg">
                <p class="text-slate-600 text-sm font-medium mb-1">Total Amount</p>
                <p class="text-3xl font-bold text-slate-900">
                  <span class="currency-prefix">$</span>{{ calculateTotal().toFixed(2) }}
                </p>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                <textarea
                  [(ngModel)]="newOrder.notes"
                  name="notes"
                  placeholder="Any special requests or notes..."
                  rows="2"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <!-- Modal Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeOrderModal()"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
                >
                  {{ isEditing() ? 'Update Order' : 'Create Order' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Messages -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-lg shadow-lg">
          {{ successMessage() }}
        </div>
      }
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class RestaurantOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  showOrderModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedStatus = signal('');
  selectedType = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  restaurantId = signal<string>('');

  newOrder: Order = this.getEmptyOrder();

  constructor(private foodService: FoodService) {}

  ngOnInit() {
    // Get restaurant ID from localStorage (set during login)
    const restaurantId = localStorage.getItem('restaurantId');
    if (restaurantId) {
      this.restaurantId.set(restaurantId);
      this.loadOrders();
    } else {
      this.errorMessage.set('Restaurant ID not found. Please log in again.');
    }
  }

  loadOrders() {
    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.isLoading.set(true);
    this.foodService.getRestaurantOrders(restaurantId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.orders.set(response.data);
          this.filterOrders();
        } else {
          // Fallback to empty array if no data
          this.orders.set([]);
          this.filterOrders();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading orders:', error);
        this.errorMessage.set('Failed to load orders. Please try again later.');
        // Keep existing orders in case of error
        this.filterOrders();
      }
    });
  }

  filterOrders() {
    let filtered = this.orders();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus()) {
      filtered = filtered.filter(o => o.status === this.selectedStatus());
    }

    if (this.selectedType()) {
      filtered = filtered.filter(o => o.orderType === this.selectedType());
    }

    this.filteredOrders.set(filtered);
  }

  countByStatus(status: string): number {
    return this.orders().filter(o => o.status === status).length;
  }

  calculateTotal(): number {
    return this.newOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  openAddOrderModal() {
    this.isEditing.set(false);
    this.newOrder = this.getEmptyOrder();
    this.showOrderModal.set(true);
  }

  editOrder(order: Order) {
    this.isEditing.set(true);
    this.newOrder = { ...order, items: order.items.map(i => ({ ...i })) };
    this.showOrderModal.set(true);
  }

  closeOrderModal() {
    this.showOrderModal.set(false);
    this.newOrder = this.getEmptyOrder();
    this.isEditing.set(false);
  }

  addItem() {
    this.newOrder.items.push({ itemName: '', quantity: 1, price: 0 });
  }

  removeItem(index: number) {
    this.newOrder.items.splice(index, 1);
  }

  saveOrder() {
    if (!this.newOrder.customerName || !this.newOrder.status || this.newOrder.items.length === 0) {
      this.errorMessage.set('Please fill in customer name, status, and add at least one item');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.newOrder.totalAmount = this.calculateTotal();

    if (this.isEditing() && this.newOrder._id) {
      // Update existing order via API
      this.isLoading.set(true);
      this.foodService.getOrderById(restaurantId, this.newOrder._id).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          // The component will update the local state
          const index = this.orders().findIndex(o => o._id === this.newOrder._id);
          if (index !== -1) {
            const updated = [...this.orders()];
            updated[index] = this.newOrder;
            this.orders.set(updated);
          }
          this.successMessage.set('Order updated successfully!');
          this.filterOrders();
          this.closeOrderModal();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to update order');
          console.error('Error updating order:', error);
        }
      });
    } else {
      // Create new order via API
      this.isLoading.set(true);
      this.foodService.createOrder(restaurantId, this.newOrder).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success' && response.data) {
            // Add the created order to the list
            this.orders.set([...this.orders(), response.data]);
            this.successMessage.set('Order created successfully!');
          } else {
            this.errorMessage.set('Failed to create order');
          }
          this.filterOrders();
          this.closeOrderModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to create order');
          console.error('Error creating order:', error);
        }
      });
    }
  }

  deleteOrder(orderId?: string) {
    if (!orderId) return;

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    if (confirm('Are you sure you want to delete this order?')) {
      this.isLoading.set(true);
      this.foodService.deleteOrder(restaurantId, orderId).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.orders.set(this.orders().filter(o => o._id !== orderId));
            this.filterOrders();
            this.successMessage.set('Order deleted successfully!');
            setTimeout(() => this.successMessage.set(''), 3000);
          } else {
            this.errorMessage.set('Failed to delete order');
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete order');
          console.error('Error deleting order:', error);
        }
      });
    }
  }

  private getEmptyOrder(): Order {
    return {
      orderNumber: '',
      customerName: '',
      items: [{ itemName: '', quantity: 1, price: 0 }],
      totalAmount: 0,
      status: 'pending',
      orderType: 'dine-in'
    };
  }
}
