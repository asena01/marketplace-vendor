import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading retail data...
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
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Total Sales</p>
              <p class="text-3xl font-bold text-slate-900">{{ '$' }}{{ totalSales() }}</p>
            </div>
            <mat-icon class="text-green-500 text-3xl">trending_up</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Transactions</p>
              <p class="text-3xl font-bold text-slate-900">{{ transactionCount() }}</p>
            </div>
            <mat-icon class="text-blue-500 text-3xl">shopping_cart</mat-icon>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">Avg. Transaction</p>
              <p class="text-3xl font-bold text-slate-900">{{ '$' }}{{ avgTransaction() | number: '1.2-2' }}</p>
            </div>
            <mat-icon class="text-orange-500 text-3xl">calculate</mat-icon>
          </div>
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

      <!-- Data Available Message -->
      @if (!isLoading() && !errorMessage() && (totalInventoryItems() === 0 && transactionCount() === 0)) {
        <div class="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
          <mat-icon class="text-blue-600 text-5xl block mx-auto mb-3">info</mat-icon>
          <p class="text-slate-900 font-semibold">Welcome to Your Retail Dashboard</p>
          <p class="text-slate-600 text-sm mt-2">Start by adding products to your inventory or creating orders to see data here</p>
        </div>
      }

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            (click)="navigateTo('/retail-dashboard/products')"
            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">add_shopping_cart</mat-icon>
            <span>Products</span>
          </button>
          <button 
            (click)="navigateTo('/retail-dashboard/inventory')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">warehouse</mat-icon>
            <span>Inventory</span>
          </button>
          <button 
            (click)="navigateTo('/retail-dashboard/customers')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">people</mat-icon>
            <span>Customers</span>
          </button>
          <button 
            (click)="navigateTo('/retail-dashboard/delivery-integrations')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <mat-icon class="text-lg">local_shipping</mat-icon>
            <span>Delivery</span>
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

  retailSidenavItems = [];

  private storeId: string = '';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {
    this.storeId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    this.isLoading.set(false);
    if (this.storeId) {
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
          
          // Calculate metrics from actual data
          const inStock = products.filter((p: any) => p.stock > 0).length;
          const lowStock = products.filter((p: any) => p.stock > 0 && p.stock < 10).length;
          
          this.lowStockCount.set(lowStock);
          
          // Set default values for sales metrics (would need orders API for real data)
          // For now, show 0 until orders are created
          this.transactionCount.set(0);
          this.totalSales.set(0);
          this.avgTransaction.set(0);
        } else {
          // If no products, show zero metrics
          this.totalInventoryItems.set(0);
          this.lowStockCount.set(0);
          this.transactionCount.set(0);
          this.totalSales.set(0);
          this.avgTransaction.set(0);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage.set('Failed to load dashboard data');
        // Set all metrics to 0 on error
        this.totalInventoryItems.set(0);
        this.lowStockCount.set(0);
        this.transactionCount.set(0);
        this.totalSales.set(0);
        this.avgTransaction.set(0);
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
