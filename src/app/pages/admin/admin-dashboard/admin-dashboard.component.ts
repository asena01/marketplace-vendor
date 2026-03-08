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
    VendorDirectoryComponent
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
        <aside class="w-64 bg-white shadow-lg min-h-screen">
          <nav class="p-6 space-y-2">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-4">Menu</p>

            <button
              (click)="setCurrentPage('overview')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'overview'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">dashboard</span>
              Overview
            </button>

            <button
              (click)="setCurrentPage('vendors')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'vendors'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">business</span>
              Vendors
            </button>

            <button
              (click)="setCurrentPage('organizations')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'organizations'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">apartment</span>
              Organizations
            </button>

            <button
              (click)="setCurrentPage('users')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'users'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">people</span>
              Users
            </button>

            <button
              (click)="setCurrentPage('payments')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'payments'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">payment</span>
              Payments
            </button>

            <button
              (click)="setCurrentPage('devices')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'devices'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">devices</span>
              Devices
            </button>

            <button
              (click)="setCurrentPage('delivery')"
              [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                (currentPage() === 'delivery'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100')"
            >
              <span class="material-icons">local_shipping</span>
              Delivery
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
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8">
          @if (currentPage() === 'overview') {
            <app-admin-overview></app-admin-overview>
          } @else if (currentPage() === 'vendors') {
            <app-vendor-directory></app-vendor-directory>
          } @else if (currentPage() === 'organizations') {
            <app-admin-organizations></app-admin-organizations>
          } @else if (currentPage() === 'users') {
            <app-admin-users></app-admin-users>
          } @else if (currentPage() === 'payments') {
            <app-admin-payments></app-admin-payments>
          } @else if (currentPage() === 'devices') {
            <app-admin-devices></app-admin-devices>
          } @else if (currentPage() === 'delivery') {
            <app-admin-delivery></app-admin-delivery>
          } @else if (currentPage() === 'profile') {
            <app-admin-profile></app-admin-profile>
          } @else if (currentPage() === 'settings') {
            <app-admin-settings></app-admin-settings>
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

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      console.log('❌ User is not admin - redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('✅ Admin dashboard loaded for:', this.getCurrentUserName());
  }

  setCurrentPage(page: string): void {
    this.currentPage.set(page);
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
    this.router.navigate(['/login']);
  }
}
