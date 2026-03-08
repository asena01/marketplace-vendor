import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

interface IntegratedDelivery {
  _id: string;
  orderId: string;
  status: string;
  providerId: {
    name: string;
  };
  providerServiceId: {
    name: string;
    category: string;
  };
  pickupLocation: {
    address: string;
  };
  deliveryLocation: {
    address: string;
  };
  tracking: {
    pickupTime?: Date;
    deliveryTime?: Date;
    estimatedDeliveryTime?: Date;
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
  };
  assignedDriver?: {
    driverName: string;
    driverPhone: string;
    vehicleType: string;
  };
  createdAt: Date;
}

@Component({
  selector: 'app-delivery-tracking-monitor',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Delivery Tracking</h2>
        <p class="text-gray-600">Track deliveries made through integrated delivery services</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            (click)="filterStatus = 'all'"
            [class.bg-blue-600]="filterStatus === 'all'"
            [class.text-white]="filterStatus === 'all'"
            [class.bg-gray-100]="filterStatus !== 'all'"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            All
          </button>
          <button 
            (click)="filterStatus = 'active'"
            [class.bg-blue-600]="filterStatus === 'active'"
            [class.text-white]="filterStatus === 'active'"
            [class.bg-gray-100]="filterStatus !== 'active'"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            Active Deliveries
          </button>
          <button 
            (click)="filterStatus = 'completed'"
            [class.bg-blue-600]="filterStatus === 'completed'"
            [class.text-white]="filterStatus === 'completed'"
            [class.bg-gray-100]="filterStatus !== 'completed'"
            class="px-4 py-2 rounded-lg font-medium transition"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-12">
        <p class="text-gray-600">Loading deliveries...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredDeliveries().length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <mat-icon class="text-6xl text-gray-300 mx-auto mb-4">local_shipping</mat-icon>
        <p class="text-gray-600 text-lg">No deliveries found</p>
        <p class="text-gray-500 text-sm mt-2">Create an order and assign it to an integrated delivery service</p>
      </div>

      <!-- Deliveries List -->
      <div *ngIf="!isLoading() && filteredDeliveries().length > 0" class="space-y-4">
        <div *ngFor="let delivery of filteredDeliveries(); trackBy: trackByDeliveryId" 
             class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-lg text-gray-800">Order #{{ delivery.orderId }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ delivery.providerServiceId.name }}</p>
              </div>
              <span [ngClass]="getStatusColor(delivery.status)" 
                    class="px-3 py-1 rounded-full text-xs font-bold">
                {{ formatStatus(delivery.status) }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-4">
            <!-- Provider & Service Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-gray-700 uppercase mb-1">Provider</p>
                <p class="text-sm text-gray-900">{{ delivery.providerId.name }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-700 uppercase mb-1">Category</p>
                <p class="text-sm text-gray-900">{{ capitalizeFirst(delivery.providerServiceId.category) }}</p>
              </div>
            </div>

            <!-- Locations -->
            <div class="border-t border-gray-200 pt-4 space-y-3">
              <div class="flex gap-3">
                <div class="flex-shrink-0">
                  <mat-icon class="text-green-600 text-lg">location_on</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-700">Pickup</p>
                  <p class="text-sm text-gray-600 truncate">{{ delivery.pickupLocation.address }}</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="flex-shrink-0">
                  <mat-icon class="text-orange-600 text-lg">flag</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-700">Delivery</p>
                  <p class="text-sm text-gray-600 truncate">{{ delivery.deliveryLocation.address }}</p>
                </div>
              </div>
            </div>

            <!-- Driver Info (if assigned) -->
            <div *ngIf="delivery.assignedDriver" class="border-t border-gray-200 pt-4">
              <p class="text-xs font-semibold text-gray-700 uppercase mb-3">Driver Details</p>
              <div class="space-y-2 text-sm">
                <p><span class="text-gray-600">Name:</span> <span class="font-semibold">{{ delivery.assignedDriver.driverName }}</span></p>
                <p><span class="text-gray-600">Phone:</span> <span class="font-semibold">{{ delivery.assignedDriver.driverPhone }}</span></p>
                <p><span class="text-gray-600">Vehicle:</span> <span class="font-semibold">{{ delivery.assignedDriver.vehicleType }}</span></p>
              </div>
            </div>

            <!-- Timeline -->
            <div class="border-t border-gray-200 pt-4">
              <p class="text-xs font-semibold text-gray-700 uppercase mb-3">Timeline</p>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600 text-sm" *ngIf="delivery.tracking?.pickupTime">check_circle</mat-icon>
                  <mat-icon class="text-gray-400 text-sm" *ngIf="!delivery.tracking?.pickupTime">radio_button_unchecked</mat-icon>
                  <span class="text-gray-700">Picked up</span>
                  <span *ngIf="delivery.tracking?.pickupTime" class="text-gray-500 text-xs">
                    {{ delivery.tracking.pickupTime | date:'short' }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600 text-sm" *ngIf="delivery.tracking?.deliveryTime">check_circle</mat-icon>
                  <mat-icon class="text-gray-400 text-sm" *ngIf="!delivery.tracking?.deliveryTime">radio_button_unchecked</mat-icon>
                  <span class="text-gray-700">Delivered</span>
                  <span *ngIf="delivery.tracking?.deliveryTime" class="text-gray-500 text-xs">
                    {{ delivery.tracking.deliveryTime | date:'short' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Current Location -->
            <div *ngIf="delivery.tracking?.currentLocation && delivery.tracking.currentLocation!.latitude" class="border-t border-gray-200 pt-4">
              <p class="text-xs font-semibold text-gray-700 uppercase mb-2">Current Location</p>
              <p class="text-sm text-gray-600">
                Lat: {{ delivery.tracking.currentLocation!.latitude | number:'1.4-4' }},
                Lng: {{ delivery.tracking.currentLocation!.longitude | number:'1.4-4' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 flex gap-2">
            <button 
              class="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
            >
              <mat-icon class="text-sm inline mr-1">info</mat-icon> Details
            </button>
            <button 
              (click)="cancelDelivery(delivery._id)"
              *ngIf="isActiveStatus(delivery.status)"
              class="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
            >
              <mat-icon class="text-sm inline mr-1">close</mat-icon> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryTrackingMonitorComponent implements OnInit {
  deliveries = signal<IntegratedDelivery[]>([]);
  isLoading = signal(false);
  filterStatus = 'all';

  private restaurantId = localStorage.getItem('restaurantId') || '';

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
    // Refresh deliveries every 10 seconds
    setInterval(() => this.loadDeliveries(), 10000);
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.deliveryService.getBusinessDeliveries(this.restaurantId, 'restaurant').subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.deliveries.set(response.data);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.error('Error', 'Failed to load deliveries');
      }
    });
  }

  filteredDeliveries(): IntegratedDelivery[] {
    const all = this.deliveries();
    if (this.filterStatus === 'all') return all;
    if (this.filterStatus === 'active') {
      return all.filter(d => ['picking_up', 'picked_up', 'out_for_delivery'].includes(d.status));
    }
    if (this.filterStatus === 'completed') {
      return all.filter(d => ['delivered', 'failed', 'cancelled'].includes(d.status));
    }
    return all;
  }

  cancelDelivery(deliveryId: string): void {
    if (!confirm('Are you sure you want to cancel this delivery?')) return;

    this.deliveryService.cancelIntegratedDelivery(deliveryId, 'Cancelled by restaurant').subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Delivery cancelled');
          this.loadDeliveries();
        }
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to cancel delivery');
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'picking_up': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-indigo-100 text-indigo-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  isActiveStatus(status: string): boolean {
    return ['picking_up', 'picked_up', 'out_for_delivery'].includes(status);
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  trackByDeliveryId(index: number, delivery: IntegratedDelivery): string {
    return delivery._id;
  }
}
