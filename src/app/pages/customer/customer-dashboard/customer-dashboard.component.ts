import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';

// Tab components
import { CustomerProfileComponent } from '../customer-profile/customer-profile.component';
import { CustomerHotelBookingsComponent } from '../customer-hotel-bookings/customer-hotel-bookings.component';
import { CustomerFoodOrdersComponent } from '../customer-food-orders/customer-food-orders.component';
import { CustomerShoppingComponent } from '../customer-shopping/customer-shopping.component';
import { CustomerServicesBookingsComponent } from '../customer-services-bookings/customer-services-bookings.component';
import { CustomerToursBookingsComponent } from '../customer-tours-bookings/customer-tours-bookings.component';
import { CustomerChatSupportComponent } from '../customer-chat-support/customer-chat-support.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    CustomerProfileComponent,
    CustomerHotelBookingsComponent,
    CustomerFoodOrdersComponent,
    CustomerShoppingComponent,
    CustomerServicesBookingsComponent,
    CustomerToursBookingsComponent,
    CustomerChatSupportComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
        <div class="px-4 py-4 md:px-6">
          <div class="flex items-center justify-between">
            <!-- Left Section -->
            <div class="flex items-center gap-4">
              <button
                (click)="goBack()"
                class="text-white hover:bg-blue-500 p-2 rounded-lg transition"
                title="Back to home"
              >
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <mat-icon class="text-xl">dashboard</mat-icon>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Dashboard</h1>
                <p class="text-blue-100 text-xs">Customer Portal</p>
              </div>
            </div>

            <!-- Right Section -->
            <div class="flex items-center gap-2">
              <button
                (click)="goHome()"
                class="bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm"
                title="Go to home page"
              >
                <mat-icon class="text-lg">home</mat-icon>
                <span class="hidden sm:inline">Home</span>
              </button>
              <button
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm"
              >
                <mat-icon class="text-lg">logout</mat-icon>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Container with Sidebar -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
          <nav class="p-6 space-y-2">
            <!-- Dashboard -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Dashboard</h3>
              <button
                (click)="setSection('dashboard', null)"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                  (activeSection() === 'dashboard'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <mat-icon class="text-xl">dashboard</mat-icon>
                <span>Overview</span>
              </button>
            </div>

            <!-- My Bookings -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">My Bookings</h3>

              <button
                (click)="setSection('my-bookings', 'hotels')"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'my-bookings' && activeType() === 'hotels'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">hotel</mat-icon>
                  <span>Hotels</span>
                </span>
                @if (hotelCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ hotelCount() }}</span>
                }
              </button>

              <button
                (click)="setSection('my-bookings', 'food')"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'my-bookings' && activeType() === 'food'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">restaurant</mat-icon>
                  <span>Food Orders</span>
                </span>
                @if (foodCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ foodCount() }}</span>
                }
              </button>

              <button
                (click)="setSection('my-bookings', 'shopping')"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'my-bookings' && activeType() === 'shopping'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">shopping_bag</mat-icon>
                  <span>Shopping</span>
                </span>
                @if (shoppingCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ shoppingCount() }}</span>
                }
              </button>

              <button
                (click)="setSection('my-bookings', 'tours')"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'my-bookings' && activeType() === 'tours'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">flight</mat-icon>
                  <span>Tours</span>
                </span>
                @if (toursCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ toursCount() }}</span>
                }
              </button>

              <button
                (click)="setSection('my-bookings', 'services')"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'my-bookings' && activeType() === 'services'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">miscellaneous_services</mat-icon>
                  <span>Services</span>
                </span>
                @if (servicesCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ servicesCount() }}</span>
                }
              </button>
            </div>

            <!-- Support & Profile -->
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Support</h3>

              <button
                (click)="setSection('support', null)"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 justify-between ' +
                  (activeSection() === 'support'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <span class="flex items-center gap-3">
                  <mat-icon class="text-xl">chat</mat-icon>
                  <span>Support Chat</span>
                </span>
                @if (chatCount() > 0) {
                  <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{{ chatCount() }}</span>
                }
              </button>

              <button
                (click)="setSection('profile', null)"
                [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ' +
                  (activeSection() === 'profile'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100')"
              >
                <mat-icon class="text-xl">person</mat-icon>
                <span>Profile Settings</span>
              </button>
            </div>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="px-4 py-8 md:px-8">
            <!-- Mobile Menu Toggle (for small screens) -->
            <div class="md:hidden mb-4">
              <button
                (click)="toggleMobileMenu()"
                class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <mat-icon>menu</mat-icon>
                <span>Menu</span>
              </button>
            </div>

            <!-- Content based on active section -->
            @if (activeSection() === 'dashboard') {
              <div class="max-w-6xl">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p class="text-gray-600 mb-8">Here's an overview of your bookings and orders</p>

                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-600 text-sm font-medium">Active Bookings</p>
                        <p class="text-3xl font-bold text-gray-900">{{ hotelCount() + toursCount() }}</p>
                      </div>
                      <mat-icon class="text-4xl text-blue-500">hotel</mat-icon>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-600 text-sm font-medium">Food Orders</p>
                        <p class="text-3xl font-bold text-gray-900">{{ foodCount() }}</p>
                      </div>
                      <mat-icon class="text-4xl text-orange-500">restaurant</mat-icon>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-600 text-sm font-medium">Shopping Orders</p>
                        <p class="text-3xl font-bold text-gray-900">{{ shoppingCount() }}</p>
                      </div>
                      <mat-icon class="text-4xl text-purple-500">shopping_bag</mat-icon>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-600 text-sm font-medium">Services</p>
                        <p class="text-3xl font-bold text-gray-900">{{ servicesCount() }}</p>
                      </div>
                      <mat-icon class="text-4xl text-green-500">miscellaneous_services</mat-icon>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-600 text-sm font-medium">Support Chats</p>
                        <p class="text-3xl font-bold text-gray-900">{{ chatCount() }}</p>
                      </div>
                      <mat-icon class="text-4xl text-red-500">chat</mat-icon>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      (click)="setSection('my-bookings', 'hotels')"
                      class="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg p-4 text-left transition"
                    >
                      <mat-icon class="text-3xl text-blue-600 mb-2">hotel</mat-icon>
                      <h4 class="font-bold text-gray-900">My Hotel Bookings</h4>
                      <p class="text-sm text-gray-600">View and manage your hotel stays</p>
                    </button>

                    <button
                      (click)="setSection('my-bookings', 'food')"
                      class="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-lg p-4 text-left transition"
                    >
                      <mat-icon class="text-3xl text-orange-600 mb-2">restaurant</mat-icon>
                      <h4 class="font-bold text-gray-900">Food Orders</h4>
                      <p class="text-sm text-gray-600">Track your food orders</p>
                    </button>

                    <button
                      (click)="setSection('my-bookings', 'shopping')"
                      class="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg p-4 text-left transition"
                    >
                      <mat-icon class="text-3xl text-purple-600 mb-2">shopping_bag</mat-icon>
                      <h4 class="font-bold text-gray-900">Shopping Orders</h4>
                      <p class="text-sm text-gray-600">Manage your shopping purchases</p>
                    </button>
                  </div>
                </div>
              </div>
            }

            @if (activeSection() === 'my-bookings' && activeType() === 'hotels') {
              <app-customer-hotel-bookings></app-customer-hotel-bookings>
            }

            @if (activeSection() === 'my-bookings' && activeType() === 'food') {
              <app-customer-food-orders></app-customer-food-orders>
            }

            @if (activeSection() === 'my-bookings' && activeType() === 'shopping') {
              <app-customer-shopping></app-customer-shopping>
            }

            @if (activeSection() === 'my-bookings' && activeType() === 'services') {
              <app-customer-services-bookings></app-customer-services-bookings>
            }

            @if (activeSection() === 'my-bookings' && activeType() === 'tours') {
              <app-customer-tours-bookings></app-customer-tours-bookings>
            }

            @if (activeSection() === 'support') {
              <app-customer-chat-support></app-customer-chat-support>
            }

            @if (activeSection() === 'profile') {
              <app-customer-profile></app-customer-profile>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  activeSection = signal<'dashboard' | 'my-bookings' | 'support' | 'profile'>('dashboard');
  activeType = signal<'hotels' | 'food' | 'shopping' | 'services' | 'tours' | null>(null);
  isMobileMenuOpen = signal<boolean>(false);

  // Signals for tracking counts of active bookings/orders
  hotelCount = signal<number>(0);
  foodCount = signal<number>(0);
  shoppingCount = signal<number>(0);
  servicesCount = signal<number>(0);
  toursCount = signal<number>(0);
  chatCount = signal<number>(0);

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is customer
    if (!this.authService.isCustomer()) {
      console.log('❌ User is not a customer - redirecting to home');
      this.router.navigate(['/']);
      return;
    }

    console.log('✅ Customer dashboard loaded for:', this.authService.getCurrentUser()?.name);

    // Load counts for all services
    this.loadAllCounts();

    // Listen for tab switch events from child components
    window.addEventListener('switchTab', (event: any) => {
      const tab = event.detail;
      // Map old tab names to new section/type
      const tabMap: { [key: string]: { section: string; type?: string } } = {
        'chat': { section: 'support' },
        'profile': { section: 'profile' },
        'hotels': { section: 'my-bookings', type: 'hotels' },
        'food': { section: 'my-bookings', type: 'food' },
        'shopping': { section: 'my-bookings', type: 'shopping' },
        'services': { section: 'my-bookings', type: 'services' },
        'tours': { section: 'my-bookings', type: 'tours' }
      };
      const mapped = tabMap[tab];
      if (mapped) {
        this.setSection(mapped.section as any, mapped.type as any);
        console.log('📌 Switching to section:', mapped.section, 'type:', mapped.type);
      }
    });
  }

  /**
   * Load counts for all services
   */
  private loadAllCounts(): void {
    this.loadShoppingCount();
    this.loadHotelCount();
    this.loadFoodCount();
    this.loadServicesCount();
    this.loadToursCount();
    this.loadChatsCount();
  }

  /**
   * Load shopping orders count
   */
  private loadShoppingCount(): void {
    this.customerService.getShoppingOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeOrders = Array.isArray(response.data)
            ? response.data.filter(order => order.status !== 'delivered' && order.status !== 'cancelled')
            : [];
          this.shoppingCount.set(activeOrders.length);
          console.log(`📦 Shopping - Found ${activeOrders.length} active orders`);
        }
      },
      error: (error) => {
        console.error('Error loading shopping count:', error);
        this.shoppingCount.set(0);
      }
    });
  }

  /**
   * Load hotel bookings count
   */
  private loadHotelCount(): void {
    this.customerService.getMyHotelBookings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeBookings = Array.isArray(response.data)
            ? response.data.filter(booking => booking.status !== 'cancelled' && booking.status !== 'completed')
            : [];
          this.hotelCount.set(activeBookings.length);
          console.log(`🏨 Hotels - Found ${activeBookings.length} active bookings`);
        }
      },
      error: (error) => {
        console.error('Error loading hotel count:', error);
        this.hotelCount.set(0);
      }
    });
  }

  /**
   * Load food orders count
   */
  private loadFoodCount(): void {
    this.customerService.getFoodOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeOrders = Array.isArray(response.data)
            ? response.data.filter(order => order.status !== 'delivered' && order.status !== 'cancelled')
            : [];
          this.foodCount.set(activeOrders.length);
          console.log(`🍔 Food - Found ${activeOrders.length} active orders`);
        }
      },
      error: (error) => {
        console.error('Error loading food count:', error);
        this.foodCount.set(0);
      }
    });
  }

  /**
   * Load service bookings count
   */
  private loadServicesCount(): void {
    this.customerService.getServiceBookings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeBookings = Array.isArray(response.data)
            ? response.data.filter(booking => booking.status !== 'cancelled' && booking.status !== 'completed')
            : [];
          this.servicesCount.set(activeBookings.length);
          console.log(`🔧 Services - Found ${activeBookings.length} active bookings`);
        }
      },
      error: (error) => {
        console.error('Error loading services count:', error);
        this.servicesCount.set(0);
      }
    });
  }

  /**
   * Load tour bookings count
   */
  private loadToursCount(): void {
    this.customerService.getMyTourBookings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeBookings = Array.isArray(response.data)
            ? response.data.filter(booking => booking.status !== 'cancelled' && booking.status !== 'completed')
            : [];
          this.toursCount.set(activeBookings.length);
          console.log(`✈️ Tours - Found ${activeBookings.length} active bookings`);
        }
      },
      error: (error) => {
        console.error('Error loading tours count:', error);
        this.toursCount.set(0);
      }
    });
  }

  /**
   * Load vendor chats count
   */
  private loadChatsCount(): void {
    this.customerService.getVendorChats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activeChats = Array.isArray(response.data)
            ? response.data.filter(chat => chat.status !== 'closed')
            : [];
          this.chatCount.set(activeChats.length);
          console.log(`💬 Chats - Found ${activeChats.length} active chats`);
        }
      },
      error: (error) => {
        console.error('Error loading chats count:', error);
        this.chatCount.set(0);
      }
    });
  }

  setSection(section: 'dashboard' | 'my-bookings' | 'support' | 'profile', type: 'hotels' | 'food' | 'shopping' | 'services' | 'tours' | null): void {
    this.activeSection.set(section);
    if (type) {
      this.activeType.set(type);
    }
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
