import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="restaurant"
        [sidenavItems]="restaurantSidenavItems"
        (logout)="onLogout()"
      ></app-vendor-sidenav>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Router Outlet for Child Pages -->
        <router-outlet></router-outlet>

        <!-- Dashboard Content (shown only on main dashboard page) -->
        @if (!hasChildRoute()) {
        <div class="p-8 space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Restaurant Management Dashboard</h1>
        <p class="text-orange-100">Track orders, inventory, menu items, and daily restaurant operations.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading restaurant data...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Error: {{ errorMessage() }}</p>
        </div>
      }

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Orders</p>
          <p class="text-3xl font-bold text-slate-900">187</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 12.3% from yesterday</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Daily Revenue</p>
          <p class="text-3xl font-bold text-slate-900">$8,945</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 7.5% increase</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Order Value</p>
          <p class="text-3xl font-bold text-slate-900">$47.85</p>
          <p class="mt-2 text-sm text-slate-500">Per customer order</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Tables</p>
          <p class="text-3xl font-bold text-slate-900">23/40</p>
          <p class="mt-2 text-sm text-slate-500">57.5% occupancy</p>
        </div>
      </div>

      <!-- Orders & Reservations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Orders -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Order #1001</p>
                <p class="text-sm text-slate-600">Table 5 - 3 items</p>
              </div>
              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Ready</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Order #1002</p>
                <p class="text-sm text-slate-600">Table 12 - 5 items</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Cooking</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Order #1003</p>
                <p class="text-sm text-slate-600">Takeout - 2 items</p>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Preparing</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Order #1004</p>
                <p class="text-sm text-slate-600">Table 8 - 4 items</p>
              </div>
              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Served</span>
            </div>
          </div>
        </div>

        <!-- Reservations -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Today's Reservations</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Michael Harris</p>
                <p class="text-sm text-slate-600">Table for 4 at 6:30 PM</p>
              </div>
              <span class="text-xs font-medium text-slate-600">Confirmed</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Emma Wilson</p>
                <p class="text-sm text-slate-600">Table for 2 at 8:00 PM</p>
              </div>
              <span class="text-xs font-medium text-slate-600">Confirmed</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">David Lee</p>
                <p class="text-sm text-slate-600">Table for 6 at 7:15 PM</p>
              </div>
              <span class="text-xs font-medium text-slate-600">Pending</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Jessica Brown</p>
                <p class="text-sm text-slate-600">Table for 3 at 9:00 PM</p>
              </div>
              <span class="text-xs font-medium text-slate-600">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu & Inventory -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Menu Items -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Top Menu Items</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Grilled Salmon</span>
              <span class="font-bold text-slate-900">34 orders</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 100%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Caesar Salad</span>
              <span class="font-bold text-slate-900">28 orders</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 82%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Ribeye Steak</span>
              <span class="font-bold text-slate-900">26 orders</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 76%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Pasta Carbonara</span>
              <span class="font-bold text-slate-900">22 orders</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 65%;"></div>
            </div>
          </div>
        </div>

        <!-- Critical Inventory -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Inventory Status</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span class="text-slate-700 font-medium">Fresh Salmon</span>
              <span class="text-emerald-700 font-bold">High</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span class="text-slate-700 font-medium">Organic Lettuce</span>
              <span class="text-yellow-700 font-bold">Medium</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <span class="text-slate-700 font-medium">Prime Beef</span>
              <span class="text-red-700 font-bold">Low</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span class="text-slate-700 font-medium">Olive Oil</span>
              <span class="text-emerald-700 font-bold">High</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span class="text-slate-700 font-medium">Fresh Herbs</span>
              <span class="text-yellow-700 font-bold">Medium</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Order
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Add Reservation
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Menu
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
          </button>
        </div>
      </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class RestaurantDashboardComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  currentRoute = signal('');

  restaurantSidenavItems = [
    { label: 'Dashboard', icon: '🍽️', route: '/restaurant-dashboard' },
    { label: 'Orders', icon: '📋', route: '/restaurant-dashboard/orders', badge: 5 },
    { label: 'Menu', icon: '🍔', route: '/restaurant-dashboard/menu', badge: 0 },
    { label: 'Reviews', icon: '⭐', route: '/restaurant-dashboard/reviews', badge: 2 },
    { label: 'Incidents', icon: '🚨', route: '/restaurant-dashboard/incidents', badge: 1 }
  ];

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading.set(false);
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
