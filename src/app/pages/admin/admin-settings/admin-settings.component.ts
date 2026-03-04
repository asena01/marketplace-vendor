import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">System Settings</h2>
        <p class="text-gray-600">Configure platform-wide settings and policies</p>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading settings...</p>
        </div>
      } @else if (settings()) {
        <!-- Commission Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">Commission Rates (%)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
              <input
                type="number"
                [(ngModel)]="settings().commissions.hotel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Restaurant</label>
              <input
                type="number"
                [(ngModel)]="settings().commissions.restaurant"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Retail</label>
              <input
                type="number"
                [(ngModel)]="settings().commissions.retail"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <input
                type="number"
                [(ngModel)]="settings().commissions.service"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tours</label>
              <input
                type="number"
                [(ngModel)]="settings().commissions['tour-operator']"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">System Configuration</h3>
          <div class="space-y-4">
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().systemSettings.maintenanceMode"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">Maintenance Mode</span>
              </label>
              <p class="text-sm text-gray-500 ml-7 mt-1">Disable platform access for maintenance</p>
            </div>

            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().systemSettings.allowUserRegistration"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">Allow Customer Registration</span>
              </label>
            </div>

            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().systemSettings.allowVendorRegistration"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">Allow Vendor Registration</span>
              </label>
            </div>

            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().systemSettings.requireEmailVerification"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">Require Email Verification</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Feature Flags -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">Feature Flags</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().features.enableHotelDashboard"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">🏨 Hotel Dashboard</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().features.enableRestaurantDashboard"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">🍽️ Restaurant Dashboard</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().features.enableRetailDashboard"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">🛍️ Retail Dashboard</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().features.enableServiceDashboard"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">💇 Service Dashboard</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().features.enableToursDashboard"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">✈️ Tours Dashboard</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">Notifications</h3>
          <div class="space-y-3">
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.emailNotifications"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">📧 Email Notifications</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.smsNotifications"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">📱 SMS Notifications</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.pushNotifications"
                  class="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700 font-medium">🔔 Push Notifications</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-4">
          <button
            (click)="loadSettings()"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
          >
            Cancel
          </button>
          <button
            (click)="saveSettings()"
            [disabled]="isSaving()"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {{ isSaving() ? '💾 Saving...' : '💾 Save Settings' }}
          </button>
        </div>

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
            <p class="font-semibold">✅ {{ successMessage() }}</p>
          </div>
        }
      }

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminSettingsComponent implements OnInit {
  settings = signal<any>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  error = signal('');
  successMessage = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.adminService.getSettings().subscribe({
      next: (response) => {
        if (response.success) {
          this.settings.set(response.data);
          console.log('✅ Settings loaded');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading settings:', error);
        this.error.set(error.error?.message || 'Failed to load settings');
        this.isLoading.set(false);
      }
    });
  }

  saveSettings(): void {
    if (!this.settings()) return;

    this.isSaving.set(true);
    this.error.set('');

    this.adminService.updateSettings(this.settings()).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Settings updated successfully!');
          console.log('✅ Settings saved');
          setTimeout(() => this.successMessage.set(''), 5000);
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('❌ Error saving settings:', error);
        this.error.set(error.error?.message || 'Failed to save settings');
        this.isSaving.set(false);
      }
    });
  }
}
