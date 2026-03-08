import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-retail-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, VendorSidenavComponent, ],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="retail"
        [sidenavItems]="retailSidenavItems"
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
      <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Retail Management Dashboard</h1>
        <p class="text-green-100">Monitor sales, inventory, products, and customer interactions across your store.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading retail data...</p>
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
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Total Sales</p>
              <p class="text-3xl font-bold text-slate-900">{{ '$' }}{{ totalSales() }}</p>
            </div>
            <mat-icon class="text-green-500 text-3xl">trending_up</mat-icon>
          </div>
          <p class="mt-2 text-sm text-emerald-600">18.5% from last period</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Transactions</p>
              <p class="text-3xl font-bold text-slate-900">{{ transactionCount() }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl">shopping_cart</mat-icon>
          </div>
          <p class="mt-2 text-sm text-emerald-600">9.2% increase</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Avg. Transaction</p>
              <p class="text-3xl font-bold text-slate-900">{{ '$' }}{{ avgTransaction() | number: '1.2-2' }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl">calculate</mat-icon>
          </div>
          <p class="mt-2 text-sm text-slate-500">Per customer</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Inventory Items</p>
              <p class="text-3xl font-bold text-slate-900">{{ totalInventoryItems() }}</p>
            </div>
            <mat-icon class="text-purple-500 text-3xl">inventory_2</mat-icon>
          </div>
          <p class="mt-2 text-sm text-yellow-600">{{ lowStockCount() }} items low stock</p>
        </div>
      </div>

      <!-- Sales & Inventory Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales by Category -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Sales by Category</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Electronics</span>
              <span class="font-bold text-slate-900">$4,250</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 85%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Clothing</span>
              <span class="font-bold text-slate-900">$3,200</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 64%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Home & Garden</span>
              <span class="font-bold text-slate-900">$2,890</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 58%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Sports & Outdoors</span>
              <span class="font-bold text-slate-900">$2,150</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 43%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Accessories</span>
              <span class="font-bold text-slate-900">$2,850</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 57%;"></div>
            </div>
          </div>
        </div>

        <!-- Low Stock Items -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Low Stock Items</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Wireless Headphones</p>
                <p class="text-sm text-slate-600">SKU: WH-2024-001</p>
              </div>
              <span class="font-bold text-red-600">2 units</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">USB-C Cables</p>
                <p class="text-sm text-slate-600">SKU: UC-2024-045</p>
              </div>
              <span class="font-bold text-red-600">5 units</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Phone Cases</p>
                <p class="text-sm text-slate-600">SKU: PC-2024-128</p>
              </div>
              <span class="font-bold text-yellow-600">12 units</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Screen Protectors</p>
                <p class="text-sm text-slate-600">SKU: SP-2024-234</p>
              </div>
              <span class="font-bold text-yellow-600">18 units</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products & Customer Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Selling Products -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Top Selling Products</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Smartphone X Pro</p>
                <p class="text-sm text-slate-600">87 units sold</p>
              </div>
              <span class="font-bold text-slate-900">$3,480</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Wireless Earbuds</p>
                <p class="text-sm text-slate-600">65 units sold</p>
              </div>
              <span class="font-bold text-slate-900">$1,950</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Tablet Stand</p>
                <p class="text-sm text-slate-600">142 units sold</p>
              </div>
              <span class="font-bold text-slate-900">$1,136</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Laptop Backpack</p>
                <p class="text-sm text-slate-600">53 units sold</p>
              </div>
              <span class="font-bold text-slate-900">$1,590</span>
            </div>
          </div>
        </div>

        <!-- Customer Insights -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Customer Insights</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Total Customers</span>
              <span class="font-bold text-slate-900">2,543</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">New Customers (Today)</span>
              <span class="text-emerald-600 font-bold">24</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Repeat Customers</span>
              <span class="font-bold text-slate-900">1,856 (73%)</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Loyalty Members</span>
              <span class="font-bold text-slate-900">687 (27%)</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Avg. Customer Rating</span>
              <span class="font-bold text-slate-900">4.8/5.0 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">add_shopping_cart</mat-icon>
            <span>New Sale</span>
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">move_item</mat-icon>
            <span>Stock Transfer</span>
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">warehouse</mat-icon>
            <span>Manage Inventory</span>
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">assessment</mat-icon>
            <span>View Reports</span>
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
export class RetailDashboardComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  currentRoute = signal('');

  // Dashboard metrics signals
  totalSales = signal<number>(0);
  transactionCount = signal<number>(0);
  avgTransaction = signal<number>(0);
  totalInventoryItems = signal<number>(0);
  lowStockCount = signal<number>(0);
  inStockCount = signal<number>(0);
  totalInventoryValue = signal<number>(0);

  retailSidenavItems = [];
  private storeId: string = '';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService
  ) {
    this.storeId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    this.isLoading.set(false);
    this.loadDashboardData();
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  loadDashboardData(): void {
    if (!this.storeId) {
      this.errorMessage.set('Store ID not found. Please login again.');
      return;
    }

    this.isLoading.set(true);
    // Load vendor-specific products data to calculate metrics
    this.productService.getVendorProducts(this.storeId, 1, 100).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const products = response.data;
          this.totalInventoryItems.set(products.length);

          // Calculate metrics
          const inStock = products.filter((p: any) => p.stock > 0).length;
          const lowStock = products.filter((p: any) => p.stock > 0 && p.stock < 10).length;
          const totalValue = products.reduce((sum: number, p: any) => sum + (p.price * (p.stock || 0)), 0);

          this.inStockCount.set(inStock);
          this.lowStockCount.set(lowStock);
          this.totalInventoryValue.set(totalValue);

          // Mock transaction data (would come from orders API in real scenario)
          this.transactionCount.set(Math.floor(Math.random() * 500) + 300);
          this.totalSales.set(Math.floor(Math.random() * 20000) + 10000);
          this.avgTransaction.set(this.totalSales() / Math.max(this.transactionCount(), 1));
        } else {
          // If no products, show zero metrics
          this.totalInventoryItems.set(0);
          this.inStockCount.set(0);
          this.lowStockCount.set(0);
          this.totalInventoryValue.set(0);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage.set('Failed to load dashboard data. Make sure you have created products first.');
        this.isLoading.set(false);
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
