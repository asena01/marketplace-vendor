import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';

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
    <div class="space-y-8">
      @if (viewMode() === 'list') {
        <!-- Enhanced Summary Section -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <mat-icon>restaurant</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p class="text-2xl font-black text-slate-900">{{ foodOrders().length }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <mat-icon>hourglass_top</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending</p>
              <p class="text-2xl font-black text-slate-900">{{ getPendingCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <mat-icon>local_fire_department</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Preparing</p>
              <p class="text-2xl font-black text-slate-900">{{ getPreparingCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <mat-icon>done_all</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Ready</p>
              <p class="text-2xl font-black text-slate-900">{{ getReadyCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Delivered</p>
              <p class="text-2xl font-black text-slate-900">{{ getDeliveredCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Orders Cards -->
        @if (foodOrders().length > 0) {
          <div class="space-y-6">
            <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-2 h-8 bg-orange-600 rounded-full"></span>
              Recent Food Orders
            </h3>
            <div class="grid grid-cols-1 gap-6">
              @for (order of foodOrders(); track order._id) {
                <div class="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 group">
                  <div class="flex flex-col lg:flex-row">
                    <!-- Order Status & Left Panel -->
                    <div [class]="'lg:w-1/4 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden ' +
                      (order.status === 'delivered' ? 'bg-green-600 text-white' :
                       order.status === 'cancelled' ? 'bg-slate-100 text-slate-400' :
                       'bg-orange-600 text-white')">

                      <div class="relative z-10">
                        <mat-icon class="text-5xl mb-4 opacity-80">restaurant</mat-icon>
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Status</p>
                        <p class="text-xl font-black uppercase tracking-tight">{{ getStatusBadge(order.status) }}</p>
                      </div>

                      <div class="relative z-10 mt-8 pt-6 border-t border-white/20 w-full">
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Order ID</p>
                        <p class="text-xs font-mono font-bold">#{{ order._id.slice(-8) }}</p>
                      </div>

                      <!-- Decorative circle -->
                      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                    </div>

                    <!-- Right Panel Info -->
                    <div class="lg:w-3/4 p-8">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                          <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-1">{{ order.restaurantName }}</h3>
                          <p class="text-orange-600 font-bold flex items-center gap-1">
                            <mat-icon class="text-sm">shopping_bag</mat-icon>
                            {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }} ordered
                          </p>
                        </div>
                        <div class="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                          <p class="text-2xl font-black text-slate-900">₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Time</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-orange-500 text-sm">schedule</mat-icon>
                            <span class="font-bold text-slate-800">{{ order.orderDate ? formatDate(order.orderDate) : (order.createdAt ? formatDate(order.createdAt) : '-') }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Time</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-blue-500 text-sm">delivery_dining</mat-icon>
                            <span class="font-bold text-slate-800">{{ order.estimatedDelivery ? formatTime(order.estimatedDelivery) : 'Asap' }}</span>
                          </div>
                        </div>
                        <div class="space-y-1 col-span-2">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                          <div class="flex items-start gap-2">
                            <mat-icon class="text-slate-400 text-sm mt-0.5">location_on</mat-icon>
                            <span class="font-bold text-slate-800 line-clamp-1">{{ order.customerAddress || 'Default Address' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex flex-wrap gap-3 pt-6 border-t border-slate-50">
                        <button
                          (click)="viewOrderDetails(order)"
                          class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100">
                          <mat-icon class="text-lg">info</mat-icon>
                          <span>Order Details</span>
                        </button>

                        <button
                          (click)="chatWithRestaurant(order)"
                          class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                          <mat-icon class="text-lg">chat</mat-icon>
                          <span>Chat Support</span>
                        </button>

                        @if (order.status === 'pending') {
                          <button
                            (click)="cancelOrderConfirm(order)"
                            class="px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                            <mat-icon class="text-lg">cancel</mat-icon>
                            <span>Cancel</span>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-5xl text-slate-300">restaurant</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2">No food orders yet</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">Hungry? Explore local restaurants and have your favorite meals delivered.</p>
            <button
              class="bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
              Explore Restaurants
            </button>
          </div>
        }
      }

      <!-- Order Details View -->
      @if (viewMode() === 'details' && selectedOrder()) {
        @let order = selectedOrder();
        <div class="bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col animate-in duration-300">
          <!-- Header -->
          <div class="bg-orange-600 text-white p-10 relative overflow-hidden">
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Order Summary</p>
                <h2 class="text-3xl font-black tracking-tight">{{ order!.restaurantName }}</h2>
                <p class="text-orange-100/80 font-bold mt-1 flex items-center gap-2">
                  <mat-icon class="text-sm">tag</mat-icon>
                  #{{ order!._id.slice(0, 16) }}
                </p>
              </div>
              <button (click)="closeOrderModal()" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-colors">
                <mat-icon>arrow_back</mat-icon>
                <span class="font-bold">Back to List</span>
              </button>
            </div>
            <!-- Decorative background element -->
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
          </div>

          <!-- Content -->
          <div class="p-10 space-y-10">
            <!-- Summary Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Status</p>
                <p class="font-black text-orange-600 uppercase">{{ getStatusBadge(order!.status) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                <p class="font-black text-slate-900">{{ order!.orderDate ? formatDate(order!.orderDate) : (order!.createdAt ? formatDate(order!.createdAt) : '-') }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                <p class="font-black text-slate-900">{{ order!.items.length }} Items</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p class="font-black text-slate-900">₦{{ (order!.total || order!.totalPrice || 0).toLocaleString() }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <!-- Order Items -->
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <mat-icon class="text-sm">shopping_cart</mat-icon>
                  Ordered Items
                </h3>
                <div class="space-y-4">
                  @for (item of order!.items; track item.name) {
                    <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 font-black shadow-sm border border-slate-100">
                          {{ item.quantity }}x
                        </div>
                        <div>
                          <p class="font-black text-slate-900">{{ item.name }}</p>
                          <p class="text-xs text-slate-400 font-bold">₦{{ item.price.toLocaleString() }} per unit</p>
                        </div>
                      </div>
                      <p class="font-black text-slate-900">₦{{ (item.price * item.quantity).toLocaleString() }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Delivery & Payment -->
              <div class="space-y-8">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <mat-icon class="text-sm">location_on</mat-icon>
                    Delivery Details
                  </h3>
                  <div class="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <div class="space-y-4">
                      <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipient</p>
                        <p class="font-bold text-slate-900">{{ order!.customerName || 'Customer Name' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p class="font-bold text-slate-900">{{ order!.customerPhone || '-' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
                        <p class="font-bold text-slate-900 leading-relaxed">{{ order!.customerAddress || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <mat-icon class="text-sm">payments</mat-icon>
                    Payment Summary
                  </h3>
                  <div class="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-200">
                    <div class="space-y-4">
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Subtotal</span>
                        <span>₦{{ (order!.total || order!.totalPrice || 0).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Delivery Fee</span>
                        <span>₦0.00</span>
                      </div>
                      <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span class="font-black uppercase text-xs tracking-widest">Total Paid</span>
                        <span class="text-3xl font-black text-orange-500">₦{{ (order!.total || order!.totalPrice || 0).toLocaleString() }}</span>
                      </div>
                      <p class="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">
                        Paid via {{ order!.paymentMethod || 'Credit Card' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-10 bg-slate-50 border-t border-slate-100">
            <div class="flex gap-4">
              <button
                (click)="chatWithRestaurant(order!)"
                class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2">
                <mat-icon>chat</mat-icon>
                <span>Chat with Restaurant</span>
              </button>
              <button
                (click)="closeOrderModal()"
                class="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all">
                Return to Orders
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }
    .animate-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class CustomerFoodOrdersComponent implements OnInit {
  foodOrders = signal<FoodOrder[]>([]);
  selectedOrder = signal<FoodOrder | null>(null);
  viewMode = signal<'list' | 'details'>('list');

  constructor(private customerService: CustomerService, private toastService: ToastService) {}

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
    return this.foodOrders().filter(o => o.status === 'preparing' || o.status === 'confirmed').length;
  }

  getReadyCount(): number {
    return this.foodOrders().filter(o => o.status === 'ready' || o.status === 'on_the_way').length;
  }

  getDeliveredCount(): number {
    return this.foodOrders().filter(o => o.status === 'delivered').length;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      on_the_way: 'On The Way',
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
      on_the_way: 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      delivered: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewOrderDetails(order: FoodOrder): void {
    this.selectedOrder.set(order);
    this.viewMode.set('details');
  }

  closeOrderModal(): void {
    this.viewMode.set('list');
    this.selectedOrder.set(null);
  }

  cancelOrderConfirm(order: FoodOrder): void {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      this.cancelOrder(order);
    }
  }

  cancelOrder(order: FoodOrder): void {
    console.log('❌ Cancelling order:', order._id);

    this.foodOrders.update(orders =>
      orders.map(o =>
        o._id === order._id
          ? { ...o, status: 'cancelled' }
          : o
      )
    );

    this.closeOrderModal();
    this.toastService.success('Order has been cancelled');
  }

  chatWithRestaurant(order: FoodOrder): void {
    console.log('💬 Opening chat for restaurant:', order.restaurantName);
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'chat' }));

    const chatData = {
      vendorType: 'restaurant',
      orderId: order._id,
      vendorName: order.restaurantName
    };
    sessionStorage.setItem('pendingChat', JSON.stringify(chatData));
  }
}
