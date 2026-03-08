import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface ShippingMethod {
  _id?: string;
  name: string;
  type: 'standard' | 'express' | 'overnight' | 'local_pickup';
  baseCost: number;
  estimatedDays: string;
  isActive: boolean;
  coverage: string[];
}

interface ShippingOrder {
  _id?: string;
  orderId: string;
  customerName: string;
  destination: string;
  shippingMethod: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippingCost: number;
  estimatedDelivery: string;
  actualDelivery?: string;
}

@Component({
  selector: 'app-retail-shipping',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Shipping & Delivery</h1>
          <p class="text-slate-600 mt-1">Manage shipping methods and track deliveries</p>
        </div>
        <button
          (click)="showAddShippingModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">add</mat-icon>
          <span>Add Shipping Method</span>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-slate-200">
        <button
          (click)="activeTab = 'methods'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': activeTab === 'methods'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">local_shipping</mat-icon>
          <span>Shipping Methods</span>
        </button>
        <button
          (click)="activeTab = 'orders'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': activeTab === 'orders'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">package</mat-icon>
          <span>Shipments ({{ shippingOrders().length }})</span>
        </button>
      </div>

      <!-- Shipping Methods Tab -->
      @if (activeTab === 'methods') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (method of shippingMethods(); track method._id) {
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4" [ngClass]="{
              'border-blue-500': method.type === 'standard',
              'border-orange-500': method.type === 'express',
              'border-red-500': method.type === 'overnight',
              'border-green-500': method.type === 'local_pickup'
            }">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ method.name }}</h3>
                  <p class="text-sm text-slate-600">{{ method.estimatedDays }}</p>
                </div>
                <span
                  [ngClass]="{
                    'bg-green-100 text-green-700': method.isActive,
                    'bg-slate-100 text-slate-700': !method.isActive
                  }"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ method.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              
              <div class="space-y-2 mb-4">
                <div class="flex justify-between">
                  <span class="text-slate-600">Base Cost:</span>
                  <span class="font-bold text-slate-900"><span>$</span>{{ method.baseCost.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Coverage:</span>
                  <span class="font-bold text-slate-900">{{ method.coverage.length }} region{{ method.coverage.length !== 1 ? 's' : '' }}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  (click)="editShippingMethod(method)"
                  class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-1"
                >
                  <mat-icon class="text-base">edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button
                  (click)="toggleShippingMethod(method)"
                  class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-1"
                >
                  <mat-icon class="text-base">{{ method.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                  <span>{{ method.isActive ? 'Disable' : 'Enable' }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Shipments Tab -->
      @if (activeTab === 'orders') {
        <div class="space-y-4">
          <!-- Status Filter -->
          <div class="bg-white rounded-lg p-6 shadow-md">
            <select
              [(ngModel)]="filterShippingStatus"
              (ngModelChange)="filterShippingStatus = $event"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Shipments Table -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Destination</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Method</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Est. Delivery</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (getFilteredShippingOrders().length === 0) {
                    <tr>
                      <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                        No shipments found
                      </td>
                    </tr>
                  } @else {
                    @for (order of getFilteredShippingOrders(); track order._id) {
                      <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ order.orderId }}</td>
                        <td class="px-6 py-4 text-slate-600">{{ order.customerName }}</td>
                        <td class="px-6 py-4 text-slate-600 text-sm">{{ order.destination }}</td>
                        <td class="px-6 py-4 text-slate-600">{{ order.shippingMethod }}</td>
                        <td class="px-6 py-4">
                          <span
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-700': order.status === 'pending',
                              'bg-blue-100 text-blue-700': order.status === 'shipped',
                              'bg-purple-100 text-purple-700': order.status === 'in_transit',
                              'bg-green-100 text-green-700': order.status === 'delivered',
                              'bg-red-100 text-red-700': order.status === 'cancelled'
                            }"
                            class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"
                          >
                            @switch (order.status) {
                              @case ('pending') {
                                <mat-icon class="text-xs">schedule</mat-icon>
                              }
                              @case ('shipped') {
                                <mat-icon class="text-xs">local_shipping</mat-icon>
                              }
                              @case ('in_transit') {
                                <mat-icon class="text-xs">directions_car</mat-icon>
                              }
                              @case ('delivered') {
                                <mat-icon class="text-xs">check_circle</mat-icon>
                              }
                              @default {
                                <mat-icon class="text-xs">cancel</mat-icon>
                              }
                            }
                            <span>{{ order.status | titlecase }}</span>
                          </span>
                        </td>
                        <td class="px-6 py-4 text-slate-600 text-sm">{{ order.estimatedDelivery }}</td>
                        <td class="px-6 py-4">
                          @if (order.trackingNumber) {
                            <button
                              (click)="viewTracking(order)"
                              class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                            >
                              <mat-icon class="text-base">track_changes</mat-icon>
                              <span>Track</span>
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
        </div>
      }

      <!-- Add Shipping Method Modal -->
      @if (showAddShippingModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Add Shipping Method</h2>
            <form (ngSubmit)="saveShippingMethod()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Method Name *</label>
                <input
                  type="text"
                  [(ngModel)]="newShippingMethod.name"
                  name="name"
                  placeholder="e.g., Standard Delivery"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                <select
                  [(ngModel)]="newShippingMethod.type"
                  name="type"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="standard">Standard (5-7 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (Next day)</option>
                  <option value="local_pickup">Local Pickup</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Base Cost ($) *</label>
                <input
                  type="number"
                  [(ngModel)]="newShippingMethod.baseCost"
                  name="baseCost"
                  step="0.01"
                  placeholder="e.g., 10.00"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="newShippingMethod.isActive"
                  name="isActive"
                  id="isActive"
                  class="w-4 h-4 text-blue-600 rounded"
                />
                <label for="isActive" class="ml-2 text-sm font-medium text-slate-700">Activate immediately</label>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  (click)="showAddShippingModal = false"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Add Method
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Messages -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2">
          <mat-icon class="text-lg">check_circle</mat-icon>
          <span>{{ successMessage() }}</span>
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
export class RetailShippingComponent implements OnInit {
  shippingMethods = signal<ShippingMethod[]>([
    {
      _id: '1',
      name: 'Standard Delivery',
      type: 'standard',
      baseCost: 9.99,
      estimatedDays: '5-7 business days',
      isActive: true,
      coverage: ['USA', 'Canada']
    },
    {
      _id: '2',
      name: 'Express Delivery',
      type: 'express',
      baseCost: 24.99,
      estimatedDays: '2-3 business days',
      isActive: true,
      coverage: ['USA', 'Canada']
    },
    {
      _id: '3',
      name: 'Overnight Delivery',
      type: 'overnight',
      baseCost: 49.99,
      estimatedDays: 'Next business day',
      isActive: false,
      coverage: ['USA']
    },
    {
      _id: '4',
      name: 'Local Pickup',
      type: 'local_pickup',
      baseCost: 0,
      estimatedDays: 'Same day or next day',
      isActive: true,
      coverage: ['Local area']
    }
  ]);

  shippingOrders = signal<ShippingOrder[]>([
    {
      _id: '1',
      orderId: '#ORD-2024-001',
      customerName: 'John Doe',
      destination: 'New York, NY',
      shippingMethod: 'Standard Delivery',
      status: 'in_transit',
      trackingNumber: 'TRK123456789',
      shippingCost: 9.99,
      estimatedDelivery: '2024-03-15'
    },
    {
      _id: '2',
      orderId: '#ORD-2024-002',
      customerName: 'Jane Smith',
      destination: 'Los Angeles, CA',
      shippingMethod: 'Express Delivery',
      status: 'shipped',
      trackingNumber: 'TRK987654321',
      shippingCost: 24.99,
      estimatedDelivery: '2024-03-12'
    },
    {
      _id: '3',
      orderId: '#ORD-2024-003',
      customerName: 'Mike Johnson',
      destination: 'Chicago, IL',
      shippingMethod: 'Standard Delivery',
      status: 'delivered',
      trackingNumber: 'TRK555666777',
      shippingCost: 9.99,
      estimatedDelivery: '2024-03-10',
      actualDelivery: '2024-03-10'
    }
  ]);

  activeTab: 'methods' | 'orders' = 'methods';
  filterShippingStatus = '';
  showAddShippingModal = false;
  successMessage = signal('');
  newShippingMethod: ShippingMethod = {
    name: '',
    type: 'standard',
    baseCost: 0,
    estimatedDays: '',
    isActive: true,
    coverage: []
  };

  ngOnInit(): void {}

  getFilteredShippingOrders(): ShippingOrder[] {
    if (this.filterShippingStatus) {
      return this.shippingOrders().filter(o => o.status === this.filterShippingStatus);
    }
    return this.shippingOrders();
  }

  editShippingMethod(method: ShippingMethod): void {
    this.newShippingMethod = { ...method };
    this.showAddShippingModal = true;
  }

  toggleShippingMethod(method: ShippingMethod): void {
    const updated = this.shippingMethods().map(m =>
      m._id === method._id ? { ...m, isActive: !m.isActive } : m
    );
    this.shippingMethods.set(updated);
    this.successMessage.set(`Shipping method ${method.isActive ? 'disabled' : 'enabled'}`);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  saveShippingMethod(): void {
    if (!this.newShippingMethod.name) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.newShippingMethod._id) {
      // Update existing
      const updated = this.shippingMethods().map(m =>
        m._id === this.newShippingMethod._id ? this.newShippingMethod : m
      );
      this.shippingMethods.set(updated);
    } else {
      // Add new
      const newMethod = {
        ...this.newShippingMethod,
        _id: Date.now().toString(),
        estimatedDays: this.getEstimatedDaysText(this.newShippingMethod.type)
      };
      this.shippingMethods.set([...this.shippingMethods(), newMethod]);
    }

    this.successMessage.set('Shipping method saved!');
    setTimeout(() => this.successMessage.set(''), 3000);
    this.showAddShippingModal = false;
    this.resetForm();
  }

  viewTracking(order: ShippingOrder): void {
    alert(`Tracking Number: ${order.trackingNumber}\nStatus: ${order.status}\nEstimated Delivery: ${order.estimatedDelivery}`);
  }

  private resetForm(): void {
    this.newShippingMethod = {
      name: '',
      type: 'standard',
      baseCost: 0,
      estimatedDays: '',
      isActive: true,
      coverage: []
    };
  }

  private getEstimatedDaysText(type: string): string {
    switch (type) {
      case 'standard': return '5-7 business days';
      case 'express': return '2-3 business days';
      case 'overnight': return 'Next business day';
      case 'local_pickup': return 'Same day or next day';
      default: return '';
    }
  }
}
