import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, Order } from '../../../../../services/order.service';
import { CustomerService } from '../../../../../services/customer.service';
import { ProductService } from '../../../../../services/product.service';
import { TrackingService } from '../../../../../services/tracking.service';

interface ChatMessage {
  sender: 'vendor' | 'customer';
  senderName: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-retail-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Gradient Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">Orders Management</h1>
            <p class="text-blue-100">View, filter, and manage all customer orders</p>
          </div>
          <button
            (click)="exportOrders()"
            class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <mat-icon>download</mat-icon>
            <span class="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <!-- Inventory Alert -->
      @if (showInventoryAlert() && lowStockProducts().length > 0) {
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
          <div class="flex items-start gap-3">
            <mat-icon class="text-amber-600 text-2xl mt-1">warning</mat-icon>
            <div class="flex-1">
              <h3 class="font-semibold text-amber-900 mb-1">Low Stock Alert</h3>
              <p class="text-amber-800 text-sm mb-3">{{ inventoryAlertMessage() }}</p>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                @for (product of lowStockProducts(); track product._id) {
                  <div class="bg-white p-2 rounded border border-amber-200 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="font-medium text-gray-900">{{ product.name }}</span>
                      <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
                        {{ product.stock }} in stock
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
            <button
              (click)="showInventoryAlert.set(false)"
              class="text-amber-600 hover:text-amber-800 flex-shrink-0"
            >
              <mat-icon class="text-lg">close</mat-icon>
            </button>
          </div>
        </div>
      }

      <!-- Quick Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalOrders() }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl opacity-60">shopping_cart</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Pending</p>
              <p class="text-2xl font-bold text-yellow-600 mt-1">{{ pendingCount() }}</p>
            </div>
            <mat-icon class="text-yellow-500 text-3xl opacity-60">schedule</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Processing</p>
              <p class="text-2xl font-bold text-orange-600 mt-1">{{ processingCount() }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl opacity-60">hourglass_top</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Shipped</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">{{ shippedCount() }}</p>
            </div>
            <mat-icon class="text-purple-500 text-3xl opacity-60">local_shipping</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Delivered</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ deliveredCount() }}</p>
            </div>
            <mat-icon class="text-green-500 text-3xl opacity-60">check_circle</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-700 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-xs font-semibold uppercase tracking-wide">Revenue</p>
              <p class="text-2xl font-bold text-green-700 mt-1">₦{{ totalRevenue() | number: '1.0-0' }}</p>
            </div>
            <mat-icon class="text-green-700 text-3xl opacity-60">trending_up</mat-icon>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadOrders()"
              placeholder="Order ID, Customer name..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="loadOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Payment Status Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Payment</label>
            <select
              [(ngModel)]="selectedPaymentStatus"
              (change)="loadOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (change)="loadOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="-createdAt">Latest Orders</option>
              <option value="total">Lowest Total</option>
              <option value="-total">Highest Total</option>
              <option value="status">Status A-Z</option>
            </select>
          </div>

          <!-- Items per page -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Per Page</label>
            <select
              [(ngModel)]="pageSize"
              (change)="currentPage.set(1); loadOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Items</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Payment</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="px-6 py-8 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <mat-icon class="animate-spin">refresh</mat-icon>
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              } @else if (orders().length === 0) {
                <tr>
                  <td colspan="8" class="px-6 py-8 text-center text-slate-600">
                    No orders found
                  </td>
                </tr>
              } @else {
                @for (order of orders(); track order._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ order.orderId || order._id }}</td>
                    <td class="px-6 py-4">
                      <div class="text-sm">
                        <p class="font-medium text-slate-900">{{ order.customerName }}</p>
                        <p class="text-slate-500 text-xs">{{ order.customerEmail }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-900">\${{ order.total | number: '1.2-2' }}</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-700': order.status === 'pending',
                          'bg-blue-100 text-blue-700': order.status === 'confirmed',
                          'bg-purple-100 text-purple-700': order.status === 'processing',
                          'bg-orange-100 text-orange-700': order.status === 'shipped',
                          'bg-green-100 text-green-700': order.status === 'delivered',
                          'bg-red-100 text-red-700': order.status === 'cancelled'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium inline-block"
                      >
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'text-yellow-600': order.paymentStatus === 'pending',
                          'text-green-600': order.paymentStatus === 'completed',
                          'text-red-600': order.paymentStatus === 'failed',
                          'text-orange-600': order.paymentStatus === 'refunded'
                        }"
                        class="text-xs font-medium"
                      >
                        {{ order.paymentStatus | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ order.createdAt | date: 'short' }}
                    </td>
                    <td class="px-6 py-4 space-x-2 text-sm">
                      <button
                        (click)="viewOrder(order)"
                        class="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                      @if (order.status !== 'delivered' && order.status !== 'cancelled') {
                        <button
                          (click)="updateStatusModal.set(true); selectedOrder.set(order)"
                          class="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Update
                        </button>
                      }
                      <button
                        (click)="openCustomerChat(order)"
                        class="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 inline-flex"
                        title="Chat with customer"
                      >
                        <mat-icon class="text-sm">chat</mat-icon>
                        <span class="hidden md:inline">Chat</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex justify-center items-center gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1"
            class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          @for (page of paginationArray(); track page) {
            <button
              (click)="goToPage(page)"
              [ngClass]="{
                'bg-blue-600 text-white': page === currentPage(),
                'border border-slate-300 hover:bg-slate-50': page !== currentPage()
              }"
              class="px-3 py-2 rounded-lg"
            >
              {{ page }}
            </button>
          }
          <button
            (click)="nextPage()"
            [disabled]="currentPage() === totalPages()"
            class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      }

      <!-- Order Details Modal -->
      @if (showOrderDetails() && selectedOrder()) {
        @let order = selectedOrder()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-900">Order Details</h2>
                <button (click)="showOrderDetails.set(false)" class="text-2xl text-gray-500">✕</button>
              </div>

              <!-- Order Info -->
              <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p class="text-sm text-slate-600">Order ID</p>
                  <p class="text-lg font-semibold text-slate-900">{{ order.orderId || order._id }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-600">Order Date</p>
                  <p class="text-lg font-semibold text-slate-900">{{ order.createdAt | date: 'medium' }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-600">Status</p>
                  <p class="text-lg font-semibold" [ngClass]="getStatusColor(order.status)">
                    {{ order.status | titlecase }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-slate-600">Payment Status</p>
                  <p class="text-lg font-semibold" [ngClass]="getPaymentStatusColor(order.paymentStatus)">
                    {{ order.paymentStatus | titlecase }}
                  </p>
                </div>
              </div>

              <!-- Customer Info -->
              <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-slate-900">Customer Information</h3>
                  <button
                    (click)="openCustomerChat(order); showOrderDetails.set(false)"
                    class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                  >
                    <mat-icon class="text-sm">chat</mat-icon>
                    <span>Chat</span>
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-slate-600">Name</p>
                    <p class="font-medium text-slate-900">{{ order.customerName }}</p>
                  </div>
                  <div>
                    <p class="text-slate-600">Email</p>
                    <p class="font-medium text-slate-900">{{ order.customerEmail }}</p>
                  </div>
                  @if (order.shippingAddress) {
                    <div>
                      <p class="text-slate-600">Address</p>
                      <p class="font-medium text-slate-900">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                <h3 class="font-semibold text-slate-900 mb-3">Order Items</h3>
                <table class="w-full text-sm">
                  <thead class="border-b border-slate-200">
                    <tr>
                      <th class="text-left py-2 text-slate-600">Product</th>
                      <th class="text-left py-2 text-slate-600">Qty</th>
                      <th class="text-right py-2 text-slate-600">Price</th>
                      <th class="text-right py-2 text-slate-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order.items; track item._id) {
                      <tr class="border-b border-slate-100">
                        <td class="py-2">{{ item.productName }}</td>
                        <td class="py-2">{{ item.quantity }}</td>
                        <td class="text-right py-2">\${{ item.price | number: '1.2-2' }}</td>
                        <td class="text-right py-2 font-medium">\${{ item.subtotal | number: '1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Order Summary -->
              <div class="mb-6 p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Subtotal:</span>
                  <span class="font-medium">\${{ order.subtotal | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Tax:</span>
                  <span class="font-medium">\${{ order.tax | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Shipping:</span>
                  <span class="font-medium">\${{ order.shippingCost | number: '1.2-2' }}</span>
                </div>
                @if (order.discount) {
                  <div class="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span class="font-medium">-\${{ order.discount | number: '1.2-2' }}</span>
                  </div>
                }
                <div class="flex justify-between pt-2 border-t border-slate-200 text-base font-bold">
                  <span>Total:</span>
                  <span>\${{ order.total | number: '1.2-2' }}</span>
                </div>
              </div>

              <!-- Shipping Info -->
              @if (order.shippingAddress) {
                <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Shipping Address</h3>
                  <div class="text-sm text-slate-600 space-y-1">
                    <p>{{ order.shippingAddress.fullName }}</p>
                    <p>{{ order.shippingAddress.street }}</p>
                    <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</p>
                    <p>{{ order.shippingAddress.country }}</p>
                  </div>
                </div>
              }

              <!-- Tracking -->
              <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                <h3 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <mat-icon class="text-lg">local_shipping</mat-icon>
                  Tracking Information
                </h3>
                @if (order.trackingNumber) {
                  <div class="space-y-3">
                    <div class="bg-green-50 p-3 rounded border border-green-200">
                      <p class="text-xs font-semibold text-green-700 uppercase">Tracking Number</p>
                      <p class="font-mono text-lg font-medium text-green-900 mt-1">{{ order.trackingNumber }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      @if (getOrderCarrier(order)) {
                        <div class="bg-slate-50 p-2 rounded border border-slate-200">
                          <p class="text-slate-600 text-xs font-semibold">Carrier</p>
                          <p class="text-slate-900 font-medium mt-1">{{ getOrderCarrier(order) }}</p>
                        </div>
                      }
                      @if (getOrderShippingMethod(order)) {
                        <div class="bg-slate-50 p-2 rounded border border-slate-200">
                          <p class="text-slate-600 text-xs font-semibold">Method</p>
                          <p class="text-slate-900 font-medium mt-1">{{ getOrderShippingMethod(order) | titlecase }}</p>
                        </div>
                      }
                      @if (getOrderEstimatedDelivery(order)) {
                        <div class="bg-slate-50 p-2 rounded border border-slate-200">
                          <p class="text-slate-600 text-xs font-semibold">Est. Delivery</p>
                          <p class="text-slate-900 font-medium mt-1">{{ getOrderEstimatedDelivery(order) | date: 'MMM dd' }}</p>
                        </div>
                      }
                      @if (getOrderActualDelivery(order)) {
                        <div class="bg-green-50 p-2 rounded border border-green-200">
                          <p class="text-green-700 text-xs font-semibold">Delivered</p>
                          <p class="text-green-900 font-medium mt-1">{{ getOrderActualDelivery(order) | date: 'MMM dd' }}</p>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="bg-amber-50 p-3 rounded border border-amber-200">
                    <p class="text-amber-800 text-sm">⏳ No tracking number generated yet</p>
                    <button
                      (click)="openGenerateTrackingModal()"
                      class="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded font-medium text-sm transition flex items-center justify-center gap-2"
                    >
                      <mat-icon class="text-sm">add</mat-icon>
                      Generate Tracking
                    </button>
                  </div>
                }
              </div>

              <div class="flex justify-end gap-3">
                <button
                  (click)="showOrderDetails.set(false)"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Update Status Modal -->
      @if (updateStatusModal() && selectedOrder()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Update Order Status</h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">New Status</label>
                <select
                  [(ngModel)]="newStatus"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status...</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              @if (newStatus === 'shipped') {
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tracking Number (Optional)</label>
                  <input
                    type="text"
                    [(ngModel)]="trackingNumber"
                    placeholder="Enter tracking number"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              }
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="updateStatusModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="updateOrderStatus()"
                [disabled]="!newStatus || isUpdating()"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {{ isUpdating() ? 'Updating...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Customer Chat Modal -->
      @if (showCustomerChat() && selectedOrder()) {
        @let order = selectedOrder()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">Chat with Customer</h3>
                <p class="text-green-100 text-sm">{{ order.customerName }} - Order #{{ order.orderId || order._id?.substring(0, 8) }}</p>
              </div>
              <button
                (click)="showCustomerChat.set(false)"
                class="text-white hover:bg-green-500 p-2 rounded-lg transition"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Messages Area -->
            <div class="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4 min-h-[300px]" #messagesContainer>
              @if (chatMessages().length === 0) {
                <div class="text-center text-gray-500 py-8">
                  <mat-icon class="text-4xl text-gray-300 block mx-auto mb-2">chat_bubble_outline</mat-icon>
                  <p class="font-medium">No messages yet</p>
                  <p class="text-sm">Start the conversation by sending a message below</p>
                </div>
              } @else {
                @for (msg of chatMessages(); track msg.timestamp) {
                  <div [ngClass]="msg.sender === 'vendor' ? 'flex justify-start' : 'flex justify-end'">
                    <div [ngClass]="msg.sender === 'vendor'
                      ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      : 'bg-green-600 text-white rounded-br-none'"
                      class="max-w-xs px-4 py-3 rounded-lg">
                      <p class="text-xs font-semibold opacity-75 mb-1">{{ msg.senderName }}</p>
                      <p class="text-sm break-words">{{ msg.message }}</p>
                      <p class="text-xs opacity-70 mt-1">{{ msg.timestamp | date: 'HH:mm' }}</p>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Message Input -->
            <div class="border-t bg-white p-4 space-y-3">
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="customerChatMessage"
                  (keyup.enter)="sendCustomerChatMessage()"
                  placeholder="Type your message..."
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button
                  (click)="sendCustomerChatMessage()"
                  [disabled]="!customerChatMessage.trim() || isSendingMessage()"
                  class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <mat-icon class="text-base">{{ isSendingMessage() ? 'schedule' : 'send' }}</mat-icon>
                  <span class="hidden sm:inline">{{ isSendingMessage() ? 'Sending...' : 'Send' }}</span>
                </button>
              </div>
              <p class="text-xs text-gray-600">
                <mat-icon class="text-xs inline">info</mat-icon>
                Customer will be notified when you send a message
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          {{ errorMessage() }}
        </div>
      }

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          {{ successMessage() }}
        </div>
      }

      <!-- Generate Tracking Modal -->
      @if (showGenerateTrackingModal() && selectedOrder()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <mat-icon class="text-orange-600">local_shipping</mat-icon>
              Generate Tracking Number
            </h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Carrier Name</label>
                <input
                  type="text"
                  [(ngModel)]="trackingCarrier"
                  placeholder="e.g., FedEx, DHL, Local Courier"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Shipping Method</label>
                <select
                  [(ngModel)]="trackingShippingMethod"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="standard">Standard (5 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Estimated Days to Delivery</label>
                <input
                  type="number"
                  [(ngModel)]="trackingEstimatedDays"
                  min="1"
                  max="30"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="showGenerateTrackingModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="generateTracking()"
                [disabled]="!trackingCarrier || generatingTracking()"
                class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <mat-icon class="text-base">{{ generatingTracking() ? 'schedule' : 'add' }}</mat-icon>
                {{ generatingTracking() ? 'Generating...' : 'Generate' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrdersComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Signals
  orders = signal<Order[]>([]);
  isLoading = signal(false);
  isUpdating = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showOrderDetails = signal(false);
  updateStatusModal = signal(false);
  showCustomerChat = signal(false);
  chatMessages = signal<ChatMessage[]>([]);
  isSendingMessage = signal(false);
  selectedOrder = signal<Order | null>(null);

  // Inventory tracking signals
  inventoryStats = signal<any>(null);
  lowStockProducts = signal<any[]>([]);
  showInventoryAlert = signal(false);
  inventoryAlertMessage = signal('');

  // Tracking management signals
  showGenerateTrackingModal = signal(false);
  generatingTracking = signal(false);
  trackingCarrier = '';
  trackingShippingMethod = 'standard';
  trackingEstimatedDays = 5;

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedPaymentStatus = '';
  sortBy = '-createdAt';
  pageSize: number = 20;
  currentPage = signal(1);
  totalOrders = signal(0);
  totalPages = signal(1);

  // Update modal
  newStatus = '';
  trackingNumber = '';
  customerChatMessage = '';

  private vendorId: string = '';
  private vendorName: string = '';

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    private trackingService: TrackingService
  ) {
    this.vendorId = localStorage.getItem('storeId') || '';
    this.vendorName = localStorage.getItem('storeName') || 'Store';
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.loadOrders();
      this.loadInventoryStats();
      this.loadLowStockProducts();
    } else {
      this.errorMessage.set('Vendor ID not found');
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadOrders(): void {
    if (!this.vendorId) {
      this.errorMessage.set('Vendor ID not found');
      return;
    }

    this.isLoading.set(true);
    this.orderService
      .getVendorOrders(this.vendorId, this.currentPage(), this.pageSize, this.selectedStatus, this.searchQuery)
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success && response.data) {
            this.orders.set(Array.isArray(response.data) ? response.data : [response.data]);
            if (response.pagination) {
              this.totalOrders.set(response.pagination.total);
              this.totalPages.set(response.pagination.pages);
            }
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          console.error('Error loading orders:', error);
          this.errorMessage.set('Failed to load orders');
        }
      });
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.showOrderDetails.set(true);
  }

  openCustomerChat(order: Order): void {
    this.selectedOrder.set(order);
    this.chatMessages.set([
      {
        sender: 'vendor',
        senderName: this.vendorName,
        message: `Hi ${order.customerName}, how can I help you with your order?`,
        timestamp: new Date()
      }
    ]);
    this.customerChatMessage = '';
    this.showCustomerChat.set(true);
  }

  sendCustomerChatMessage(): void {
    if (!this.customerChatMessage.trim() || !this.selectedOrder()) return;

    this.isSendingMessage.set(true);
    const message: ChatMessage = {
      sender: 'vendor',
      senderName: this.vendorName,
      message: this.customerChatMessage,
      timestamp: new Date()
    };

    // Add message to chat immediately
    this.chatMessages.update(msgs => [...msgs, message]);
    this.customerChatMessage = '';

    // Simulate sending to backend
    setTimeout(() => {
      this.isSendingMessage.set(false);
      // Add simulated customer response
      const customerResponse: ChatMessage = {
        sender: 'customer',
        senderName: this.selectedOrder()?.customerName || 'Customer',
        message: 'Thanks for your help!',
        timestamp: new Date(Date.now() + 1000)
      };
      this.chatMessages.update(msgs => [...msgs, customerResponse]);
    }, 1000);
  }

  updateOrderStatus(): void {
    if (!this.newStatus || !this.selectedOrder()) {
      return;
    }

    this.isUpdating.set(true);
    const orderId = this.selectedOrder()?._id || '';

    this.orderService
      .updateOrderStatus(orderId, this.newStatus, this.trackingNumber || undefined)
      .subscribe({
        next: (response: any) => {
          this.isUpdating.set(false);
          if (response.success) {
            this.successMessage.set('Order status updated successfully');
            this.updateStatusModal.set(false);
            this.newStatus = '';
            this.trackingNumber = '';
            this.loadOrders();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isUpdating.set(false);
          console.error('Error updating order:', error);
          this.errorMessage.set('Failed to update order status');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  exportOrders(): void {
    this.orderService.exportOrders(this.vendorId, 'csv').subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error exporting orders:', error);
        this.errorMessage.set('Failed to export orders');
      }
    });
  }

  pendingCount(): number {
    return this.orders().filter(o => o.status === 'pending').length;
  }

  shippedCount(): number {
    return this.orders().filter(o => o.status === 'shipped').length;
  }

  processingCount(): number {
    return this.orders().filter(o => o.status === 'processing').length;
  }

  deliveredCount(): number {
    return this.orders().filter(o => o.status === 'delivered').length;
  }

  totalRevenue(): number {
    return this.orders().reduce((sum, order) => sum + order.total, 0);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'processing': 'text-purple-600',
      'shipped': 'text-orange-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-slate-600';
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600',
      'refunded': 'text-orange-600'
    };
    return colors[status] || 'text-slate-600';
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadOrders();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  paginationArray(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Load inventory statistics for the vendor
   */
  loadInventoryStats(): void {
    this.productService.getVendorInventory(this.vendorId).subscribe({
      next: (response) => {
        if (response.success && response.stats) {
          this.inventoryStats.set(response.stats);
          console.log('✅ Inventory stats loaded:', response.stats);
        }
      },
      error: (error) => {
        console.error('❌ Error loading inventory stats:', error);
      }
    });
  }

  /**
   * Load low stock products for the vendor
   */
  loadLowStockProducts(): void {
    this.productService.getLowStockProducts(this.vendorId, 5).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lowStockProducts.set(response.data);
          if (response.data.length > 0) {
            this.inventoryAlertMessage.set(`⚠️ You have ${response.data.length} products with low stock!`);
            this.showInventoryAlert.set(true);
            console.log('⚠️ Low stock products found:', response.data);
          }
        }
      },
      error: (error) => {
        console.error('❌ Error loading low stock products:', error);
      }
    });
  }

  /**
   * Get calculated inventory impact for selected order
   */
  getOrderInventoryImpact(): any {
    const order = this.selectedOrder();
    if (!order || !order.items) return null;

    return {
      totalItems: order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
      uniqueProducts: order.items.length,
      estimatedValue: order.total
    };
  }

  /**
   * Open tracking generation modal
   */
  openGenerateTrackingModal(): void {
    if (!this.selectedOrder()) return;
    this.trackingCarrier = '';
    this.trackingShippingMethod = 'standard';
    this.trackingEstimatedDays = 5;
    this.showGenerateTrackingModal.set(true);
  }

  /**
   * Generate tracking number for selected order
   */
  generateTracking(): void {
    if (!this.selectedOrder() || !this.trackingCarrier) {
      this.errorMessage.set('Please fill in all tracking details');
      return;
    }

    this.generatingTracking.set(true);
    const order = this.selectedOrder()!;
    const orderId = order._id || order.orderId;

    if (!orderId) {
      this.errorMessage.set('Order ID not found');
      this.generatingTracking.set(false);
      return;
    }

    this.trackingService.generateTracking(
      orderId,
      this.trackingCarrier,
      this.trackingShippingMethod,
      this.trackingEstimatedDays
    ).subscribe({
      next: (response) => {
        this.generatingTracking.set(false);
        if (response.success) {
          this.successMessage.set(`✅ Tracking generated: ${response.data.trackingNumber}`);
          this.showGenerateTrackingModal.set(false);
          this.loadOrders();
          setTimeout(() => this.successMessage.set(''), 3000);

          console.log('✅ Tracking generated:', response.data);
        }
      },
      error: (error) => {
        this.generatingTracking.set(false);
        console.error('Error generating tracking:', error);
        this.errorMessage.set('Failed to generate tracking number');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  /**
   * Get tracking status label
   */
  getTrackingStatusLabel(trackingNumber?: string): string {
    return trackingNumber ? '🎯 Tracking Active' : '⏳ No Tracking Yet';
  }

  /**
   * Safe getter for order carrier
   */
  getOrderCarrier(order: Order): string | undefined {
    return (order as any).carrier;
  }

  /**
   * Safe getter for order shipping method
   */
  getOrderShippingMethod(order: Order): string | undefined {
    return (order as any).shippingMethod;
  }

  /**
   * Safe getter for order estimated delivery
   */
  getOrderEstimatedDelivery(order: Order): Date | undefined {
    return (order as any).estimatedDelivery;
  }

  /**
   * Safe getter for order actual delivery
   */
  getOrderActualDelivery(order: Order): Date | undefined {
    return (order as any).actualDelivery;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }
}
