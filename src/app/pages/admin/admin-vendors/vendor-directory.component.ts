import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-vendor-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-1">Vendors Management</h2>
        <p class="text-xs text-gray-600">Manage and monitor vendors</p>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search..."
          class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          [(ngModel)]="selectedType"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="hotel">Hotel</option>
          <option value="restaurant">Restaurant</option>
          <option value="retail">Retail</option>
          <option value="service">Service</option>
          <option value="tours">Tours</option>
        </select>

        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          [(ngModel)]="selectedKyc"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All KYC</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          (click)="applyFilters()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">filter_list</span>
          <span class="hidden sm:inline">Filter</span>
        </button>

        <button
          (click)="resetFilters()"
          class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">refresh</span>
          <span class="hidden sm:inline">Reset</span>
        </button>

        <button
          (click)="openAddVendorModal()"
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">add_circle</span>
          <span class="hidden sm:inline">Add</span>
        </button>
      </div>

      <!-- Vendors Table - Desktop View -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto hidden md:block">
        @if (filteredVendors().length > 0) {
          <table class="w-full text-sm">
            <thead class="bg-gray-200 border-b border-gray-300 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Type</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">KYC</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Rating</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Revenue</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (vendor of filteredVendors() | slice: (currentPage() - 1) * pageSize : currentPage() * pageSize; track vendor._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs font-semibold text-gray-800 truncate">{{ vendor.name }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ vendor.email }}</td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold inline-block ' + getTypeClass(vendor.vendorType)">
                      {{ vendor.vendorType | slice:0:10 }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-0.5 ' + getStatusClass(vendor.status)">
                      <span class="material-icons text-xs">{{ getStatusIcon(vendor.status) }}</span>
                      {{ vendor.status | slice:0:8 }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ' + getKycClass(vendor.kycStatus)">
                      {{ vendor.kycStatus | slice:0:8 }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-800">
                    <span class="inline-flex items-center gap-0.5">
                      <span class="material-icons text-xs text-yellow-500">star</span>
                      {{ vendor.rating || 0 }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-800 truncate">\${{ vendor.monthlyRevenue || 0 | number:'1.2-2' }}</td>
                  <td class="px-3 py-2 text-xs space-x-0.5">
                    <button
                      (click)="viewVendorDetail(vendor._id)"
                      title="View"
                      class="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                    >
                      <span class="material-icons text-base">visibility</span>
                    </button>
                    <button
                      (click)="editVendor(vendor._id)"
                      title="Edit"
                      class="text-green-600 hover:text-green-800 transition p-1 rounded hover:bg-green-50"
                    >
                      <span class="material-icons text-base">edit</span>
                    </button>
                    <button
                      (click)="deleteVendor(vendor._id)"
                      title="Delete"
                      class="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                    >
                      <span class="material-icons text-base">delete</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Vendors Cards - Mobile View -->
      <div class="space-y-2 md:hidden">
        @if (filteredVendors().length > 0) {
          @for (vendor of filteredVendors() | slice: (currentPage() - 1) * pageSize : currentPage() * pageSize; track vendor._id) {
            <div class="bg-white rounded shadow-sm p-3 border border-gray-200">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-semibold text-gray-800 truncate">{{ vendor.name }}</h3>
                  <p class="text-xs text-gray-600 truncate">{{ vendor.email }}</p>
                </div>
                <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ml-2 ' + getTypeClass(vendor.vendorType)">
                  {{ vendor.vendorType | slice:0:10 }}
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-0.5 mb-2">
                <p><strong>Status:</strong> {{ vendor.status }}</p>
                <p><strong>KYC:</strong> {{ vendor.kycStatus }}</p>
                <p><strong>Rating:</strong> {{ vendor.rating || 0 }} / 5</p>
                <p><strong>Revenue:</strong> \${{ vendor.monthlyRevenue || 0 | number:'1.2-2' }}</p>
              </div>
              <div class="flex gap-1">
                <button
                  (click)="viewVendorDetail(vendor._id)"
                  class="flex-1 text-blue-600 hover:text-blue-800 transition text-xs py-1.5 px-2 border border-blue-300 rounded hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">visibility</span>
                  <span class="hidden sm:inline">View</span>
                </button>
                <button
                  (click)="editVendor(vendor._id)"
                  class="flex-1 text-green-600 hover:text-green-800 transition text-xs py-1.5 px-2 border border-green-300 rounded hover:bg-green-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">edit</span>
                  <span class="hidden sm:inline">Edit</span>
                </button>
                <button
                  (click)="deleteVendor(vendor._id)"
                  class="flex-1 text-red-600 hover:text-red-800 transition text-xs py-1.5 px-2 border border-red-300 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">delete</span>
                  <span class="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Empty State -->
      @if (filteredVendors().length === 0) {
        <div class="p-6 text-center bg-white rounded-lg shadow-md">
          <span class="material-icons text-4xl text-gray-400 block mb-2">business</span>
          <p class="text-gray-600 text-xs">No vendors found</p>
        </div>
      }

      <!-- Pagination -->
      @if (filteredVendors().length > pageSize) {
        <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="text-xs text-gray-600">
            Showing {{ (currentPage() - 1) * pageSize + 1 }} to {{ Math.min(currentPage() * pageSize, filteredVendors().length) }} of {{ filteredVendors().length }}
          </div>
          <div class="flex items-center gap-1">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition text-xs disabled:opacity-50 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span class="material-icons text-sm">chevron_left</span>
            </button>

            <div class="flex gap-0.5">
              @for (page of getPageNumbers(); track page) {
                <button
                  (click)="goToPage(page)"
                  [class.bg-blue-600]="page === currentPage()"
                  [class.text-white]="page === currentPage()"
                  [class.bg-gray-300]="page !== currentPage()"
                  [class.text-gray-900]="page !== currentPage()"
                  class="px-2 py-1 rounded hover:opacity-80 transition text-xs font-semibold"
                >
                  {{ page }}
                </button>
              }
            </div>

            <button
              (click)="nextPage()"
              [disabled]="currentPage() * pageSize >= filteredVendors().length"
              class="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition text-xs disabled:opacity-50 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span class="material-icons text-sm">chevron_right</span>
            </button>
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
