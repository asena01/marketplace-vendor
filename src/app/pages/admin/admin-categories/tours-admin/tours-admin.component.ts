import { Component, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorDirectoryComponent } from '../../admin-vendors/vendor-directory.component';
import { AdminUsersComponent } from '../../admin-users/admin-users.component';
import { AdminPaymentsComponent } from '../../admin-payments/admin-payments.component';

@Component({
  selector: 'app-tours-admin',
  standalone: true,
  imports: [CommonModule, VendorDirectoryComponent, AdminUsersComponent, AdminPaymentsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <span class="material-icons text-4xl text-teal-600">flight_takeoff</span>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Tours & Travel Management</h2>
          <p class="text-gray-600">Manage tour operators, guides, bookings, and payments</p>
        </div>
      </div>

      <div class="flex gap-2 border-b border-gray-200 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="setCurrentTab(tab.id)"
            [class]="'px-6 py-3 font-medium transition whitespace-nowrap ' +
              (currentTab() === tab.id
                ? 'border-b-2 border-teal-600 text-teal-600'
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
        } @else if (currentTab() === 'tours') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Tours Catalog</h3>
            <div class="p-4 bg-teal-50 border border-teal-200 rounded">
              <p class="text-gray-700">Tours and itineraries management component</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Tours only (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'bookings') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Tour Bookings</h3>
            <div class="p-4 bg-orange-50 border border-orange-200 rounded">
              <p class="text-gray-700">Tour bookings management component</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Tours only (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'payments') {
          <app-admin-payments></app-admin-payments>
        } @else if (currentTab() === 'reviews') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Tour Reviews & Ratings</h3>
            <div class="p-4 bg-pink-50 border border-pink-200 rounded">
              <p class="text-gray-700">Tour reviews and ratings management</p>
              <p class="text-sm text-gray-600 mt-2">Filter: Tours only (to be implemented)</p>
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
export class ToursAdminComponent implements OnChanges {
  @Input() currentTabInput: string = 'vendors';
  currentTab = signal<string>('vendors');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTabInput']) {
      this.currentTab.set(this.currentTabInput);
    }
  }

  tabs = [
    { id: 'vendors', label: 'Operators', icon: 'business' },
    { id: 'users', label: 'Guides', icon: 'people' },
    { id: 'tours', label: 'Tours', icon: 'tour' },
    { id: 'bookings', label: 'Bookings', icon: 'event' },
    { id: 'payments', label: 'Payments', icon: 'payment' },
    { id: 'reviews', label: 'Reviews', icon: 'star_rate' }
  ];

  setCurrentTab(tabId: string): void {
    this.currentTab.set(tabId);
  }
}
