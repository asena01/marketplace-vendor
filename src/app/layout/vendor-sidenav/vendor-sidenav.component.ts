import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { FoodService } from '../../services/food.service';
import { HotelService } from '../../services/hotel.service';
import { ProductService } from '../../services/product.service';

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
    private router: Router,
    private foodService: FoodService,
    private hotelService: HotelService,
    private productService: ProductService
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
    } else if (this.vendorType === 'retail') {
      // Load low stock products count
      this.productService.getProducts(1, 100).subscribe({
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
  }

  ngOnChanges() {
    this.setVendorIcon();
  }

  setVendorIcon(): void {
    const icons: { [key: string]: string } = {
      'hotel': '🏨',
      'restaurant': '🍽️',
      'retail': '🛍️',
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
      'Rooms': 'hotel',
      'Staff': 'people',
      'Products': 'inventory_2',
      'Bookings': 'event_note',
      'Inventory': 'warehouse',
      'Customers': 'people_outline',
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
      'Delivery Integrations': 'link'
    };
    return iconMap[label] || 'circle';
  }

  getDefaultItems(): SidenavItem[] {
    const dashboardPath = this.vendorType === 'restaurant' ? '/restaurant-dashboard' :
                          this.vendorType === 'hotel' ? '/hotel-dashboard' :
                          this.vendorType === 'retail' ? '/retail-dashboard' : '/dashboard';

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
        { label: 'Reviews', icon: '⭐', route: `${dashboardPath}/reviews` },
        { label: 'Incidents', icon: '⚠️', route: `${dashboardPath}/incidents` }
      );
    } else if (this.vendorType === 'hotel') {
      items.push(
        { label: 'Rooms', icon: '🏨', route: `${dashboardPath}/rooms`, badge: 0 },
        { label: 'Staff', icon: '👥', route: `${dashboardPath}/staff` },
        { label: 'Bookings', icon: '📅', route: `${dashboardPath}/bookings` }
      );
    } else if (this.vendorType === 'retail') {
      items.push(
        { label: 'Products', icon: '📦', route: `${dashboardPath}/products`, badge: 0 },
        { label: 'Inventory', icon: '📊', route: `${dashboardPath}/inventory` },
        { label: 'Customers', icon: '👥', route: `${dashboardPath}/customers` }
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
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}
