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
import { CustomerDeliveryOrdersComponent } from '../customer-delivery-orders/customer-delivery-orders.component';
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
    CustomerDeliveryOrdersComponent,
    CustomerChatSupportComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
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
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <mat-icon class="text-xl">person</mat-icon>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Customer Dashboard</h1>
                <p class="text-blue-100 text-sm">Welcome back! Manage all your bookings and orders</p>
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
            </button>

            <button
              (click)="setActiveTab('delivery')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ' +
                (activeTab() === 'delivery'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'delivery'"
            >
              <mat-icon class="text-lg">local_shipping</mat-icon>
              <span>Delivery</span>
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
        } @else if (activeTab() === 'delivery') {
          <app-customer-delivery-orders></app-customer-delivery-orders>
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
  activeTab = signal<'hotels' | 'food' | 'shopping' | 'services' | 'tours' | 'delivery' | 'chat' | 'profile'>('hotels');

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
  }

  setActiveTab(tab: 'hotels' | 'food' | 'shopping' | 'services' | 'tours' | 'delivery' | 'chat' | 'profile'): void {
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
