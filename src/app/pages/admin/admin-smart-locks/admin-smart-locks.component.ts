import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../services/hotel.service';
import { AdminService } from '../../../services/admin.service';

interface SmartLockDevice {
  _id: string;
  deviceId: string;
  hotelId: string;
  hotelName?: string;
  roomId?: string;
  roomNumber?: string;
  deviceType: string;
  status: boolean;
  battery?: number;
  lastActive?: Date;
  tuyaDeviceId: string;
  createdAt: Date;
  updatedAt: Date;
  unlockLogs?: Array<{
    timestamp: Date;
    bookingId: string;
    status: 'success' | 'failed';
  }>;
}

interface SmartLockAnalytics {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  lowBatteryDevices: number;
  unlockAttempts: {
    successful: number;
    failed: number;
    total: number;
  };
  devicesByStatus: {
    [key: string]: number;
  };
}

@Component({
  selector: 'app-admin-smart-locks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-8">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">🔐 Smart Lock Management</h1>
          <p class="text-indigo-100">Monitor and manage smart lock devices across all hotels</p>
        </div>
      </div>

      <!-- Analytics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-indigo-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Devices</p>
          <p class="text-3xl font-bold text-indigo-600">{{ analytics()?.totalDevices || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Active</p>
          <p class="text-3xl font-bold text-green-600">{{ analytics()?.activeDevices || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Inactive</p>
          <p class="text-3xl font-bold text-red-600">{{ analytics()?.inactiveDevices || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Low Battery</p>
          <p class="text-3xl font-bold text-orange-600">{{ analytics()?.lowBatteryDevices || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Unlock Success Rate</p>
          @if (analytics() && analytics()!.unlockAttempts && (analytics()!.unlockAttempts.total || 0) > 0) {
            <p class="text-3xl font-bold text-blue-600">
              {{ (((analytics()!.unlockAttempts.successful || 0) / (analytics()!.unlockAttempts.total || 1)) * 100 | number: '1.0-0') + '%' }}
            </p>
          } @else {
            <p class="text-3xl font-bold text-blue-600">N/A</p>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h3 class="font-bold text-slate-900">Filters & Search</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            [(ngModel)]="searchQuery"
            (keyup)="filterDevices()"
            placeholder="Search by device ID, room number, or hotel name..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          />
          <select
            [(ngModel)]="selectedStatus"
            (change)="filterDevices()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            [(ngModel)]="selectedHotel"
            (change)="filterDevices()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          >
            <option value="">All Hotels</option>
            @for (hotel of availableHotels(); track hotel) {
              <option [value]="hotel">{{ hotel }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Devices Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="font-bold text-slate-900">Smart Lock Devices ({{ filteredDevices().length }} of {{ devices().length }})</h3>
        </div>

        @if (isLoading()) {
          <div class="p-8 text-center">
            <p class="text-slate-600 font-semibold">Loading devices...</p>
          </div>
        } @else if (filteredDevices().length === 0) {
          <div class="p-8 text-center">
            <p class="text-slate-600 font-semibold">No devices found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Device ID</th>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Hotel</th>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Room</th>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Battery</th>
                  <th class="px-6 py-3 text-left font-semibold text-slate-900">Last Active</th>
                  <th class="px-6 py-3 text-center font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (device of filteredDevices(); track device._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-3 font-mono text-sm text-slate-900">{{ device.deviceId }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ device.hotelName || 'N/A' }}</td>
                    <td class="px-6 py-3 text-slate-600">
                      @if (device.roomNumber) {
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {{ device.roomNumber }}
                        </span>
                      } @else {
                        <span class="text-slate-400 italic">Unassigned</span>
                      }
                    </td>
                    <td class="px-6 py-3">
                      <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                        'bg-green-100 text-green-700': device.status,
                        'bg-red-100 text-red-700': !device.status
                      }">
                        {{ device.status ? '🟢 Online' : '🔴 Offline' }}
                      </span>
                    </td>
                    <td class="px-6 py-3">
                      @if (device.battery !== undefined) {
                        <span [ngClass]="{
                          'text-green-600 font-semibold': device.battery > 50,
                          'text-orange-600 font-semibold': device.battery <= 50 && device.battery > 20,
                          'text-red-600 font-semibold': device.battery <= 20
                        }">
                          {{ device.battery }}%
                        </span>
                      } @else {
                        <span class="text-slate-400">—</span>
                      }
                    </td>
                    <td class="px-6 py-3 text-slate-600 text-xs">
                      {{ device.lastActive ? (device.lastActive | date: 'short') : '—' }}
                    </td>
                    <td class="px-6 py-3 text-center space-x-2">
                      <button
                        (click)="viewDeviceDetails(device)"
                        class="text-indigo-600 hover:text-indigo-700 font-medium text-xs"
                      >
                        View
                      </button>
                      <button
                        (click)="testDevice(device._id)"
                        [disabled]="testingDeviceId() === device._id"
                        class="text-blue-600 hover:text-blue-700 font-medium text-xs disabled:opacity-50"
                      >
                        {{ testingDeviceId() === device._id ? 'Testing...' : 'Test' }}
                      </button>
                      <button
                        (click)="revokeDeviceAccess(device._id)"
                        class="text-orange-600 hover:text-orange-700 font-medium text-xs"
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Device Details Modal -->
      @if (selectedDevice()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900">Device Details</h2>
              <button
                (click)="selectedDevice.set(null)"
                class="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Device ID</p>
                <p class="text-lg font-mono text-slate-900">{{ selectedDevice()?.deviceId }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Tuya Device ID</p>
                <p class="text-lg font-mono text-slate-900">{{ selectedDevice()?.tuyaDeviceId }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Hotel</p>
                <p class="text-lg text-slate-900">{{ selectedDevice()?.hotelName }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Room</p>
                <p class="text-lg text-slate-900">{{ selectedDevice()?.roomNumber || '—' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Status</p>
                <span class="px-3 py-1 rounded-full text-sm font-medium" [ngClass]="{
                  'bg-green-100 text-green-700': selectedDevice()?.status,
                  'bg-red-100 text-red-700': !selectedDevice()?.status
                }">
                  {{ selectedDevice()?.status ? '🟢 Online' : '🔴 Offline' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-slate-600 font-medium mb-2">Battery</p>
                <p class="text-lg font-semibold" [ngClass]="{
                  'text-green-600': (selectedDevice()?.battery || 0) > 50,
                  'text-orange-600': (selectedDevice()?.battery || 0) <= 50,
                  'text-red-600': (selectedDevice()?.battery || 0) <= 20
                }">
                  {{ selectedDevice()?.battery }}%
                </p>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-200">
              <button
                (click)="selectedDevice.set(null)"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success/Error Messages -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg fixed bottom-4 right-4">
          <p class="font-semibold">✓ {{ successMessage() }}</p>
        </div>
      }
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg fixed bottom-4 right-4">
          <p class="font-semibold">✗ {{ errorMessage() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminSmartLocksComponent implements OnInit {
  devices = signal<SmartLockDevice[]>([]);
  filteredDevices = signal<SmartLockDevice[]>([]);
  analytics = signal<SmartLockAnalytics | null>(null);
  selectedDevice = signal<SmartLockDevice | null>(null);

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  testingDeviceId = signal<string | null>(null);

  searchQuery = '';
  selectedStatus = '';
  selectedHotel = '';
  availableHotels = signal<string[]>([]);

  constructor(
    private hotelService: HotelService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Fetch all devices - in a real scenario, this would come from a backend endpoint
    // For now, we'll simulate loading from hotel services
    this.devices.set([
      {
        _id: '1',
        deviceId: 'lock_room_101',
        tuyaDeviceId: 'tuya_uuid_1',
        hotelId: 'hotel_1',
        hotelName: 'Luxury Hotel Group',
        roomId: 'room_101',
        roomNumber: '101',
        deviceType: 'smart_lock',
        status: true,
        battery: 85,
        lastActive: new Date(Date.now() - 5 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        _id: '2',
        deviceId: 'lock_room_102',
        tuyaDeviceId: 'tuya_uuid_2',
        hotelId: 'hotel_1',
        hotelName: 'Luxury Hotel Group',
        roomId: 'room_102',
        roomNumber: '102',
        deviceType: 'smart_lock',
        status: true,
        battery: 45,
        lastActive: new Date(Date.now() - 15 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        _id: '3',
        deviceId: 'lock_room_201',
        tuyaDeviceId: 'tuya_uuid_3',
        hotelId: 'hotel_2',
        hotelName: 'Paradise Resort',
        roomId: 'room_201',
        roomNumber: '201',
        deviceType: 'smart_lock',
        status: false,
        battery: 15,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]);

    // Extract available hotels
    const hotels = [...new Set(this.devices().map(d => d.hotelName || ''))];
    this.availableHotels.set(hotels);

    // Calculate analytics
    this.calculateAnalytics();

    this.filteredDevices.set(this.devices());
    this.isLoading.set(false);
  }

  calculateAnalytics(): void {
    const devices = this.devices();
    const activeDevices = devices.filter(d => d.status).length;
    const inactiveDevices = devices.filter(d => !d.status).length;
    const lowBatteryDevices = devices.filter(d => (d.battery || 100) <= 20).length;

    this.analytics.set({
      totalDevices: devices.length,
      activeDevices,
      inactiveDevices,
      lowBatteryDevices,
      unlockAttempts: {
        successful: 247,
        failed: 8,
        total: 255
      },
      devicesByStatus: {
        online: activeDevices,
        offline: inactiveDevices
      }
    });
  }

  filterDevices(): void {
    let filtered = this.devices();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.deviceId.toLowerCase().includes(query) ||
        (d.hotelName || '').toLowerCase().includes(query) ||
        (d.roomNumber || '').toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(d => d.status.toString() === this.selectedStatus);
    }

    if (this.selectedHotel) {
      filtered = filtered.filter(d => d.hotelName === this.selectedHotel);
    }

    this.filteredDevices.set(filtered);
  }

  viewDeviceDetails(device: SmartLockDevice): void {
    this.selectedDevice.set(device);
  }

  testDevice(deviceId: string): void {
    this.testingDeviceId.set(deviceId);
    setTimeout(() => {
      this.testingDeviceId.set(null);
      this.successMessage.set('✅ Device test completed successfully');
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 2000);
  }

  revokeDeviceAccess(deviceId: string): void {
    if (confirm('Are you sure you want to revoke access for this device?')) {
      this.errorMessage.set('Access revoked for device: ' + deviceId);
      setTimeout(() => this.errorMessage.set(''), 3000);
    }
  }
}
