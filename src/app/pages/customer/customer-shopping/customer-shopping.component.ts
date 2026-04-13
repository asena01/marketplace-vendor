import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';
import { TrackingService } from '../../../services/tracking.service';
import { OrderTrackingComponent } from '../order-tracking/order-tracking.component';

interface ShoppingOrder {
  _id: string;
  orderId: string;
  storeName: string;
  customerName: string;
  items: { id?: string; name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderDate: string;
  deliveryDate?: string;
  deliveryInfo?: {
    serviceId: string;
    serviceName: string;
    address: string;
    estimatedTime: number;
    price: number;
  };
  createdAt?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

@Component({
  selector: 'app-customer-shopping',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-10">
      @if (viewMode() === 'list') {
        <!-- Enhanced Summary Section -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all">
            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <mat-icon class="text-xl">shopping_bag</mat-icon>
            </div>
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Orders</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ shoppingOrders().length }}</p>
            </div>
          </div>
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all">
            <div class="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <mat-icon class="text-xl">hourglass_top</mat-icon>
            </div>
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Processing</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ getProcessingCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all">
            <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <mat-icon class="text-xl">local_shipping</mat-icon>
            </div>
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Shipped</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ getShippedCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all">
            <div class="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <mat-icon class="text-xl">check_circle</mat-icon>
            </div>
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Delivered</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ getDeliveredCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all hidden lg:flex">
            <div class="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <mat-icon class="text-xl">cancel</mat-icon>
            </div>
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cancelled</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ getCancelledCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Orders Cards -->
        @if (shoppingOrders().length > 0) {
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
                Shopping History
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4">
              @for (order of shoppingOrders(); track order._id) {
                <div class="bg-white rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 group">
                  <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <!-- Icon & Basic Info -->
                    <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                      <mat-icon class="text-3xl">shopping_cart</mat-icon>
                    </div>

                    <div class="flex-grow min-w-0">
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <h3 class="text-xl font-black text-slate-900 truncate tracking-tight">{{ order.storeName || 'Online Store' }}</h3>
                        <span [class]="getStatusBadgeClass(order.status) + ' rounded-lg px-2 py-0.5 font-black uppercase text-[10px] tracking-widest'">
                          {{ getStatusBadge(order.status) }}
                        </span>
                      </div>
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs font-bold">
                        <span class="flex items-center gap-1">
                          <mat-icon class="text-sm">tag</mat-icon>
                          #{{ (order.orderId || order._id).slice(-8) }}
                        </span>
                        <span class="flex items-center gap-1">
                          <mat-icon class="text-sm">calendar_today</mat-icon>
                          {{ formatDate(order.createdAt || order.orderDate) }}
                        </span>
                        <span class="flex items-center gap-1">
                          <mat-icon class="text-sm">inventory_2</mat-icon>
                          {{ getOrderItems(order).length }} Items
                        </span>
                      </div>
                    </div>

                    <!-- Price Block -->
                    <div class="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center md:text-right shrink-0 w-full md:w-auto">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                      <p class="text-2xl font-black text-slate-900 leading-none">₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</p>
                    </div>

                    <!-- Simplified Actions -->
                    <div class="flex gap-2 w-full md:w-auto">
                      <button
                        (click)="viewOrderDetails(order)"
                        class="flex-grow md:flex-grow-0 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100">
                        <span>Details</span>
                        <mat-icon class="text-sm">arrow_forward</mat-icon>
                      </button>
                      @if (order.status === 'shipped' || order.status === 'processing' || order.status === 'confirmed') {
                        <button
                          (click)="trackOrder(order)"
                          class="bg-orange-600 hover:bg-orange-700 text-white font-black p-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-orange-100"
                          title="Track Shipment">
                          <mat-icon>my_location</mat-icon>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else if (isLoading()) {
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 p-20 text-center">
            <mat-icon class="text-5xl text-blue-500 animate-spin mb-4">autorenew</mat-icon>
            <p class="text-slate-500 font-bold">Loading your shopping orders...</p>
          </div>
        } @else {
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-5xl text-slate-300">shopping_bag</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2">No shopping orders yet</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">Ready to shop? Explore our curated collection of stores and products.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button class="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Start Shopping
              </button>
              <button
                (click)="createDemoOrder()"
                class="bg-white border-2 border-slate-100 text-slate-400 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <mat-icon>add</mat-icon>
                <span>Create Demo Order</span>
              </button>
            </div>
          </div>
        }
      }

      <!-- Order Details View -->
      @if (viewMode() === 'details' && selectedOrder()) {
        @let order = selectedOrder();
        <div class="bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col animate-in duration-300">
          <!-- Header -->
          <div class="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <span class="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Shopping Order
                  </span>
                  <span [class]="getStatusBadgeClass(order!.status) + ' rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest'">
                    {{ getStatusBadge(order!.status) }}
                  </span>
                </div>
                <h2 class="text-4xl font-black tracking-tight mb-2">{{ order!.storeName || 'Online Store' }}</h2>
                <div class="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-bold">
                  <span class="flex items-center gap-1">
                    <mat-icon class="text-sm">tag</mat-icon>
                    #{{ order!.orderId || order!._id }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon class="text-sm">calendar_today</mat-icon>
                    {{ formatDate(order!.createdAt || order!.orderDate) }}
                  </span>
                </div>
              </div>
              <button (click)="viewMode.set('list')" class="bg-white/10 hover:bg-white/20 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2 backdrop-blur-md">
                <mat-icon>arrow_back</mat-icon>
                <span>Back to History</span>
              </button>
            </div>
            <!-- Decorative circle -->
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          <!-- Content -->
          <div class="p-8 md:p-12 space-y-12">
            <!-- Order Status & Quick Info -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                <div class="flex items-center gap-2">
                  <mat-icon [class]="order!.paymentStatus === 'completed' ? 'text-green-500' : 'text-yellow-500'">
                    {{ order!.paymentStatus === 'completed' ? 'check_circle' : 'pending' }}
                  </mat-icon>
                  <span class="font-black text-slate-900">{{ order!.paymentStatus | titlecase }}</span>
                </div>
              </div>
              <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Method</p>
                <div class="flex items-center gap-2 text-slate-900">
                  <mat-icon class="text-blue-500">local_shipping</mat-icon>
                  <span class="font-black">{{ order!.deliveryInfo?.serviceName || 'Standard' }}</span>
                </div>
              </div>
              <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                <div class="flex items-center gap-2 text-slate-900">
                  <mat-icon class="text-orange-500">event</mat-icon>
                  <span class="font-black">Within 3-5 days</span>
                </div>
              </div>
              <div class="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
                <p class="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Total Paid</p>
                <p class="text-2xl font-black leading-none mt-1">₦{{ (order!.total || order!.totalPrice || 0).toLocaleString() }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <!-- Left Column: Items List -->
              <div class="lg:col-span-2 space-y-8">
                <div>
                  <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <mat-icon class="text-blue-600">inventory</mat-icon>
                    Items Ordered
                  </h3>
                  <div class="space-y-4">
                    @for (item of getOrderItems(order!); track item.id || item.name) {
                      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                          <mat-icon class="text-4xl text-slate-300">image</mat-icon>
                        </div>
                        <div class="flex-grow">
                          <h4 class="font-black text-slate-900 text-lg mb-1">{{ item.name }}</h4>
                          <div class="flex items-center gap-4 text-slate-400 text-sm font-bold">
                            <span>Qty: {{ item.quantity }}</span>
                            <span>₦{{ item.price.toLocaleString() }} / unit</span>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-lg font-black text-slate-900 leading-none mb-1">₦{{ (item.price * item.quantity).toLocaleString() }}</p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Shipping Tracking (Mock) -->
                @if (order!.status !== 'cancelled' && order!.status !== 'pending') {
                  <div class="bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                    <h3 class="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                      <mat-icon class="text-orange-500">route</mat-icon>
                      Delivery Progress
                    </h3>
                    <div class="relative flex justify-between">
                      <div class="absolute top-4 left-0 w-full h-1 bg-slate-200 -z-0">
                        <div [class]="'h-full bg-blue-600 transition-all duration-1000 ' +
                          (order!.status === 'delivered' ? 'w-full' :
                           order!.status === 'shipped' ? 'w-2/3' : 'w-1/3')"></div>
                      </div>

                      <div class="relative z-10 flex flex-col items-center gap-2">
                        <div [class]="'w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white'">
                          <mat-icon class="text-sm">receipt</mat-icon>
                        </div>
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Placed</span>
                      </div>
                      <div class="relative z-10 flex flex-col items-center gap-2">
                        <div [class]="'w-9 h-9 rounded-full flex items-center justify-center ' + (order!.status === 'processing' || order!.status === 'shipped' || order!.status === 'delivered' ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400')">
                          <mat-icon class="text-sm">precision_manufacturing</mat-icon>
                        </div>
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Processed</span>
                      </div>
                      <div class="relative z-10 flex flex-col items-center gap-2">
                        <div [class]="'w-9 h-9 rounded-full flex items-center justify-center ' + (order!.status === 'shipped' || order!.status === 'delivered' ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400')">
                          <mat-icon class="text-sm">local_shipping</mat-icon>
                        </div>
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Shipped</span>
                      </div>
                      <div class="relative z-10 flex flex-col items-center gap-2">
                        <div [class]="'w-9 h-9 rounded-full flex items-center justify-center ' + (order!.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400')">
                          <mat-icon class="text-sm">verified</mat-icon>
                        </div>
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Delivered</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Right Column: Summary Cards -->
              <div class="space-y-8">
                <!-- Delivery Info Card -->
                <div class="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
                  <div class="absolute top-0 right-0 p-8">
                    <mat-icon class="text-6xl text-slate-50">location_on</mat-icon>
                  </div>
                  <div class="relative z-10">
                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Delivery Information</h3>
                    <div class="space-y-6">
                      <div>
                        <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Recipient</p>
                        <p class="font-black text-slate-900">{{ order!.customerName || 'Customer' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Address</p>
                        <p class="font-bold text-slate-600 leading-relaxed text-sm">{{ order!.deliveryInfo?.address || 'N/A' }}</p>
                      </div>
                      @if (order!.trackingNumber) {
                        <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Tracking ID</p>
                          <p class="font-mono font-black text-slate-900">{{ order!.trackingNumber }}</p>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Price Breakdown Card -->
                <div class="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden group">
                  <div class="relative z-10">
                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Payment Summary</h3>
                    <div class="space-y-4 mb-8">
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Items Subtotal</span>
                        <span class="text-white">₦{{ (order!.subtotal || order!.totalPrice).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Tax / VAT</span>
                        <span class="text-white">₦{{ (order!.tax || 0).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Delivery Fee</span>
                        <span class="text-white">₦{{ (order!.deliveryInfo?.price || 0).toLocaleString() }}</span>
                      </div>
                      <div class="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                          <p class="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                          <p class="text-3xl font-black text-white leading-none tracking-tight">₦{{ (order!.total || order!.totalPrice).toLocaleString() }}</p>
                        </div>
                        <div class="text-right">
                          <span class="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300">
                            {{ order!.paymentStatus | titlecase }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2">
                      <mat-icon>receipt_long</mat-icon>
                      <span>Download Receipt</span>
                    </button>
                  </div>
                  <!-- Decorative circle -->
                  <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Quick Actions -->
          <div class="p-8 md:p-12 bg-slate-50 border-t border-slate-100">
            <div class="flex flex-wrap gap-4">
              @if (order!.status === 'shipped' || order!.status === 'processing' || order!.status === 'confirmed') {
                <button
                  (click)="trackOrder(order!)"
                  class="bg-orange-600 hover:bg-orange-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3">
                  <mat-icon>my_location</mat-icon>
                  <span>Real-time Tracking</span>
                </button>
              }
              <button
                (click)="openSupportForOrder(order!)"
                class="bg-white border-2 border-slate-200 text-slate-900 font-black px-10 py-5 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                <mat-icon>support_agent</mat-icon>
                <span>Contact Store</span>
              </button>
              <button
                (click)="requestRefund()"
                class="bg-white border-2 border-slate-200 text-red-600 font-black px-10 py-5 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-3 ml-auto">
                <mat-icon>assignment_return</mat-icon>
                <span>Refund Request</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modals (Tracking & Support) -->
      <!-- Tracking Modal -->
      @if (showTrackingModal() && selectedOrder()) {
        @let order = selectedOrder()!;
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div class="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="bg-orange-600 text-white p-8 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-3xl">local_shipping</mat-icon>
              </div>
              <h2 class="text-2xl font-black tracking-tight">Track Your Order</h2>
              <p class="text-orange-100 text-sm font-bold uppercase tracking-widest mt-1">#{{ order.orderId || order._id.substring(0, 8) }}</p>
            </div>

            <div class="p-8">
              <div class="bg-slate-50 rounded-2xl p-6 mb-6 text-center">
                <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Status</p>
                <p class="text-2xl font-black text-slate-900">{{ getStatusBadge(order.status) }}</p>
              </div>

              <div class="space-y-6 mb-8">
                <p class="text-center text-slate-500 text-sm leading-relaxed">
                  @switch(order.status) {
                    @case ('confirmed') {
                      Your order has been confirmed and is being prepared for shipment.
                    }
                    @case ('processing') {
                      Your order is being prepared in the warehouse. It will be shipped shortly.
                    }
                    @case ('shipped') {
                      Your order is on the way!
                      @if (order.deliveryInfo?.estimatedTime) {
                        Delivery expected in {{ formatDeliveryTime(order.deliveryInfo!.estimatedTime) }}.
                      } @else {
                        Expected delivery in 2-3 days.
                      }
                    }
                    @case ('delivered') {
                      Your order has been successfully delivered!
                    }
                    @default {
                      Tracking information coming soon.
                    }
                  }
                </p>

                @if (order.deliveryInfo) {
                  <div class="bg-blue-50/50 rounded-2xl p-6 space-y-4 border border-blue-100/50">
                    <div class="flex items-start gap-3">
                      <mat-icon class="text-blue-600 text-xl">location_on</mat-icon>
                      <div>
                        <p class="font-black text-slate-900 text-xs uppercase tracking-tight">Delivery Address</p>
                        <p class="text-slate-600 text-sm mt-0.5">{{ order.deliveryInfo!.address }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <button
                (click)="showTrackingModal.set(false)"
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Support Modal -->
      @if (showSupportModal()) {
        @let order = selectedOrder();
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div class="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="bg-green-600 text-white p-8 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-3xl">support_agent</mat-icon>
              </div>
              <h2 class="text-2xl font-black tracking-tight">Support & Help</h2>
              @if (order) {
                <p class="text-green-100 text-sm font-bold uppercase tracking-widest mt-1">Order #{{ order.orderId || order._id.substring(0, 8) }}</p>
              }
            </div>

            <div class="p-8 space-y-3">
              <button
                (click)="openChatSupport()"
                class="w-full group bg-slate-50 hover:bg-blue-50 rounded-2xl p-6 border border-slate-100 transition-all text-left">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <mat-icon>chat</mat-icon>
                  </div>
                  <div>
                    <p class="font-black text-slate-900">Live Chat</p>
                    <p class="text-xs text-slate-400 font-bold">Instant help from our team</p>
                  </div>
                </div>
              </button>

              <button
                (click)="submitTicket()"
                class="w-full group bg-slate-50 hover:bg-yellow-50 rounded-2xl p-6 border border-slate-100 transition-all text-left">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-yellow-600 shadow-sm transition-colors group-hover:bg-yellow-600 group-hover:text-white">
                    <mat-icon>confirmation_number</mat-icon>
                  </div>
                  <div>
                    <p class="font-black text-slate-900">Support Ticket</p>
                    <p class="text-xs text-slate-400 font-bold">Report an issue or problem</p>
                  </div>
                </div>
              </button>

              <button
                (click)="requestRefund()"
                class="w-full group bg-slate-50 hover:bg-red-50 rounded-2xl p-6 border border-slate-100 transition-all text-left">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <mat-icon>assignment_return</mat-icon>
                  </div>
                  <div>
                    <p class="font-black text-slate-900">Request Refund</p>
                    <p class="text-xs text-slate-400 font-bold">Return or refund this order</p>
                  </div>
                </div>
              </button>

              <button
                (click)="showSupportModal.set(false)"
                class="w-full mt-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
                Maybe Later
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
    .zoom-in-95 {
      animation: zoomIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class CustomerShoppingComponent implements OnInit {
  shoppingOrders = signal<ShoppingOrder[]>([]);
  isLoading = signal(true);
  viewMode = signal<'list' | 'details'>('list');
  showTrackingModal = signal(false);
  showSupportModal = signal(false);
  selectedOrder = signal<ShoppingOrder | null>(null);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadShoppingOrders();
  }

  loadShoppingOrders(): void {
    const userId = localStorage.getItem('userId');
    console.log('🛍️ Loading shopping orders for user:', userId);

    this.customerService.getShoppingOrders().subscribe({
      next: (response: any) => {
        console.log('📥 Shopping orders response:', response);
        if (response.success && response.data) {
          const orders = (Array.isArray(response.data) ? response.data : [response.data]).map((order: any) => this.normalizeOrder(order));
          console.log('✅ Loaded', orders.length, 'shopping orders');
          this.shoppingOrders.set(orders);
        } else {
          console.warn('⚠️ Response missing success or data:', response);
          this.shoppingOrders.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading shopping orders:', error);
        this.shoppingOrders.set([]);
        this.isLoading.set(false);
      }
    });
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

  getCancelledCount(): number {
    return this.shoppingOrders().filter(o => o.status === 'cancelled').length;
  }

  getOrderItems(order: ShoppingOrder | null | undefined): ShoppingOrder['items'] {
    return Array.isArray(order?.items) ? order.items : [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDeliveryTime(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.ceil(minutes / 60);
    return `${hours}h`;
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  isStatusComplete(status: string, order: ShoppingOrder): boolean {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const checkIndex = statusOrder.indexOf(status);
    return currentIndex >= checkIndex;
  }

  viewOrderDetails(order: ShoppingOrder): void {
    this.selectedOrder.set(order);
    this.viewMode.set('details');
  }

  trackOrder(order: ShoppingOrder): void {
    this.selectedOrder.set(order);
    this.showTrackingModal.set(true);
  }

  openSupport(order: ShoppingOrder): void {
    this.selectedOrder.set(order);
    this.showSupportModal.set(true);
  }

  openSupportForOrder(order: ShoppingOrder): void {
    this.selectedOrder.set(order);
    this.showSupportModal.set(true);
  }

  openChatSupport(): void {
    const order = this.selectedOrder();
    if (!order) return;

    console.log('💬 Opening chat support for order:', order._id);
    sessionStorage.setItem('selectedOrderId', order._id);
    sessionStorage.setItem('selectedOrderName', order.orderId || order._id.substring(0, 8));

    this.showSupportModal.set(false);
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'chat' }));
  }

  submitTicket(): void {
    const order = this.selectedOrder();
    console.log('📝 Submitting support ticket for order:', order?._id);
    alert('📝 Support ticket feature coming soon!\n\nTicket would be created for your order #' + (order?.orderId || order?._id.substring(0, 8)));
  }

  requestRefund(): void {
    const order = this.selectedOrder();
    console.log('💸 Requesting refund for order:', order?._id);
    alert('💸 Refund request feature coming soon!\n\nYou would be able to request a refund for order #' + (order?.orderId || order?._id.substring(0, 8)));
  }

  createDemoOrder(): void {
    console.log('🎯 Creating demo order for testing...');
    const demoOrder: ShoppingOrder = {
      _id: 'demo-order-' + Date.now(),
      orderId: `ORD-DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      storeName: 'Demo Store',
      customerName: 'You',
      items: [
        { id: '1', name: 'Demo Product 1', quantity: 2, price: 5000 },
        { id: '2', name: 'Demo Product 2', quantity: 1, price: 8500 }
      ],
      totalPrice: 18500,
      status: 'shipped',
      paymentStatus: 'completed',
      orderDate: new Date().toISOString(),
      deliveryDate: undefined,
      deliveryInfo: {
        serviceId: 'demo-service',
        serviceName: 'Demo Delivery Service',
        address: '123 Demo Street, Demo City',
        estimatedTime: 45,
        price: 2000
      },
      createdAt: new Date().toISOString(),
      total: 18500,
      subtotal: 16500,
      tax: 0,
      trackingNumber: 'TRK-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    };

    this.shoppingOrders.update(orders => [demoOrder, ...orders]);
    setTimeout(() => this.viewOrderDetails(demoOrder), 500);
  }

  private normalizeOrder(order: any): ShoppingOrder {
    const items = Array.isArray(order?.items)
      ? order.items.map((item: any) => ({
          id: item?.id,
          name: item?.name || item?.productName || 'Item',
          quantity: Number(item?.quantity || 1),
          price: Number(item?.price || 0)
        }))
      : [];

    return {
      ...order,
      items,
      storeName: order?.storeName || order?.items?.[0]?.vendorName || 'Online Store',
      customerName: order?.customerName || 'Customer',
      totalPrice: Number(order?.totalPrice || order?.total || 0),
      total: Number(order?.total || order?.totalPrice || 0),
      subtotal: Number(order?.subtotal || 0),
      tax: Number(order?.tax || 0)
    };
  }
}
