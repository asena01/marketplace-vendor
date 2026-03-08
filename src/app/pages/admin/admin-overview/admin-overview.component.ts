import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p class="text-gray-600">System statistics and key metrics</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Users</p>
              <p class="text-4xl font-bold text-gray-800">{{ stats()?.users?.total || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ stats()?.users?.vendors || 0 }} vendors • {{ stats()?.users?.customers || 0 }} customers
              </p>
            </div>
            <div class="text-5xl">👥</div>
          </div>
        </div>

        <!-- Total Organizations -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Organizations</p>
              <p class="text-4xl font-bold text-gray-800">{{ stats()?.organizations?.total || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ stats()?.organizations?.active || 0 }} active
              </p>
            </div>
            <div class="text-5xl">🏢</div>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Transactions</p>
              <p class="text-4xl font-bold text-gray-800">{{ stats()?.payments?.totalTransactions || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">All-time total</p>
            </div>
            <div class="text-5xl">💳</div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p class="text-4xl font-bold text-gray-800">
                \${{ (stats()?.payments?.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">Gross revenue</p>
            </div>
            <div class="text-5xl">💰</div>
          </div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Platform Commission -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Platform Commission</h3>
          <p class="text-3xl font-bold text-green-600">
            \${{ (stats()?.payments?.platformCommission || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
          </p>
          <p class="text-sm text-gray-600 mt-2">Total platform earnings</p>
        </div>

        <!-- Organization Status -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Organization Status</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Active</span>
              <span class="font-bold text-green-600">{{ stats()?.organizations?.active || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Pending Verification</span>
              <span class="font-bold text-yellow-600">{{ stats()?.organizations?.pending || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl">⏳</div>
          <p class="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error loading statistics</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminOverviewComponent implements OnInit {
  stats = signal<any>(null);
  isLoading = signal(true);
  error = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.adminService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data);
          console.log('✅ Stats loaded:', response.data);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading stats:', error);
        this.error.set(error.error?.message || 'Failed to load statistics');
        this.isLoading.set(false);
      }
    });
  }
}
