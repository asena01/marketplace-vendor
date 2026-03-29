import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-system-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Page Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="material-icons text-3xl text-purple-600">people</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">System Users</h2>
          <p class="text-xs text-gray-600">Manage admin accounts and system users</p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search..."
          class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          [(ngModel)]="filterUserType"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Types</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>
        <button
          (click)="searchUsers()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">search</span>
          <span class="hidden sm:inline">Search</span>
        </button>
        <button
          (click)="openAddUserModal()"
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">add_circle</span>
          <span class="hidden sm:inline">Add User</span>
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
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Phone</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Verified</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Joined</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs font-semibold text-gray-800 truncate">{{ user.name }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ user.email }}</td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ' +
                      (user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                       user.userType === 'vendor' ? 'bg-blue-100 text-blue-800' :
                       'bg-green-100 text-green-800')">
                      {{ user.userType }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ user.phone || '-' }}</td>
                  <td class="px-3 py-2 text-xs text-center">
                    @if (user.isVerified) {
                      <span class="text-green-600 material-icons text-sm">check_circle</span>
                    } @else {
                      <span class="text-gray-400 material-icons text-sm">circle</span>
                    }
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-600">{{ user.createdAt | date:'short' }}</td>
                  <td class="px-3 py-2 text-xs space-x-0.5">
                    <button
                      (click)="editUser(user._id)"
                      class="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                      title="Edit"
                    >
                      <span class="material-icons text-base">edit</span>
                    </button>
                    <button
                      (click)="deleteUser(user._id)"
                      class="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
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
                  (user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                   user.userType === 'vendor' ? 'bg-blue-100 text-blue-800' :
                   'bg-green-100 text-green-800')">
                  {{ user.userType }}
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-0.5 mb-2">
                <p><strong>Phone:</strong> {{ user.phone || '-' }}</p>
                <p><strong>Verified:</strong> {{ user.isVerified ? '✓' : '-' }}</p>
                <p><strong>Joined:</strong> {{ user.createdAt | date:'short' }}</p>
              </div>
              <div class="flex gap-1">
                <button
                  (click)="editUser(user._id)"
                  class="flex-1 text-blue-600 hover:text-blue-800 transition text-xs py-1.5 px-2 border border-blue-300 rounded hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">edit</span>
                  <span class="hidden sm:inline">Edit</span>
                </button>
                <button
                  (click)="deleteUser(user._id)"
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
      @if (users().length === 0) {
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <span class="material-icons text-6xl text-gray-300 mx-auto mb-4 block">people_outline</span>
          <p class="text-gray-600 font-medium">No users found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new user</p>
        </div>
      }

      <!-- Pagination -->
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
                  [class.bg-purple-600]="page === currentPage()"
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
  `]
})
export class AdminSystemUsersComponent implements OnInit {
  users = signal<any[]>([]);
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
    this.adminService.getUsers(this.currentPage(), this.pageSize(), this.filterUserType || undefined).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.users.set(response.data || []);

          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          }

          console.log('✅ Users loaded:', response.data?.length);
        }
        this.users.set([]);
      },
      error: (error: any) => {
        console.error('❌ Error loading users:', error);
        this.users.set([]);
      }
    });
  }

  searchUsers(): void {
    this.currentPage.set(1);
    this.loadUsers();
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

    return pages;
  }

  editUser(userId: string): void {
    alert(`Edit user: ${userId} (To be implemented)`);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          console.log('✅ User deleted successfully');
        },
        error: (error: any) => console.error('❌ Error deleting user:', error)
      });
    }
  }

  openAddUserModal(): void {
    alert('Add User modal (To be implemented)');
  }
}
