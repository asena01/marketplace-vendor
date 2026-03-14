import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Organizations Management</h2>
          <p class="text-gray-600">Manage vendors and their organizations</p>
        </div>
        <button
          (click)="openAddModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          ➕ Add Organization
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search organizations..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending-verification">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          (click)="loadOrganizations()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Organizations Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (organizations().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Revenue</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (org of organizations(); track org._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-800">
                    <div class="font-semibold">{{ org.name }}</div>
                    <div class="text-xs text-gray-500">{{ org.email }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {{ org.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ org.owner?.name || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    @switch (org.status) {
                      @case ('active') {
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✅ Active
                        </span>
                      }
                      @case ('pending-verification') {
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </span>
                      }
                      @case ('suspended') {
                        <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          🚫 Suspended
                        </span>
                      }
                    }
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ org.totalRevenue?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    @if (org.status === 'pending-verification') {
                      <button
                        (click)="verifyOrganization(org._id)"
                        class="text-green-600 hover:text-green-800 font-semibold"
                      >
                        ✅ Verify
                      </button>
                    }
                    @if (org.status !== 'suspended') {
                      <button
                        (click)="suspendOrganization(org._id, org.name)"
                        class="text-red-600 hover:text-red-800 font-semibold"
                      >
                        🚫 Suspend
                      </button>
                    }
                    <button
                      (click)="viewDetails(org._id)"
                      class="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading organizations...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">No organizations found</p>
          </div>
        }

        <!-- Pagination Controls -->
        @if (totalPages() > 1 && organizations().length > 0) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="text-sm text-gray-600">
              Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total organizations)
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div class="flex gap-1">
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.bg-gray-300]="page !== currentPage()"
                    [class.text-gray-900]="page !== currentPage()"
                    class="px-3 py-2 rounded hover:opacity-80 transition font-semibold text-sm"
                  >
                    {{ page }}
                  </button>
                }
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Add New Organization</h3>
            
            <form (ngSubmit)="addOrganization()" class="space-y-4">
              <input
                type="text"
                [(ngModel)]="newOrg.name"
                name="name"
                placeholder="Organization Name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="email"
                [(ngModel)]="newOrg.email"
                name="email"
                placeholder="Email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                [(ngModel)]="newOrg.phone"
                name="phone"
                placeholder="Phone"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                [(ngModel)]="newOrg.type"
                name="type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="tour-operator">Tour Operator</option>
              </select>

              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminOrganizationsComponent implements OnInit {
  organizations = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  showModal = signal(false);
  searchTerm = '';
  filterStatus = '';
  newOrg = {
    name: '',
    email: '',
    phone: '',
    type: ''
  };

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.adminService.getOrganizations(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations.set(response.data || []);

          // Update pagination info from response
          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          }

          console.log('✅ Organizations loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading organizations:', error);
        this.error.set(error.error?.message || 'Failed to load organizations');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrganizations();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);

    return pages.sort((a, b) => a - b);
  }

  openAddModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.newOrg = { name: '', email: '', phone: '', type: '' };
  }

  addOrganization(): void {
    if (!this.newOrg.name || !this.newOrg.email || !this.newOrg.phone || !this.newOrg.type) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.adminService.createOrganization(this.newOrg).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Organization created');
          this.closeModal();
          this.loadOrganizations();
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to create organization');
      }
    });
  }

  verifyOrganization(orgId: string): void {
    this.adminService.verifyOrganization(orgId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Organization verified');
          this.loadOrganizations();
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to verify organization');
      }
    });
  }

  suspendOrganization(orgId: string, orgName: string): void {
    const reason = prompt(`Reason for suspending "${orgName}":`);
    if (!reason) return;

    this.adminService.suspendOrganization(orgId, reason).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Organization suspended');
          this.loadOrganizations();
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to suspend organization');
      }
    });
  }

  viewDetails(orgId: string): void {
    console.log('Viewing organization details:', orgId);
    // Can expand to show detailed modal later
  }
}
