import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

// Admin sub-pages
import { AdminOverviewComponent } from '../admin-overview/admin-overview.component';
import { AdminSettingsComponent } from '../admin-settings/admin-settings.component';
import { AdminProfileComponent } from '../admin-profile/admin-profile.component';
import { RolesComponent } from '../admin-roles/roles.component';

// Business vendor list component for hierarchical drill-down
import { BusinessVendorListComponent } from '../admin-vendors/business-vendor-list.component';

// System management components
import { AdminSystemUsersComponent } from '../admin-system-users/admin-system-users.component';
import { AdminSystemDevicesComponent } from '../admin-system-devices/admin-system-devices.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminOverviewComponent,
    AdminSettingsComponent,
    AdminProfileComponent,
    RolesComponent,
    BusinessVendorListComponent,
    AdminSystemUsersComponent,
    AdminSystemDevicesComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 pt-16">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg fixed top-0 left-0 right-0 z-50 h-16">
        <div class="h-16 px-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-icons text-3xl">admin_panel_settings</span>
            <div>
              <h1 class="text-xl font-bold">Admin Dashboard</h1>
              <p class="text-slate-300 text-xs">MarketHub Administration</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right text-xs hidden sm:block">
              <p class="font-semibold">{{ getCurrentUserName() }}</p>
              <p class="text-slate-300 text-xs">{{ getAdminRole() }}</p>
            </div>
            <button
              (click)="logout()"
              class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-semibold text-sm transition flex items-center gap-2"
            >
              <span class="material-icons text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="flex relative">
        <!-- Sidebar Navigation - Always Visible -->
        <aside
          class="w-72 flex-shrink-0 bg-white shadow-lg overflow-y-auto z-30 fixed top-16 left-0 bottom-0"
        >
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

            <button
              (click)="setCurrentPage('users')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'users'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">people</span>
              System Users
            </button>

            <button
              (click)="setCurrentPage('devices')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'devices'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">devices</span>
              Smart Devices
            </button>

            <!-- Business Categories -->
            <p class="text-xs font-semibold text-gray-500 uppercase mb-4 mt-8">Businesses</p>

            @for (category of categories; track category.id) {
              <!-- Category Button - Click to view vendors list -->
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
                <span class="material-icons text-lg">chevron_right</span>
              </button>
            }
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8 ml-72">
          @if (currentPage() === 'overview' && !currentCategory()) {
            <app-admin-overview></app-admin-overview>
          } @else if (currentPage() === 'profile') {
            <app-admin-profile></app-admin-profile>
          } @else if (currentPage() === 'settings') {
            <app-admin-settings></app-admin-settings>
          } @else if (currentPage() === 'roles') {
            <app-roles></app-roles>
          } @else if (currentPage() === 'users') {
            <app-admin-system-users></app-admin-system-users>
          } @else if (currentPage() === 'devices') {
            <app-admin-system-devices></app-admin-system-devices>
          } @else if (currentCategory()) {
            <!-- Business Vendor List - Hierarchical Drill-Down View -->
            @switch (currentCategory()) {
              @case ('hotels') {
                <app-business-vendor-list [businessType]="'hotels'"></app-business-vendor-list>
              }
              @case ('restaurants') {
                <app-business-vendor-list [businessType]="'restaurants'"></app-business-vendor-list>
              }
              @case ('retail') {
                <app-business-vendor-list [businessType]="'retail'"></app-business-vendor-list>
              }
              @case ('services') {
                <app-business-vendor-list [businessType]="'services'"></app-business-vendor-list>
              }
              @case ('tours') {
                <app-business-vendor-list [businessType]="'tours'"></app-business-vendor-list>
              }
              @case ('delivery') {
                <app-business-vendor-list [businessType]="'delivery'"></app-business-vendor-list>
              }
            }
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
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      console.log('❌ User is not admin - redirecting to home');
      this.router.navigate(['/']);
      return;
    }

    console.log('✅ Admin dashboard loaded for:', this.getCurrentUserName());

    // Check URL fragments and set current page accordingly
    this.activatedRoute.fragment.subscribe((fragment) => {
      if (fragment) {
        console.log('📍 URL fragment detected:', fragment);
        this.setCurrentPage(fragment);
      }
    });

    // Check query params for page
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['page']) {
        console.log('📍 Page param detected:', params['page']);
        this.setCurrentPage(params['page']);
      }
    });
  }

  setCurrentPage(page: string): void {
    console.log('📄 Switching to page:', page);
    this.currentPage.set(page);
    this.currentCategory.set(null);
  }

  selectCategory(categoryId: string): void {
    console.log('📂 Selecting category:', categoryId);
    this.currentPage.set('');  // Clear system page
    this.currentCategory.set(categoryId);
    console.log('✅ Category set to:', categoryId, 'Showing vendors list');
  }

  selectSubPage(subPage: string): void {
    console.log('📄 Selecting sub-page:', subPage, 'Current category:', this.currentCategory());
    this.currentPage.set('');  // Clear system page
    this.currentSubPage.set(subPage);
    console.log('✅ Sub-page set to:', subPage);
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
