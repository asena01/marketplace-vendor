import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../../../services/delivery.service';

interface IntegratedDelivery {
  _id: string;
  orderId: string;
  status: 'pending' | 'confirmed' | 'picking_up' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled';
  providerId?: { name: string };
  providerServiceId?: { name: string; category: string };
  pickupLocation?: { address: string };
  deliveryLocation?: { address: string };
  tracking?: {
    pickupTime?: Date;
    deliveryTime?: Date;
    estimatedDeliveryTime?: Date;
    currentLocation?: { latitude: number; longitude: number };
  };
  assignedDriver?: {
    driverName: string;
    driverPhone: string;
    vehicleType: string;
  };
  createdAt: Date;
}

@Component({
  selector: 'app-retail-delivery-tracking',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Delivery Tracking</h1>
        <p class="text-slate-600 mt-1">Track deliveries made through integrated delivery services</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading deliveries...
          </p>
        </div>
      }

      <!-- Status Filters -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex gap-2 flex-wrap">
          <button 
            (click)="filterStatus = 'all'"
            [ngClass]="{'bg-blue-600 text-white': filterStatus === 'all', 'bg-gray-100': filterStatus !== 'all'}"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            All ({{ deliveries().length }})
          </button>
          <button 
            (click)="filterStatus = 'active'"
            [ngClass]="{'bg-blue-600 text-white': filterStatus === 'active', 'bg-gray-100': filterStatus !== 'active'}"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            Active ({{ activeCount() }})
          </button>
          <button 
            (click)="filterStatus = 'completed'"
            [ngClass]="{'bg-blue-600 text-white': filterStatus === 'completed', 'bg-gray-100': filterStatus !== 'completed'}"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            Completed ({{ completedCount() }})
          </button>
        </div>
      </div>

      <!-- Empty State -->
      @if (!isLoading() && filteredDeliveries().length === 0) {
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <mat-icon class="text-slate-300 text-6xl block mx-auto mb-4">local_shipping</mat-icon>
          <p class="text-slate-600 text-lg">No deliveries found</p>
          <p class="text-slate-500 text-sm mt-2">Create an order with integrated delivery service to see tracking here</p>
        </div>
      }

      <!-- Deliveries List -->
      @if (!isLoading() && filteredDeliveries().length > 0) {
        <div class="space-y-4">
          @for (delivery of filteredDeliveries(); track delivery._id) {
            <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
              <div class="p-6">
                <!-- Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-sm text-slate-600">Order</p>
                    <p class="text-xl font-bold text-slate-900">{{ delivery.orderId }}</p>
                  </div>
                  <span
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-700': delivery.status === 'pending' || delivery.status === 'confirmed',
                      'bg-blue-100 text-blue-700': delivery.status === 'picking_up' || delivery.status === 'picked_up',
                      'bg-purple-100 text-purple-700': delivery.status === 'out_for_delivery',
                      'bg-green-100 text-green-700': delivery.status === 'delivered',
                      'bg-red-100 text-red-700': delivery.status === 'failed' || delivery.status === 'cancelled'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                  >
                    @switch (delivery.status) {
                      @case ('pending') { <mat-icon class="text-xs">schedule</mat-icon> }
                      @case ('confirmed') { <mat-icon class="text-xs">check</mat-icon> }
                      @case ('picking_up') { <mat-icon class="text-xs">shopping_cart</mat-icon> }
                      @case ('picked_up') { <mat-icon class="text-xs">check_circle</mat-icon> }
                      @case ('out_for_delivery') { <mat-icon class="text-xs">directions_car</mat-icon> }
                      @case ('delivered') { <mat-icon class="text-xs">check_circle</mat-icon> }
                      @default { <mat-icon class="text-xs">error</mat-icon> }
                    }
                    <span>{{ formatStatus(delivery.status) }}</span>
                  </span>
                </div>

                <!-- Provider Info -->
                <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-xs text-slate-600">Provider</p>
                    <p class="font-semibold text-slate-900">{{ delivery.providerId?.name || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-600">Service</p>
                    <p class="font-semibold text-slate-900">{{ delivery.providerServiceId?.name || 'Standard' }}</p>
                  </div>
                </div>

                <!-- Driver Info -->
                @if (delivery.assignedDriver) {
                  <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p class="text-xs text-slate-600">Driver</p>
                      <p class="font-semibold text-slate-900">{{ delivery.assignedDriver.driverName }}</p>
                      <p class="text-sm text-slate-600">{{ delivery.assignedDriver.vehicleType }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-600">Phone</p>
                      <p class="font-semibold text-slate-900">{{ delivery.assignedDriver.driverPhone }}</p>
                    </div>
                  </div>
                }

                <!-- Location Info -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <p class="text-xs text-slate-600 flex items-center gap-1">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>Pickup</span>
                    </p>
                    <p class="text-sm font-semibold text-slate-900">{{ delivery.pickupLocation?.address || 'Pickup location' }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <p class="text-xs text-slate-600 flex items-center gap-1">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>Delivery</span>
                    </p>
                    <p class="text-sm font-semibold text-slate-900">{{ delivery.deliveryLocation?.address || 'Delivery location' }}</p>
                  </div>
                </div>

                <!-- Timeline -->
                <div class="space-y-2 mb-4 p-4 border-l-2 border-slate-200">
                  @if (delivery.tracking?.pickupTime) {
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-green-600">check_circle</mat-icon>
                      <div>
                        <p class="text-sm font-semibold text-slate-900">Picked up</p>
                        <p class="text-xs text-slate-600">{{ delivery.tracking?.pickupTime | date: 'medium' }}</p>
                      </div>
                    </div>
                  }
                  @if (delivery.tracking?.estimatedDeliveryTime && !delivery.tracking?.deliveryTime) {
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-orange-600">access_time</mat-icon>
                      <div>
                        <p class="text-sm font-semibold text-slate-900">Est. Delivery</p>
                        <p class="text-xs text-slate-600">{{ delivery.tracking?.estimatedDeliveryTime | date: 'medium' }}</p>
                      </div>
                    </div>
                  }
                  @if (delivery.tracking?.deliveryTime) {
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-green-600">check_circle</mat-icon>
                      <div>
                        <p class="text-sm font-semibold text-slate-900">Delivered</p>
                        <p class="text-xs text-slate-600">{{ delivery.tracking?.deliveryTime | date: 'medium' }}</p>
                      </div>
                    </div>
                  }
                </div>

                <!-- Current Location -->
                @if (delivery.tracking?.currentLocation) {
                  <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p class="text-xs text-purple-700 font-semibold flex items-center gap-1">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>Current Location</span>
                    </p>
                    <p class="text-sm text-slate-900 mt-1">
                      Lat: {{ delivery.tracking?.currentLocation?.latitude | number: '1.4-4' }},
                      Lng: {{ delivery.tracking?.currentLocation?.longitude | number: '1.4-4' }}
                    </p>
                  </div>
                }

                <!-- Actions -->
                @if (isActiveStatus(delivery.status)) {
                  <div class="mt-4 flex gap-2">
                    <button
                      (click)="cancelDelivery(delivery._id)"
                      class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <mat-icon class="text-base">cancel</mat-icon>
                      <span>Cancel Delivery</span>
                    </button>
                  </div>
                }
              </div>
            </div>
          }
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
export class RetailDeliveryTrackingComponent implements OnInit, OnDestroy {
  deliveries = signal<IntegratedDelivery[]>([]);
  isLoading = signal(false);
  filterStatus: 'all' | 'active' | 'completed' = 'all';
  private storeId: string = '';
  private autoRefreshInterval: any;

  // Computed signals
  activeCount = computed(() =>
    this.deliveries().filter(d => this.isActiveStatus(d.status)).length
  );
  completedCount = computed(() =>
    this.deliveries().filter(d => d.status === 'delivered' || d.status === 'cancelled' || d.status === 'failed').length
  );
  filteredDeliveries = computed(() => {
    if (this.filterStatus === 'all') return this.deliveries();
    if (this.filterStatus === 'active') return this.deliveries().filter(d => this.isActiveStatus(d.status));
    if (this.filterStatus === 'completed') return this.deliveries().filter(d => d.status === 'delivered' || d.status === 'cancelled' || d.status === 'failed');
    return this.deliveries();
  });

  constructor(private deliveryService: DeliveryService) {
    this.storeId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (!this.storeId) return;
    this.loadDeliveries();
    // Auto-refresh every 10 seconds
    this.autoRefreshInterval = setInterval(() => this.loadDeliveries(), 10000);
  }

  ngOnDestroy(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.deliveryService.getBusinessDeliveries(this.storeId, 'retail').subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.deliveries.set(response.data);
        } else {
          this.deliveries.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading deliveries:', error);
        this.isLoading.set(false);
      }
    });
  }

  cancelDelivery(deliveryId: string): void {
    if (confirm('Are you sure you want to cancel this delivery?')) {
      this.deliveryService.cancelIntegratedDelivery(deliveryId).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.loadDeliveries();
          }
        },
        error: (error: any) => {
          console.error('Error canceling delivery:', error);
        }
      });
    }
  }

  isActiveStatus(status: string): boolean {
    return ['pending', 'confirmed', 'picking_up', 'picked_up', 'out_for_delivery'].includes(status);
  }

  formatStatus(status: string): string {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusColor(status: string): string {
    if (['pending', 'confirmed'].includes(status)) return 'yellow';
    if (['picking_up', 'picked_up'].includes(status)) return 'blue';
    if (status === 'out_for_delivery') return 'purple';
    if (status === 'delivered') return 'green';
    return 'red';
  }
}
