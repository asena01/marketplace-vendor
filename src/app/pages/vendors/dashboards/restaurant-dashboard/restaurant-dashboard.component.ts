import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';
import { RestaurantService } from '../../../../services/restaurant.service';
import { getVendorTypeConfig, VendorTypeConfig } from '../../../../shared/config/vendor-type.config';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        [vendorType]="vendorType"
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
      <div [ngClass]="'bg-gradient-to-r ' + dashboardGradient" class="rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">{{ dashboardTitle }}</h1>
        <p class="opacity-90">{{ dashboardDescription }}</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading restaurant data...
          </p>
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
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Today's Orders</p>
              <p class="text-3xl font-bold text-slate-900">{{ todayOrders() }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl">shopping_cart</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Completed</p>
              <p class="text-3xl font-bold text-slate-900">{{ completedOrders() }}</p>
            </div>
            <mat-icon class="text-green-500 text-3xl">check_circle</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Pending</p>
              <p class="text-3xl font-bold text-slate-900">{{ pendingOrders() }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl">schedule</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Revenue</p>
              <p class="text-3xl font-bold text-slate-900">₦{{ totalRevenue() | number: '1.0-0' }}</p>
            </div>
            <mat-icon class="text-red-500 text-3xl">trending_up</mat-icon>
          </div>
        </div>
      </div>

      <!-- Data Available Message -->
      @if (!isLoading() && !errorMessage() && (todayOrders() === 0 && completedOrders() === 0)) {
        <div class="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
          <mat-icon class="text-blue-600 text-5xl block mx-auto mb-3">info</mat-icon>
          <p class="text-slate-900 font-semibold">Welcome to Your Restaurant Dashboard</p>
          <p class="text-slate-600 text-sm mt-2">Start by adding menu items and wait for customer orders to see data here</p>
        </div>
      }

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            (click)="navigateTo('/restaurant-dashboard/menu')"
            class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">restaurant_menu</mat-icon>
            <span>Menu</span>
          </button>
          <button 
            (click)="navigateTo('/restaurant-dashboard/orders')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">shopping_bag</mat-icon>
            <span>Orders</span>
          </button>
          <button 
            (click)="navigateTo('/restaurant-dashboard/delivery-orders')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">local_shipping</mat-icon>
            <span>Delivery</span>
          </button>
          <button 
            (click)="navigateTo('/restaurant-dashboard/settings')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">settings</mat-icon>
            <span>Settings</span>
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

  // Dashboard metrics signals
  todayOrders = signal<number>(0);
  completedOrders = signal<number>(0);
  pendingOrders = signal<number>(0);
  totalRevenue = signal<number>(0);

  restaurantSidenavItems = [];

  private restaurantId: string = '';
  public vendorType: string = '';
  public dashboardTitle: string = '';
  public dashboardDescription: string = '';
  public dashboardGradient: string = 'from-orange-600 to-red-700';
  public vendorConfig: VendorTypeConfig | null = null;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private restaurantService: RestaurantService,
    private router: Router
  ) {
    this.restaurantId = localStorage.getItem('storeId') || '';
    this.vendorType = localStorage.getItem('vendorType') || 'restaurant';

    // Load vendor type configuration
    this.vendorConfig = getVendorTypeConfig(this.vendorType);
    if (this.vendorConfig) {
      this.dashboardTitle = this.vendorConfig.dashboardTitle;
      this.dashboardDescription = this.vendorConfig.dashboardDescription;
      this.dashboardGradient = this.vendorConfig.color;
    }

    console.log('Restaurant ID:', this.restaurantId);
    console.log('Vendor Type:', this.vendorType);
  }

  ngOnInit(): void {
    this.isLoading.set(false);
    if (this.restaurantId) {
      this.loadDashboardData();
    }
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  loadDashboardData(): void {
    if (!this.restaurantId) {
      this.errorMessage.set('Restaurant ID not found. Please login again.');
      return;
    }
    
    this.isLoading.set(true);
    // Load restaurant stats
    this.restaurantService.getRestaurantStats(this.restaurantId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.todayOrders.set(response.data.todayOrders || 0);
          this.completedOrders.set(response.data.completedOrders || 0);
          this.pendingOrders.set(response.data.pendingOrders || 0);
          this.totalRevenue.set(response.data.totalRevenue || 0);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage.set('Failed to load dashboard data');
        // Set all metrics to 0 on error
        this.todayOrders.set(0);
        this.completedOrders.set(0);
        this.pendingOrders.set(0);
        this.totalRevenue.set(0);
        this.isLoading.set(false);
      }
    });
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
