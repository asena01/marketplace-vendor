import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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

        <!-- Hotel Vendors -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium flex items-center gap-1">
                <span class="material-icons text-sm">hotel</span>
                Hotel Vendors
              </p>
              <p class="text-4xl font-bold text-gray-800 mt-2">{{ hotelStats().total }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ hotelStats().active }} active
              </p>
            </div>
            <span class="material-icons text-6xl text-green-200">hotel</span>
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
        <!-- Pending Hotel Approvals -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="material-icons text-amber-600">pending_actions</span>
            Pending Hotel Approvals
          </h3>
          <p class="text-3xl font-bold text-amber-600">{{ hotelStats().pending }}</p>
          <p class="text-sm text-gray-600 mt-2">Hotel vendors waiting for admin approval</p>
        </div>

        <!-- Hotel Approval Status -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600">verified_user</span>
            Hotel Approval Status
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span class="text-gray-600 flex items-center gap-2">
                <span class="material-icons text-sm text-green-600">check_circle</span>
                Active Hotels
              </span>
              <span class="font-bold text-green-600">{{ hotelStats().active }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span class="text-gray-600 flex items-center gap-2">
                <span class="material-icons text-sm text-yellow-600">schedule</span>
                Pending Approval
              </span>
              <span class="font-bold text-yellow-600">{{ hotelStats().pending }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span class="text-gray-600 flex items-center gap-2">
                <span class="material-icons text-sm text-blue-600">verified</span>
                KYC Approved
              </span>
              <span class="font-bold text-blue-600">{{ hotelStats().approvedKyc }}</span>
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
  hotelStats = signal({
    total: 0,
    active: 0,
    pending: 0,
    approvedKyc: 0
  });
  isLoading = signal(true);
  error = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.error.set('');

    forkJoin({
      stats: this.adminService.getStats(),
      hotels: this.adminService.getVendors(1, 500, { vendorType: 'hotel' })
    }).subscribe({
      next: ({ stats, hotels }) => {
        if (stats?.success) {
          this.stats.set(stats.data);
          console.log('✅ Stats loaded:', stats.data);
        }

        const hotelVendors = Array.isArray(hotels?.data) ? hotels.data : [];
        this.hotelStats.set({
          total: hotelVendors.length,
          active: hotelVendors.filter((vendor: any) => vendor.status === 'active').length,
          pending: hotelVendors.filter((vendor: any) => vendor.status === 'pending').length,
          approvedKyc: hotelVendors.filter((vendor: any) => vendor.kycStatus === 'approved').length
        });

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
