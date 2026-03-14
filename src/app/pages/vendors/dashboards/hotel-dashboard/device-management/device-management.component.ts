import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Device {
  id: string;
  name: string;
  type: 'room-tablet' | 'room-speaker' | 'room-thermostat' | 'service-pos' | 'service-kiosk';
  roomNumber?: string;
  serviceArea?: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastChecked?: string;
  battery?: number;
  location?: string;
}

@Component({
  selector: 'app-device-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Device Management</h1>
          <p class="text-slate-600 mt-2">Check in devices for rooms and food/drink services</p>
        </div>
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          + New Device
        </button>
      </div>

      <!-- Filter & Search -->
      <div class="bg-white rounded-lg p-4 shadow-md flex gap-4">
        <div class="flex-1">
          <input 
            type="text" 
            placeholder="Search devices..." 
            [(ngModel)]="searchQuery"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
        </div>
        <select 
          [(ngModel)]="filterType"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="room">Room Devices</option>
          <option value="service">Service Devices</option>
        </select>
        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Devices</p>
          <p class="text-3xl font-bold text-slate-900">{{ devices().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All devices</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active</p>
          <p class="text-3xl font-bold text-emerald-600">{{ getActiveDevices() }}</p>
          <p class="mt-2 text-sm text-emerald-600">Operational</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Inactive</p>
          <p class="text-3xl font-bold text-yellow-600">{{ getInactiveDevices() }}</p>
          <p class="mt-2 text-sm text-yellow-600">Offline</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Maintenance</p>
          <p class="text-3xl font-bold text-red-600">{{ getMaintenanceDevices() }}</p>
          <p class="mt-2 text-sm text-red-600">Being serviced</p>
        </div>
      </div>

      <!-- Room Devices -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">Room Devices</h2>
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{{ getRoomDevices().length }} devices</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (device of getRoomDevices(); track device.id) {
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-medium text-slate-900">{{ device.name }}</p>
                  <p class="text-sm text-slate-600">Room {{ device.roomNumber }}</p>
                </div>
                <span [ngClass]="{
                  'bg-emerald-100 text-emerald-700': device.status === 'active',
                  'bg-yellow-100 text-yellow-700': device.status === 'inactive',
                  'bg-red-100 text-red-700': device.status === 'maintenance'
                }" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ device.status | titlecase }}
                </span>
              </div>

              <div class="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-600">Type:</span>
                  <span class="font-medium text-slate-900">{{ getDeviceTypeLabel(device.type) }}</span>
                </div>
                @if (device.battery) {
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">Battery:</span>
                    <span [ngClass]="{
                      'text-emerald-600': device.battery > 50,
                      'text-yellow-600': device.battery <= 50 && device.battery > 20,
                      'text-red-600': device.battery <= 20
                    }" class="font-medium">{{ device.battery }}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div [ngClass]="{
                      'bg-emerald-500': device.battery > 50,
                      'bg-yellow-500': device.battery <= 50 && device.battery > 20,
                      'bg-red-500': device.battery <= 20
                    }" class="h-2 rounded-full" [style.width.%]="device.battery"></div>
                  </div>
                }
              </div>

              <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm">
                Check In Device
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Food & Drink Service Devices -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">Food & Drink Service Devices</h2>
          <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{{ getServiceDevices().length }} devices</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (device of getServiceDevices(); track device.id) {
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-medium text-slate-900">{{ device.name }}</p>
                  <p class="text-sm text-slate-600">{{ device.serviceArea }}</p>
                </div>
                <span [ngClass]="{
                  'bg-emerald-100 text-emerald-700': device.status === 'active',
                  'bg-yellow-100 text-yellow-700': device.status === 'inactive',
                  'bg-red-100 text-red-700': device.status === 'maintenance'
                }" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ device.status | titlecase }}
                </span>
              </div>

              <div class="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-600">Type:</span>
                  <span class="font-medium text-slate-900">{{ getDeviceTypeLabel(device.type) }}</span>
                </div>
                @if (device.lastChecked) {
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">Last Checked:</span>
                    <span class="font-medium text-slate-900">{{ device.lastChecked }}</span>
                  </div>
                }
              </div>

              <button class="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors text-sm">
                Check In Device
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Recent Check-ins -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Check-ins</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b-2 border-slate-200">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-slate-700">Device</th>
                <th class="text-left py-3 px-4 font-medium text-slate-700">Location</th>
                <th class="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th class="text-left py-3 px-4 font-medium text-slate-700">Last Check-in</th>
                <th class="text-left py-3 px-4 font-medium text-slate-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              @for (log of deviceLogs; track log.id) {
                <tr class="border-b border-slate-200 hover:bg-slate-50">
                  <td class="py-3 px-4 font-medium text-slate-900">{{ log.deviceName }}</td>
                  <td class="py-3 px-4 text-slate-600">{{ log.location }}</td>
                  <td class="py-3 px-4">
                    <span [ngClass]="{
                      'bg-emerald-100 text-emerald-700': log.status === 'OK',
                      'bg-yellow-100 text-yellow-700': log.status === 'Warning',
                      'bg-red-100 text-red-700': log.status === 'Error'
                    }" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-600">{{ log.timestamp }}</td>
                  <td class="py-3 px-4 text-slate-600">{{ log.notes }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeviceManagementComponent implements OnInit {
  devices = signal<Device[]>([
    // Room Devices
    {
      id: 'dev-001',
      name: 'Room Tablet',
      type: 'room-tablet',
      roomNumber: '101',
      status: 'active',
      battery: 85,
      lastChecked: '2024-03-04 08:30 AM'
    },
    {
      id: 'dev-002',
      name: 'Smart Speaker',
      type: 'room-speaker',
      roomNumber: '102',
      status: 'active',
      battery: 92,
      lastChecked: '2024-03-04 08:45 AM'
    },
    {
      id: 'dev-003',
      name: 'Smart Thermostat',
      type: 'room-thermostat',
      roomNumber: '103',
      status: 'inactive',
      battery: 45,
      lastChecked: '2024-03-04 07:00 AM'
    },
    {
      id: 'dev-004',
      name: 'Room Tablet',
      type: 'room-tablet',
      roomNumber: '201',
      status: 'active',
      battery: 78,
      lastChecked: '2024-03-04 08:15 AM'
    },
    {
      id: 'dev-005',
      name: 'Smart Speaker',
      type: 'room-speaker',
      roomNumber: '202',
      status: 'maintenance',
      battery: 20,
      lastChecked: '2024-03-03 06:00 PM'
    },
    {
      id: 'dev-006',
      name: 'Room Tablet',
      type: 'room-tablet',
      roomNumber: '301',
      status: 'active',
      battery: 88,
      lastChecked: '2024-03-04 08:50 AM'
    },
    // Service Devices
    {
      id: 'dev-007',
      name: 'POS Terminal - Bar',
      type: 'service-pos',
      serviceArea: 'Bar & Lounge',
      status: 'active',
      lastChecked: '2024-03-04 09:00 AM'
    },
    {
      id: 'dev-008',
      name: 'Kitchen Display System',
      type: 'service-kiosk',
      serviceArea: 'Restaurant Kitchen',
      status: 'active',
      lastChecked: '2024-03-04 08:30 AM'
    },
    {
      id: 'dev-009',
      name: 'POS Terminal - Restaurant',
      type: 'service-pos',
      serviceArea: 'Restaurant',
      status: 'active',
      lastChecked: '2024-03-04 08:45 AM'
    },
    {
      id: 'dev-010',
      name: 'Beverage Kiosk',
      type: 'service-kiosk',
      serviceArea: 'Room Service',
      status: 'inactive',
      lastChecked: '2024-03-04 08:00 AM'
    }
  ]);

  searchQuery = '';
  filterType = '';
  filterStatus = '';

  deviceLogs = [
    { id: 1, deviceName: 'Room 101 Tablet', location: 'Room 101', status: 'OK', timestamp: '2024-03-04 09:15 AM', notes: 'All systems operational' },
    { id: 2, deviceName: 'Bar POS Terminal', location: 'Bar & Lounge', status: 'OK', timestamp: '2024-03-04 09:10 AM', notes: 'Battery at 95%' },
    { id: 3, deviceName: 'Room 202 Speaker', location: 'Room 202', status: 'Warning', timestamp: '2024-03-04 09:05 AM', notes: 'Battery low at 20%' },
    { id: 4, deviceName: 'Restaurant POS', location: 'Restaurant', status: 'OK', timestamp: '2024-03-04 09:00 AM', notes: 'Network stable' },
    { id: 5, deviceName: 'Room 103 Thermostat', location: 'Room 103', status: 'Error', timestamp: '2024-03-04 08:50 AM', notes: 'Disconnected - checking' }
  ];

  ngOnInit(): void {
    // Load devices data
  }

  getRoomDevices(): Device[] {
    return this.devices().filter(d => d.type.startsWith('room'));
  }

  getServiceDevices(): Device[] {
    return this.devices().filter(d => d.type.startsWith('service'));
  }

  getActiveDevices(): number {
    return this.devices().filter(d => d.status === 'active').length;
  }

  getInactiveDevices(): number {
    return this.devices().filter(d => d.status === 'inactive').length;
  }

  getMaintenanceDevices(): number {
    return this.devices().filter(d => d.status === 'maintenance').length;
  }

  getDeviceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'room-tablet': 'Room Tablet',
      'room-speaker': 'Smart Speaker',
      'room-thermostat': 'Smart Thermostat',
      'service-pos': 'POS Terminal',
      'service-kiosk': 'Service Kiosk'
    };
    return labels[type] || type;
  }
}
