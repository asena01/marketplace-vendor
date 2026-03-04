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
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search users..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="filterUserType"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          (click)="loadUsers()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (users().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">{{ user.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' +
                      (user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                       user.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                       'bg-purple-100 text-purple-800')">
                      {{ user.userType }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ user.businessName || user.vendorType || '-' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.phone || '-' }}</td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      (click)="suspendUser(user._id, user.name)"
                      class="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🚫 Suspend
                    </button>
                    <button
                      (click)="deleteUser(user._id, user.name)"
                      class="text-orange-600 hover:text-orange-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading users...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">No users found</p>
          </div>
        }

        <!-- Pagination Controls -->
        @if (totalPages() > 1 && users().length > 0) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="text-sm text-gray-600">
              Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total users)
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
    </div>
  `,
  styles: []
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
      error: (error) => {
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
      error: (error) => {
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
      error: (error) => {
        this.error.set(error.error?.message || 'Failed to delete user');
      }
    });
  }
}
