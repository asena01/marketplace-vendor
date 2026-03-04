import { Component, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../services/delivery.service';
import { AuthService } from '../../../services/auth.service';

// Delivery sub-pages
import { DeliveryOrdersComponent } from '../delivery-orders/delivery-orders.component';
import { DeliveryCouriersComponent } from '../delivery-couriers/delivery-couriers.component';
import { DeliveryTrackingComponent } from '../delivery-tracking/delivery-tracking.component';
import { DeliveryAnalyticsComponent } from '../delivery-analytics/delivery-analytics.component';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DeliveryOrdersComponent,
    DeliveryCouriersComponent,
    DeliveryTrackingComponent,
    DeliveryAnalyticsComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-4xl">🚚</div>
            <div>
              <h1 class="text-3xl font-bold">Delivery Management Dashboard</h1>
              <p class="text-cyan-100 text-sm">Real-time delivery tracking and management</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <aside class="w-64 bg-white shadow-lg min-h-screen">
          <nav class="p-6 space-y-2">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-4">Dashboard</p>

            <button
              (click)="setCurrentPage('overview')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                (currentPage() === 'overview'
                  ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              📊 Overview
            </button>

            <button
              (click)="setCurrentPage('orders')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                (currentPage() === 'orders'
                  ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              📦 Orders
            </button>

            <button
              (click)="setCurrentPage('tracking')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                (currentPage() === 'tracking'
                  ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              📍 Live Tracking
            </button>

            <button
              (click)="setCurrentPage('couriers')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                (currentPage() === 'couriers'
                  ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              👥 Couriers
            </button>

            <button
              (click)="setCurrentPage('analytics')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                (currentPage() === 'analytics'
                  ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              📈 Analytics
            </button>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8">
          @if (currentPage() === 'overview') {
            <div class="space-y-6">
              <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                <p class="text-gray-600">Real-time delivery service metrics</p>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Active Orders -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm font-medium">Active Orders</p>
                      <p class="text-4xl font-bold text-gray-800">{{ stats()?.activeOrders || 0 }}</p>
                      <p class="text-xs text-gray-500 mt-1">In delivery</p>
                    </div>
                    <div class="text-5xl">📦</div>
                  </div>
                </div>

                <!-- Completed Today -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm font-medium">Completed Today</p>
                      <p class="text-4xl font-bold text-gray-800">{{ stats()?.completedDeliveries || 0 }}</p>
                      <p class="text-xs text-gray-500 mt-1">Success rate</p>
                    </div>
                    <div class="text-5xl">✅</div>
                  </div>
                </div>

                <!-- Active Couriers -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm font-medium">Active Couriers</p>
                      <p class="text-4xl font-bold text-gray-800">{{ stats()?.activeCouriers || 0 }}</p>
                      <p class="text-xs text-gray-500 mt-1">Online now</p>
                    </div>
                    <div class="text-5xl">👥</div>
                  </div>
                </div>

                <!-- Completion Rate -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm font-medium">Completion Rate</p>
                      <p class="text-4xl font-bold text-gray-800">{{ stats()?.completionRate || 0 }}%</p>
                      <p class="text-xs text-gray-500 mt-1">All-time average</p>
                    </div>
                    <div class="text-5xl">📊</div>
                  </div>
                </div>
              </div>
            </div>
          } @else if (currentPage() === 'orders') {
            <app-delivery-orders></app-delivery-orders>
          } @else if (currentPage() === 'tracking') {
            <app-delivery-tracking></app-delivery-tracking>
          } @else if (currentPage() === 'couriers') {
            <app-delivery-couriers></app-delivery-couriers>
          } @else if (currentPage() === 'analytics') {
            <app-delivery-analytics></app-delivery-analytics>
          }
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryDashboardComponent implements OnInit {
  currentPage = signal<string>('overview');
  stats = signal<any>(null);
  deliveryId = signal<string>('');
  vendorType = signal<string>('delivery');
  businessName = signal<string>('Delivery Service');

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is vendor (delivery service)
    if (!this.authService.isVendor()) {
      console.log('❌ User is not a vendor - redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Initialize delivery ID for chat
    const deliveryId = localStorage.getItem('deliveryId');
    if (deliveryId) {
      this.deliveryId.set(deliveryId);
    }

    // Set business name from user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.businessName) {
      this.businessName.set(currentUser.businessName);
    }

    // Load stats
    this.loadStats();
  }

  loadStats(): void {
    this.deliveryService.getServiceStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats.set(response.data);
          console.log('✅ Delivery stats loaded:', response.data);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading stats:', error);
      }
    });
  }

  setCurrentPage(page: string): void {
    this.currentPage.set(page);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
