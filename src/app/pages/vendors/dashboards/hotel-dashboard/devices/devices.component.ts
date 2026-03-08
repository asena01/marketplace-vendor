import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-hotel-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">Devices Management</h1>
          <p class="text-purple-100">View IoT devices and monitor their status (Devices are added by admin only)</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading devices...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Total Devices</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ devices().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Active</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus(true) }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Inactive</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus(false) }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (keyup)="filterDevices()"
          placeholder="Search by device ID or device name..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
        />
        <select
          [(ngModel)]="filterDeviceType"
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
          [(ngModel)]="filterStatus"
          (change)="filterDevices()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <!-- Devices Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (filteredDevices().length === 0) {
          <div class="p-8 text-center text-slate-500">
            <p class="text-lg font-semibold">No devices found</p>
            <p class="text-sm mt-1">Add a new device to get started</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Device ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Device Type</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tuya Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (device of filteredDevices(); track device._id) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ device.deviceId }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      <span class="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                        {{ getDeviceTypeLabel(device.deviceType) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ device.room?.roomNumber || 'Unassigned' }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="device.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ device.status ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      @if (deviceStatusMap()[device._id]) {
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {{ deviceStatusMap()[device._id] }}
                        </span>
                      } @else {
                        <span class="text-slate-400 text-xs">Loading...</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <div class="flex gap-2">
                        <button
                          (click)="viewDevice(device)"
                          class="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                        <button
                          (click)="deleteDevice(device._id)"
                          class="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- View Device Details Modal -->
      @if (showViewModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">📱 Device Details</h2>

            @if (selectedDevice()) {
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-semibold text-slate-600">Device ID</p>
                  <p class="text-slate-900">{{ selectedDevice().deviceId }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-600">Device Type</p>
                  <p class="text-slate-900">{{ getDeviceTypeLabel(selectedDevice().deviceType) }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-600">Room</p>
                  <p class="text-slate-900">{{ selectedDevice().room?.roomNumber || 'Unassigned' }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-600">Status</p>
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    [ngClass]="selectedDevice().status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ selectedDevice().status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-600">Tuya Status</p>
                  @if (selectedDeviceTuyaStatus()) {
                    <p class="text-slate-900 text-xs bg-blue-50 p-2 rounded max-h-20 overflow-y-auto">
                      {{ selectedDeviceTuyaStatus() | json }}
                    </p>
                  } @else {
                    <p class="text-slate-400 text-sm">Loading Tuya status...</p>
                  }
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-600">Created At</p>
                  <p class="text-slate-900">{{ formatDate(selectedDevice().createdAt) }}</p>
                </div>
              </div>
            }

            <button
              (click)="closeViewModal()"
              class="w-full mt-6 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class HotelDevicesComponent implements OnInit {
  devices = signal<any[]>([]);
  filteredDevices = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  showViewModal = signal(false);

  deviceStatusMap = signal<{ [key: string]: string }>({});
  selectedDevice = signal<any>(null);
  selectedDeviceTuyaStatus = signal<any>(null);

  searchQuery = '';
  filterDeviceType = '';
  filterStatus = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading.set(true);
    this.hotelService.getAllDevices(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.devices.set(response.data);
          this.filterDevices();
          this.loadDeviceStatuses();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading devices:', error);
        this.errorMessage.set('Failed to load devices');
        this.isLoading.set(false);
      }
    });
  }

  loadDeviceStatuses(): void {
    const statusMap: { [key: string]: string } = {};
    this.devices().forEach((device) => {
      this.hotelService.getDeviceStatus(device.deviceId).subscribe({
        next: (response: any) => {
          if (response && Array.isArray(response)) {
            statusMap[device._id] = response.length > 0 ? response[0]?.value || 'Unknown' : 'Offline';
          } else {
            statusMap[device._id] = 'Unknown';
          }
          this.deviceStatusMap.set({ ...this.deviceStatusMap(), ...statusMap });
        },
        error: () => {
          statusMap[device._id] = 'Error';
          this.deviceStatusMap.set({ ...this.deviceStatusMap(), ...statusMap });
        }
      });
    });
  }

  filterDevices(): void {
    let result = [...this.devices()];

    if (this.searchQuery) {
      result = result.filter(
        (d) =>
          d.deviceId?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.filterDeviceType) {
      result = result.filter((d) => d.deviceType === this.filterDeviceType);
    }

    if (this.filterStatus) {
      const statusBool = this.filterStatus === 'true';
      result = result.filter((d) => d.status === statusBool);
    }

    this.filteredDevices.set(result);
  }

  countByStatus(status: boolean): number {
    return this.devices().filter((d) => d.status === status).length;
  }

  getDeviceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      motion_sensor: '📡 Motion Sensor',
      door_sensor: '🚪 Door Sensor',
      temperature_sensor: '🌡️ Temperature',
      smart_lock: '🔒 Smart Lock',
      smart_light: '💡 Smart Light',
      other: '⚙️ Other'
    };
    return labels[type] || type;
  }

  viewDevice(device: any): void {
    this.selectedDevice.set(device);
    this.selectedDeviceTuyaStatus.set(null);
    this.showViewModal.set(true);
    
    this.hotelService.getDeviceStatus(device.deviceId).subscribe({
      next: (response: any) => {
        this.selectedDeviceTuyaStatus.set(response);
      },
      error: (error: any) => {
        console.error('Error loading device status:', error);
        this.selectedDeviceTuyaStatus.set({ error: 'Failed to load status' });
      }
    });
  }

  deleteDevice(deviceId: string): void {
    if (!confirm('Are you sure you want to delete this device?')) return;

    this.hotelService.deleteDevice(deviceId).subscribe({
      next: () => {
        this.loadDevices();
      },
      error: (error: any) => {
        console.error('Error deleting device:', error);
        alert('Failed to delete device');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedDevice.set(null);
    this.selectedDeviceTuyaStatus.set(null);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
