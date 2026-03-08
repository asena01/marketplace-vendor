import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

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
            <mat-icon class="text-white text-lg" [matIconFontSet]="'material-icons'">{{ getVendorIconName() }}</mat-icon>
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
export class VendorSidenavComponent {
  @Input() vendorType: string = 'hotel';
  @Input() sidenavItems: SidenavItem[] = [];
  @Output() logout = new EventEmitter<void>();

  vendorTypeIcon: string = '🏨';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.setVendorIcon();
  }

  ngOnInit() {
    if (!this.sidenavItems || this.sidenavItems.length === 0) {
      this.sidenavItems = this.getDefaultItems();
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
      'Guests': 'group'
    };
    return iconMap[label] || 'circle';
  }

  getDefaultItems(): SidenavItem[] {
    return [
      { label: 'Dashboard', icon: '📊', route: `/dashboard` },
      { label: 'Bookings', icon: '📅', route: `/bookings`, badge: 5 },
      { label: 'Inventory', icon: '📦', route: `/inventory` },
      { label: 'Customers', icon: '👥', route: `/customers` },
      { label: 'Reports', icon: '📈', route: `/reports` },
      { label: 'Settings', icon: '⚙️', route: `/settings` }
    ];
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
