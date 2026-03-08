import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { FoodService } from '../../../../services/food.service';
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
          <p class="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
          <p class="text-3xl font-bold text-slate-900">{{ orders().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All time orders</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Pending Orders</p>
          <p class="text-3xl font-bold text-slate-900">{{ countOrdersByStatus('pending') }}</p>
          <p class="mt-2 text-sm text-slate-500">Waiting to prepare</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Menu Items</p>
          <p class="text-3xl font-bold text-slate-900">{{ menuItems().length }}</p>
          <p class="mt-2 text-sm text-slate-500">Available items</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Ready Orders</p>
          <p class="text-3xl font-bold text-slate-900">{{ countOrdersByStatus('ready') }}</p>
          <p class="mt-2 text-sm text-slate-500">Ready to serve</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-slate-900">Recent Orders</h3>
          <a href="/restaurant-dashboard/orders" class="text-orange-600 hover:text-orange-700 text-sm font-medium">View All</a>
        </div>
        <div class="space-y-3">
          @if (orders().length === 0) {
            <p class="text-slate-500 text-center py-4">No orders yet</p>
          }
          @for (order of orders().slice(0, 4); track order._id) {
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">{{ order.orderNumber }}</p>
                <p class="text-sm text-slate-600">{{ order.customerName }} - {{ order.items.length }} items</p>
              </div>
              <span [ngClass]="{
                'bg-emerald-100 text-emerald-700': order.status === 'ready',
                'bg-blue-100 text-blue-700': order.status === 'preparing',
                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                'bg-slate-100 text-slate-700': order.status === 'completed'
              }" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ order.status | uppercase }}
              </span>
            </div>
          }
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
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-slate-900">Menu Items ({{ menuItems().length }})</h3>
          <a (click)="goToMenu()" class="text-orange-600 hover:text-orange-700 text-sm font-medium cursor-pointer">View All</a>
        </div>
        <div class="space-y-3">
          @if (menuItems().length === 0) {
            <p class="text-slate-500 text-center py-4">No menu items yet</p>
          }
          @for (item of menuItems().slice(0, 5); track item._id) {
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">{{ item.name }}</p>
                <p class="text-sm text-slate-600">{{ item.category }} • Prep: {{ item.prepTime }}min</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-900"><span class="currency-prefix">$</span>{{ item.price }}</p>
                <span [ngClass]="item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'" class="text-xs font-medium px-2 py-1 rounded">
                  {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button (click)="goToOrders()" class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📝 New Order
          </button>
          <button (click)="goToMenu()" class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            🍔 Manage Menu
          </button>
          <button (click)="goToReviews()" class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            ⭐ Reviews
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
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class RestaurantDashboardComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  currentRoute = signal('');
  orders = signal<any[]>([]);
  menuItems = signal<any[]>([]);

  restaurantSidenavItems = [
    { label: 'Dashboard', icon: '🍽️', route: '/restaurant-dashboard' },
    { label: 'Orders', icon: '📋', route: '/restaurant-dashboard/orders', badge: 5 },
    { label: 'Menu', icon: '🍔', route: '/restaurant-dashboard/menu', badge: 0 },
    { label: 'Reviews', icon: '⭐', route: '/restaurant-dashboard/reviews', badge: 2 },
    { label: 'Incidents', icon: '🚨', route: '/restaurant-dashboard/incidents', badge: 1 },
    { label: 'Settings', icon: '⚙️', route: '/restaurant-dashboard/settings' }
  ];

  private restaurantId: string = '';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private foodService: FoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restaurantId = localStorage.getItem('restaurantId') || '';
    this.loadDashboardData();
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  loadDashboardData(): void {
    if (!this.restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.isLoading.set(true);

    // Load orders
    this.foodService.getRestaurantOrders(this.restaurantId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.orders.set(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
      }
    });

    // Load menu items
    this.foodService.getRestaurantMenus(this.restaurantId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.menuItems.set(response.data);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading menu:', error);
      }
    });
  }

  countOrdersByStatus(status: string): number {
    return this.orders().filter(o => o.status === status).length;
  }

  goToOrders(): void {
    this.router.navigate(['/restaurant-dashboard/orders']);
  }

  goToMenu(): void {
    this.router.navigate(['/restaurant-dashboard/menu']);
  }

  goToReviews(): void {
    this.router.navigate(['/restaurant-dashboard/reviews']);
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
