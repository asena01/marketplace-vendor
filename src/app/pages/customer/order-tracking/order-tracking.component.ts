import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TrackingService, TrackingInfo, TrackingEvent } from '../../../services/tracking.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Tracking Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Order Tracking</h2>
            @if (trackingInfo() && trackingInfo()!.trackingNumber) {
              <p class="text-blue-100 text-sm">Tracking #{{ trackingInfo()!.trackingNumber }}</p>
            } @else {
              <p class="text-blue-100 text-sm">View your delivery status in real-time</p>
            }
          </div>
          <mat-icon class="text-4xl opacity-70">local_shipping</mat-icon>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-icon class="animate-spin text-4xl text-blue-600">refresh</mat-icon>
          <span class="ml-2 text-gray-600">Loading tracking information...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div class="flex items-start gap-3">
            <mat-icon class="text-red-600 mt-1">error</mat-icon>
            <div>
              <h3 class="font-semibold">Unable to Load Tracking</h3>
              <p class="text-sm">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>
      } @else if (trackingInfo()) {
        @let tracking = trackingInfo()!;

        <!-- Tracking Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Card -->
          <div [class]="'rounded-lg p-4 border-2 ' + getStatusColor(tracking.status)">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-xs font-semibold uppercase">Current Status</p>
                <p class="text-lg font-bold mt-1">{{ getStatusLabel(tracking.status) }}</p>
              </div>
              <mat-icon [class]="'text-3xl opacity-70 ' + getStatusColor(tracking.status)">
                {{ getStatusIcon(tracking.status) }}
              </mat-icon>
            </div>
          </div>

          <!-- Carrier Card -->
          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <p class="text-gray-600 text-xs font-semibold uppercase">Carrier</p>
            <p class="text-lg font-bold mt-1 text-gray-900">{{ tracking.carrier }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ tracking.shippingMethod | titlecase }}</p>
          </div>

          <!-- Days Remaining Card -->
          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <p class="text-gray-600 text-xs font-semibold uppercase">Estimated Arrival</p>
            <p class="text-lg font-bold mt-1 text-gray-900">
              {{ tracking.estimatedDelivery | date: 'MMM dd' }}
            </p>
            <p class="text-xs text-gray-500 mt-2">{{ daysRemaining() }} days remaining</p>
          </div>

          <!-- Progress Card -->
          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <p class="text-gray-600 text-xs font-semibold uppercase">Progress</p>
            <div class="mt-3">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  [style.width.%]="tracking.progressPercent"
                ></div>
              </div>
              <p class="text-lg font-bold mt-2 text-gray-900">{{ tracking.progressPercent | number: '1.0-0' }}%</p>
            </div>
          </div>
        </div>

        <!-- Tracking Timeline -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-8">Delivery Timeline</h3>
          <div class="space-y-6">
            @for (event of tracking.timeline; track event.status) {
              <div class="flex gap-4">
                <!-- Timeline marker -->
                <div class="flex flex-col items-center">
                  <div
                    [class]="'w-12 h-12 rounded-full flex items-center justify-center transition ' +
                      (event.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600')"
                  >
                    @if (event.completed) {
                      <mat-icon>check</mat-icon>
                    } @else {
                      <mat-icon>{{ getStatusIcon(event.status) }}</mat-icon>
                    }
                  </div>
                  @if (!$last) {
                    <div [class]="'flex-1 w-1 mt-2 mb-2 ' + (event.completed ? 'bg-green-500' : 'bg-gray-200')"></div>
                  }
                </div>

                <!-- Timeline content -->
                <div class="flex-1 pt-2 pb-6">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 [class]="'font-semibold ' + (event.completed ? 'text-gray-900' : 'text-gray-500')">
                        {{ event.label }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
                    </div>
                    @if (event.timestamp) {
                      <span class="text-xs font-medium text-gray-500 whitespace-nowrap ml-4">
                        {{ event.timestamp | date: 'MMM dd, HH:mm' }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Order Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-start gap-2">
                <mat-icon class="text-blue-600 mt-1">location_on</mat-icon>
                <div>
                  <p class="font-semibold text-gray-900">{{ tracking.customerName }}</p>
                  <p>{{ tracking.customerAddress }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Order ID:</span>
                <span class="font-medium text-gray-900">{{ tracking.orderId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tracking #:</span>
                <span class="font-mono font-medium text-gray-900">{{ tracking.trackingNumber }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t">
                <span class="text-gray-600 font-semibold">Shipped By:</span>
                <span class="font-medium text-gray-900">{{ tracking.carrier }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-blue-900 mb-3">Need Help?</h3>
          <p class="text-blue-800 text-sm mb-4">
            If your package doesn't arrive by the estimated date or if you have any questions about your order, please contact our support team.
          </p>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            <mat-icon>chat</mat-icon>
            <span>Contact Support</span>
          </button>
        </div>
      } @else {
        <div class="bg-gray-50 rounded-lg p-12 text-center">
          <mat-icon class="text-4xl text-gray-400 mx-auto mb-4">visibility_off</mat-icon>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Tracking Information</h3>
          <p class="text-gray-600">This order doesn't have tracking information yet. It will be available once the order is shipped.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class OrderTrackingComponent implements OnInit {
  @Input() orderId!: string;

  trackingInfo = signal<TrackingInfo | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  daysRemaining = signal(0);

  constructor(private trackingService: TrackingService) {}

  ngOnInit(): void {
    if (this.orderId) {
      this.loadTracking();
    }
  }

  loadTracking(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.trackingService.getOrderTracking(this.orderId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.trackingInfo.set(response.data);
          if (response.data.hasTracking && response.data.estimatedDelivery) {
            this.daysRemaining.set(this.trackingService.daysUntilDelivery(response.data.estimatedDelivery));
          }
          console.log('✅ Tracking loaded:', response.data);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading tracking:', error);
        this.errorMessage.set('Unable to load tracking information. Please try again later.');
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.trackingService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.trackingService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.trackingService.getStatusIcon(status);
  }
}
