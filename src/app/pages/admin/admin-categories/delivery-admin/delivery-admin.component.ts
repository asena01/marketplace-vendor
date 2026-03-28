import { Component, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDeliveryComponent } from '../../admin-delivery/admin-delivery.component';
import { AdminPaymentsComponent } from '../../admin-payments/admin-payments.component';

@Component({
  selector: 'app-delivery-admin',
  standalone: true,
  imports: [CommonModule, AdminDeliveryComponent, AdminPaymentsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <span class="material-icons text-4xl text-red-700">local_shipping</span>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Delivery Management</h2>
          <p class="text-gray-600">Manage delivery partners, drivers, orders, and payments</p>
        </div>
      </div>

      <div class="flex gap-2 border-b border-gray-200 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="setCurrentTab(tab.id)"
            [class]="'px-6 py-3 font-medium transition whitespace-nowrap ' +
              (currentTab() === tab.id
                ? 'border-b-2 border-red-700 text-red-700'
                : 'text-gray-600 hover:text-gray-800')"
          >
            <span class="material-icons inline mr-2 text-lg align-text-bottom">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </div>

      <div class="mt-6">
        @if (currentTab() === 'partners') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Delivery Partners</h3>
            <div class="p-4 bg-red-50 border border-red-200 rounded">
              <p class="text-gray-700">Delivery partner businesses management</p>
              <p class="text-sm text-gray-600 mt-2">Manage delivery service companies (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'drivers') {
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Delivery Drivers</h3>
            <div class="p-4 bg-red-50 border border-red-200 rounded">
              <p class="text-gray-700">Delivery drivers management component</p>
              <p class="text-sm text-gray-600 mt-2">Manage individual drivers and their performance (to be implemented)</p>
            </div>
          </div>
        } @else if (currentTab() === 'orders') {
          <app-admin-delivery></app-admin-delivery>
        } @else if (currentTab() === 'payments') {
          <app-admin-payments></app-admin-payments>
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
export class DeliveryAdminComponent implements OnChanges {
  @Input() currentTabInput: string = 'partners';
  currentTab = signal<string>('partners');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTabInput']) {
      this.currentTab.set(this.currentTabInput);
    }
  }

  tabs = [
    { id: 'partners', label: 'Partners', icon: 'business' },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin_circle' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
    { id: 'payments', label: 'Payments', icon: 'payment' }
  ];

  setCurrentTab(tabId: string): void {
    this.currentTab.set(tabId);
  }
}
