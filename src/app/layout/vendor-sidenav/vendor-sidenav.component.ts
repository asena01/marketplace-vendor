import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { FoodService } from '../../services/food.service';
import { HotelService } from '../../services/hotel.service';
import { ProductService } from '../../services/product.service';
import { ServiceProviderService } from '../../services/service-provider.service';

interface SidenavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-vendor-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="w-64 bg-slate-900 text-white h-screen overflow-y-auto flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-slate-700">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <mat-icon class="text-white text-lg">{{ getVendorIconName() }}</mat-icon>
          </div>
          <div>
            <h2 class="font-bold text-lg">MarketHub</h2>
            <p class="text-xs text-slate-400">{{ vendorType | titlecase }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 p-4">
        <div class="space-y-2">
          @for (item of sidenavItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 relative group text-slate-300 hover:text-white"
            >
              <!-- Material Icon -->
              <mat-icon class="text-lg">{{ getIconNameForLabel(item.label) }}</mat-icon>
              <span class="flex-1 font-medium">{{ item.label }}</span>
              @if (item.badge && item.badge > 0) {
                <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {{ item.badge }}
                </span>
              }
            </a>
          }
        </div>
      </nav>

      <!-- User Info & Logout -->
      <div class="p-4 border-t border-slate-700">
        <div class="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-800 rounded-lg">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-sm">{{ getCurrentUserInitial() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ getCurrentUserName() }}</p>
            <p class="text-xs text-slate-400 truncate">{{ vendorType | titlecase }}</p>
          </div>
        </div>
        
        <button
          (click)="onLogout()"
          class="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-900/50 rounded-lg transition-all duration-200 text-sm font-medium"
        >
          <mat-icon class="text-lg">logout</mat-icon>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    a.active-link {
      @apply bg-blue-600 text-white shadow-lg;
    }

    a.active-link::before {
      content: '';
      @apply absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-lg;
    }

    mat-icon {
      @apply text-slate-300;
    }

    a.active-link mat-icon {
      @apply text-white;
    }

    a:hover mat-icon {
      @apply text-white;
    }
  `]
})
export class VendorSidenavComponent implements OnInit {
  @Input() vendorType: string = 'hotel';
  @Input() sidenavItems: SidenavItem[] = [];
  @Output() logout = new EventEmitter<void>();

  vendorTypeIcon: string = '🏨';
  ordersBadge = signal(0);
  roomsBadge = signal(0);
  productsBadge = signal(0);

  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService,
    private router: Router,
    private foodService: FoodService,
    private hotelService: HotelService,
    private productService: ProductService,
    private serviceProviderService: ServiceProviderService
  ) {
    this.setVendorIcon();
  }

  ngOnInit() {
    if (!this.sidenavItems || this.sidenavItems.length === 0) {
      this.sidenavItems = this.getDefaultItems();
    }
    this.loadBadgeData();
  }

  loadBadgeData(): void {
    if (this.vendorType === 'restaurant') {
      // Load pending orders count
      this.foodService.getRestaurantOrders(localStorage.getItem('restaurantId') || '').subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const pendingCount = response.data.filter((order: any) => order.status === 'pending').length;
            this.ordersBadge.set(pendingCount);
            // Update badge in sidenavItems
            const ordersItem = this.sidenavItems.find(item => item.label === 'Orders');
            if (ordersItem) ordersItem.badge = pendingCount;
          }
        },
        error: (error) => console.log('Error loading orders:', error)
      });
    } else if (this.vendorType === 'hotel') {
      // Load available rooms count
      this.hotelService.getRooms(1, 100).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const availableRooms = response.data.filter((room: any) => room.status === 'available').length;
            this.roomsBadge.set(availableRooms);
            const roomsItem = this.sidenavItems.find(item => item.label === 'Rooms');
            if (roomsItem) roomsItem.badge = availableRooms;
          }
        },
        error: (error) => console.log('Error loading rooms:', error)
      });
    } else if (this.vendorType === 'retail' || this.vendorType === 'pet-store' || this.vendorType === 'furniture') {
      // Load low stock products count for this vendor
      const storeId = localStorage.getItem('storeId') || '';
      if (storeId) {
        this.productService.getVendorProducts(storeId, 1, 100).subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              const lowStockCount = response.data.filter((product: any) => product.stock < 10).length;
              this.productsBadge.set(lowStockCount);
              const productsItem = this.sidenavItems.find(item => item.label === 'Products');
              if (productsItem) productsItem.badge = lowStockCount;
            }
          },
          error: (error) => console.log('Error loading products:', error)
        });
      }
    } else if (this.vendorType === 'gym') {
      // Load low stock equipment count for gym
      const storeId = localStorage.getItem('storeId') || '';
      if (storeId) {
        this.productService.getVendorProducts(storeId, 1, 100).subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              const lowStockCount = response.data.filter((product: any) => product.stock < 5).length;
              this.productsBadge.set(lowStockCount);
              const equipmentItem = this.sidenavItems.find(item => item.label === 'Equipment');
              if (equipmentItem) equipmentItem.badge = lowStockCount;
            }
          },
          error: (error) => console.log('Error loading equipment:', error)
        });
      }
    } else if (this.vendorType === 'service') {
      // Load actual badge counts for service provider from API
      const providerId = localStorage.getItem('userId') || '';
      this.serviceProviderService.getBadgeCounts(providerId).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            // Update Appointments badge
            const appointmentsItem = this.sidenavItems.find(item => item.label === 'Appointments');
            if (appointmentsItem) {
              appointmentsItem.badge = response.data.pendingAppointments || 0;
            }

            // Update Reviews badge
            const reviewsItem = this.sidenavItems.find(item => item.label === 'Reviews');
            if (reviewsItem) {
              reviewsItem.badge = response.data.pendingReviews || 0;
            }

            // Update Incidents badge
            const incidentsItem = this.sidenavItems.find(item => item.label === 'Incidents');
            if (incidentsItem) {
              incidentsItem.badge = response.data.activeIncidents || 0;
            }

            // Update Notifications badge
            const notificationsItem = this.sidenavItems.find(item => item.label === 'Notifications');
            if (notificationsItem) {
              notificationsItem.badge = response.data.unreadNotifications || 0;
            }
          }
        },
        error: (error) => console.log('Error loading badge counts:', error)
      });
    }
  }

  ngOnChanges() {
    this.setVendorIcon();
  }

  setVendorIcon(): void {
    const icons: { [key: string]: string } = {
      'hotel': '🏨',
      'restaurant': '🍽️',
      'retail': '🛍️',
      'furniture': '🪑',
      'pet-store': '🐾',
      'gym': '🏋️',
      'service': '💇',
      'tours': '✈️',
      'delivery': '🚚'
    };
    this.vendorTypeIcon = icons[this.vendorType] || '🏢';
  }

  getVendorIconName(): string {
    const iconMap: { [key: string]: string } = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'retail': 'shopping_cart',
      'furniture': 'chair',
      'pet-store': 'pets',
      'gym': 'fitness_center',
      'service': 'miscellaneous_services',
      'tours': 'flight',
      'delivery': 'local_shipping'
    };
    return iconMap[this.vendorType] || 'business';
  }

  getIconNameForLabel(label: string): string {
    const iconMap: { [key: string]: string } = {
      'Dashboard': 'dashboard',
      'Orders': 'assignment',
      'Menu': 'menu_book',
      'Calendar': 'calendar_month',
      'Pricing': 'sell',
      'Rooms': 'hotel',
      'Staff': 'people',
      'Products': 'inventory_2',
      'Bookings': 'event_note',
      'Inventory': 'warehouse',
      'Customers': 'people_outline',
      'Payments': 'payments',
      'Returns': 'undo',
      'Reports': 'assessment',
      'Settings': 'settings',
      'Reviews': 'star',
      'Incidents': 'warning',
      'Devices': 'devices',
      'Guests': 'group',
      'Delivery Orders': 'local_shipping',
      'Drivers': 'person_outline',
      'Driver Tracking': 'my_location',
      'Delivery Analytics': 'analytics',
      'Support Tickets': 'support_agent',
      'Delivery Integrations': 'link',
      'Delivery Tracking': 'location_on',
      'Notifications': 'notifications',
      'Shipping': 'local_shipping',
      'Finance': 'account_balance',
      'Equipment': 'fitness_center',
      'Classes': 'school',
      'Members': 'group',
      'Memberships': 'card_membership',
      'Trainers': 'sports_martial_arts',
      'Appointments': 'event_note',
      'Services': 'miscellaneous_services',
      'Clients': 'contacts',
      'Tours': 'tour',
      'Guides': 'person',
      'Itineraries': 'route'
    };
    return iconMap[label] || 'circle';
  }

  getDefaultItems(): SidenavItem[] {
    const dashboardPath = this.vendorType === 'restaurant' ? '/restaurant-dashboard' :
                          this.vendorType === 'hotel' ? '/hotel-dashboard' :
                          this.vendorType === 'retail' ? '/retail-dashboard' :
                          this.vendorType === 'furniture' ? '/retail-dashboard' :
                          this.vendorType === 'pet-store' ? '/retail-dashboard' :
                          this.vendorType === 'gym' ? '/retail-dashboard' :
                          this.vendorType === 'service' ? '/service-dashboard' : '/dashboard';

    const items: SidenavItem[] = [{ label: 'Dashboard', icon: '📊', route: dashboardPath }];

    // Add vendor-specific items
    if (this.vendorType === 'restaurant') {
      items.push(
        { label: 'Orders', icon: '📋', route: `${dashboardPath}/orders`, badge: 0 },
        { label: 'Menu', icon: '📖', route: `${dashboardPath}/menu`, badge: 0 },
        { label: 'Delivery Orders', icon: '🚚', route: `${dashboardPath}/delivery-orders`, badge: 0 },
        { label: 'Drivers', icon: '👨‍💼', route: `${dashboardPath}/drivers` },
        { label: 'Driver Tracking', icon: '📍', route: `${dashboardPath}/driver-tracking` },
        { label: 'Delivery Analytics', icon: '📊', route: `${dashboardPath}/delivery-analytics` },
        { label: 'Support Tickets', icon: '💬', route: `${dashboardPath}/delivery-support`, badge: 0 },
        { label: 'Delivery Integrations', icon: '🔗', route: `${dashboardPath}/delivery-integrations` },
        { label: 'Delivery Tracking', icon: '📍', route: `${dashboardPath}/delivery-tracking` },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Incidents', icon: '⚠️', route: `${dashboardPath}/incidents` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'hotel') {
      items.push(
        { label: 'Calendar', icon: '📅', route: `${dashboardPath}/calendar` },
        { label: 'Pricing', icon: '💰', route: `${dashboardPath}/pricing` },
        { label: 'Rooms', icon: '🏨', route: `${dashboardPath}/rooms`, badge: 0 },
        { label: 'Devices', icon: '📱', route: `${dashboardPath}/devices` },
        { label: 'Staff', icon: '👥', route: `${dashboardPath}/staff` },
        { label: 'Bookings', icon: '📅', route: `${dashboardPath}/bookings` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications`, badge: 0 },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'retail') {
      items.push(
        { label: 'Products', icon: '📦', route: `${dashboardPath}/products`, badge: 0 },
        { label: 'Inventory', icon: '📊', route: `${dashboardPath}/inventory` },
        { label: 'Orders', icon: '📋', route: `${dashboardPath}/orders`, badge: 0 },
        { label: 'Payments', icon: '💳', route: `${dashboardPath}/payments` },
        { label: 'Returns', icon: '↩️', route: `${dashboardPath}/returns` },
        { label: 'Customers', icon: '👥', route: `${dashboardPath}/customers` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications`, badge: 0 },
        { label: 'Shipping', icon: '🚚', route: `${dashboardPath}/shipping` },
        { label: 'Delivery Integrations', icon: '🔗', route: `${dashboardPath}/delivery-integrations` },
        { label: 'Delivery Tracking', icon: '📍', route: `${dashboardPath}/delivery-tracking` },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'pet-store') {
      items.push(
        { label: 'Products', icon: '📦', route: `${dashboardPath}/products`, badge: 0 },
        { label: 'Inventory', icon: '📊', route: `${dashboardPath}/inventory` },
        { label: 'Orders', icon: '📋', route: `${dashboardPath}/orders`, badge: 0 },
        { label: 'Customers', icon: '👥', route: `${dashboardPath}/customers` },
        { label: 'Payments', icon: '💳', route: `${dashboardPath}/payments` },
        { label: 'Shipping', icon: '🚚', route: `${dashboardPath}/shipping` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications`, badge: 0 },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'gym') {
      items.push(
        { label: 'Equipment', icon: '💪', route: `${dashboardPath}/equipment`, badge: 0 },
        { label: 'Classes', icon: '📚', route: `${dashboardPath}/classes` },
        { label: 'Members', icon: '👥', route: `${dashboardPath}/members` },
        { label: 'Memberships', icon: '🎟️', route: `${dashboardPath}/memberships` },
        { label: 'Bookings', icon: '📅', route: `${dashboardPath}/bookings`, badge: 0 },
        { label: 'Trainers', icon: '👨‍🏫', route: `${dashboardPath}/trainers` },
        { label: 'Payments', icon: '💳', route: `${dashboardPath}/payments` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications`, badge: 0 },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'furniture') {
      items.push(
        { label: 'Products', icon: '📦', route: `${dashboardPath}/products`, badge: 0 },
        { label: 'Inventory', icon: '📊', route: `${dashboardPath}/inventory` },
        { label: 'Orders', icon: '📋', route: `${dashboardPath}/orders`, badge: 0 },
        { label: 'Payments', icon: '💳', route: `${dashboardPath}/payments` },
        { label: 'Returns', icon: '↩️', route: `${dashboardPath}/returns` },
        { label: 'Customers', icon: '👥', route: `${dashboardPath}/customers` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications`, badge: 0 },
        { label: 'Shipping', icon: '🚚', route: `${dashboardPath}/shipping` },
        { label: 'Delivery Integrations', icon: '🔗', route: `${dashboardPath}/delivery-integrations` },
        { label: 'Delivery Tracking', icon: '📍', route: `${dashboardPath}/delivery-tracking` },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'service') {
      items.push(
        { label: 'Appointments', icon: '📅', route: `${dashboardPath}/appointments` },
        { label: 'Services', icon: '🛠️', route: `${dashboardPath}/services` },
        { label: 'Staff', icon: '👥', route: `${dashboardPath}/staff` },
        { label: 'Clients', icon: '👤', route: `${dashboardPath}/clients` },
        { label: 'Reports', icon: '📊', route: `${dashboardPath}/reports` },
        { label: 'Notifications', icon: '🔔', route: `${dashboardPath}/notifications` },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Incidents', icon: '⚠️', route: `${dashboardPath}/incidents` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    } else if (this.vendorType === 'tours') {
      items.push(
        { label: 'Tours', icon: '🗺️', route: `${dashboardPath}/tours` },
        { label: 'Bookings', icon: '📅', route: `${dashboardPath}/bookings` },
        { label: 'Guides', icon: '👨‍✈️', route: `${dashboardPath}/guides` },
        { label: 'Itineraries', icon: '📋', route: `${dashboardPath}/itineraries` },
        { label: 'Reports', icon: '📈', route: `${dashboardPath}/reports` },
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Incidents', icon: '⚠️', route: `${dashboardPath}/incidents` },
        { label: 'Finance', icon: '💼', route: `${dashboardPath}/finance` }
      );
    }

    items.push({ label: 'Settings', icon: '⚙️', route: `${dashboardPath}/settings` });

    return items;
  }

  getCurrentUserName(): string {
    return this.authService.getCurrentUser()?.name || 'Guest User';
  }

  getCurrentUserInitial(): string {
    const name = this.authService.getCurrentUser()?.name || 'G';
    return name.charAt(0).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
    this.authModalService.closeModal(); // Close any open modals before logout
    this.logout.emit();
    this.router.navigate(['/']);
  }
}
