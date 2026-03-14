import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-vendor-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span class="material-icons text-4xl text-blue-600">business</span>
            Vendor Management
          </h2>
          <p class="text-gray-600 mt-2">Manage and monitor all vendors across the platform</p>
        </div>
        <button
          (click)="openAddVendorModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span class="material-icons">add_circle</span>
          Add Vendor
        </button>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">search</span>
              Search
            </label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by name, email, ID..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Vendor Type Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">category</span>
              Vendor Type
            </label>
            <select
              [(ngModel)]="selectedType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="service">Service</option>
              <option value="tours">Tours</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">info</span>
              Status
            </label>
            <select
              [(ngModel)]="selectedStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <!-- Verification Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">verified</span>
              KYC Status
            </label>
            <select
              [(ngModel)]="selectedKyc"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Additional Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Revenue Range -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">attach_money</span>
              Revenue (Min)
            </label>
            <input
              type="number"
              [(ngModel)]="minRevenue"
              placeholder="Min revenue"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">attach_money</span>
              Revenue (Max)
            </label>
            <input
              type="number"
              [(ngModel)]="maxRevenue"
              placeholder="Max revenue"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Rating Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="material-icons inline mr-2 text-lg">star</span>
              Min Rating
            </label>
            <input
              type="number"
              [(ngModel)]="minRating"
              min="0"
              max="5"
              step="0.5"
              placeholder="Min rating"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-2">
          <button
            (click)="applyFilters()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <span class="material-icons">filter_list</span>
            Apply Filters
          </button>
          <button
            (click)="resetFilters()"
            class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <span class="material-icons">refresh</span>
            Reset
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-semibold">Total Vendors</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ allVendors().length }}</p>
            </div>
            <span class="material-icons text-4xl text-blue-500 opacity-20">business</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-semibold">Active Vendors</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ activeVendorsCount() }}</p>
            </div>
            <span class="material-icons text-4xl text-green-500 opacity-20">check_circle</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-semibold">Pending KYC</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ pendingKycCount() }}</p>
            </div>
            <span class="material-icons text-4xl text-yellow-500 opacity-20">schedule</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-semibold">Suspended</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ suspendedCount() }}</p>
            </div>
            <span class="material-icons text-4xl text-red-500 opacity-20">block</span>
          </div>
        </div>
      </div>

      <!-- Vendors Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    [(ngModel)]="selectAll"
                    (change)="toggleSelectAll()"
                    class="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">person</span>
                  Vendor Name
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">email</span>
                  Email
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">category</span>
                  Type
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">info</span>
                  Status
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">verified</span>
                  KYC
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">star</span>
                  Rating
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">attach_money</span>
                  Revenue
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">more_vert</span>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              @if (filteredVendors().length === 0) {
                <tr>
                  <td colspan="9" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center justify-center">
                      <span class="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>
                      <p class="text-gray-500 font-semibold">No vendors found</p>
                      <p class="text-gray-400 text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (vendor of filteredVendors() | slice: (currentPage() - 1) * pageSize : currentPage() * pageSize; track vendor._id) {
                  <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-6 py-4">
                      <input
                        type="checkbox"
                        [(ngModel)]="vendor.selected"
                        class="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td class="px-6 py-4 text-gray-900 font-semibold">{{ vendor.name }}</td>
                    <td class="px-6 py-4 text-gray-700">{{ vendor.email }}</td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-sm font-semibold"
                        [class]="getTypeClass(vendor.vendorType)"
                      >
                        {{ vendor.vendorType }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                        [class]="getStatusClass(vendor.status)"
                      >
                        <span class="material-icons text-sm">{{ getStatusIcon(vendor.status) }}</span>
                        {{ vendor.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                        [class]="getKycClass(vendor.kycStatus)"
                      >
                        <span class="material-icons text-sm">{{ getKycIcon(vendor.kycStatus) }}</span>
                        {{ vendor.kycStatus }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-1">
                        <span class="material-icons text-yellow-500 text-sm">star</span>
                        <span class="font-semibold text-gray-900">{{ vendor.rating || 0 }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-gray-900 font-semibold">
                      \${{ vendor.monthlyRevenue || 0 | number:'1.2-2' }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <button
                          (click)="viewVendorDetail(vendor._id)"
                          title="View Details"
                          class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                        >
                          <span class="material-icons">visibility</span>
                        </button>
                        <button
                          (click)="editVendor(vendor._id)"
                          title="Edit"
                          class="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded transition"
                        >
                          <span class="material-icons">edit</span>
                        </button>
                        <button
                          (click)="deleteVendor(vendor._id)"
                          title="Delete"
                          class="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        >
                          <span class="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (filteredVendors().length > pageSize) {
          <div class="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ (currentPage() - 1) * pageSize + 1 }} to {{ Math.min(currentPage() * pageSize, filteredVendors().length) }} of {{ filteredVendors().length }}
            </div>
            <div class="flex gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <span class="material-icons text-sm">chevron_left</span>
                Previous
              </button>
              @for (page of getPageNumbers(); track page) {
                <button
                  (click)="goToPage(page)"
                  [class]="'px-4 py-2 rounded-lg font-semibold transition ' +
                    (currentPage() === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100')"
                >
                  {{ page }}
                </button>
              }
              <button
                (click)="nextPage()"
                [disabled]="currentPage() * pageSize >= filteredVendors().length"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                Next
                <span class="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        }
      </div>
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
    `
  ]
})
export class VendorDirectoryComponent implements OnInit {
  allVendors = signal<any[]>([]);
  filteredVendors = signal<any[]>([]);
  
  // Filters
  searchQuery = '';
  selectedType = '';
  selectedStatus = '';
  selectedKyc = '';
  minRevenue = 0;
  maxRevenue = 0;
  minRating = 0;

  // UI
  selectAll = false;
  currentPage = signal(1);
  pageSize = 10;
  Math = Math;

  // Computed values
  activeVendorsCount = computed(() =>
    this.allVendors().filter(v => v.status === 'active').length
  );

  pendingKycCount = computed(() =>
    this.allVendors().filter(v => v.kycStatus === 'pending').length
  );

  suspendedCount = computed(() =>
    this.allVendors().filter(v => v.status === 'suspended' || v.status === 'blocked').length
  );

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.adminService.getVendors().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const vendors = Array.isArray(response.data) ? response.data : [response.data];
          const enrichedVendors = vendors.map((v: any) => ({
            ...v,
            selected: false
          }));
          this.allVendors.set(enrichedVendors);
          this.filteredVendors.set(enrichedVendors);
        }
      },
      error: (error: any) => console.error('Error loading vendors:', error)
    });
  }

  applyFilters(): void {
    let filtered = [...this.allVendors()];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((v: any) =>
        v.name?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v._id?.includes(query)
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((v: any) => v.vendorType === this.selectedType);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((v: any) => v.status === this.selectedStatus);
    }

    if (this.selectedKyc) {
      filtered = filtered.filter((v: any) => v.kycStatus === this.selectedKyc);
    }

    if (this.minRevenue > 0) {
      filtered = filtered.filter((v: any) => (v.monthlyRevenue || 0) >= this.minRevenue);
    }

    if (this.maxRevenue > 0) {
      filtered = filtered.filter((v: any) => (v.monthlyRevenue || 0) <= this.maxRevenue);
    }

    if (this.minRating > 0) {
      filtered = filtered.filter((v: any) => (v.rating || 0) >= this.minRating);
    }

    this.filteredVendors.set(filtered);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.selectedKyc = '';
    this.minRevenue = 0;
    this.maxRevenue = 0;
    this.minRating = 0;
    this.filteredVendors.set([...this.allVendors()]);
    this.currentPage.set(1);
  }

  toggleSelectAll(): void {
    this.filteredVendors().forEach((v: any) => {
      v.selected = this.selectAll;
    });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize < this.filteredVendors().length) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredVendors().length / this.pageSize);
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage() - 2);
    const endPage = Math.min(totalPages, this.currentPage() + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      hotel: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-orange-100 text-orange-800',
      retail: 'bg-purple-100 text-purple-800',
      service: 'bg-green-100 text-green-800',
      tours: 'bg-pink-100 text-pink-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      verified: 'verified',
      active: 'check_circle',
      suspended: 'pause_circle',
      blocked: 'block'
    };
    return icons[status] || 'help';
  }

  getKycClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getKycIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      approved: 'verified_user',
      rejected: 'cancel'
    };
    return icons[status] || 'help';
  }

  viewVendorDetail(vendorId: string): void {
    this.router.navigate(['/vendor-detail', vendorId]);
  }

  editVendor(vendorId: string): void {
    this.router.navigate(['/vendor-detail', vendorId]);
  }

  deleteVendor(vendorId: string): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.adminService.deleteVendor(vendorId).subscribe({
        next: () => {
          this.loadVendors();
          console.log('Vendor deleted successfully');
        },
        error: (error: any) => console.error('Error deleting vendor:', error)
      });
    }
  }

  openAddVendorModal(): void {
    console.log('Open add vendor modal');
  }
}
