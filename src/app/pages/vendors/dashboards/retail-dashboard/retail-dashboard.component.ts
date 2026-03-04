import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';

@Component({
  selector: 'app-retail-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
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
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Sales</p>
          <p class="text-3xl font-bold text-slate-900">$15,340</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 18.5% from yesterday</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Transactions</p>
          <p class="text-3xl font-bold text-slate-900">487</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 9.2% increase</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Transaction</p>
          <p class="text-3xl font-bold text-slate-900">$31.50</p>
          <p class="mt-2 text-sm text-slate-500">Per customer</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Inventory Items</p>
          <p class="text-3xl font-bold text-slate-900">3,245</p>
          <p class="mt-2 text-sm text-yellow-600">24 items low stock</p>
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
          <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Sale
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Stock Transfer
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Inventory
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
          </button>
        </div>
      </div>
        </div>
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

  retailSidenavItems = [
    { label: 'Dashboard', icon: '🛍️', route: '/retail-dashboard' },
    { label: 'Sales', icon: '💰', route: '/retail-dashboard/sales', badge: 0 },
    { label: 'Inventory', icon: '📦', route: '/retail-dashboard/inventory', badge: 24 },
    { label: 'Products', icon: '🏷️', route: '/retail-dashboard/products', badge: 0 },
    { label: 'Customers', icon: '👥', route: '/retail-dashboard/customers', badge: 0 },
    { label: 'Reports', icon: '📈', route: '/retail-dashboard/reports' },
    { label: 'Settings', icon: '⚙️', route: '/retail-dashboard/settings' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
