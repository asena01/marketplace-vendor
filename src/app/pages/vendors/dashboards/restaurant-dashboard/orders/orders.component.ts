import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FoodService } from '../../../../../services/food.service';
import { DeliveryService } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';
import { RestaurantService } from '../../../../../services/restaurant.service';
import { CustomerService } from '../../../../../services/customer.service';

interface OrderItem {
  itemName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  tableNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeout' | 'delivery';
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

interface ChatMessage {
  _id: string;
  sender: 'customer' | 'vendor';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface VendorChat {
  _id: string;
  bookingId?: string;
  orderId?: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'hotel' | 'restaurant' | 'retail' | 'service' | 'tour' | 'delivery';
  vendorIcon: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  customerId?: string;
}

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p class="text-slate-600 mt-1">Track and manage restaurant orders</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="loadOrders()"
            [disabled]="isLoading()"
            class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <mat-icon class="text-sm">{{ isLoading() ? 'schedule' : 'refresh' }}</mat-icon>
            {{ isLoading() ? 'Loading...' : 'Reload' }}
          </button>
          <button
            (click)="openAddOrderModal()"
            class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            ➕ New Order from Menu
          </button>
        </div>
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
                    <td class="px-6 py-4 font-medium text-slate-900">{{ formatPrice(order.totalAmount) }}</td>
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
                    <td class="px-6 py-4 space-x-2 flex items-center gap-2">
                      <button
                        (click)="editOrder(order)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <mat-icon class="text-sm">edit</mat-icon>
                      </button>
                      <button
                        (click)="openStatusMenu(order)"
                        class="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
                      >
                        <mat-icon class="text-sm">update</mat-icon>
                      </button>
                      <button
                        (click)="openOrderChat(order)"
                        class="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                      >
                        <mat-icon class="text-sm">chat</mat-icon>
                      </button>
                      <button
                        (click)="deleteOrder(order._id)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- New Order Modal -->
      @if (showOrderModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 class="text-xl font-bold text-slate-900">{{ isEditing() ? 'Edit Order' : 'Create New Order' }}</h2>
              <button (click)="closeOrderModal()" class="text-slate-500 hover:text-slate-700 text-2xl leading-none">✕</button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Customer Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    [(ngModel)]="newOrder.customerName"
                    placeholder="Enter customer name"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="newOrder.customerPhone"
                    placeholder="Phone number"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <!-- Order Type -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Order Type</label>
                  <select
                    [(ngModel)]="newOrder.orderType"
                    (change)="onOrderTypeChange()"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="dine-in">Dine-In</option>
                    <option value="takeout">Takeout</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                @if (newOrder.orderType === 'dine-in') {
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Table Number</label>
                    <input
                      type="text"
                      [(ngModel)]="newOrder.tableNumber"
                      placeholder="Table #"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                }
                @if (newOrder.orderType === 'delivery') {
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <input
                      type="text"
                      [(ngModel)]="newOrder.customerAddress"
                      placeholder="Delivery address"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                }
              </div>

              <!-- Menu Item Selection -->
              <div class="border-t border-slate-200 pt-4">
                <h3 class="font-semibold text-slate-900 mb-4">Add Items from Menu</h3>
                @if (isLoadingMenu()) {
                  <p class="text-slate-600">Loading menu items...</p>
                } @else if (menuItems().length === 0) {
                  <p class="text-slate-600">No menu items available</p>
                } @else {
                  <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Item</label>
                        <select
                          [(ngModel)]="selectedMenuItem"
                          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select item...</option>
                          @for (item of menuItems(); track item._id) {
                            <option [value]="item._id">{{ item.name }} - {{ formatPrice(item.price || 0) }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          [(ngModel)]="selectedMenuItemQuantity"
                          [min]="1"
                          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div class="flex items-end">
                        <button
                          (click)="addMenuItemToOrder()"
                          [disabled]="!selectedMenuItem() || selectedMenuItemQuantity() < 1"
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Items in Order -->
              @if (newOrder.items.length > 0) {
                <div class="border-t border-slate-200 pt-4">
                  <h3 class="font-semibold text-slate-900 mb-4">Order Items</h3>
                  <div class="space-y-2">
                    @for (item of newOrder.items; track $index) {
                      <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div class="flex-1">
                          <p class="font-medium text-slate-900">{{ item.itemName }}</p>
                          <p class="text-sm text-slate-600">Qty: {{ item.quantity }} x {{ formatPrice(item.price) }}</p>
                        </div>
                        <div class="text-right mr-4">
                          <p class="font-semibold text-slate-900">{{ formatItemTotal(item.quantity, item.price) }}</p>
                        </div>
                        <button
                          (click)="removeItem($index)"
                          class="text-red-600 hover:text-red-700 font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    }
                  </div>

                  <!-- Total -->
                  <div class="mt-4 pt-4 border-t border-slate-200">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-bold text-slate-900">Total:</span>
                      <span class="text-2xl font-bold text-orange-600">{{ formatPrice(calculateTotal()) }}</span>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="border-t border-slate-200 pt-4 text-center text-slate-600">
                  No items added yet
                </div>
              }

              <!-- Delivery Service Selection -->
              @if (newOrder.orderType === 'delivery' && integratedDeliveryServices().length > 0) {
                <div class="border-t border-slate-200 pt-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Delivery Service</label>
                  <select
                    [(ngModel)]="selectedDeliveryServiceId"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select delivery service...</option>
                    @for (service of integratedDeliveryServices(); track service._id) {
                      <option [value]="service._id">{{ service.name }}</option>
                    }
                  </select>
                </div>
              }

              <!-- Notes -->
              <div class="border-t border-slate-200 pt-4">
                <label class="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                <textarea
                  [(ngModel)]="newOrder.notes"
                  placeholder="Any special requests or notes..."
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <button
                (click)="closeOrderModal()"
                class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="saveOrder()"
                [disabled]="isLoading()"
                class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {{ isLoading() ? 'Saving...' : (isEditing() ? 'Update Order' : 'Create Order') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Status Update Menu -->
      @if (showStatusMenu() && selectedOrder()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-slate-900">Update Order Status</h2>
              <button (click)="closeStatusMenu()" class="text-slate-500 hover:text-slate-700 text-2xl leading-none">✕</button>
            </div>

            <div class="space-y-3">
              @for (status of ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled']; track status) {
                <button
                  (click)="updateOrderStatus(selectedOrder()!, status)"
                  [disabled]="isUpdatingStatus() || selectedOrder()?.status === status"
                  [ngClass]="{
                    'bg-blue-100 text-blue-700': status === 'pending',
                    'bg-orange-100 text-orange-700': status === 'preparing',
                    'bg-yellow-100 text-yellow-700': status === 'ready',
                    'bg-green-100 text-green-700': status === 'served' || status === 'completed',
                    'bg-red-100 text-red-700': status === 'cancelled',
                    'opacity-50 cursor-not-allowed': selectedOrder()?.status === status
                  }"
                  class="w-full px-4 py-3 rounded-lg font-medium transition"
                >
                  {{ status | titlecase }}
                </button>
              }
            </div>

            <div class="mt-6 flex gap-3 justify-end">
              <button
                (click)="closeStatusMenu()"
                class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Chat Modal -->
      @if (showChatModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
            <!-- Chat Header -->
            <div class="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ currentOrderChat().subject }}</h2>
                <p class="text-sm text-slate-600">Status: {{ currentOrderChat().status | titlecase }}</p>
              </div>
              <button (click)="closeChatModal()" class="text-slate-500 hover:text-slate-700 text-2xl leading-none">✕</button>
            </div>

            <!-- Chat Messages -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              @for (message of currentOrderChat().messages; track message._id) {
                <div [ngClass]="{
                  'flex justify-end': message.sender === 'vendor',
                  'flex justify-start': message.sender === 'customer'
                }">
                  <div [ngClass]="{
                    'bg-orange-100 text-orange-900': message.sender === 'vendor',
                    'bg-slate-100 text-slate-900': message.sender === 'customer'
                  }" class="max-w-xs px-4 py-2 rounded-lg">
                    <p class="text-xs font-semibold mb-1">{{ message.senderName }}</p>
                    <p class="text-sm">{{ message.message }}</p>
                    <p class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Chat Input -->
            <div class="border-t border-slate-200 px-6 py-4 flex gap-2">
              <input
                type="text"
                [ngModel]="chatMessage()"
                (ngModelChange)="chatMessage.set($event)"
                placeholder="Type your message..."
                (keyup.enter)="sendChatMessage()"
                class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                (click)="sendChatMessage()"
                [disabled]="!chatMessage().trim() || isSendingMessage()"
                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {{ isSendingMessage() ? '...' : 'Send' }}
              </button>
            </div>
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
  `
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

  // Delivery service signals
  integratedDeliveryServices = signal<any[]>([]);
  selectedDeliveryServiceId = signal<string>('');
  hasOwnDelivery = signal(false);
  isLoadingDeliveryServices = signal(false);

  // Status update signals
  showStatusMenu = signal(false);
  isUpdatingStatus = signal(false);

  // Chat signals
  showChatModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  currentOrderChat = signal<VendorChat>({
    _id: '',
    vendorId: '',
    vendorName: '',
    vendorType: 'restaurant',
    vendorIcon: '🍕',
    subject: '',
    status: 'open',
    messages: [],
    createdAt: '',
    updatedAt: ''
  });
  chatMessage = signal('');
  isSendingMessage = signal(false);
  vendorChats = signal<Map<string, VendorChat>>(new Map());

  // Menu signals
  menuItems = signal<any[]>([]);
  isLoadingMenu = signal(false);
  selectedMenuItem = signal<string>('');
  selectedMenuItemQuantity = signal<number>(1);

  newOrder: Order = this.getEmptyOrder();

  constructor(
    private foodService: FoodService,
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    const restaurantId = localStorage.getItem('restaurantId');
    const userId = localStorage.getItem('userId');
    const storeId = localStorage.getItem('storeId');

    console.log('🍽️ Restaurant Dashboard Init:', {
      restaurantId,
      userId,
      storeId
    });

    if (restaurantId || storeId) {
      const id = restaurantId || storeId;
      if (id) {
        this.restaurantId.set(id);
        this.loadOrders();
      }
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

    console.log(`📥 Loading orders for restaurant: ${restaurantId}`);
    this.isLoading.set(true);

    this.foodService.getRestaurantOrders(restaurantId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('📦 Orders response:', response);

        if (response.status === 'success' && response.data) {
          console.log(`✅ Loaded ${response.data.length} orders`);
          this.orders.set(response.data);
          this.filterOrders();
        } else if (response.success && response.data) {
          console.log(`✅ Loaded ${response.data.length} orders`);
          this.orders.set(response.data);
          this.filterOrders();
        } else {
          console.log('ℹ️ No orders found');
          this.orders.set([]);
          this.filterOrders();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('❌ Error loading orders:', error);
        this.errorMessage.set('Failed to load orders');
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

  formatPrice(price: number): string {
    return `$${(price || 0).toFixed(2)}`;
  }

  formatItemTotal(quantity: number, price: number): string {
    return `$${(quantity * price).toFixed(2)}`;
  }

  loadMenuItems() {
    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      console.warn('⚠️ No restaurant ID');
      return;
    }

    this.isLoadingMenu.set(true);
    console.log(`📥 Loading menu items`);

    this.foodService.getRestaurantMenus(restaurantId).subscribe({
      next: (response: any) => {
        this.isLoadingMenu.set(false);
        console.log('✅ Menu loaded:', response);

        if (response.success && response.data && Array.isArray(response.data)) {
          this.menuItems.set(response.data);
        } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          this.menuItems.set(response.data.items);
        } else if (Array.isArray(response.data)) {
          this.menuItems.set(response.data);
        } else {
          this.menuItems.set([]);
        }
      },
      error: (error: any) => {
        this.isLoadingMenu.set(false);
        console.error('❌ Error loading menu:', error);
        this.menuItems.set([]);
      }
    });
  }

  addMenuItemToOrder() {
    const itemId = this.selectedMenuItem();
    const quantity = this.selectedMenuItemQuantity();

    if (!itemId || quantity < 1) {
      this.errorMessage.set('Select an item and quantity');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const menuItem = this.menuItems().find(m => m._id === itemId);
    if (!menuItem) {
      this.errorMessage.set('Item not found');
      return;
    }

    const existingIndex = this.newOrder.items.findIndex(i => i.itemName === menuItem.name);
    if (existingIndex !== -1) {
      this.newOrder.items[existingIndex].quantity += quantity;
    } else {
      this.newOrder.items.push({
        itemName: menuItem.name,
        quantity,
        price: menuItem.price || 0
      });
    }

    this.selectedMenuItem.set('');
    this.selectedMenuItemQuantity.set(1);

    this.successMessage.set(`✅ Added ${menuItem.name}`);
    setTimeout(() => this.successMessage.set(''), 2000);
  }

  openAddOrderModal() {
    this.isEditing.set(false);
    this.newOrder = this.getEmptyOrder();
    this.selectedDeliveryServiceId.set('');
    this.selectedMenuItem.set('');
    this.selectedMenuItemQuantity.set(1);
    this.showOrderModal.set(true);
    this.loadMenuItems();
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
    if (!this.newOrder.customerName || !this.newOrder.items.length) {
      this.errorMessage.set('Fill in customer name and add items');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.newOrder.totalAmount = this.calculateTotal();
    this.isLoading.set(true);

    if (this.isEditing() && this.newOrder._id) {
      // Update existing order
      this.foodService.updateOrder(restaurantId, this.newOrder._id, this.newOrder).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            const idx = this.orders().findIndex(o => o._id === this.newOrder._id);
            if (idx !== -1) {
              const updated = [...this.orders()];
              updated[idx] = response.data;
              this.orders.set(updated);
            }
            this.filterOrders();
            this.successMessage.set('✅ Order updated!');
            this.closeOrderModal();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to update order');
          console.error(error);
        }
      });
    } else {
      // Create new order
      this.foodService.createOrder(restaurantId, this.newOrder).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.orders.set([...this.orders(), response.data]);
            this.filterOrders();
            this.successMessage.set('✅ Order created!');
            this.closeOrderModal();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to create order');
          console.error(error);
        }
      });
    }
  }

  deleteOrder(orderId?: string) {
    if (!orderId || !confirm('Delete this order?')) return;

    const restaurantId = this.restaurantId();
    if (!restaurantId) return;

    this.isLoading.set(true);
    this.foodService.deleteOrder(restaurantId, orderId).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.orders.set(this.orders().filter(o => o._id !== orderId));
        this.filterOrders();
        this.successMessage.set('✅ Order deleted!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to delete');
      }
    });
  }

  getAvailableStatuses(): string[] {
    return ['pending', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'];
  }

  openStatusMenu(order: Order): void {
    this.selectedOrder.set(order);
    this.showStatusMenu.set(true);
  }

  closeStatusMenu(): void {
    this.showStatusMenu.set(false);
    this.selectedOrder.set(null);
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    if (!order._id) return;

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.isUpdatingStatus.set(true);
    this.restaurantService.updateOrderStatus(restaurantId, order._id, newStatus).subscribe({
      next: (response: any) => {
        this.isUpdatingStatus.set(false);
        if (response.success) {
          const idx = this.orders().findIndex(o => o._id === order._id);
          if (idx !== -1) {
            const updated = [...this.orders()];
            updated[idx].status = newStatus as any;
            this.orders.set(updated);
            this.filterOrders();
          }
          this.successMessage.set(`✅ Status updated`);
          this.closeStatusMenu();
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: () => {
        this.isUpdatingStatus.set(false);
        this.errorMessage.set('Failed to update');
      }
    });
  }

  openOrderChat(order: Order): void {
    this.selectedOrder.set(order);
    this.chatMessage.set('');
    this.loadOrCreateOrderChat(order);
    this.showChatModal.set(true);
  }

  closeChatModal(): void {
    this.showChatModal.set(false);
    this.selectedOrder.set(null);
    this.chatMessage.set('');
  }

  loadOrCreateOrderChat(order: Order): void {
    const chatMap = this.vendorChats();
    if (chatMap.has(order._id || '')) {
      const existing = chatMap.get(order._id || '');
      if (existing) {
        this.currentOrderChat.set(existing);
        return;
      }
    }

    const newChat: VendorChat = {
      _id: `chat-${order._id}`,
      orderId: order._id,
      vendorId: this.restaurantId(),
      vendorName: 'Restaurant',
      vendorType: 'restaurant',
      vendorIcon: '🍽️',
      subject: `Order ${order.orderNumber}`,
      status: 'open',
      messages: [{
        _id: '1',
        sender: 'vendor',
        senderName: 'Restaurant',
        message: `Order #${order.orderNumber} received!`,
        timestamp: new Date().toISOString(),
        read: false
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    chatMap.set(order._id || '', newChat);
    this.vendorChats.set(new Map(chatMap));
    this.currentOrderChat.set(newChat);
  }

  sendChatMessage(): void {
    const message = this.chatMessage().trim();
    if (!message) return;

    const chat = this.currentOrderChat();
    this.isSendingMessage.set(true);

    this.restaurantService.sendVendorReply(chat._id, message, 'Restaurant').subscribe({
      next: (response: any) => {
        this.isSendingMessage.set(false);
        if (response.success) {
          const updated = { ...chat };
          updated.messages.push(response.data);
          this.currentOrderChat.set(updated);

          const map = this.vendorChats();
          map.set(chat._id, updated);
          this.vendorChats.set(new Map(map));

          this.chatMessage.set('');
        }
      },
      error: () => {
        this.isSendingMessage.set(false);
        const updated = { ...chat };
        updated.messages.push({
          _id: `msg-${Date.now()}`,
          sender: 'vendor',
          senderName: 'Restaurant',
          message: message,
          timestamp: new Date().toISOString(),
          read: false
        });
        this.currentOrderChat.set(updated);
        this.chatMessage.set('');
      }
    });
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  onOrderTypeChange() {
    if (this.newOrder.orderType === 'delivery') {
      this.loadDeliveryServices();
    }
  }

  loadDeliveryServices() {
    const id = this.restaurantId();
    if (!id) return;

    this.isLoadingDeliveryServices.set(true);
    this.deliveryService.getBusinessDeliveries(id, 'restaurant').subscribe({
      next: (response: any) => {
        this.isLoadingDeliveryServices.set(false);
        if (response.status === 'success' && response.data) {
          const active = response.data.filter((d: any) => d.status === 'active');
          this.integratedDeliveryServices.set(active);
        }
      },
      error: () => {
        this.isLoadingDeliveryServices.set(false);
      }
    });
  }

  private getEmptyOrder(): Order {
    return {
      orderNumber: '',
      customerName: '',
      items: [],
      totalAmount: 0,
      status: 'pending',
      orderType: 'dine-in'
    };
  }
}
