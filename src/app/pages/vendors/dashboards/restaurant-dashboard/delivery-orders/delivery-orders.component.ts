import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService, DeliveryOrder, Driver } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Delivery Orders</h1>
          <p class="text-slate-600 mt-2">Manage and track delivery orders</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
          <p class="text-3xl font-bold text-slate-900">{{ orders().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All delivery orders</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Pending</p>
          <p class="text-3xl font-bold text-yellow-600">{{ countByStatus('pending') }}</p>
          <p class="mt-2 text-sm text-yellow-600">Awaiting confirmation</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Out for Delivery</p>
          <p class="text-3xl font-bold text-purple-600">{{ countByStatus('out_for_delivery') }}</p>
          <p class="mt-2 text-sm text-purple-600">On their way</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Delivered</p>
          <p class="text-3xl font-bold text-emerald-600">{{ countByStatus('delivered') }}</p>
          <p class="mt-2 text-sm text-emerald-600">Completed</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg p-4 shadow-md flex gap-4 flex-wrap">
        <select 
          [(ngModel)]="filterStatus"
          (ngModelChange)="filterOrders()"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input 
          type="text" 
          placeholder="Search by order number or customer..." 
          [(ngModel)]="searchQuery"
          (ngModelChange)="filterOrders()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        @if (isLoading()) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600">Loading delivery orders...</p>
          </div>
        }
        @if (!isLoading() && filteredOrders().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No delivery orders found</p>
          </div>
        }
        @for (order of filteredOrders(); track order._id) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4" [ngClass]="{
            'border-yellow-500': order.status === 'pending',
            'border-blue-500': order.status === 'confirmed' || order.status === 'preparing',
            'border-purple-500': order.status === 'out_for_delivery',
            'border-emerald-500': order.status === 'delivered',
            'border-red-500': order.status === 'cancelled'
          }">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-slate-900">{{ order.orderNumber }}</h3>
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-700': order.status === 'pending',
                    'bg-blue-100 text-blue-700': order.status === 'confirmed' || order.status === 'preparing',
                    'bg-purple-100 text-purple-700': order.status === 'out_for_delivery',
                    'bg-emerald-100 text-emerald-700': order.status === 'delivered',
                    'bg-red-100 text-red-700': order.status === 'cancelled'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ formatStatus(order.status) }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <span class="text-slate-600 text-sm">Customer</span>
                    <p class="font-medium text-slate-900">{{ order.customerName }}</p>
                    <p class="text-xs text-slate-600">{{ order.customerPhone }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Delivery Address</span>
                    <p class="font-medium text-slate-900">{{ order.deliveryAddress }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Items & Amount</span>
                    <p class="font-medium text-slate-900">{{ order.items.length }} items • <span class="currency-prefix">$</span>{{ order.totalAmount }}</p>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-slate-600">{{ order.createdAt | date: 'short' }}</p>
              </div>
            </div>

            <!-- Driver Assignment -->
            <div class="mt-4 pt-4 border-t border-slate-200">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  @if (order.assignedDriver) {
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-slate-600">Assigned Driver:</span>
                      <span class="font-medium text-slate-900">
                        {{ typeof order.assignedDriver === 'string' ? order.assignedDriver : order.assignedDriver.name }}
                      </span>
                      @if (typeof order.assignedDriver !== 'string') {
                        <span class="text-xs text-slate-600">⭐ {{ order.assignedDriver.rating }}/5</span>
                      }
                    </div>
                  } @else {
                    <select
                      [ngModel]="getSelectedDriver(order._id!)"
                      (ngModelChange)="onDriverChange(order._id!, $event)"
                      class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Assign a driver...</option>
                      @for (driver of availableDrivers(); track driver._id) {
                        <option [value]="driver._id">{{ driver.name }} ({{ driver.vehicleType }})</option>
                      }
                    </select>
                  }
                </div>

                <div class="flex gap-2">
                  <select 
                    [(ngModel)]="order.status"
                    (ngModelChange)="updateOrderStatus(order._id!, $event)"
                    class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class DeliveryOrdersComponent implements OnInit {
  orders = signal<DeliveryOrder[]>([]);
  availableDrivers = signal<Driver[]>([]);
  filteredOrders = signal<DeliveryOrder[]>([]);
  isLoading = signal(false);
  filterStatus = '';
  searchQuery = '';
  selectedDrivers = signal<Map<string, string>>(new Map());

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDeliveryOrders();
    this.loadAvailableDrivers();
  }

  loadDeliveryOrders(): void {
    this.isLoading.set(true);
    this.deliveryService.getDeliveryOrders().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.orders.set(response.data);
          this.filterOrders();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading orders:', error);
        this.notificationService.error('Error', 'Failed to load delivery orders');
      }
    });
  }

  loadAvailableDrivers(): void {
    this.deliveryService.getDrivers(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.availableDrivers.set(response.data.filter((d: Driver) => d.isActive));
        }
      },
      error: (error: any) => {
        console.error('Error loading drivers:', error);
      }
    });
  }

  filterOrders(): void {
    let filtered = this.orders();

    if (this.filterStatus) {
      filtered = filtered.filter(o => o.status === this.filterStatus);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query)
      );
    }

    this.filteredOrders.set(filtered);
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }

  countByStatus(status: string): number {
    return this.orders().filter(o => o.status === status).length;
  }

  getSelectedDriver(orderId: string): string {
    return this.selectedDrivers().get(orderId) || '';
  }

  setSelectedDriver(orderId: string, driverId: string): void {
    const map = new Map(this.selectedDrivers());
    map.set(orderId, driverId);
    this.selectedDrivers.set(map);
  }

  onDriverChange(orderId: string, driverId: string): void {
    if (!driverId) return;

    this.setSelectedDriver(orderId, driverId);

    this.deliveryService.assignDriverToOrder(orderId, driverId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Driver assigned successfully');
          this.loadDeliveryOrders();
          this.setSelectedDriver(orderId, '');
        }
      },
      error: (error: any) => {
        this.notificationService.error('Error', 'Failed to assign driver');
        this.setSelectedDriver(orderId, '');
      }
    });
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.deliveryService.updateDeliveryOrderStatus(orderId, status).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', `Order status updated to ${status}`);
          this.loadDeliveryOrders();
        }
      },
      error: (error: any) => {
        this.notificationService.error('Error', 'Failed to update order status');
        this.loadDeliveryOrders();
      }
    });
  }
}
