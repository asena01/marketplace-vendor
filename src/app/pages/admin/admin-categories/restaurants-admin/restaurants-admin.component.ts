import { Component, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorDirectoryComponent } from '../../admin-vendors/vendor-directory.component';
import { AdminUsersComponent } from '../../admin-users/admin-users.component';
import { AdminDevicesComponent } from '../../admin-devices/admin-devices.component';
import { AdminPaymentsComponent } from '../../admin-payments/admin-payments.component';

@Component({
  selector: 'app-restaurants-admin',
  standalone: true,
  imports: [CommonModule, VendorDirectoryComponent, AdminUsersComponent, AdminDevicesComponent, AdminPaymentsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <span class="material-icons text-4xl text-orange-600">restaurant</span>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Restaurants Management</h2>
          <p class="text-gray-600">Manage restaurant vendors, staff, devices, orders, and payments</p>
        </div>
      </div>

      <div class="flex gap-2 border-b border-gray-200 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="setCurrentTab(tab.id)"
            [class]="'px-6 py-3 font-medium transition whitespace-nowrap ' +
              (currentTab() === tab.id
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-800')"
          >
            <span class="material-icons inline mr-2 text-lg align-text-bottom">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </div>

      <div class="mt-6">
        @if (currentTab() === 'vendors') {
          <app-vendor-directory></app-vendor-directory>
        } @else if (currentTab() === 'users') {
          <app-admin-users></app-admin-users>
        } @else if (currentTab() === 'devices') {
          <app-admin-devices></app-admin-devices>
        } @else if (currentTab() === 'orders') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Restaurant Orders</h3>
            <div class="p-4 bg-orange-50 border border-orange-200 rounded">
              <p class="text-gray-700">Restaurant orders management component</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Restaurants only (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'payments') {
          <app-admin-payments></app-admin-payments>
        } @else if (currentTab() === 'reviews') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Restaurant Reviews & Ratings</h3>
            <div class="p-4 bg-pink-50 border border-pink-200 rounded">
              <p class="text-gray-700">Restaurant reviews and ratings management</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Restaurants only (to be implemented)</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .material-icons {
        font-size: 24px;
        height: 24px;
        width: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `
  ]
})
export class RestaurantsAdminComponent implements OnChanges {
  @Input() currentTabInput: string = 'vendors';
  currentTab = signal<string>('vendors');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTabInput']) {
      this.currentTab.set(this.currentTabInput);
    }
  }

  tabs = [
    { id: 'vendors', label: 'Vendors', icon: 'business' },
    { id: 'users', label: 'Staff', icon: 'people' },
    { id: 'devices', label: 'POS Devices', icon: 'devices' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
    { id: 'payments', label: 'Payments', icon: 'payment' },
    { id: 'reviews', label: 'Reviews', icon: 'star_rate' }
  ];

  setCurrentTab(tabId: string): void {
    this.currentTab.set(tabId);
  }
}
