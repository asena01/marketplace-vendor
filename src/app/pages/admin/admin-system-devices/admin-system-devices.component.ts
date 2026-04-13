import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

type DeviceView = 'discovered' | 'accepted';

@Component({
  selector: 'app-admin-system-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 text-white shadow-xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-indigo-200">Admin Devices</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight">Smart Device Intake</h2>
            <p class="mt-2 max-w-3xl text-sm text-slate-200">
              Review devices discovered directly from Tuya, accept the ones you want in the platform, and manage accepted devices separately.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">Discovered</p>
              <p class="mt-2 text-2xl font-black">{{ discoveredTotal() }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">Accepted</p>
              <p class="mt-2 text-2xl font-black">{{ acceptedTotal() }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">Door Sensors</p>
              <p class="mt-2 text-2xl font-black">{{ doorSensorCount() }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">Smart Locks</p>
              <p class="mt-2 text-2xl font-black">{{ smartLockCount() }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <button
            (click)="switchView('discovered')"
            [class]="'rounded-2xl px-4 py-3 text-sm font-bold transition ' + (activeView() === 'discovered' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')"
          >
            Discovered from Tuya
          </button>
          <button
            (click)="switchView('accepted')"
            [class]="'rounded-2xl px-4 py-3 text-sm font-bold transition ' + (activeView() === 'accepted' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')"
          >
            Accepted in Platform
          </button>
        </div>
      </div>

      <div class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="flex-1">
            <span class="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Search</span>
            <input
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              type="text"
              placeholder="Search by device ID, name, or type"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </label>

          <label class="w-full lg:max-w-xs">
            <span class="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select
              [(ngModel)]="filterStatus"
              (ngModelChange)="applyFilters()"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div class="flex gap-2">
            <button
              (click)="refreshActiveView()"
              class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span class="material-icons text-base">refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      @if (errorMessage()) {
        <div class="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm">
          {{ errorMessage() }}
        </div>
      }

      @if (isLoading()) {
        <div class="rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p class="text-sm font-semibold text-slate-500">Loading {{ activeView() === 'discovered' ? 'discovered Tuya devices' : 'accepted devices' }}...</p>
        </div>
      } @else if (visibleDevices().length === 0) {
        <div class="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <span class="material-icons text-5xl text-slate-300">devices_other</span>
          <h3 class="mt-4 text-xl font-black tracking-tight text-slate-900">No devices in this view</h3>
          <p class="mt-2 text-sm text-slate-500">
            {{ activeView() === 'discovered' ? 'No devices were discovered from Tuya.' : 'No devices have been accepted into the platform yet.' }}
          </p>
        </div>
      } @else {
        <section class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr class="text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  <th class="px-6 py-4">Device</th>
                  <th class="px-6 py-4">Type</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">{{ activeView() === 'discovered' ? 'Tuya Last Seen' : 'Platform Updated' }}</th>
                  <th class="px-6 py-4">Assignment</th>
                  <th class="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (device of visibleDevices(); track device._id || device.deviceId) {
                  <tr class="transition hover:bg-slate-50/80">
                    <td class="px-6 py-5">
                      <p class="text-sm font-bold text-slate-900">{{ device.name || device.deviceId }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ device.deviceId }}</p>
                    </td>
                    <td class="px-6 py-5 text-sm font-semibold text-slate-700">{{ getDeviceTypeLabel(device.deviceType || device.type) }}</td>
                    <td class="px-6 py-5">
                      <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getStatusClass(device.status)">
                        {{ formatStatus(device.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-5 text-sm text-slate-600">
                      {{ getDeviceDateLabel(device) }}
                    </td>
                    <td class="px-6 py-5 text-sm text-slate-600">
                      @if (activeView() === 'accepted') {
                        {{ getAssignmentLabel(device) }}
                      } @else {
                        {{ device.accepted ? 'Already accepted' : 'Not accepted' }}
                      }
                    </td>
                    <td class="px-6 py-5 text-right">
                      @if (activeView() === 'discovered') {
                        @if (device.accepted) {
                          <span class="inline-flex rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">Accepted</span>
                        } @else {
                          <div class="flex justify-end gap-2">
                            <button
                              (click)="rejectDiscovered(device.deviceId)"
                              class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Reject
                            </button>
                            <button
                              (click)="acceptDiscovered(device)"
                              class="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-600"
                            >
                              Accept
                            </button>
                          </div>
                        }
                      } @else {
                        <div class="flex justify-end gap-2">
                          <button
                            (click)="checkLiveStatus(device)"
                            [disabled]="checkingDeviceId() === device._id"
                            class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {{ checkingDeviceId() === device._id ? 'Checking...' : 'Check Status' }}
                          </button>
                          <button
                            (click)="promptDeleteDevice(device)"
                            class="rounded-2xl bg-rose-100 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (showDeleteDeviceConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div class="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Delete Device</p>
            <h3 class="mt-2 text-xl font-black tracking-tight text-slate-900">Remove this device?</h3>
            <p class="mt-3 text-sm text-slate-600">
              {{ deleteDeviceCandidate()?.name || deleteDeviceCandidate()?.deviceId || 'This device' }} will be deleted from the accepted platform inventory.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                (click)="cancelDeleteDevice()"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="confirmDeleteDevice()"
                [disabled]="!deleteDeviceCandidate() || deletingDeviceId() === deleteDeviceCandidate()?._id"
                class="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ deletingDeviceId() === deleteDeviceCandidate()?._id ? 'Deleting...' : 'Delete Device' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 22px;
      height: 22px;
      width: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class AdminSystemDevicesComponent implements OnInit {
  activeView = signal<DeviceView>('discovered');
  isLoading = signal(false);
  errorMessage = signal('');
  deletingDeviceId = signal<string | null>(null);
  checkingDeviceId = signal<string | null>(null);
  showDeleteDeviceConfirm = signal(false);
  deleteDeviceCandidate = signal<any | null>(null);

  discoveredDevices = signal<any[]>([]);
  acceptedDevices = signal<any[]>([]);
  visibleDevices = signal<any[]>([]);

  discoveredTotal = signal(0);
  acceptedTotal = signal(0);

  searchTerm = '';
  filterStatus = '';
  private rejectedDiscoveredIds = new Set<string>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDiscoveredDevices();
    this.loadAcceptedDevices();
  }

  switchView(view: DeviceView): void {
    this.activeView.set(view);
    this.applyFilters();
  }

  refreshActiveView(): void {
    if (this.activeView() === 'discovered') {
      this.loadDiscoveredDevices();
      return;
    }
    this.loadAcceptedDevices();
  }

  loadDiscoveredDevices(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.adminService.getDiscoveredDevices(1, 200).subscribe({
      next: (response: any) => {
        const devices = Array.isArray(response?.data) ? response.data : [];
        this.discoveredDevices.set(devices.filter((device: any) => !this.rejectedDiscoveredIds.has(device.deviceId)));
        this.discoveredTotal.set(Number(response?.pagination?.total) || devices.length);
        this.isLoading.set(false);
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('❌ Error loading discovered devices:', error);
        this.errorMessage.set('Failed to load devices directly from Tuya.');
        this.discoveredDevices.set([]);
        this.discoveredTotal.set(0);
        this.isLoading.set(false);
        this.applyFilters();
      }
    });
  }

  loadAcceptedDevices(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.adminService.getDevices(1, 200).subscribe({
      next: (response: any) => {
        const devices = Array.isArray(response?.data) ? response.data : [];
        this.acceptedDevices.set(devices);
        this.acceptedTotal.set(Number(response?.pagination?.total) || devices.length);
        this.isLoading.set(false);
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('❌ Error loading accepted devices:', error);
        this.errorMessage.set('Failed to load accepted devices from the platform database.');
        this.acceptedDevices.set([]);
        this.acceptedTotal.set(0);
        this.isLoading.set(false);
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const status = this.filterStatus;
    const source = this.activeView() === 'discovered' ? this.discoveredDevices() : this.acceptedDevices();

    this.visibleDevices.set(
      source.filter((device) => {
        const matchesSearch = !search || [
          device.name,
          device.deviceId,
          this.getDeviceTypeLabel(device.deviceType || device.type)
        ].some((value) => String(value || '').toLowerCase().includes(search));

        const matchesStatus = !status || this.formatStatus(device.status).toLowerCase() === status;
        return matchesSearch && matchesStatus;
      })
    );
  }

  private resolveDeviceId(device: any): string {
    return device?.deviceId || device?.device_id || device?.tuyaDeviceId || device?.id || device?.uuid || '';
  }

  acceptDiscovered(device: any): void {
    const deviceId = this.resolveDeviceId(device);
    this.adminService.acceptDevice({
      deviceId,
      name: device.name,
      deviceType: device.deviceType,
      tuyaData: device.tuyaData
    }).subscribe({
      next: () => {
        this.loadAcceptedDevices();
        this.loadDiscoveredDevices();
      },
      error: (error: any) => {
        console.error('❌ Error accepting device:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to accept Tuya device.');
      }
    });
  }

  rejectDiscovered(deviceId: string): void {
    this.rejectedDiscoveredIds.add(deviceId);
    this.discoveredDevices.set(this.discoveredDevices().filter((device) => this.resolveDeviceId(device) !== deviceId));
    this.applyFilters();
  }

  removeAccepted(deviceId: string): void {
    this.deletingDeviceId.set(deviceId);
    this.adminService.deleteDevice(deviceId).subscribe({
      next: () => {
        this.loadAcceptedDevices();
        this.loadDiscoveredDevices();
        this.deletingDeviceId.set(null);
      },
      error: (error: any) => {
        console.error('❌ Error removing accepted device:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to remove accepted device.');
        this.deletingDeviceId.set(null);
      }
    });
  }

  promptDeleteDevice(device: any): void {
    this.deleteDeviceCandidate.set(device);
    this.showDeleteDeviceConfirm.set(true);
  }

  cancelDeleteDevice(): void {
    this.showDeleteDeviceConfirm.set(false);
    this.deleteDeviceCandidate.set(null);
  }

  confirmDeleteDevice(): void {
    const deviceId = this.deleteDeviceCandidate()?._id;
    if (!deviceId) {
      return;
    }

    this.removeAccepted(deviceId);
    this.cancelDeleteDevice();
  }

  checkLiveStatus(device: any): void {
    if (!device?._id) {
      return;
    }

    this.checkingDeviceId.set(device._id);
    this.errorMessage.set('');
    this.adminService.getAdminDeviceLiveStatus(device._id).subscribe({
      next: (response: any) => {
        const online = response?.data?.online === true;
        const lastDetectionTime = response?.data?.lastDetectionTime || null;
        const updatedDevices = this.acceptedDevices().map((item) =>
          item._id === device._id
            ? { ...item, status: online, lastDetectionTime, updatedAt: new Date().toISOString() }
            : item
        );
        this.acceptedDevices.set(updatedDevices);
        this.applyFilters();
        this.checkingDeviceId.set(null);
      },
      error: (error: any) => {
        console.error('❌ Failed to check live device status:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to check live device status.');
        this.checkingDeviceId.set(null);
      }
    });
  }

  getDeviceTypeLabel(deviceType: string): string {
    const normalized = String(deviceType || '').toLowerCase();
    const labels: Record<string, string> = {
      smart_lock: 'Smart Lock',
      door_sensor: 'Door Sensor',
      motion_sensor: 'Motion Sensor',
      thermostat: 'Thermostat',
      camera: 'Camera',
      light: 'Light',
      speaker: 'Speaker'
    };
    return labels[normalized] || deviceType || 'Device';
  }

  formatStatus(status: string | boolean | undefined): string {
    if (status === true || status === 'active') {
      return 'active';
    }
    return 'inactive';
  }

  getStatusClass(status: string | boolean | undefined): string {
    return this.formatStatus(status) === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-700';
  }

  getDeviceDateLabel(device: any): string {
    const sourceDate = this.activeView() === 'discovered'
      ? device.lastActive
      : (device.updatedAt || device.createdAt);

    if (!sourceDate) {
      return 'N/A';
    }

    return new Date(sourceDate).toLocaleString();
  }

  getAssignmentLabel(device: any): string {
    if (device.roomNumber) {
      return `Room ${device.roomNumber}`;
    }
    if (device.hotel) {
      return 'Assigned to hotel';
    }
    return 'Unassigned';
  }

  doorSensorCount(): number {
    return this.discoveredDevices().filter((device) => device.deviceType === 'door_sensor').length;
  }

  smartLockCount(): number {
    return this.discoveredDevices().filter((device) => device.deviceType === 'smart_lock').length;
  }
}
