import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Devices Management</h2>
        <p class="text-gray-600">Monitor and manage IoT devices for hotels</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Total Devices</p>
          <p class="text-3xl font-bold text-gray-800">{{ devices().length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Active</p>
          <p class="text-3xl font-bold text-green-600">{{ getActiveCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p class="text-gray-600 text-sm font-medium">Inactive</p>
          <p class="text-3xl font-bold text-red-600">{{ devices().length - getActiveCount() }}</p>
        </div>
      </div>

      <!-- Add Device Button -->
      <div class="flex justify-end">
        <button
          (click)="toggleAddForm()"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
        >
          ➕ Add Device
        </button>
      </div>

      <!-- Add Device Form Modal -->
      @if (showAddForm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Add New Device</h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Device ID *</label>
                <input
                  [(ngModel)]="newDevice.deviceId"
                  type="text"
                  placeholder="e.g., MS-001"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Device Type *</label>
                <select [(ngModel)]="newDevice.deviceType" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select Device Type</option>
                  <option value="motion_sensor">🚨 Motion Sensor</option>
                  <option value="smart_lock">🔐 Smart Lock</option>
                  <option value="thermostat">🌡️ Thermostat</option>
                  <option value="camera">📹 Camera</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Hotel/Location</label>
                <input
                  [(ngModel)]="newDevice.hotel"
                  type="text"
                  placeholder="e.g., Grand Plaza Hotel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Room Number</label>
                <input
                  [(ngModel)]="newDevice.roomNumber"
                  type="number"
                  placeholder="e.g., 101"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Last Detection</label>
                <input
                  [(ngModel)]="newDevice.lastDetection"
                  type="text"
                  placeholder="e.g., Just now"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Status</label>
                <select [(ngModel)]="newDevice.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                (click)="saveDevice()"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Save Device
              </button>
              <button
                (click)="toggleAddForm()"
                class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Devices Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (devices().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Device ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room/Location</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Detection</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (device of devices(); track device._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ device.deviceId }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {{ getDeviceTypeLabel(device.deviceType) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ device.roomNumber || device.hotel || 'General' }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    @if (device.status) {
                      <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        ✅ Active
                      </span>
                    } @else {
                      <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        ❌ Inactive
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ device.lastDetection || 'Never' }}</td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    <button
                      (click)="toggleDeviceStatus(device._id, device.status)"
                      [class]="device.status
                        ? 'text-red-600 hover:text-red-800 font-semibold'
                        : 'text-green-600 hover:text-green-800 font-semibold'"
                    >
                      {{ device.status ? '🔴 Disable' : '🟢 Enable' }}
                    </button>
                    <button
                      (click)="deleteDevice(device._id, device.deviceId)"
                      class="text-orange-600 hover:text-orange-800 font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading devices...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">📱 No devices found</p>
          </div>
        }

        <!-- Pagination Controls -->
        @if (totalPages() > 1 && devices().length > 0) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="text-sm text-gray-600">
              Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total devices)
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div class="flex gap-1">
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.bg-gray-300]="page !== currentPage()"
                    [class.text-gray-900]="page !== currentPage()"
                    class="px-3 py-2 rounded hover:opacity-80 transition font-semibold text-sm"
                  >
                    {{ page }}
                  </button>
                }
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        }
      </div>

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
export class AdminDevicesComponent implements OnInit {
  devices = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  showAddForm = signal(false);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  newDevice = {
    deviceId: '',
    deviceType: '',
    hotel: '',
    roomNumber: undefined,
    lastDetection: '',
    status: true
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.adminService.getDevices(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.devices.set(response.data || []);

          // Update pagination info from response
          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          }

          console.log('✅ Devices loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading devices:', error);
        this.error.set(error.error?.message || 'Failed to load devices');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDevices();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);

    return pages.sort((a, b) => a - b);
  }

  getActiveCount(): number {
    return this.devices().filter(d => d.status).length;
  }

  getDeviceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      motion_sensor: '🚨 Motion',
      smart_lock: '🔐 Lock',
      thermostat: '🌡️ Thermostat',
      camera: '📹 Camera'
    };
    return labels[type] || type;
  }

  toggleDeviceStatus(deviceId: string, currentStatus: boolean): void {
    const newStatus = !currentStatus;
    this.adminService.updateDeviceStatus(deviceId, newStatus ? 'active' : 'inactive').subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Device status updated');
          this.loadDevices();
        }
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Failed to update device');
      }
    });
  }

  deleteDevice(deviceId: string, deviceName: string): void {
    if (!confirm(`Are you sure you want to delete device "${deviceName}"?`)) {
      return;
    }

    this.adminService.deleteDevice(deviceId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Device deleted');
          // If only one device on page and it's the last page, go back one page
          if (this.devices().length === 1 && this.currentPage() > 1) {
            this.previousPage();
          } else {
            this.loadDevices();
          }
        }
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Failed to delete device');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(val => !val);
    if (!this.showAddForm()) {
      this.resetForm();
    }
  }

  saveDevice(): void {
    // Validation
    if (!this.newDevice.deviceId.trim()) {
      this.error.set('Device ID is required');
      return;
    }
    if (!this.newDevice.deviceType) {
      this.error.set('Device Type is required');
      return;
    }

    this.error.set('');

    this.adminService.createDevice({
      deviceId: this.newDevice.deviceId,
      deviceType: this.newDevice.deviceType,
      hotel: this.newDevice.hotel,
      roomNumber: this.newDevice.roomNumber,
      lastDetection: this.newDevice.lastDetection,
      status: this.newDevice.status
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('✅ Device created successfully');
          this.toggleAddForm();
          this.loadDevices();
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Failed to create device');
      }
    });
  }

  resetForm(): void {
    this.newDevice = {
      deviceId: '',
      deviceType: '',
      hotel: '',
      roomNumber: undefined,
      lastDetection: '',
      status: true
    };
  }
}
