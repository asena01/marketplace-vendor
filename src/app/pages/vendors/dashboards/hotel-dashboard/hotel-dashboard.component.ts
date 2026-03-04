import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../../services/hotel.service';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';

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
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Occupied</span>
                <span class="text-slate-900 font-bold">142</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 91%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Available</span>
                <span class="text-slate-900 font-bold">14</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 9%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Cleaning</span>
                <span class="text-slate-900 font-bold">0</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-yellow-500 h-2 rounded-full" style="width: 0%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Maintenance</span>
                <span class="text-slate-900 font-bold">0</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" style="width: 0%;"></div>
              </div>
            </div>
          </div>
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

      <!-- Revenue & Services -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Services Performance -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Additional Services</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Restaurant Orders</span>
              <span class="font-bold text-slate-900">$3,240</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 65%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Spa & Wellness</span>
              <span class="font-bold text-slate-900">$2,150</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 43%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Room Service</span>
              <span class="font-bold text-slate-900">$1,560</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 31%;"></div>
            </div>
          </div>
        </div>

        <!-- Staff Management -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Staff On Duty</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="font-bold text-blue-600">HK</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Housekeeping</p>
                <p class="text-sm text-slate-600">8 staff members on duty</p>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span class="font-bold text-green-600">FO</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Front Office</p>
                <p class="text-sm text-slate-600">4 staff members on duty</p>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="font-bold text-purple-600">RS</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Restaurant Service</p>
                <p class="text-sm text-slate-600">6 staff members on duty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Booking
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Rooms
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Check-in Guest
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
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
  isLoading = signal(false);
  errorMessage = signal('');

  hotelSidenavItems = [
    { label: 'Dashboard', icon: '📊', route: '/hotel-dashboard' },
    { label: 'Rooms', icon: '🛏️', route: '/hotel-dashboard/rooms', badge: 0 },
    { label: 'Bookings', icon: '📅', route: '/hotel-dashboard/bookings', badge: 5 },
    { label: 'Devices', icon: '📱', route: '/hotel-dashboard/devices', badge: 0 },
    { label: 'Guests', icon: '👥', route: '/hotel-dashboard/guests' },
    { label: 'Reviews', icon: '⭐', route: '/hotel-dashboard/reviews', badge: 2 },
    { label: 'Incidents', icon: '🚨', route: '/hotel-dashboard/incidents', badge: 1 },
    { label: 'Reports', icon: '📈', route: '/hotel-dashboard/reports' },
    { label: 'Settings', icon: '⚙️', route: '/hotel-dashboard/settings' }
  ];

  currentRoute = signal('');

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
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

    // Get hotel details
    this.hotelService.getHotelDetails().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.hotelData.set(response.data);
          console.log('✅ Hotel data loaded:', response.data);
        }
      },
      error: (error) => {
        console.error('❌ Error loading hotel data:', error);
        this.errorMessage.set('Failed to load hotel data');
      }
    });

    // Get hotel stats
    this.hotelService.getHotelStats().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.stats.set(response.data);
        }
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
      }
    });

    // Get bookings
    this.hotelService.getHotelBookings(1, 5).subscribe({
      next: (response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.bookings.set(response.data);
          console.log('✅ Bookings loaded:', response.data);
        }
      },
      error: (error) => {
        console.error('❌ Error loading bookings:', error);
      },
      complete: () => {
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

  onLogout(): void {
    this.authService.logout();
    console.log('User logged out');
  }
}
