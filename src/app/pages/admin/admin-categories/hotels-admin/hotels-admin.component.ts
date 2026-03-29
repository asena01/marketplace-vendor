import { Component, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorDirectoryComponent } from '../../admin-vendors/vendor-directory.component';
import { AdminUsersComponent } from '../../admin-users/admin-users.component';
import { AdminDevicesComponent } from '../../admin-devices/admin-devices.component';
import { AdminPaymentsComponent } from '../../admin-payments/admin-payments.component';

/**
 * Hotels Admin Component
 * Manages all hotel-related operations including vendors, staff, devices, bookings, payments, and reviews
 */
@Component({
  selector: 'app-hotels-admin',
  standalone: true,
  imports: [
    CommonModule,
    VendorDirectoryComponent,
    AdminUsersComponent,
    AdminDevicesComponent,
    AdminPaymentsComponent
  ],
  template: `
    <div class="space-y-4">
      <!-- Category Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="material-icons text-3xl text-blue-600">hotel</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Hotels Management</h2>
          <p class="text-xs text-gray-600">Manage hotel vendors, staff, devices, bookings, and payments</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-1 border-b border-gray-200 overflow-x-auto pb-0">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="setCurrentTab(tab.id)"
            [class]="'px-3 py-2 text-sm font-medium transition whitespace-nowrap ' +
              (currentTab() === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800')"
          >
            <span class="material-icons inline text-base align-text-bottom" style="margin-right: 4px;">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab Content -->
      <div class="mt-6">
        @if (currentTab() === 'vendors') {
          <app-vendor-directory></app-vendor-directory>
        } @else if (currentTab() === 'users') {
          <app-admin-users></app-admin-users>
        } @else if (currentTab() === 'devices') {
          <app-admin-devices></app-admin-devices>
        } @else if (currentTab() === 'bookings') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Hotel Bookings</h3>
            <div class="p-4 bg-orange-50 border border-orange-200 rounded">
              <p class="text-gray-700">Hotel bookings management component</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Hotels only (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'payments') {
          <app-admin-payments></app-admin-payments>
        } @else if (currentTab() === 'reviews') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Hotel Reviews & Ratings</h3>
            <div class="p-4 bg-pink-50 border border-pink-200 rounded">
              <p class="text-gray-700">Hotel reviews and ratings management</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Hotels only (to be implemented)</p>
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
export class HotelsAdminComponent implements OnChanges {
  @Input() currentTabInput: string = 'vendors';
  currentTab = signal<string>('vendors');

  tabs = [
    { id: 'vendors', label: 'Vendors', icon: 'business' },
    { id: 'users', label: 'Staff', icon: 'people' },
    { id: 'devices', label: 'Smart Devices', icon: 'devices' },
    { id: 'bookings', label: 'Bookings', icon: 'event' },
    { id: 'payments', label: 'Payments', icon: 'payment' },
    { id: 'reviews', label: 'Reviews', icon: 'star_rate' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTabInput']) {
      this.currentTab.set(this.currentTabInput);
    }
  }

  setCurrentTab(tabId: string): void {
    this.currentTab.set(tabId);
  }
}
