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
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-3xl font-bold mb-2">Shopping Orders</h2>
            <p class="text-blue-100">Track and manage all your shopping orders</p>
          </div>
          <div class="text-right">
            <p class="text-4xl font-bold">{{ shoppingOrders().length }}</p>
            <p class="text-blue-100 text-sm">Total Orders</p>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ shoppingOrders().length }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl">shopping_bag</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Processing</p>
              <p class="text-2xl font-bold text-yellow-600 mt-1">{{ getProcessingCount() }}</p>
            </div>
            <mat-icon class="text-yellow-500 text-3xl">hourglass_top</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Shipped</p>
              <p class="text-2xl font-bold text-orange-600 mt-1">{{ getShippedCount() }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl">local_shipping</mat-icon>
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

        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Cancelled</p>
              <p class="text-2xl font-bold text-red-600 mt-1">{{ getCancelledCount() }}</p>
            </div>
            <mat-icon class="text-red-500 text-3xl">cancel</mat-icon>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      @if (shoppingOrders().length > 0) {
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Payment</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (order of shoppingOrders(); track order._id) {
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                      #{{ order.orderId || order._id.substring(0, 8) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                      {{ formatDate(order.createdAt || order.orderDate) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                      <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <mat-icon class="text-xs">shopping_cart</mat-icon>
                        {{ order.items.length || 0 }} item(s)
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <span [class]="getStatusBadgeClass(order.status)" class="inline-block px-3 py-1 rounded-full text-xs font-semibold">
                        {{ getStatusBadge(order.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <span [class]="getPaymentStatusClass(order.paymentStatus)" class="inline-block px-3 py-1 rounded-full text-xs font-semibold">
                        {{ order.paymentStatus | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm space-x-2 flex items-center gap-2">
                      <button
                        (click)="viewOrderDetails(order)"
                        class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded transition"
                        title="View order details"
                      >
                        <mat-icon class="text-base">visibility</mat-icon>
                        <span class="hidden sm:inline">View</span>
                      </button>
                      @if (order.status === 'shipped' || order.status === 'processing' || order.status === 'confirmed') {
                        <button
                          (click)="trackOrder(order)"
                          class="text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-1 hover:bg-orange-50 px-3 py-1 rounded transition"
                          title="Track delivery"
                        >
                          <mat-icon class="text-base">my_location</mat-icon>
                          <span class="hidden sm:inline">Track</span>
                        </button>
                      }
                      <button
                        (click)="openSupport(order)"
                        class="text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 hover:bg-green-50 px-3 py-1 rounded transition"
                        title="Contact support"
                      >
                        <mat-icon class="text-base">chat</mat-icon>
                        <span class="hidden sm:inline">Help</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else if (isLoading()) {
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-400 animate-spin">autorenew</mat-icon>
          </div>
          <p class="text-gray-600 font-semibold">Loading your orders...</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-300">shopping_bag</mat-icon>
          </div>
          <p class="text-gray-600 text-lg font-semibold mb-2">No orders yet</p>
          <p class="text-gray-500 text-sm mb-6">Start shopping and place your first order to see orders and tracking here!</p>
          <div class="flex flex-col gap-2 justify-center sm:flex-row">
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Continue Shopping
            </button>
            <button
              (click)="createDemoOrder()"
              class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
              <mat-icon>add</mat-icon>
              <span>Create Demo Order</span>
            </button>
          </div>
        </div>
      }

      <!-- Order Details Modal -->
      @if (showOrderDetailsModal() && selectedOrder()) {
        @let order = selectedOrder()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between sticky top-0">
              <div>
                <h3 class="text-2xl font-bold">Order Details</h3>
                <p class="text-blue-100">Order #{{ order.orderId || order._id.substring(0, 8) }}</p>
              </div>
              <button
                (click)="showOrderDetailsModal.set(false)"
                class="text-white hover:bg-blue-500 p-2 rounded-lg transition"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Status Timeline -->
              <div class="border rounded-lg p-4 bg-gray-50">
                <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <mat-icon class="text-blue-600">timeline</mat-icon>
                  Order Status Timeline
                </h4>
                <div class="space-y-3">
                  <div [class]="'flex items-start gap-3 ' + (isStatusComplete('pending', order) ? 'opacity-100' : 'opacity-50')">
                    <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (isStatusComplete('pending', order) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600')">
                      <mat-icon class="text-sm">{{ isStatusComplete('pending', order) ? 'check' : 'schedule' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Order Confirmed</p>
                      <p class="text-sm text-gray-600">{{ formatDate(order.createdAt || order.orderDate) }}</p>
                    </div>
                  </div>

                  <div [class]="'flex items-start gap-3 ' + (isStatusComplete('processing', order) ? 'opacity-100' : 'opacity-50')">
                    <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (isStatusComplete('processing', order) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600')">
                      <mat-icon class="text-sm">{{ isStatusComplete('processing', order) ? 'check' : 'inventory_2' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Processing</p>
                      <p class="text-sm text-gray-600">Items being prepared</p>
                    </div>
                  </div>

                  <div [class]="'flex items-start gap-3 ' + (isStatusComplete('shipped', order) ? 'opacity-100' : 'opacity-50')">
                    <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (isStatusComplete('shipped', order) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600')">
                      <mat-icon class="text-sm">{{ isStatusComplete('shipped', order) ? 'check' : 'local_shipping' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Shipped</p>
                      <p class="text-sm text-gray-600">On the way to you</p>
                    </div>
                  </div>

                  <div [class]="'flex items-start gap-3 ' + (isStatusComplete('delivered', order) ? 'opacity-100' : 'opacity-50')">
                    <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (isStatusComplete('delivered', order) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600')">
                      <mat-icon class="text-sm">{{ isStatusComplete('delivered', order) ? 'check' : 'destination' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Delivered</p>
                      <p class="text-sm text-gray-600">{{ order.deliveryDate ? formatDate(order.deliveryDate) : 'Pending delivery' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Info Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="border rounded-lg p-4 bg-gray-50">
                  <p class="text-sm text-gray-600 font-semibold mb-1">Order Status</p>
                  <span [class]="getStatusBadgeClass(order.status)" class="inline-block px-3 py-1 rounded-full text-xs font-semibold">
                    {{ getStatusBadge(order.status) }}
                  </span>
                </div>
                <div class="border rounded-lg p-4 bg-gray-50">
                  <p class="text-sm text-gray-600 font-semibold mb-1">Payment Status</p>
                  <span [class]="getPaymentStatusClass(order.paymentStatus)" class="inline-block px-3 py-1 rounded-full text-xs font-semibold">
                    {{ order.paymentStatus | titlecase }}
                  </span>
                </div>
              </div>

              <!-- Items -->
              <div class="border rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <mat-icon class="text-blue-600">shopping_cart</mat-icon>
                  Order Items ({{ order.items.length || 0 }})
                </h4>
                <div class="space-y-3">
                  @for (item of order.items; track item.id || item.name) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex-1">
                        <p class="font-semibold text-gray-900">{{ item.name }}</p>
                        <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-gray-900">₦{{ (item.price * item.quantity).toLocaleString() }}</p>
                        <p class="text-xs text-gray-600">₦{{ item.price.toLocaleString() }} each</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Delivery Info -->
              @if (order.deliveryInfo) {
                <div class="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <mat-icon class="text-blue-600">local_shipping</mat-icon>
                    Delivery Information
                  </h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Service:</span>
                      <span class="font-semibold text-gray-900">{{ order.deliveryInfo!.serviceName }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Address:</span>
                      <span class="font-semibold text-gray-900">{{ order.deliveryInfo!.address }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Est. Delivery:</span>
                      <span class="font-semibold text-gray-900">{{ formatDeliveryTime(order.deliveryInfo!.estimatedTime) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Delivery Fee:</span>
                      <span class="font-semibold text-gray-900">₦{{ order.deliveryInfo!.price.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              }

              <!-- Order Summary -->
              <div class="border-t pt-4">
                <div class="space-y-2 text-sm mb-4">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-semibold">₦{{ (order.subtotal || order.totalPrice).toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tax:</span>
                    <span class="font-semibold">₦{{ (order.tax || 0).toLocaleString() }}</span>
                  </div>
                  @if (order.deliveryInfo?.price) {
                    <div class="flex justify-between">
                      <span class="text-gray-600">Delivery:</span>
                      <span class="font-semibold">₦{{ order.deliveryInfo!.price.toLocaleString() }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                    <span>Total:</span>
                    <span>₦{{ (order.total || order.totalPrice).toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4 border-t">
                @if (order.status === 'shipped' || order.status === 'processing' || order.status === 'confirmed') {
                  <button
                    (click)="trackOrder(selectedOrder()!)"
                    class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <mat-icon>my_location</mat-icon>
                    Track Order
                  </button>
                }
                <button
                  (click)="openSupportForOrder(selectedOrder()!)"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <mat-icon>chat</mat-icon>
                  Get Help
                </button>
                <button
                  (click)="showOrderDetailsModal.set(false)"
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <mat-icon>close</mat-icon>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tracking Modal -->
      @if (showTrackingModal() && selectedOrder()) {
        @let order = selectedOrder()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">Track Your Order</h3>
                <p class="text-orange-100">Order #{{ order.orderId || order._id.substring(0, 8) }}</p>
              </div>
              <button
                (click)="showTrackingModal.set(false)"
                class="text-white hover:bg-orange-500 p-2 rounded-lg transition"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="p-6">
              <div class="bg-orange-50 rounded-lg p-4 mb-6 text-center">
                <p class="text-gray-600 text-sm font-semibold">Current Status</p>
                <p class="text-2xl font-bold text-orange-600 mt-2">{{ getStatusBadge(order.status) }}</p>
              </div>

              <div class="space-y-4 mb-6">
                <div class="text-center">
                  <mat-icon class="text-5xl text-orange-500">local_shipping</mat-icon>
                </div>
                <p class="text-center text-gray-600">
                  @switch(order.status) {
                    @case ('confirmed') {
                      Your order has been confirmed and is being prepared for shipment
                    }
                    @case ('processing') {
                      Your order is being prepared in the warehouse. It will be shipped shortly
                    }
                    @case ('shipped') {
                      Your order is on the way!
                      @if (order.deliveryInfo?.estimatedTime) {
                        Delivery expected in {{ formatDeliveryTime(order.deliveryInfo!.estimatedTime) }}
                      } @else {
                        Expected delivery in 2-3 days
                      }
                    }
                    @case ('delivered') {
                      Your order has been successfully delivered!
                    }
                    @default {
                      Tracking information coming soon
                    }
                  }
                </p>
              </div>

              <div class="bg-blue-50 rounded-lg p-4 space-y-2 text-sm mb-6">
                @if (order.deliveryInfo) {
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-blue-600 text-lg">location_on</mat-icon>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Delivery Address</p>
                      <p class="text-gray-600">{{ order.deliveryInfo!.address }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2 pt-2 border-t border-blue-200">
                    <mat-icon class="text-blue-600 text-lg">schedule</mat-icon>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">Est. Delivery Time</p>
                      <p class="text-gray-600">{{ formatDeliveryTime(order.deliveryInfo!.estimatedTime) }}</p>
                    </div>
                  </div>
                }
              </div>

              <button
                (click)="showTrackingModal.set(false)"
                class="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Support Modal -->
      @if (showSupportModal()) {
        @let order = selectedOrder();
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">Support & Help</h3>
                @if (order) {
                  <p class="text-green-100">Order #{{ order.orderId || order._id.substring(0, 8) }}</p>
                }
              </div>
              <button
                (click)="showSupportModal.set(false)"
                class="text-white hover:bg-green-500 p-2 rounded-lg transition"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <button
                (click)="openChatSupport()"
                class="w-full text-left p-4 border rounded-lg hover:bg-blue-50 transition group"
              >
                <div class="flex items-center gap-3">
                  <mat-icon class="text-green-600 group-hover:text-blue-600 transition">chat</mat-icon>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Chat with Support</p>
                    <p class="text-xs text-gray-600">Get instant help from our team</p>
                  </div>
                  <mat-icon class="text-gray-400">arrow_forward</mat-icon>
                </div>
              </button>

              <button
                (click)="submitTicket()"
                class="w-full text-left p-4 border rounded-lg hover:bg-yellow-50 transition group"
              >
                <div class="flex items-center gap-3">
                  <mat-icon class="text-green-600 group-hover:text-yellow-600 transition">confirmation_number</mat-icon>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Create Support Ticket</p>
                    <p class="text-xs text-gray-600">Report an issue or problem</p>
                  </div>
                  <mat-icon class="text-gray-400">arrow_forward</mat-icon>
                </div>
              </button>

              <button
                (click)="requestRefund()"
                class="w-full text-left p-4 border rounded-lg hover:bg-red-50 transition group"
              >
                <div class="flex items-center gap-3">
                  <mat-icon class="text-green-600 group-hover:text-red-600 transition">money_off</mat-icon>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Request Refund</p>
                    <p class="text-xs text-gray-600">Return or refund this order</p>
                  </div>
                  <mat-icon class="text-gray-400">arrow_forward</mat-icon>
                </div>
              </button>

              <div class="pt-4 border-t space-y-2 text-xs text-gray-600">
                <p class="font-semibold">Common Issues:</p>
                <ul class="space-y-1 ml-4">
                  <li>• Order not received</li>
                  <li>• Damaged or wrong item</li>
                  <li>• Want to change delivery address</li>
                  <li>• Request cancellation</li>
                </ul>
              </div>

              <button
                (click)="showSupportModal.set(false)"
                class="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition mt-4"
              >
                Close
              </button>
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

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class CustomerShoppingComponent implements OnInit {
  shoppingOrders = signal<ShoppingOrder[]>([]);
  isLoading = signal(true);
  showOrderDetailsModal = signal(false);
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
          const orders = Array.isArray(response.data) ? response.data : [response.data];
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
    this.showOrderDetailsModal.set(true);
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
    // Store the order ID in sessionStorage so the chat component knows which order was selected
    sessionStorage.setItem('selectedOrderId', order._id);
    sessionStorage.setItem('selectedOrderName', order.orderId || order._id.substring(0, 8));

    // Close the support modal
    this.showSupportModal.set(false);

    // Navigate to the Support tab in the dashboard
    const event = new CustomEvent('switchTab', { detail: 'chat' });
    window.dispatchEvent(event);
  }

  submitTicket(): void {
    const order = this.selectedOrder();
    console.log('📝 Submitting support ticket for order:', order?._id);
    alert('📝 Support ticket feature coming soon!\n\nTicket would be created and assigned to support team for your order #' + (order?.orderId || order?._id.substring(0, 8)));
    // TODO: Integrate with actual ticket system
  }

  requestRefund(): void {
    const order = this.selectedOrder();
    console.log('💸 Requesting refund for order:', order?._id);
    alert('💸 Refund request feature coming soon!\n\nYou would be able to request a refund for order #' + (order?.orderId || order?._id.substring(0, 8)));
    // TODO: Integrate with actual refund system
  }

  createDemoOrder(): void {
    console.log('🎯 Creating demo order for testing...');
    // Create a mock demo order with shipped status
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
      tax: 0
    };

    // Add the demo order to the list
    this.shoppingOrders.update(orders => [demoOrder, ...orders]);

    alert('✅ Demo order created successfully!\n\nOrder ID: ' + demoOrder.orderId + '\n\nYou can now:\n• Click "Track" to see order tracking\n• Click "Help" to chat with support\n\nThis is a demo order for testing purposes.');

    // Automatically select and show the demo order
    setTimeout(() => {
      this.viewOrderDetails(demoOrder);
    }, 500);
  }
}
