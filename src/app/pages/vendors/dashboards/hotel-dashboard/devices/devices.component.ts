import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface DeviceLog {
  time: string;
  code: string;
  value: string;
  event_time: number;
  duration?: number;
}

@Component({
  selector: 'app-hotel-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">Device Management</h1>
          <p class="text-purple-100">View all assigned devices and monitor their activity</p>
        </div>
      </div>

      <!-- Status Messages -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✓ {{ successMessage() }}</p>
        </div>
      }
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✗ {{ errorMessage() }}</p>
        </div>
      }

      <!-- Device Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Devices</p>
          <p class="text-3xl font-bold text-purple-600">{{ assignedDevices().length }}</p>
          <p class="text-sm text-slate-600 mt-2">Devices assigned to this hotel</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Active</p>
          <p class="text-3xl font-bold text-green-600">{{ getActiveDevicesCount() }}</p>
          <p class="text-sm text-slate-600 mt-2">Currently online</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Inactive</p>
          <p class="text-3xl font-bold text-red-600">{{ getInactiveDevicesCount() }}</p>
          <p class="text-sm text-slate-600 mt-2">Offline or disconnected</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 bg-white rounded-lg shadow-md p-2">
        <button
          (click)="activeTab = 'devices'"
          [class.bg-purple-600]="activeTab === 'devices'"
          [class.text-white]="activeTab === 'devices'"
          [class.text-slate-700]="activeTab !== 'devices'"
          class="flex-1 px-6 py-3 font-semibold rounded-lg transition"
        >
          📱 All Devices
        </button>
        <button
          (click)="activeTab = 'monitoring'"
          [class.bg-purple-600]="activeTab === 'monitoring'"
          [class.text-white]="activeTab === 'monitoring'"
          [class.text-slate-700]="activeTab !== 'monitoring'"
          class="flex-1 px-6 py-3 font-semibold rounded-lg transition"
        >
          📊 Monitor Device
        </button>
      </div>

      <!-- Devices List View -->
      @if (activeTab === 'devices') {
        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Assigned Devices</h2>
            <button
              (click)="loadDevicesList()"
              [disabled]="isLoading()"
              class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
            >
              {{ isLoading() ? '⏳ Loading...' : '🔄 Refresh' }}
            </button>
          </div>

          <!-- Date Range Filter -->
          <div class="bg-slate-50 rounded-lg p-4 space-y-3 mb-6">
            <label class="block text-sm font-semibold text-slate-700">Filter by Date Range</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-slate-600 mb-1">From</label>
                <input
                  type="date"
                  [(ngModel)]="dateRangeStart"
                  (change)="onDateRangeChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-600 mb-1">To</label>
                <input
                  type="date"
                  [(ngModel)]="dateRangeEnd"
                  (change)="onDateRangeChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-600 mb-1">Action</label>
                <button
                  (click)="resetDateRange()"
                  class="w-full px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm font-medium transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <!-- Search & Filter -->
          <div class="space-y-3 mb-6">
            <input
              [(ngModel)]="searchQuery"
              (keyup)="filterDevices()"
              placeholder="Search by device ID or device name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                [(ngModel)]="selectedDeviceType"
                (change)="filterDevices()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                <option value="">All Device Types</option>
                <option value="motion_sensor">Motion Sensor</option>
                <option value="door_sensor">Door Sensor</option>
                <option value="temperature_sensor">Temperature Sensor</option>
                <option value="smart_lock">Smart Lock</option>
                <option value="smart_light">Smart Light</option>
                <option value="other">Other</option>
              </select>
              <select
                [(ngModel)]="selectedDeviceStatus"
                (change)="filterDevices()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <!-- Devices Table -->
          @if (filteredDevices().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="text-lg font-semibold">No devices found</p>
              <p class="text-sm mt-1">Add a new device to get started</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-100 border-b">
                  <tr>
                    <th class="px-6 py-3 text-left font-semibold text-slate-900">Device ID</th>
                    <th class="px-6 py-3 text-left font-semibold text-slate-900">Device Type</th>
                    <th class="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th class="px-6 py-3 text-left font-semibold text-slate-900">Last Active</th>
                    <th class="px-6 py-3 text-center font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (device of filteredDevices(); track device._id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-6 py-3 font-medium text-slate-900">{{ device._id || device.deviceId }}</td>
                      <td class="px-6 py-3 text-slate-600">
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {{ device.deviceType || 'motion_sensor' }}
                        </span>
                      </td>
                      <td class="px-6 py-3">
                        <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                          'bg-green-100 text-green-700': device.status === true || device.status === 'true' || device.isActive,
                          'bg-red-100 text-red-700': device.status === false || device.status === 'false' || !device.isActive
                        }">
                          {{ (device.status === true || device.status === 'true' || device.isActive) ? '🟢 Active' : '🔴 Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-3 text-slate-600">{{ formatDate(device.lastActive || device.createdAt) }}</td>
                      <td class="px-6 py-3 text-center">
                        <button
                          (click)="selectDeviceForMonitoring(device._id || device.deviceId)"
                          class="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          Monitor →
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (filteredDevices().length > 0) {
              <p class="text-sm text-slate-500 text-center pt-4">Showing {{ filteredDevices().length }} of {{ assignedDevices().length }} devices</p>
            }
          }
        </div>
      }

      <!-- Monitoring Tab -->
      @if (activeTab === 'monitoring') {
        <!-- Device Selection -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <label class="block text-sm font-semibold text-slate-700 mb-3">Select Device to Monitor</label>
          <div class="flex gap-3">
            <input
              [(ngModel)]="selectedDeviceId"
              placeholder="Enter device ID (e.g., device123)"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
            <button
              (click)="loadDeviceData()"
              [disabled]="isLoading()"
              class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {{ isLoading() ? '⏳ Loading...' : '📱 Load Device' }}
            </button>
          </div>
        </div>

        @if (selectedDeviceId) {
          <!-- Device Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Online Status -->
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-2">Device Status</p>
            @if (deviceStatus()) {
              <div class="space-y-3">
                <p class="text-3xl font-bold" [ngClass]="{
                  'text-green-600': deviceStatus()?.online,
                  'text-red-600': !deviceStatus()?.online
                }">
                  {{ deviceStatus()?.online ? '🟢 Online' : '🔴 Offline' }}
                </p>
                <p class="text-sm text-slate-600">Last updated: {{ lastStatusUpdate }}</p>
              </div>
            } @else {
              <p class="text-slate-500 italic">No device data</p>
            }
          </div>

          <!-- Total Logs -->
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <p class="text-slate-600 text-sm font-medium mb-2">Total Logs</p>
            <p class="text-3xl font-bold text-blue-600">{{ totalLogs }}</p>
            <p class="text-sm text-slate-600 mt-2">Device activity records</p>
          </div>

          <!-- Long Durations -->
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-amber-500">
            <p class="text-slate-600 text-sm font-medium mb-2">Motion Periods >20min</p>
            <p class="text-3xl font-bold text-amber-600">{{ longDurationPeriods().length }}</p>
            <p class="text-sm text-slate-600 mt-2">Extended motion detection</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 bg-white rounded-lg shadow-md p-2">
          <button
            (click)="activeTab = 'timeline'"
            [class.bg-purple-600]="activeTab === 'timeline'"
            [class.text-white]="activeTab === 'timeline'"
            [class.text-slate-700]="activeTab !== 'timeline'"
            class="flex-1 px-6 py-3 font-semibold rounded-lg transition"
          >
            📊 Timeline
          </button>
          <button
            (click)="activeTab = 'logs'"
            [class.bg-purple-600]="activeTab === 'logs'"
            [class.text-white]="activeTab === 'logs'"
            [class.text-slate-700]="activeTab !== 'logs'"
            class="flex-1 px-6 py-3 font-semibold rounded-lg transition"
          >
            📋 Logs
          </button>
          <button
            (click)="activeTab = 'periods'"
            [class.bg-purple-600]="activeTab === 'periods'"
            [class.text-white]="activeTab === 'periods'"
            [class.text-slate-700]="activeTab !== 'periods'"
            class="flex-1 px-6 py-3 font-semibold rounded-lg transition"
          >
            ⏱️ Long Periods
          </button>
        </div>

        <!-- Timeline View -->
        @if (activeTab === 'timeline') {
          <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Device Activity Timeline</h2>
            
            @if (deviceLogs().length === 0) {
              <div class="text-center py-8 text-slate-500">
                <p class="text-lg font-semibold">No logs available</p>
                <p class="text-sm mt-1">Load a device to view activity timeline</p>
              </div>
            } @else {
              <div class="space-y-3 max-h-96 overflow-y-auto">
                @for (log of deviceLogs().slice(0, 20); track log.event_time) {
                  <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border-l-4 border-purple-500">
                    <div class="flex-shrink-0">
                      <div class="flex items-center justify-center h-10 w-10 rounded-lg" [ngClass]="{
                        'bg-green-100 text-green-600': log.value === 'true',
                        'bg-red-100 text-red-600': log.value === 'false',
                        'bg-slate-100 text-slate-600': log.value !== 'true' && log.value !== 'false'
                      }">
                        {{ log.value === 'true' ? '✓' : '✕' }}
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-slate-900">{{ log.code }}</p>
                      <p class="text-sm text-slate-600">{{ formatDate(log.event_time) }}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-700': log.value === 'true',
                      'bg-red-100 text-red-700': log.value === 'false',
                      'bg-slate-100 text-slate-700': log.value !== 'true' && log.value !== 'false'
                    }">
                      {{ log.value }}
                    </span>
                  </div>
                }
              </div>
              @if (deviceLogs().length > 20) {
                <p class="text-sm text-slate-500 text-center pt-4">Showing 20 of {{ deviceLogs().length }} logs</p>
              }
            }
          </div>
        }

        <!-- Raw Logs View -->
        @if (activeTab === 'logs') {
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Device Logs</h2>
            
            @if (deviceLogs().length === 0) {
              <div class="text-center py-8 text-slate-500">
                <p class="text-lg font-semibold">No logs found</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-100 border-b">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-900">Time</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-900">Code</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-900">Value</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    @for (log of deviceLogs().slice(0, 50); track log.event_time) {
                      <tr class="hover:bg-slate-50">
                        <td class="px-6 py-3 text-slate-600">{{ formatDate(log.event_time) }}</td>
                        <td class="px-6 py-3 font-medium text-slate-900">{{ log.code }}</td>
                        <td class="px-6 py-3">
                          <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                            'bg-green-100 text-green-700': log.value === 'true',
                            'bg-red-100 text-red-700': log.value === 'false'
                          }">
                            {{ log.value }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              @if (deviceLogs().length > 50) {
                <p class="text-sm text-slate-500 text-center pt-4">Showing 50 of {{ deviceLogs().length }} logs</p>
              }
            }
          </div>
        }

        <!-- Long Duration Periods -->
        @if (activeTab === 'periods') {
          <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Extended Motion Periods (>20 minutes)</h2>
            
            @if (longDurationPeriods().length === 0) {
              <div class="text-center py-8 text-slate-500">
                <p class="text-lg font-semibold">No extended periods found</p>
                <p class="text-sm mt-1">Motion detection periods lasting more than 20 minutes will appear here</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (period of longDurationPeriods(); track period.start) {
                  <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-500">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p class="text-xs text-slate-600 font-medium mb-1">START</p>
                        <p class="font-semibold text-slate-900">{{ formatDate(period.start) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-600 font-medium mb-1">END</p>
                        <p class="font-semibold text-slate-900">{{ formatDate(period.end) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-600 font-medium mb-1">DURATION</p>
                        <p class="font-semibold text-amber-600">{{ period.duration }} min</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-600 font-medium mb-1">IN HOURS</p>
                        <p class="font-semibold text-amber-600">{{ period.durationHours }} h</p>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Summary Stats -->
              <div class="mt-8 pt-6 border-t border-slate-200">
                <h3 class="font-bold text-slate-900 mb-4">Summary Statistics</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 bg-slate-100 rounded-lg">
                    <p class="text-xs text-slate-600 font-medium mb-1">Total Extended Periods</p>
                    <p class="text-2xl font-bold text-slate-900">{{ longDurationPeriods().length }}</p>
                  </div>
                  <div class="p-4 bg-slate-100 rounded-lg">
                    <p class="text-xs text-slate-600 font-medium mb-1">Average Duration</p>
                    <p class="text-2xl font-bold text-slate-900">{{ getAverageDuration() }} min</p>
                  </div>
                  <div class="p-4 bg-slate-100 rounded-lg">
                    <p class="text-xs text-slate-600 font-medium mb-1">Total Time</p>
                    <p class="text-2xl font-bold text-slate-900">{{ getTotalDuration() }} min</p>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class HotelDevicesComponent implements OnInit {
  selectedDeviceId = '';
  activeTab = 'devices';

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  deviceStatus = signal<any>(null);
  deviceLogs = signal<DeviceLog[]>([]);
  longDurationPeriods = signal<any[]>([]);
  assignedDevices = signal<any[]>([]);
  filteredDevices = signal<any[]>([]);

  dateRangeStart = '';
  dateRangeEnd = '';
  searchQuery = '';
  selectedDeviceType = '';
  selectedDeviceStatus = '';

  totalLogs = 0;
  lastStatusUpdate = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadDevicesList();
  }

  loadDevicesList(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Get the hotel ID from localStorage
    const hotelId = localStorage.getItem('hotelId');
    if (!hotelId) {
      this.errorMessage.set('Hotel ID not found. Please log in again.');
      this.isLoading.set(false);
      return;
    }

    // In a real scenario, you would call an API endpoint to get all devices assigned to this hotel
    // For now, we'll simulate this - the actual endpoint would be something like:
    // this.hotelService.getHotelDevices(hotelId).subscribe({...})

    // Simulated devices data - replace with actual API call
    const simulatedDevices = [
      {
        _id: 'device_motion_001',
        deviceId: 'device_motion_001',
        deviceType: 'motion_sensor',
        status: true,
        isActive: true,
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        name: 'Lobby Motion Sensor'
      },
      {
        _id: 'device_motion_002',
        deviceId: 'device_motion_002',
        deviceType: 'motion_sensor',
        status: true,
        isActive: true,
        lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Corridor Motion Sensor'
      },
      {
        _id: 'device_door_001',
        deviceId: 'device_door_001',
        deviceType: 'door_sensor',
        status: false,
        isActive: false,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Main Entrance Door Sensor'
      },
      {
        _id: 'device_temp_001',
        deviceId: 'device_temp_001',
        deviceType: 'temperature_sensor',
        status: true,
        isActive: true,
        lastActive: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Room 101 Temperature Sensor'
      },
      {
        _id: 'device_smart_lock_001',
        deviceId: 'device_smart_lock_001',
        deviceType: 'smart_lock',
        status: true,
        isActive: true,
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Room 101 Smart Lock'
      }
    ];

    // Set the devices and apply filters
    this.assignedDevices.set(simulatedDevices);
    this.filteredDevices.set(simulatedDevices);

    this.successMessage.set(`Loaded ${simulatedDevices.length} devices successfully`);
    this.isLoading.set(false);

    console.log('✅ Devices loaded:', simulatedDevices);
  }

  filterDevices(): void {
    const allDevices = this.assignedDevices();

    const filtered = allDevices.filter(device => {
      // Search filter (by ID or name)
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const deviceId = (device._id || device.deviceId || '').toLowerCase();
        const deviceName = (device.name || '').toLowerCase();
        if (!deviceId.includes(query) && !deviceName.includes(query)) {
          return false;
        }
      }

      // Device type filter
      if (this.selectedDeviceType) {
        if (device.deviceType !== this.selectedDeviceType) {
          return false;
        }
      }

      // Status filter
      if (this.selectedDeviceStatus) {
        const deviceIsActive = device.status === true || device.status === 'true' || device.isActive;
        const filterIsActive = this.selectedDeviceStatus === 'true';
        if (deviceIsActive !== filterIsActive) {
          return false;
        }
      }

      // Date range filter (based on lastActive)
      if (this.dateRangeStart || this.dateRangeEnd) {
        const lastActive = new Date(device.lastActive || device.createdAt);

        if (this.dateRangeStart) {
          const startDate = new Date(this.dateRangeStart);
          startDate.setHours(0, 0, 0, 0);
          if (lastActive < startDate) {
            return false;
          }
        }

        if (this.dateRangeEnd) {
          const endDate = new Date(this.dateRangeEnd);
          endDate.setHours(23, 59, 59, 999);
          if (lastActive > endDate) {
            return false;
          }
        }
      }

      return true;
    });

    this.filteredDevices.set(filtered);
  }

  onDateRangeChange(): void {
    this.filterDevices();
  }

  resetDateRange(): void {
    this.dateRangeStart = '';
    this.dateRangeEnd = '';
    this.filterDevices();
  }

  selectDeviceForMonitoring(deviceId: string): void {
    this.selectedDeviceId = deviceId;
    this.activeTab = 'monitoring';
    // Load the selected device's data
    this.loadDeviceData();
  }

  getActiveDevicesCount(): number {
    return this.assignedDevices().filter(device =>
      device.status === true || device.status === 'true' || device.isActive
    ).length;
  }

  getInactiveDevicesCount(): number {
    return this.assignedDevices().filter(device =>
      device.status === false || device.status === 'false' || !device.isActive
    ).length;
  }

  loadDeviceData(): void {
    if (!this.selectedDeviceId.trim()) {
      this.errorMessage.set('Please enter a device ID');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Load device status
    this.hotelService.getDeviceStatus(this.selectedDeviceId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.deviceStatus.set(response.data);
          this.lastStatusUpdate = new Date().toLocaleTimeString();
          console.log('✅ Device status:', response.data);
        }
      },
      error: (error) => {
        console.error('❌ Error loading device status:', error);
        this.errorMessage.set('Failed to load device status');
      }
    });

    // Load device logs
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours

    this.hotelService.getDeviceLogs(this.selectedDeviceId, startTime, endTime).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.deviceLogs.set(response.data?.logs || []);
          this.totalLogs = response.data?.totalLogs || 0;
          this.longDurationPeriods.set(response.data?.timeDifferences || []);
          
          this.successMessage.set(`Loaded ${this.totalLogs} logs with ${this.longDurationPeriods().length} extended periods`);
          console.log('✅ Device logs:', response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading device logs:', error);
        this.errorMessage.set('Failed to load device logs');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(timestamp: number | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getAverageDuration(): number {
    const periods = this.longDurationPeriods();
    if (periods.length === 0) return 0;
    const total = periods.reduce((sum, p) => sum + p.duration, 0);
    return Math.round(total / periods.length);
  }

  getTotalDuration(): number {
    const periods = this.longDurationPeriods();
    return periods.reduce((sum, p) => sum + p.duration, 0);
  }
}
