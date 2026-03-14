import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { TourService } from '../../../../services/tour.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';

@Component({
  selector: 'app-tours-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <app-vendor-sidenav
        vendorType="tours"
        [sidenavItems]="toursSidenavItems"
        (logout)="onLogout()"
      ></app-vendor-sidenav>

      <div class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>

        @if (!hasChildRoute()) {
        <div class="p-8 space-y-8">
          <div class="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 text-white shadow-lg">
            <h1 class="text-3xl font-bold mb-2">Tours & Travel Dashboard</h1>
            <p class="text-pink-100">Manage tour packages, bookings, guides, itineraries, and customer experiences.</p>
          </div>

          @if (isLoading()) {
            <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
              <p class="font-semibold">Loading tours data...</p>
            </div>
          }

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p class="font-semibold">Error: {{ errorMessage() }}</p>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
              <p class="text-slate-600 text-sm font-medium mb-1">Active Tours</p>
              @if (activeTours().length > 0) {
                <p class="text-3xl font-bold text-slate-900">{{ activeTours().length }}</p>
                <p class="mt-2 text-sm text-slate-500">{{ totalParticipants() }} participants</p>
              } @else {
                <p class="text-3xl font-bold text-slate-900">0</p>
                <p class="mt-2 text-sm text-slate-500">No active tours</p>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
              <p class="text-slate-600 text-sm font-medium mb-1">Monthly Revenue</p>
              @if (monthlyRevenue() > 0) {
                <p class="text-3xl font-bold text-slate-900">{{ '$' + (monthlyRevenue() | number:'1.0-0') }}</p>
                <p class="mt-2 text-sm text-emerald-600">From {{ tours().length }} tours</p>
              } @else {
                <p class="text-3xl font-bold text-slate-900">$0</p>
                <p class="mt-2 text-sm text-slate-500">No revenue data</p>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
              <p class="text-slate-600 text-sm font-medium mb-1">Total Bookings</p>
              @if (bookings().length > 0) {
                <p class="text-3xl font-bold text-slate-900">{{ bookings().length }}</p>
                <p class="mt-2 text-sm text-slate-500">{{ totalBookingValue() | currency }}</p>
              } @else {
                <p class="text-3xl font-bold text-slate-900">0</p>
                <p class="mt-2 text-sm text-slate-500">No bookings yet</p>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
              <p class="text-slate-600 text-sm font-medium mb-1">Tour Guides</p>
              @if (tourGuides().length > 0) {
                <p class="text-3xl font-bold text-slate-900">{{ tourGuides().length }}</p>
                <p class="mt-2 text-sm text-slate-500">Available guides</p>
              } @else {
                <p class="text-3xl font-bold text-slate-900">0</p>
                <p class="mt-2 text-sm text-slate-500">No guides added</p>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Active Tours</h3>
              @if (activeTours().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No active tours</p>
                  <p class="text-sm mt-1">Create your first tour to get started</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (tour of activeTours().slice(0, 4); track tour._id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p class="font-medium text-slate-900">{{ tour.name }}</p>
                        <p class="text-sm text-slate-600">{{ tour.maxParticipants || 0 }} guests</p>
                      </div>
                      <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Bookings</h3>
              @if (bookings().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No bookings yet</p>
                  <p class="text-sm mt-1">Bookings will appear when customers book tours</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (booking of bookings().slice(0, 4); track booking._id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p class="font-medium text-slate-900">{{ booking.customerName || 'Guest' }}</p>
                        <p class="text-sm text-slate-600">{{ booking.touristCount || 1 }} persons</p>
                      </div>
                      <span class="text-sm font-bold text-slate-900">{{ booking.totalPrice | currency }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Tour Packages</h3>
              @if (tours().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No tours created yet</p>
                  <p class="text-sm mt-1">Add tours to manage your packages</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (tour of tours().slice(0, 4); track tour._id) {
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-slate-700 font-medium">{{ tour.name }}</span>
                        <span class="font-bold text-slate-900">{{ tour.currentParticipants || 0 }}/{{ tour.maxParticipants || 0 }}</span>
                      </div>
                      <div class="w-full bg-slate-200 rounded-full h-2">
                        <div
                          class="bg-pink-500 h-2 rounded-full"
                          [style.width.%]="((tour.currentParticipants || 0) / (tour.maxParticipants || 1)) * 100"
                        ></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Tour Guides</h3>
              @if (tourGuides().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No guides added yet</p>
                  <p class="text-sm mt-1">Add tour guides to manage your team</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (guide of tourGuides().slice(0, 4); track guide._id) {
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <span class="font-bold text-pink-600 text-sm">{{ getInitials(guide.name) }}</span>
                        </div>
                        <div>
                          <p class="font-medium text-slate-900">{{ guide.name }}</p>
                          <p class="text-sm text-slate-600">{{ guide.expertise || 'Guide' }}</p>
                        </div>
                      </div>
                      <span class="text-xs font-medium text-slate-600">{{ guide.toursCompleted || 0 }} tours</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Tour Statistics</h3>
              @if (tours().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No tour data available</p>
                  <p class="text-sm mt-1">Create tours to see statistics</p>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Total Tours</span>
                    <span class="font-bold text-slate-900">{{ tours().length }}</span>
                  </div>
                  <div class="border-t border-slate-200"></div>
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Avg. Rating</span>
                    <span class="font-bold text-slate-900">{{ averageRating() | number:'1.1-1' }}/5.0</span>
                  </div>
                  <div class="border-t border-slate-200"></div>
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Occupancy Rate</span>
                    <span class="font-bold text-slate-900">{{ occupancyRate() | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md">
              <h3 class="text-lg font-bold text-slate-900 mb-6">Booking Insights</h3>
              @if (bookings().length === 0) {
                <div class="text-center py-8 text-slate-500">
                  <p class="font-semibold">No booking data available</p>
                  <p class="text-sm mt-1">Bookings will appear when customers book</p>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Total Bookings</span>
                    <span class="font-bold text-slate-900">{{ bookings().length }}</span>
                  </div>
                  <div class="border-t border-slate-200"></div>
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Total Revenue</span>
                    <span class="font-bold text-slate-900">{{ totalBookingValue() | currency }}</span>
                  </div>
                  <div class="border-t border-slate-200"></div>
                  <div class="flex items-center justify-between p-3">
                    <span class="text-slate-700 font-medium">Avg. Booking</span>
                    <span class="font-bold text-slate-900">{{ averageBookingValue() | currency }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button routerLink="/tours-dashboard/tours" class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm">New Tour</button>
              <button routerLink="/tours-dashboard/bookings" class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition text-sm">View Bookings</button>
              <button routerLink="/tours-dashboard/guides" class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition text-sm">Manage Guides</button>
              <button routerLink="/tours-dashboard/reports" class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition text-sm">View Reports</button>
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
export class ToursDashboardComponent implements OnInit {
  tours = signal<any[]>([]);
  bookings = signal<any[]>([]);
  tourGuides = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  currentRoute = signal('');

  activeTours = computed(() => this.tours().filter(t => t.isActive !== false));
  
  totalParticipants = computed(() => {
    return this.tours().reduce((sum, tour) => sum + (tour.currentParticipants || 0), 0);
  });

  monthlyRevenue = computed(() => {
    return this.bookings().reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  });

  totalBookingValue = computed(() => {
    return this.bookings().reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  });

  averageBookingValue = computed(() => {
    const bookingCount = this.bookings().length;
    if (bookingCount === 0) return 0;
    return this.totalBookingValue() / bookingCount;
  });

  averageRating = computed(() => {
    const toursWithRating = this.tours().filter(t => t.rating && t.rating > 0);
    if (toursWithRating.length === 0) return 0;
    const totalRating = toursWithRating.reduce((sum, tour) => sum + tour.rating, 0);
    return totalRating / toursWithRating.length;
  });

  occupancyRate = computed(() => {
    const totalCapacity = this.tours().reduce((sum, tour) => sum + (tour.maxParticipants || 0), 0);
    if (totalCapacity === 0) return 0;
    return (this.totalParticipants() / totalCapacity) * 100;
  });

  toursSidenavItems = [
    { label: 'Dashboard', icon: '✈️', route: '/tours-dashboard' },
    { label: 'Tours', icon: '🗺️', route: '/tours-dashboard/tours', badge: 0 },
    { label: 'Bookings', icon: '📅', route: '/tours-dashboard/bookings', badge: 0 },
    { label: 'Guides', icon: '👨‍✈️', route: '/tours-dashboard/guides', badge: 0 },
    { label: 'Itineraries', icon: '📋', route: '/tours-dashboard/itineraries', badge: 0 },
    { label: 'Reviews', icon: '⭐', route: '/tours-dashboard/reviews', badge: 0 },
    { label: 'Incidents', icon: '🚨', route: '/tours-dashboard/incidents', badge: 0 },
    { label: 'Reports', icon: '📈', route: '/tours-dashboard/reports' },
    { label: 'Finance', icon: '💼', route: '/tours-dashboard/finance' },
    { label: 'Settings', icon: '⚙️', route: '/tours-dashboard/settings' }
  ];

  constructor(
    private authService: AuthService,
    private tourService: TourService,
    private activatedRoute: ActivatedRoute
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

  loadDashboardData(): void {
    this.isLoading.set(true);
    
    this.tourService.getTours(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.tours.set(response.data);
          this.updateSidenavBadges();
        }
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.errorMessage.set('Failed to load tours data');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });

    this.tourService.getBookings(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.bookings.set(response.data);
        }
      },
      error: (error) => console.error('Error loading bookings:', error)
    });

    this.tourService.getTourGuides().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.tourGuides.set(response.data);
        }
      },
      error: (error) => console.error('Error loading guides:', error),
      complete: () => this.isLoading.set(false)
    });
  }

  updateSidenavBadges(): void {
    this.toursSidenavItems[1].badge = this.tours().length;
    this.toursSidenavItems[2].badge = this.bookings().length;
    this.toursSidenavItems[3].badge = this.tourGuides().length;
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
