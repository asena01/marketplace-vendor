import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
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
    CustomerProfileComponent,
    CustomerHotelBookingsComponent,
    CustomerFoodOrdersComponent,
    CustomerShoppingComponent,
    CustomerServicesBookingsComponent,
    CustomerToursBookingsComponent,
    CustomerChatSupportComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-8">
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
              <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <mat-icon class="text-2xl font-bold">dashboard</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-3xl font-bold">My Dashboard</h1>
                  <span class="px-3 py-1 bg-blue-500 text-xs font-semibold rounded-full">Customer</span>
                </div>
                <p class="text-blue-100 text-sm mt-1">Manage all your bookings, orders and services</p>
              </div>
            </div>

            <!-- Right Section -->
            <div class="flex items-center gap-2">
              <button
                (click)="goHome()"
                class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                title="Go to home page"
              >
                <mat-icon class="text-lg">home</mat-icon>
                <span class="hidden sm:inline">Home</span>
              </button>
              <button
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <mat-icon class="text-lg">logout</mat-icon>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <div class="bg-white border-b border-gray-200 overflow-x-auto sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4">
          <nav class="flex gap-2 md:gap-6 min-w-max md:min-w-full overflow-x-auto" role="tablist">
            <button
              (click)="setActiveTab('hotels')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'hotels'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'hotels'"
            >
              <mat-icon class="text-lg">hotel</mat-icon>
              <span>Hotels</span>
              @if (hotelCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ hotelCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('food')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'food'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'food'"
            >
              <mat-icon class="text-lg">restaurant</mat-icon>
              <span>Food</span>
              @if (foodCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ foodCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('shopping')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'shopping'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'shopping'"
            >
              <mat-icon class="text-lg">shopping_bag</mat-icon>
              <span>Shopping</span>
              @if (shoppingCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ shoppingCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('services')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'services'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'services'"
            >
              <mat-icon class="text-lg">miscellaneous_services</mat-icon>
              <span>Services</span>
              @if (servicesCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ servicesCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('tours')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'tours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'tours'"
            >
              <mat-icon class="text-lg">flight</mat-icon>
              <span>Tours</span>
              @if (toursCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ toursCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('chat')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'chat'"
            >
              <mat-icon class="text-lg">chat</mat-icon>
              <span>Support</span>
              @if (chatCount() > 0) {
                <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
                  {{ chatCount() }}
                </span>
              }
            </button>

            <button
              (click)="setActiveTab('profile')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'profile'"
            >
              <mat-icon class="text-lg">settings</mat-icon>
              <span>Profile</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content -->
      <main class="max-w-7xl mx-auto px-4 py-8">
        @if (activeTab() === 'hotels') {
          <app-customer-hotel-bookings></app-customer-hotel-bookings>
        } @else if (activeTab() === 'food') {
          <app-customer-food-orders></app-customer-food-orders>
        } @else if (activeTab() === 'shopping') {
          <app-customer-shopping></app-customer-shopping>
        } @else if (activeTab() === 'services') {
          <app-customer-services-bookings></app-customer-services-bookings>
        } @else if (activeTab() === 'tours') {
          <app-customer-tours-bookings></app-customer-tours-bookings>
        } @else if (activeTab() === 'chat') {
          <app-customer-chat-support></app-customer-chat-support>
        } @else if (activeTab() === 'profile') {
          <app-customer-profile></app-customer-profile>
        }
      </main>
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
  activeTab = signal<'hotels' | 'food' | 'shopping' | 'services' | 'tours' | 'chat' | 'profile'>('hotels');

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
      this.setActiveTab(tab);
      console.log('📌 Switching to tab:', tab);
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

  setActiveTab(tab: 'hotels' | 'food' | 'shopping' | 'services' | 'tours' | 'chat' | 'profile'): void {
    this.activeTab.set(tab);
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
