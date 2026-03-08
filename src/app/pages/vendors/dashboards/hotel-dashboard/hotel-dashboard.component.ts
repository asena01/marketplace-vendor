import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../../../services/hotel.service';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="hotel"
        [sidenavItems]="hotelSidenavItems"
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
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Hotel Management Dashboard</h1>
        <p class="text-blue-100">Monitor bookings, rooms, guests, and hotel operations in real-time.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading hotel data...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Error: {{ errorMessage() }}</p>
        </div>
      }

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Occupancy Rate</p>
          <p class="text-3xl font-bold text-slate-900">{{ getOccupancyRate() }}%</p>
          <p class="mt-2 text-sm text-emerald-600">{{ bookings().length }} of {{ hotelData()?.totalRooms || 156 }} rooms</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Rooms</p>
          <p class="text-3xl font-bold text-slate-900">{{ hotelData()?.totalRooms || 156 }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ bookings().length }} occupied, {{ getAvailableRooms() }} available</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Revenue</p>
          <p class="text-3xl font-bold text-slate-900">$ {{ getTotalRevenue() }}</p>
          <p class="mt-2 text-sm text-emerald-600">Updated: Real-time data</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Bookings</p>
          <p class="text-3xl font-bold text-slate-900">{{ bookings().length }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ stats()?.checkInsToday || 0 }} check-ins today</p>
        </div>
      </div>

      <!-- Room Status & Bookings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Room Status -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Room Status Overview</h3>
          @if (roomStatusSummary()) {
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Occupied</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().occupied || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('occupied')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Available</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().available || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('available')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Cleaning</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().cleaning || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('cleaning')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Maintenance</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().maintenance || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('maintenance')"></div>
                </div>
              </div>
            </div>
          } @else {
            <p class="text-slate-600 text-center py-4">No room status data available</p>
          }
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Bookings</h3>
          <div class="space-y-4">
            @if (bookings().length === 0) {
              <p class="text-slate-600 text-center py-4">No bookings yet</p>
            } @else {
              @for (booking of bookings(); track booking._id) {
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="font-medium text-slate-900">{{ booking.customerName || 'Guest' }}</p>
                    <p class="text-sm text-slate-600">Room {{ booking.roomNumber || 'TBA' }} - {{ booking.roomType || 'Standard' }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                    'bg-emerald-100 text-emerald-700': booking.status === 'checked-in',
                    'bg-blue-100 text-blue-700': booking.status === 'confirmed',
                    'bg-yellow-100 text-yellow-700': booking.status === 'pending'
                  }">
                    {{ booking.status ? (booking.status | titlecase) : 'Pending' }}
                  </span>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Staff -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Staff On Duty</h3>
        @if (staffMembers().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (staff of staffMembers().slice(0, 6); track staff._id || staff.id) {
              <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span class="font-bold text-blue-600 text-sm">{{ getInitials(staff.name) }}</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ staff.name }}</p>
                  <p class="text-sm text-slate-600">{{ staff.position || 'Staff' }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-slate-600 text-center py-4">No staff members available</p>
        }
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            (click)="navigateTo('/hotel-dashboard/bookings')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📅 New Booking
          </button>
          <button
            (click)="navigateTo('/hotel-dashboard/rooms')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            🏨 Manage Rooms
          </button>
          <button
            (click)="navigateTo('/hotel-dashboard/bookings')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            ✅ Check-in Guest
          </button>
          <button
            (click)="navigateTo('/hotel-dashboard/settings')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            ⚙️ Settings
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
export class HotelDashboardComponent implements OnInit {
  hotelData = signal<any>(null);
  bookings = signal<any[]>([]);
  stats = signal<any>(null);
  staffMembers = signal<any[]>([]);
  roomStatusSummary = signal<any>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  hotelSidenavItems = [];
  currentRoute = signal('');

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHotelData();
    // Detect child routes
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  loadHotelData(): void {
    this.isLoading.set(true);

    // Load all data in parallel
    forkJoin({
      details: this.hotelService.getHotelDetails(),
      stats: this.hotelService.getHotelStats(),
      bookings: this.hotelService.getHotelBookings(1, 5),
      staff: this.hotelService.getStaff(1, 10),
      roomStatus: this.hotelService.getRoomStatusSummary()
    }).subscribe({
      next: (results: any) => {
        // Load hotel details
        if (results.details.status === 'success' && results.details.data) {
          this.hotelData.set(results.details.data);
          console.log('✅ Hotel data loaded:', results.details.data);
        }

        // Load stats
        if (results.stats.status === 'success' && results.stats.data) {
          this.stats.set(results.stats.data);
        }

        // Load bookings
        if (results.bookings.status === 'success' && Array.isArray(results.bookings.data)) {
          this.bookings.set(results.bookings.data);
          console.log('✅ Bookings loaded:', results.bookings.data);
        }

        // Load staff
        if (results.staff.status === 'success' && Array.isArray(results.staff.data)) {
          this.staffMembers.set(results.staff.data);
          console.log('✅ Staff loaded:', results.staff.data);
        }

        // Load room status summary
        if (results.roomStatus.status === 'success' && results.roomStatus.data) {
          this.roomStatusSummary.set(results.roomStatus.data);
          console.log('✅ Room status summary loaded:', results.roomStatus.data);
        }

        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading hotel data:', error);
        this.errorMessage.set('Failed to load hotel data. Please try refreshing.');
        this.isLoading.set(false);
      }
    });
  }

  getOccupancyRate(): number {
    if (!this.hotelData()) return 0;
    const total = this.hotelData().totalRooms || 156;
    const occupied = this.bookings().length || 0;
    return Math.round((occupied / total) * 100);
  }

  getTotalRevenue(): number {
    if (!this.stats()) return 0;
    return this.stats().totalRevenue || 0;
  }

  getAvailableRooms(): number {
    if (!this.hotelData()) return 0;
    return (this.hotelData().totalRooms || 156) - (this.bookings().length || 0);
  }

  getRoomStatusPercentage(status: string): number {
    const summary = this.roomStatusSummary();
    if (!summary) return 0;

    const total = summary.occupied + summary.available + summary.cleaning + summary.maintenance;
    if (total === 0) return 0;

    const count = summary[status] || 0;
    return Math.round((count / total) * 100);
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

  onLogout(): void {
    this.authService.logout();
    console.log('User logged out');
  }
}
