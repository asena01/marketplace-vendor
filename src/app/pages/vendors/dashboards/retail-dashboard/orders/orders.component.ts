import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, Order } from '../../../../../services/order.service';

@Component({
  selector: 'app-retail-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p class="text-slate-600 mt-1">View, filter, and manage customer orders</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="exportOrders()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <mat-icon>download</mat-icon>
            Export
          </button>
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

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Orders</p>
          <p class="text-2xl font-bold text-slate-900">{{ totalOrders() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Pending</p>
          <p class="text-2xl font-bold text-yellow-600">{{ pendingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Shipped</p>
          <p class="text-2xl font-bold text-purple-600">{{ shippedCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p class="text-2xl font-bold text-green-600">\${{ totalRevenue() | number: '1.2-2' }}</p>
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
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="viewOrder(order)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                      @if (order.status !== 'delivered' && order.status !== 'cancelled') {
                        <button
                          (click)="updateStatusModal.set(true); selectedOrder.set(order)"
                          class="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          Update
                        </button>
                      }
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
                <h3 class="font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-slate-600">Name</p>
                    <p class="font-medium text-slate-900">{{ order.customerName }}</p>
                  </div>
                  <div>
                    <p class="text-slate-600">Email</p>
                    <p class="font-medium text-slate-900">{{ order.customerEmail }}</p>
                  </div>
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
              @if (order.trackingNumber) {
                <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-2">Tracking Information</h3>
                  <p class="text-slate-600 text-sm">Tracking Number:</p>
                  <p class="font-mono text-lg font-medium text-slate-900">{{ order.trackingNumber }}</p>
                </div>
              }

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
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrdersComponent implements OnInit {
  // Signals
  orders = signal<Order[]>([]);
  isLoading = signal(false);
  isUpdating = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showOrderDetails = signal(false);
  updateStatusModal = signal(false);
  selectedOrder = signal<Order | null>(null);

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

  private vendorId: string = '';

  constructor(private orderService: OrderService) {
    this.vendorId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.loadOrders();
    } else {
      this.errorMessage.set('Vendor ID not found');
    }
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
}
