import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Users Management</h2>
        <p class="text-gray-600">Manage customers, vendors, and staff</p>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search users..."
          class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="filterUserType"
          class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          (click)="loadUsers()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span class="material-icons text-lg">refresh</span>
          <span class="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <!-- Users Table - Desktop View -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
        @if (users().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Business</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Phone</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ user.name }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600">{{ user.email }}</td>
                  <td class="px-4 py-3 text-xs">
                    <span [class]="'px-2 py-1 rounded-full text-xs font-semibold ' +
                      (user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                       user.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                       'bg-purple-100 text-purple-800')">
                      {{ user.userType }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-600">
                    {{ user.businessName || user.vendorType || '-' }}
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-600">{{ user.phone || '-' }}</td>
                  <td class="px-4 py-3 text-xs space-x-1">
                    <button
                      (click)="suspendUser(user._id, user.name)"
                      class="text-red-600 hover:text-red-800 font-semibold transition"
                      title="Suspend"
                    >
                      <span class="material-icons text-lg">block</span>
                    </button>
                    <button
                      (click)="deleteUser(user._id, user.name)"
                      class="text-orange-600 hover:text-orange-800 font-semibold transition"
                      title="Delete"
                    >
                      <span class="material-icons text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Users Cards - Mobile View -->
      <div class="space-y-3 md:hidden">
        @if (users().length > 0) {
          @for (user of users(); track user._id) {
            <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h3 class="text-sm font-semibold text-gray-800">{{ user.name }}</h3>
                  <p class="text-xs text-gray-600">{{ user.email }}</p>
                </div>
                <span [class]="'px-2 py-1 rounded-full text-xs font-semibold ' +
                  (user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                   user.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                   'bg-purple-100 text-purple-800')">
                  {{ user.userType }}
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-1 mb-3">
                <p><strong>Business:</strong> {{ user.businessName || user.vendorType || '-' }}</p>
                <p><strong>Phone:</strong> {{ user.phone || '-' }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="suspendUser(user._id, user.name)"
                  class="flex-1 text-red-600 hover:text-red-800 font-semibold transition text-sm py-2 px-3 border border-red-300 rounded hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <span class="material-icons text-base">block</span>
                  Suspend
                </button>
                <button
                  (click)="deleteUser(user._id, user.name)"
                  class="flex-1 text-orange-600 hover:text-orange-800 font-semibold transition text-sm py-2 px-3 border border-orange-300 rounded hover:bg-orange-50 flex items-center justify-center gap-2"
                >
                  <span class="material-icons text-base">delete</span>
                  Delete
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="p-12 text-center bg-white rounded-lg shadow-md">
          <div class="inline-block animate-spin text-3xl text-blue-600 mb-4">
            <span class="material-icons">refresh</span>
          </div>
          <p class="text-gray-600 text-sm">Loading users...</p>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && users().length === 0) {
        <div class="p-12 text-center bg-white rounded-lg shadow-md">
          <span class="material-icons text-5xl text-gray-400 block mb-3">person_off</span>
          <p class="text-gray-600">No users found</p>
        </div>
      }

        <!-- Pagination Controls -->
      @if (totalPages() > 1 && users().length > 0) {
        <div class="bg-white rounded-lg shadow-md p-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs sm:text-sm text-gray-600">
              Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total users)
            </div>
            <div class="flex items-center gap-2 flex-wrap justify-center">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
              >
                <span class="material-icons text-base">chevron_left</span>
                <span class="hidden sm:inline">Previous</span>
              </button>

              <div class="flex gap-1">
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.bg-gray-300]="page !== currentPage()"
                    [class.text-gray-900]="page !== currentPage()"
                    class="px-2 py-1 sm:px-3 sm:py-2 rounded hover:opacity-80 transition font-semibold text-xs"
                  >
                    {{ page }}
                  </button>
                }
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
              >
                <span class="hidden sm:inline">Next</span>
                <span class="material-icons text-base">chevron_right</span>
              </button>
            </div>
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
