import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';

@Component({
  selector: 'app-tours-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="tours"
        [sidenavItems]="toursSidenavItems"
        (logout)="onLogout()"
      ></app-vendor-sidenav>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-8 space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Tours & Travel Dashboard</h1>
        <p class="text-pink-100">Manage tour packages, bookings, guides, itineraries, and customer experiences.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading tours data...</p>
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
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Tours</p>
          <p class="text-3xl font-bold text-slate-900">18</p>
          <p class="mt-2 text-sm text-slate-500">247 participants total</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Monthly Revenue</p>
          <p class="text-3xl font-bold text-slate-900">$87,450</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 23.4% from last month</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Pending Bookings</p>
          <p class="text-3xl font-bold text-slate-900">34</p>
          <p class="mt-2 text-sm text-slate-500">Worth $18,900</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Satisfaction</p>
          <p class="text-3xl font-bold text-slate-900">4.7/5</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 0.3 from last month</p>
        </div>
      </div>

      <!-- Tours & Bookings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Active Tours -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Active Tours</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Paris City Explorer</p>
                <p class="text-sm text-slate-600">12 guests - March 15-20</p>
              </div>
              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">In Progress</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Alps Mountain Adventure</p>
                <p class="text-sm text-slate-600">8 guests - March 18-25</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Barcelona Beach Getaway</p>
                <p class="text-sm text-slate-600">15 guests - March 22-28</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Rome Historical Tour</p>
                <p class="text-sm text-slate-600">10 guests - April 1-7</p>
              </div>
              <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Pending</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Bookings -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Bookings</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">John & Sarah Thompson</p>
                <p class="text-sm text-slate-600">2 persons - Paris Tour</p>
              </div>
              <span class="text-sm font-bold text-slate-900">$3,200</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Michael Chen Family</p>
                <p class="text-sm text-slate-600">4 persons - Alps Adventure</p>
              </div>
              <span class="text-sm font-bold text-slate-900">$5,400</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Emma & David Wilson</p>
                <p class="text-sm text-slate-600">2 persons - Barcelona Beach</p>
              </div>
              <span class="text-sm font-bold text-slate-900">$2,800</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Roberto Santos Group</p>
                <p class="text-sm text-slate-600">6 persons - Rome Tour</p>
              </div>
              <span class="text-sm font-bold text-slate-900">$7,800</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tours & Guides -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tour Packages -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Popular Tour Packages</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">European Grand Tour</span>
              <span class="font-bold text-slate-900">156 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 100%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Exotic Beaches Tour</span>
              <span class="font-bold text-slate-900">98 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 63%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Mountain Trekking</span>
              <span class="font-bold text-slate-900">87 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 56%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Cultural Heritage Tour</span>
              <span class="font-bold text-slate-900">73 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 47%;"></div>
            </div>
          </div>
        </div>

        <!-- Tour Guides -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Tour Guides</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <span class="font-bold text-pink-600 text-sm">PD</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Pierre Dubois</p>
                  <p class="text-sm text-slate-600">Paris Specialist</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">24 tours</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <span class="font-bold text-pink-600 text-sm">MB</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Marco Bellini</p>
                  <p class="text-sm text-slate-600">Italy Expert</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">31 tours</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <span class="font-bold text-pink-600 text-sm">SG</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Sofia Garcia</p>
                  <p class="text-sm text-slate-600">Spain Guide</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">19 tours</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <span class="font-bold text-pink-600 text-sm">AK</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Andreas Klein</p>
                  <p class="text-sm text-slate-600">Alps Specialist</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">22 tours</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue & Performance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Breakdown -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Revenue by Region</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Europe</span>
              <span class="font-bold text-slate-900">$65,200</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 100%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Asia</span>
              <span class="font-bold text-slate-900">$14,300</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 22%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Americas</span>
              <span class="font-bold text-slate-900">$5,800</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 9%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Africa & Others</span>
              <span class="font-bold text-slate-900">$2,150</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-pink-500 h-2 rounded-full" style="width: 3%;"></div>
            </div>
          </div>
        </div>

        <!-- Customer Insights -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Customer Insights</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Total Customers</span>
              <span class="font-bold text-slate-900">3,245</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Repeat Customers</span>
              <span class="font-bold text-slate-900">1,234 (38%)</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Avg. Trip Cost</span>
              <span class="font-bold text-slate-900">$2,845</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Customer Satisfaction</span>
              <span class="font-bold text-emerald-600">4.7/5.0 ⭐</span>
            </div>
            <div class="border-t border-slate-200"></div>

            <div class="flex items-center justify-between p-3">
              <span class="text-slate-700 font-medium">Referral Rate</span>
              <span class="font-bold text-slate-900">34%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Tour
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Add Booking
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Guides
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
          </button>
        </div>
      </div>
        </div>
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
  isLoading = signal(false);
  errorMessage = signal('');

  toursSidenavItems = [
    { label: 'Dashboard', icon: '✈️', route: '/tours-dashboard' },
    { label: 'Tours', icon: '🗺️', route: '/tours-dashboard/tours', badge: 0 },
    { label: 'Bookings', icon: '📅', route: '/tours-dashboard/bookings', badge: 34 },
    { label: 'Guides', icon: '👨‍✈️', route: '/tours-dashboard/guides', badge: 0 },
    { label: 'Itineraries', icon: '📋', route: '/tours-dashboard/itineraries', badge: 0 },
    { label: 'Reports', icon: '📈', route: '/tours-dashboard/reports' },
    { label: 'Settings', icon: '⚙️', route: '/tours-dashboard/settings' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
