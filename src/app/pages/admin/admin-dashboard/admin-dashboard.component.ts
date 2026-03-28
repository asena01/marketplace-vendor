import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

// Admin sub-pages
import { AdminOverviewComponent } from '../admin-overview/admin-overview.component';
import { AdminSettingsComponent } from '../admin-settings/admin-settings.component';
import { AdminProfileComponent } from '../admin-profile/admin-profile.component';
import { RolesComponent } from '../admin-roles/roles.component';

// Category-specific admin components
import { HotelsAdminComponent } from '../admin-categories/hotels-admin/hotels-admin.component';
import { RestaurantsAdminComponent } from '../admin-categories/restaurants-admin/restaurants-admin.component';
import { RetailAdminComponent } from '../admin-categories/retail-admin/retail-admin.component';
import { ServicesAdminComponent } from '../admin-categories/services-admin/services-admin.component';
import { ToursAdminComponent } from '../admin-categories/tours-admin/tours-admin.component';
import { DeliveryAdminComponent } from '../admin-categories/delivery-admin/delivery-admin.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminOverviewComponent,
    AdminSettingsComponent,
    AdminProfileComponent,
    RolesComponent,
    HotelsAdminComponent,
    RestaurantsAdminComponent,
    RetailAdminComponent,
    ServicesAdminComponent,
    ToursAdminComponent,
    DeliveryAdminComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Mobile Menu Toggle -->
            <button
              (click)="toggleSidebar()"
              class="lg:hidden material-icons text-3xl hover:bg-slate-700 p-2 rounded transition"
            >
              {{ sidebarOpen() ? 'menu_open' : 'menu' }}
            </button>
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

      <div class="flex relative">
        <!-- Mobile Overlay (Tailwind hides on lg+) -->
        @if (sidebarOpen()) {
          <div
            (click)="sidebarOpen.set(false)"
            class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          ></div>
        }

        <!-- Sidebar Navigation -->
        <aside
          [class]="'fixed lg:relative w-72 h-screen lg:h-auto bg-white shadow-lg overflow-y-auto transition-all duration-300 z-40 ' +
            (sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')"
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
          } @else if (currentCategory() === 'hotels') {
            <app-hotels-admin></app-hotels-admin>
          } @else if (currentCategory() === 'restaurants') {
            <app-restaurants-admin></app-restaurants-admin>
          } @else if (currentCategory() === 'retail') {
            <app-retail-admin></app-retail-admin>
          } @else if (currentCategory() === 'services') {
            <app-services-admin></app-services-admin>
          } @else if (currentCategory() === 'tours') {
            <app-tours-admin></app-tours-admin>
          } @else if (currentCategory() === 'delivery') {
            <app-delivery-admin></app-delivery-admin>
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
  sidebarOpen = signal<boolean>(true);

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
    this.closeSidebarOnMobile();
  }

  selectCategory(categoryId: string): void {
    this.currentCategory.set(categoryId);
    this.currentSubPage.set('vendors');
    this.expandedCategory.set(categoryId === this.expandedCategory() ? null : categoryId);
    this.closeSidebarOnMobile();
  }

  selectSubPage(subPage: string): void {
    this.currentSubPage.set(subPage);
    this.closeSidebarOnMobile();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebarOnMobile(): void {
    // Close sidebar on mobile (screen width < 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
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
