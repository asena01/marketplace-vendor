import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              (click)="goBack()"
              class="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
              title="Back to home"
            >
              ← Back
            </button>
            <div class="text-4xl">👤</div>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">My Dashboard</h1>
              <p class="text-gray-600 text-sm">Hotels, Food, Shopping, Services, Tours, Delivery & Support</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              (click)="goHome()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              title="Go to home page"
            >
              🏠 Home
            </button>
            <button
              (click)="logout()"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <div class="bg-white border-b border-gray-200 overflow-x-auto">
        <div class="max-w-7xl mx-auto px-4">
          <nav class="flex gap-4 md:gap-8 min-w-max md:min-w-full" role="tablist">
            <button
              (click)="setActiveTab('hotels')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'hotels'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'hotels'"
            >
              🏨 Hotels
            </button>

            <button
              (click)="setActiveTab('food')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'food'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'food'"
            >
              🍕 Food
            </button>

            <button
              (click)="setActiveTab('shopping')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'shopping'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'shopping'"
            >
              🛍️ Shopping
            </button>

            <button
              (click)="setActiveTab('services')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'services'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'services'"
            >
              💇 Services
            </button>

            <button
              (click)="setActiveTab('tours')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'tours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'tours'"
            >
              ✈️ Tours
            </button>

            <button
              (click)="setActiveTab('delivery')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'delivery'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'delivery'"
            >
              🚚 Delivery
            </button>

            <button
              (click)="setActiveTab('chat')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'chat'"
            >
              💬 Support
            </button>

            <button
              (click)="setActiveTab('profile')"
              [class]="'py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab() === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'profile'"
            >
              ⚙️ Profile
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
  styles: []
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
      console.log('❌ User is not a customer - redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('✅ Customer dashboard loaded for:', this.authService.getCurrentUser()?.name);
  }

  setActiveTab(tab: 'hotels' | 'food' | 'shopping' | 'services' | 'tours' | 'delivery' | 'chat' | 'profile'): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
