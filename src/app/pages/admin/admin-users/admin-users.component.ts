import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Page Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-1">Users Management</h2>
        <p class="text-xs text-gray-600">Manage customers, vendors, and staff</p>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search..."
          class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="filterUserType"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          (click)="loadUsers()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">refresh</span>
          <span class="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <!-- Users Table - Desktop View -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto hidden md:block">
        @if (users().length > 0) {
          <table class="w-full text-sm">
            <thead class="bg-gray-200 border-b border-gray-300 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Type</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Business</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Phone</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs font-semibold text-gray-800 truncate">{{ user.name }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ user.email }}</td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold inline-block ' +
                      (user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                       user.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                       'bg-purple-100 text-purple-800')">
                      {{ user.userType | slice:0:3 }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">
                    {{ (user.businessName || user.vendorType || '-') | slice:0:20 }}
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ user.phone || '-' }}</td>
                  <td class="px-3 py-2 text-xs space-x-0.5">
                    <button
                      (click)="suspendUser(user._id, user.name)"
                      class="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                      title="Suspend"
                    >
                      <span class="material-icons text-base">block</span>
                    </button>
                    <button
                      (click)="deleteUser(user._id, user.name)"
                      class="text-orange-600 hover:text-orange-800 transition p-1 rounded hover:bg-orange-50"
                      title="Delete"
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

      <!-- Users Cards - Mobile View -->
      <div class="space-y-2 md:hidden">
        @if (users().length > 0) {
          @for (user of users(); track user._id) {
            <div class="bg-white rounded shadow-sm p-3 border border-gray-200">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-semibold text-gray-800 truncate">{{ user.name }}</h3>
                  <p class="text-xs text-gray-600 truncate">{{ user.email }}</p>
                </div>
                <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ml-2 ' +
                  (user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                   user.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                   'bg-purple-100 text-purple-800')">
                  {{ user.userType | slice:0:3 }}
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-0.5 mb-2">
                <p><strong>Business:</strong> {{ (user.businessName || user.vendorType || '-') | slice:0:20 }}</p>
                <p><strong>Phone:</strong> {{ user.phone || '-' }}</p>
              </div>
              <div class="flex gap-1">
                <button
                  (click)="suspendUser(user._id, user.name)"
                  class="flex-1 text-red-600 hover:text-red-800 transition text-xs py-1.5 px-2 border border-red-300 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">block</span>
                  <span class="hidden sm:inline">Suspend</span>
                </button>
                <button
                  (click)="deleteUser(user._id, user.name)"
                  class="flex-1 text-orange-600 hover:text-orange-800 transition text-xs py-1.5 px-2 border border-orange-300 rounded hover:bg-orange-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">delete</span>
                  <span class="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="p-6 text-center bg-white rounded-lg shadow-md">
          <div class="inline-block animate-spin text-2xl text-blue-600 mb-3">
            <span class="material-icons">refresh</span>
          </div>
          <p class="text-gray-600 text-xs">Loading users...</p>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && users().length === 0) {
        <div class="p-6 text-center bg-white rounded-lg shadow-md">
          <span class="material-icons text-4xl text-gray-400 block mb-2">person_off</span>
          <p class="text-gray-600 text-xs">No users found</p>
        </div>
      }

        <!-- Pagination Controls -->
      @if (totalPages() > 1 && users().length > 0) {
        <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="text-xs text-gray-600">
            Page {{ currentPage() }}/{{ totalPages() }} ({{ totalItems() }} total)
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
              [disabled]="currentPage() === totalPages()"
              class="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition text-xs disabled:opacity-50 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span class="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      }

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 24px;
      height: 24px;
      width: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  searchTerm = '';
  filterUserType = '';

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set('');

    const userType = this.filterUserType || undefined;
    this.adminService.getUsers(this.currentPage(), this.pageSize(), userType).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data || []);

          // Update pagination info from response
          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          }

          console.log('✅ Users loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading users:', error);
        this.error.set(error.error?.message || 'Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
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

  suspendUser(userId: string, userName: string): void {
    const reason = prompt(`Reason for suspending "${userName}":`);
    if (!reason) return;

    this.adminService.suspendUser(userId, reason).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ User suspended');
          // If only one user on page and it's the last page, go back one page
          if (this.users().length === 1 && this.currentPage() > 1) {
            this.previousPage();
          } else {
            this.loadUsers();
          }
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to suspend user');
      }
    });
  }

  deleteUser(userId: string, userName: string): void {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
      return;
    }

    this.adminService.deleteUser(userId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ User deleted');
          // If only one user on page and it's the last page, go back one page
          if (this.users().length === 1 && this.currentPage() > 1) {
            this.previousPage();
          } else {
            this.loadUsers();
          }
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to delete user');
      }
    });
  }
}
