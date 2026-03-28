import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

// Admin sub-pages
import { AdminOverviewComponent } from '../admin-overview/admin-overview.component';
import { AdminOrganizationsComponent } from '../admin-organizations/admin-organizations.component';
import { AdminUsersComponent } from '../admin-users/admin-users.component';
import { AdminPaymentsComponent } from '../admin-payments/admin-payments.component';
import { AdminDevicesComponent } from '../admin-devices/admin-devices.component';
import { AdminSettingsComponent } from '../admin-settings/admin-settings.component';
import { AdminDeliveryComponent } from '../admin-delivery/admin-delivery.component';
import { AdminProfileComponent } from '../admin-profile/admin-profile.component';
import { VendorDirectoryComponent } from '../admin-vendors/vendor-directory.component';
import { SettlementsComponent } from '../admin-settlements/settlements.component';
import { RolesComponent } from '../admin-roles/roles.component';
import { DeviceAssignmentManagerComponent } from '../admin-dashboard/device-assignment-manager/device-assignment-manager.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminOverviewComponent,
    AdminOrganizationsComponent,
    AdminUsersComponent,
    AdminPaymentsComponent,
    AdminDevicesComponent,
    AdminSettingsComponent,
    AdminDeliveryComponent,
    AdminProfileComponent,
    VendorDirectoryComponent,
    SettlementsComponent,
    RolesComponent,
    DeviceAssignmentManagerComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="material-icons text-4xl">admin_panel_settings</span>
            <div>
              <h1 class="text-3xl font-bold">Admin Dashboard</h1>
              <p class="text-slate-300 text-sm">MarketHub Administration Control Center</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right text-sm">
              <p class="font-semibold">{{ getCurrentUserName() }}</p>
              <p class="text-slate-300">{{ getAdminRole() }}</p>
            </div>
            <button
              (click)="logout()"
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span class="material-icons">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <aside class="w-72 bg-white shadow-lg min-h-screen overflow-y-auto">
          <nav class="p-6 space-y-2">
            <!-- Top Level Menu -->
            <p class="text-xs font-semibold text-gray-500 uppercase mb-4">System</p>

            <button
              (click)="setCurrentPage('overview')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'overview' && !currentCategory()
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">dashboard</span>
              Overview
            </button>

            <button
              (click)="setCurrentPage('profile')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'profile'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">account_circle</span>
              Profile
            </button>

            <button
              (click)="setCurrentPage('settings')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'settings'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">settings</span>
              Settings
            </button>

            <button
              (click)="setCurrentPage('roles')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'roles'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">security</span>
              Roles & Permissions
            </button>

            <!-- Business Categories -->
            <p class="text-xs font-semibold text-gray-500 uppercase mb-4 mt-8">Businesses</p>

            @for (category of categories; track category.id) {
              <div>
                <!-- Category Header (Collapsible) -->
                <button
                  (click)="selectCategory(category.id)"
                  [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center justify-between ' +
                    (currentCategory() === category.id
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100')"
                >
                  <div class="flex items-center gap-3">
                    <span class="material-icons">{{ category.icon }}</span>
                    <span>{{ category.name }}</span>
                  </div>
                  <span class="material-icons text-lg transition-transform" [style.transform]="expandedCategory() === category.id ? 'rotate(180deg)' : 'rotate(0deg)'">
                    expand_more
                  </span>
                </button>

                <!-- Sub Pages (Expandable) -->
                @if (expandedCategory() === category.id) {
                  <div class="ml-4 mt-2 space-y-1 border-l-2 border-gray-200">
                    @for (subPage of category.subPages; track subPage) {
                      <button
                        (click)="selectSubPage(subPage)"
                        [class]="'w-full text-left px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 ' +
                          (currentSubPage() === subPage && currentCategory() === category.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50')"
                      >
                        <span class="material-icons text-base">{{ getSubPageIcon(subPage) }}</span>
                        <span class="capitalize">{{ subPage }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8">
          @if (currentPage() === 'overview' && !currentCategory()) {
            <app-admin-overview></app-admin-overview>
          } @else if (currentPage() === 'profile') {
            <app-admin-profile></app-admin-profile>
          } @else if (currentPage() === 'settings') {
            <app-admin-settings></app-admin-settings>
          } @else if (currentPage() === 'roles') {
            <app-roles></app-roles>
          } @else if (currentCategory()) {
            <!-- Category-Based Content -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-icons text-3xl text-blue-600">{{ getCategory(currentCategory()!)?.icon }}</span>
                <div>
                  <h2 class="text-2xl font-bold text-gray-800">{{ getCategory(currentCategory()!)?.name }}</h2>
                  <p class="text-gray-600 capitalize">Managing {{ currentSubPage() }}</p>
                </div>
              </div>

              <!-- Sub Page Content based on category and sub-page -->
              @switch(currentSubPage()) {
                @case ('vendors') {
                  <div class="p-4 bg-blue-50 rounded border border-blue-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Vendors Management</p>
                    <p class="text-sm text-gray-600">Showing vendors filtered by category: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('users') {
                  <div class="p-4 bg-green-50 rounded border border-green-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Staff & Users</p>
                    <p class="text-sm text-gray-600">Showing staff members for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('devices') {
                  <div class="p-4 bg-purple-50 rounded border border-purple-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Smart Devices</p>
                    <p class="text-sm text-gray-600">Managing devices for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('bookings') {
                  <div class="p-4 bg-orange-50 rounded border border-orange-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Bookings</p>
                    <p class="text-sm text-gray-600">Viewing bookings for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('orders') {
                  <div class="p-4 bg-orange-50 rounded border border-orange-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Orders</p>
                    <p class="text-sm text-gray-600">Viewing orders for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('payments') {
                  <div class="p-4 bg-yellow-50 rounded border border-yellow-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Payments</p>
                    <p class="text-sm text-gray-600">Tracking payments for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('reviews') {
                  <div class="p-4 bg-pink-50 rounded border border-pink-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Reviews & Ratings</p>
                    <p class="text-sm text-gray-600">Managing reviews for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('inventory') {
                  <div class="p-4 bg-indigo-50 rounded border border-indigo-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Inventory</p>
                    <p class="text-sm text-gray-600">Managing inventory for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('appointments') {
                  <div class="p-4 bg-cyan-50 rounded border border-cyan-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Appointments</p>
                    <p class="text-sm text-gray-600">Managing appointments for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('tours') {
                  <div class="p-4 bg-teal-50 rounded border border-teal-200">
                    <p class="text-gray-700">{{ getCategory(currentCategory()!)?.name }} Tours</p>
                    <p class="text-sm text-gray-600">Managing tours for: <strong>{{ currentCategory() }}</strong></p>
                  </div>
                }
                @case ('partners') {
                  <div class="p-4 bg-red-50 rounded border border-red-200">
                    <p class="text-gray-700">Delivery Partners</p>
                    <p class="text-sm text-gray-600">Managing delivery partner businesses</p>
                  </div>
                }
                @case ('drivers') {
                  <div class="p-4 bg-red-50 rounded border border-red-200">
                    <p class="text-gray-700">Delivery Drivers</p>
                    <p class="text-sm text-gray-600">Managing delivery drivers</p>
                  </div>
                }
              }
            </div>
          }
        </main>
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
export class AdminDashboardComponent implements OnInit {
  currentPage = signal<string>('overview');
  currentCategory = signal<string | null>(null);
  currentSubPage = signal<string>('vendors');
  expandedCategory = signal<string | null>(null);

  // Business categories with their sub-pages
  categories = [
    {
      id: 'hotels',
      name: 'Hotels',
      icon: 'hotel',
      subPages: ['vendors', 'users', 'devices', 'bookings', 'payments', 'reviews']
    },
    {
      id: 'restaurants',
      name: 'Restaurants',
      icon: 'restaurant',
      subPages: ['vendors', 'users', 'devices', 'orders', 'payments', 'reviews']
    },
    {
      id: 'retail',
      name: 'Retail Stores',
      icon: 'storefront',
      subPages: ['vendors', 'users', 'inventory', 'payments', 'reviews']
    },
    {
      id: 'services',
      name: 'Services',
      icon: 'handyman',
      subPages: ['vendors', 'users', 'appointments', 'payments', 'reviews']
    },
    {
      id: 'tours',
      name: 'Tours & Travel',
      icon: 'flight_takeoff',
      subPages: ['vendors', 'users', 'tours', 'bookings', 'payments', 'reviews']
    },
    {
      id: 'delivery',
      name: 'Delivery',
      icon: 'local_shipping',
      subPages: ['partners', 'drivers', 'orders', 'payments']
    }
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      console.log('❌ User is not admin - redirecting to home');
      this.router.navigate(['/']);
      return;
    }

    console.log('✅ Admin dashboard loaded for:', this.getCurrentUserName());
  }

  setCurrentPage(page: string): void {
    this.currentPage.set(page);
    this.currentCategory.set(null);
  }

  selectCategory(categoryId: string): void {
    this.currentCategory.set(categoryId);
    this.currentSubPage.set('vendors');
    this.expandedCategory.set(categoryId === this.expandedCategory() ? null : categoryId);
  }

  selectSubPage(subPage: string): void {
    this.currentSubPage.set(subPage);
  }

  getCategory(id: string) {
    return this.categories.find(c => c.id === id);
  }

  getSubPageIcon(subPage: string): string {
    const iconMap: Record<string, string> = {
      'vendors': 'business',
      'users': 'people',
      'staff': 'people',
      'drivers': 'person_pin_circle',
      'devices': 'devices',
      'bookings': 'event',
      'orders': 'shopping_cart',
      'payments': 'payment',
      'reviews': 'star_rate',
      'inventory': 'inventory_2',
      'appointments': 'schedule',
      'tours': 'tour',
      'partners': 'business',
      'settings': 'settings'
    };
    return iconMap[subPage] || 'folder';
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Admin';
  }

  getAdminRole(): string {
    const role = localStorage.getItem('adminRole');
    return role ? role.replace('-', ' ').toUpperCase() : 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
