import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';
import { ServiceProviderService, Appointment, ServiceStaff } from '../../../../services/service-provider.service';
import { ReviewService } from '../../../../services/review.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-service-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="service"
        [sidenavItems]="serviceSidenavItems"
        (logout)="onLogout()"
      ></app-vendor-sidenav>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Router Outlet for Child Pages -->
        <router-outlet></router-outlet>

        <!-- Dashboard Content (shown only on main dashboard page) -->
        @if (!hasChildRoute()) {
        <div class="p-8 space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Service Provider Dashboard</h1>
        <p class="text-purple-100">Manage appointments, staff schedules, services, and client interactions.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading service data...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Error: {{ errorMessage() }}</p>
        </div>
      }

      <!-- Key Metrics -->
      @if (providerStats()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Total Appointments</p>
            <p class="text-3xl font-bold text-slate-900">{{ providerStats().totalAppointments || 0 }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ providerStats().completedAppointments || 0 }} completed</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Total Revenue</p>
            <p class="text-3xl font-bold text-slate-900">₦{{ (providerStats().totalRevenue || 0).toLocaleString() }}</p>
            <p class="mt-2 text-sm text-emerald-600">All-time earnings</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Total Clients</p>
            <p class="text-3xl font-bold text-slate-900">{{ providerStats().totalClients || 0 }}</p>
            <p class="mt-2 text-sm text-slate-500">Unique customers</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Average Rating</p>
            <p class="text-3xl font-bold text-slate-900">{{ (providerStats().averageRating || 0).toFixed(1) }}/5</p>
            <p class="mt-2 text-sm text-emerald-600">{{ providerStats().totalReviews || 0 }} reviews</p>
          </div>
        </div>
      } @else {
        <div class="bg-slate-50 border border-slate-300 text-slate-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">No statistics data available</p>
        </div>
      }

      <!-- Appointments & Staff -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Appointments</h3>
          @if (upcomingAppointments().length > 0) {
            <div class="space-y-3">
              @for (apt of upcomingAppointments(); track apt._id || apt.id) {
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="font-medium text-slate-900">{{ apt.customerName }}</p>
                    <p class="text-sm text-slate-600">{{ apt.serviceName }} - {{ apt.startTime }}</p>
                  </div>
                  <span [class]="'px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(apt.status)">
                    {{ apt.status | titlecase }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-8 text-slate-500">
              <p>No appointments scheduled</p>
            </div>
          }
        </div>

        <!-- Staff On Duty -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Staff Members</h3>
          @if (staffMembers().length > 0) {
            <div class="space-y-3">
              @for (staff of staffMembers(); track staff._id || staff.id) {
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="font-bold text-purple-600 text-sm">{{ getInitials(staff.name) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-slate-900">{{ staff.name }}</p>
                      <p class="text-sm text-slate-600">{{ staff.specialization }}</p>
                    </div>
                  </div>
                  <span [class]="'text-xs font-medium ' + (staff.status === 'active' ? 'text-green-600' : 'text-slate-600')">
                    {{ staff.status | titlecase }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-8 text-slate-500">
              <p>No staff members added</p>
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            (click)="navigateTo('/service-dashboard/appointments')"
            class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📅 New Appointment
          </button>
          <button
            (click)="navigateTo('/service-dashboard/services')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            🛠️ Manage Services
          </button>
          <button
            (click)="navigateTo('/service-dashboard/staff')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            👔 Staff Schedule
          </button>
          <button
            (click)="navigateTo('/service-dashboard/reports')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📈 View Reports
          </button>
        </div>
      </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class ServiceDashboardComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  currentRoute = signal('');

  // API Data
  providerStats = signal<any>(null);
  upcomingAppointments = signal<Appointment[]>([]);
  staffMembers = signal<ServiceStaff[]>([]);

  serviceSidenavItems = [
    { label: 'Dashboard', icon: '💇', route: '/service-dashboard' },
    { label: 'Appointments', icon: '📅', route: '/service-dashboard/appointments', badge: 0 },
    { label: 'Services', icon: '🛠️', route: '/service-dashboard/services', badge: 0 },
    { label: 'Staff', icon: '👔', route: '/service-dashboard/staff', badge: 0 },
    { label: 'Clients', icon: '👥', route: '/service-dashboard/clients', badge: 0 },
    { label: 'Reviews', icon: '⭐', route: '/service-dashboard/reviews', badge: 0 },
    { label: 'Notifications', icon: '🔔', route: '/service-dashboard/notifications', badge: 0 },
    { label: 'Incidents', icon: '🚨', route: '/service-dashboard/incidents', badge: 0 },
    { label: 'Reports', icon: '📈', route: '/service-dashboard/reports' },
    { label: 'Settings', icon: '⚙️', route: '/service-dashboard/settings' }
  ];

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private serviceProviderService: ServiceProviderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  private loadDashboardData(): void {
    const providerId = localStorage.getItem('userId') || '';
    if (!providerId) {
      this.errorMessage.set('Unable to load provider information');
      return;
    }

    this.isLoading.set(true);

    // Load all data in parallel
    forkJoin({
      stats: this.serviceProviderService.getProviderStats(providerId),
      appointments: this.serviceProviderService.getProviderAppointments(providerId, 1, 10),
      staff: this.serviceProviderService.getProviderStaff(providerId, 1, 5)
    }).subscribe({
      next: (results: any) => {
        // Load stats
        if (results.stats.status === 'success' && results.stats.data) {
          this.providerStats.set(results.stats.data);
        }

        // Load appointments
        if (results.appointments.status === 'success' && results.appointments.data) {
          this.upcomingAppointments.set(results.appointments.data);
        }

        // Load staff
        if (results.staff.status === 'success' && results.staff.data) {
          this.staffMembers.set(results.staff.data);
        }

        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage.set('Failed to load dashboard data. Please try refreshing.');
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
