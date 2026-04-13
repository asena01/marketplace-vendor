import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <aside class="w-72 bg-slate-950 text-white flex flex-col">
        <div class="border-b border-slate-800 p-6">
          <p class="text-xs uppercase tracking-[0.22em] text-sky-400">Staff Workspace</p>
          <h1 class="mt-3 text-xl font-bold">{{ currentUser()?.name }}</h1>
          <p class="mt-1 text-sm text-slate-400">{{ currentUser()?.hotelName || 'Hotel Team' }}</p>
          <p class="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-sky-300">
            {{ formatLabel(currentUser()?.accessRole || 'staff') }}
          </p>
        </div>

        <nav class="flex-1 p-4 space-y-2">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-sky-600 text-white"
              class="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border-t border-slate-800 p-4">
          <button (click)="logout()" class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class StaffDashboardComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/staff-login');
  }

  currentUser() {
    return this.authService.currentUser();
  }

  navItems() {
    const user = this.currentUser();
    const items = [];
    const hiddenModulesByPosition: Record<string, string[]> = {
      chef: ['overview', 'services'],
      waiter: ['food-menu']
    };
    const moduleRouteMap: Record<string, { label: string; route: string }> = {
      bookings: { label: 'Bookings', route: '/staff-dashboard/bookings' },
      rooms: { label: 'Rooms', route: '/staff-dashboard/rooms' },
      guests: { label: 'Guests', route: '/staff-dashboard/guests' },
      chat: { label: 'Guest Chat', route: '/staff-dashboard/chat' },
      'food-orders': { label: 'Food Orders', route: '/staff-dashboard/food-orders' },
      'food-menu': { label: 'Food Menu', route: '/staff-dashboard/food-menu' },
      services: { label: 'Services', route: '/staff-dashboard/services' }
    };
    const position = (user as any)?.position || '';
    const hiddenModules = new Set(hiddenModulesByPosition[position] || []);
    const isHousekeepingStaff = this.isHousekeepingStaff(user);

    if (isHousekeepingStaff) {
      items.push({ label: 'My Schedule', route: '/staff-dashboard/my-schedule' });
      items.push({ label: 'My Tasks', route: '/staff-dashboard/my-tasks' });
      items.push({ label: 'Timesheet', route: '/staff-dashboard/timesheet' });
      items.push({ label: 'Profile', route: '/staff-dashboard/profile' });
      return items;
    }

    for (const module of user?.allowedModules || []) {
      if (hiddenModules.has(module)) {
        continue;
      }
      const mapped = moduleRouteMap[module];
      if (mapped) {
        items.push(mapped);
      }
    }

    if ((user?.accessRole === 'front-desk' || user?.accessRole === 'admin' || position === 'receptionist') && !items.some((item) => item.route === '/staff-dashboard/chat')) {
      items.push({ label: 'Guest Chat', route: '/staff-dashboard/chat' });
    }

    items.push({ label: 'My Schedule', route: '/staff-dashboard/my-schedule' });

    if (['housekeeping', 'maintenance', 'admin', 'operations'].includes(user?.accessRole || '') || user?.permissions?.canHandleMaintenance || user?.permissions?.canManageRooms) {
      items.push({ label: 'My Tasks', route: '/staff-dashboard/my-tasks' });
    }

    items.push({ label: 'Timesheet', route: '/staff-dashboard/timesheet' });

    if (user?.permissions?.canManageBookings || user?.permissions?.canManageOrders || user?.permissions?.canHandleMaintenance) {
      items.push({ label: 'Access Overview', route: '/staff-dashboard/access' });
    }

    items.push({ label: 'Profile', route: '/staff-dashboard/profile' });

    return items;
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private isHousekeepingStaff(user: any): boolean {
    const position = String(user?.position || user?.staffPosition || '').toLowerCase();
    const department = String(user?.department || '').toLowerCase();
    const accessRole = String(user?.accessRole || '').toLowerCase();

    return accessRole === 'housekeeping' ||
      position === 'housekeeping' ||
      position === 'housekeeper' ||
      department === 'housekeeping';
  }
}
