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
      <div class="flex items-center gap-3 mb-8">
        <span class="material-icons text-4xl text-blue-600">dashboard</span>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
          <p class="text-gray-600">System statistics and key metrics</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium flex items-center gap-1">
                <span class="material-icons text-sm">people</span>
                Total Users
              </p>
              <p class="text-4xl font-bold text-gray-800 mt-2">{{ stats()?.users?.total || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ stats()?.users?.vendors || 0 }} vendors • {{ stats()?.users?.customers || 0 }} customers
              </p>
            </div>
            <span class="material-icons text-6xl text-blue-200">people</span>
          </div>
        </div>

        <!-- Total Organizations -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium flex items-center gap-1">
                <span class="material-icons text-sm">apartment</span>
                Total Organizations
              </p>
              <p class="text-4xl font-bold text-gray-800 mt-2">{{ stats()?.organizations?.total || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ stats()?.organizations?.active || 0 }} active
              </p>
            </div>
            <span class="material-icons text-6xl text-green-200">apartment</span>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium flex items-center gap-1">
                <span class="material-icons text-sm">payment</span>
                Total Transactions
              </p>
              <p class="text-4xl font-bold text-gray-800 mt-2">{{ stats()?.payments?.totalTransactions || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">All-time total</p>
            </div>
            <span class="material-icons text-6xl text-purple-200">payment</span>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium flex items-center gap-1">
                <span class="material-icons text-sm">attach_money</span>
                Total Revenue
              </p>
              <p class="text-4xl font-bold text-gray-800 mt-2">
                \${{ (stats()?.payments?.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">Gross revenue</p>
            </div>
            <span class="material-icons text-6xl text-orange-200">attach_money</span>
          </div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Platform Commission -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="material-icons text-green-600">trending_up</span>
            Platform Commission
          </h3>
          <p class="text-3xl font-bold text-green-600">
            \${{ (stats()?.payments?.platformCommission || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
          </p>
          <p class="text-sm text-gray-600 mt-2">Total platform earnings</p>
        </div>

        <!-- Organization Status -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600">info</span>
            Organization Status
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span class="text-gray-600 flex items-center gap-2">
                <span class="material-icons text-sm text-green-600">check_circle</span>
                Active
              </span>
              <span class="font-bold text-green-600">{{ stats()?.organizations?.active || 0 }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span class="text-gray-600 flex items-center gap-2">
                <span class="material-icons text-sm text-yellow-600">schedule</span>
                Pending Verification
              </span>
              <span class="font-bold text-yellow-600">{{ stats()?.organizations?.pending || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-12">
          <span class="material-icons animate-spin text-5xl text-blue-600">hourglass_empty</span>
          <p class="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <span class="material-icons text-red-700 mt-1">error</span>
          <div>
            <p class="font-semibold">Error loading statistics</p>
            <p class="text-sm mt-1">{{ error() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .material-icons {
        font-size: 24px;
        height: 24px;
        width: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
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
