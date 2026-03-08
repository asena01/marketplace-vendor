import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';
import { interval, Subscription } from 'rxjs';

interface DeliveryLocation {
  orderId: string;
  orderNumber: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: string;
  destination: string;
  estimatedTime: number;
}

@Component({
  selector: 'app-driver-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Driver Tracking</h1>
          <p class="text-slate-600 mt-2">Real-time driver locations and delivery tracking</p>
        </div>
        <div class="flex gap-2">
          <button 
            (click)="toggleAutoRefresh()"
            [class]="autoRefresh() ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'"
            class="font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <mat-icon class="text-lg">{{ autoRefresh() ? 'pause' : 'play_arrow' }}</mat-icon>
            {{ autoRefresh() ? 'Live' : 'Paused' }}
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Deliveries</p>
          <p class="text-3xl font-bold text-slate-900">{{ deliveries().length }}</p>
          <p class="mt-2 text-sm text-slate-500">Currently in transit</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg Delivery Time</p>
          <p class="text-3xl font-bold text-slate-900">{{ getAverageDeliveryTime() }}</p>
          <p class="mt-2 text-sm text-emerald-600">minutes</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">On-time Rate</p>
          <p class="text-3xl font-bold text-slate-900">{{ getOnTimeRate() }}%</p>
          <p class="mt-2 text-sm text-purple-600">Last 24 hours</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Distance</p>
          <p class="text-3xl font-bold text-slate-900">{{ getTotalDistance() }}</p>
          <p class="mt-2 text-sm text-orange-600">km today</p>
        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-slate-200">
          <h2 class="text-lg font-bold text-slate-900">Live Map</h2>
          <p class="text-sm text-slate-600 mt-1">Driver locations and delivery routes</p>
        </div>

        <!-- Simplified Map Visualization -->
        <div class="bg-gradient-to-br from-slate-50 to-slate-100 h-96 relative overflow-hidden flex items-center justify-center">
          <svg class="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            <!-- Grid background -->
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#grid)" />

            <!-- Delivery points -->
            @for (delivery of deliveries(); track delivery.orderId) {
              <g>
                <!-- Delivery location point -->
                <circle 
                  [attr.cx]="getMapX(delivery.latitude)" 
                  [attr.cy]="getMapY(delivery.longitude)"
                  r="6" 
                  fill="#ef4444" 
                  opacity="0.8"
                />
                <!-- Destination marker -->
                <rect 
                  [attr.x]="getMapX(delivery.latitude) - 8" 
                  [attr.y]="getMapY(delivery.longitude) - 8"
                  width="16" 
                  height="16" 
                  fill="none" 
                  stroke="#ef4444" 
                  stroke-width="2"
                />
              </g>
            }

            <!-- Driver positions -->
            @for (delivery of deliveries(); track delivery.driverId) {
              <g>
                <!-- Driver location -->
                <circle 
                  [attr.cx]="getMapX(delivery.latitude + 0.01)" 
                  [attr.cy]="getMapY(delivery.longitude + 0.01)"
                  r="8" 
                  fill="#3b82f6"
                />
                <!-- Driver icon -->
                <text 
                  [attr.x]="getMapX(delivery.latitude + 0.01)" 
                  [attr.y]="getMapY(delivery.longitude + 0.01)"
                  text-anchor="middle" 
                  dy="0.3em" 
                  font-size="12" 
                  fill="white" 
                  font-weight="bold"
                >
                  {{ delivery.driverName.charAt(0) }}
                </text>
                <!-- Status indicator -->
                <circle 
                  [attr.cx]="getMapX(delivery.latitude + 0.01)" 
                  [attr.cy]="getMapY(delivery.longitude + 0.01)"
                  r="12" 
                  fill="none" 
                  stroke="#3b82f6" 
                  stroke-width="2" 
                  opacity="0.5"
                />
              </g>
            }
          </svg>

          @if (deliveries().length === 0) {
            <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div class="text-center">
                <mat-icon class="text-5xl text-slate-300 mx-auto mb-2">location_off</mat-icon>
                <p class="text-slate-600 text-lg">No active deliveries</p>
              </div>
            </div>
          }
        </div>

        <!-- Map Legend -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex gap-8">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-slate-700">Driver Location</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-red-500"></div>
            <span class="text-sm text-slate-700">Delivery Destination</span>
          </div>
        </div>
      </div>

      <!-- Active Deliveries List -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Active Deliveries</h2>
        @if (deliveries().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No active deliveries at the moment</p>
          </div>
        }
        @for (delivery of deliveries(); track delivery.orderId) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span class="text-slate-600 text-sm">Order</span>
                <p class="font-bold text-slate-900">{{ delivery.orderNumber }}</p>
              </div>
              <div>
                <span class="text-slate-600 text-sm">Driver</span>
                <p class="font-bold text-slate-900">{{ delivery.driverName }}</p>
              </div>
              <div>
                <span class="text-slate-600 text-sm">Status</span>
                <p class="font-bold text-slate-900 capitalize">{{ formatStatus(delivery.status) }}</p>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-600 text-sm">Delivery Progress</span>
                <span class="text-sm font-medium text-slate-900">{{ getDeliveryProgress(delivery) }}%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  [style.width.%]="getDeliveryProgress(delivery)"
                ></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span class="text-slate-600 text-sm">Destination</span>
                <p class="text-slate-900">{{ delivery.destination }}</p>
              </div>
              <div>
                <span class="text-slate-600 text-sm">Est. Delivery</span>
                <p class="text-slate-900">{{ delivery.estimatedTime }} minutes</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="contactDriver(delivery)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <mat-icon>phone</mat-icon>
                <span>Contact Driver</span>
              </button>
              <button (click)="trackDelivery(delivery)" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <mat-icon>map</mat-icon>
                <span>View Details</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DriverTrackingComponent implements OnInit, OnDestroy {
  deliveries = signal<DeliveryLocation[]>([]);
  isLoading = signal(false);
  autoRefresh = signal(true);
  private refreshSubscription?: Subscription;

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadActiveDeliveries();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadActiveDeliveries(): void {
    this.isLoading.set(true);
    this.deliveryService.getActiveDeliveries().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.deliveries.set(response.data);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading active deliveries:', error);
      }
    });
  }

  startAutoRefresh(): void {
    this.refreshSubscription = interval(15000).subscribe(() => {
      if (this.autoRefresh()) {
        this.loadActiveDeliveries();
      }
    });
  }

  stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(val => !val);
  }

  getMapX(latitude: number): number {
    // Convert latitude to SVG X coordinate (0-800)
    return (latitude + 180) * (800 / 360);
  }

  getMapY(longitude: number): number {
    // Convert longitude to SVG Y coordinate (0-400)
    return (longitude + 90) * (400 / 180);
  }

  getDeliveryProgress(delivery: DeliveryLocation): number {
    const statusMap: { [key: string]: number } = {
      'pending': 10,
      'confirmed': 20,
      'preparing': 30,
      'ready': 40,
      'out_for_delivery': 80,
      'delivered': 100
    };
    return statusMap[delivery.status] || 0;
  }

  getAverageDeliveryTime(): number {
    if (this.deliveries().length === 0) return 0;
    const total = this.deliveries().reduce((sum, d) => sum + d.estimatedTime, 0);
    return Math.round(total / this.deliveries().length);
  }

  getOnTimeRate(): number {
    // Mock calculation - would be calculated from actual data
    return 92;
  }

  getTotalDistance(): number {
    // Mock calculation - would be calculated from coordinates
    return (this.deliveries().length * 2.5).toFixed(1) as any;
  }

  contactDriver(delivery: DeliveryLocation): void {
    this.notificationService.info('Call Driver', `Contacting ${delivery.driverName}...`);
    // Implement actual call/SMS functionality here
  }

  trackDelivery(delivery: DeliveryLocation): void {
    this.notificationService.info('Tracking', `Tracking order ${delivery.orderNumber}`);
    // Implement detailed tracking modal/page here
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }
}
