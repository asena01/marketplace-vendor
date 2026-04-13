import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../services/hotel.service';
import { ToastService } from '../../../../services/toast.service';
import { DialogService } from '../../../../services/dialog.service';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  floor?: number;
  capacity: number;
  status: string;
  hotel?: string;
  assignedDevices?: Device[];
}

interface Device {
  _id: string;
  deviceId: string;
  deviceType: 'motion_sensor' | 'door_sensor' | 'smart_lock' | 'thermostat' | 'camera' | 'light' | 'speaker';
  status: boolean;
  battery?: number;
  tuyaDeviceId?: string;
  room?: string;
  roomNumber?: number;
  lastActivity?: Date;
}

interface AssignmentHistory {
  id: string;
  timestamp: Date;
  action: 'assign' | 'unassign';
  deviceId: string;
  deviceName: string;
  roomId: string;
  roomNumber: string;
}

interface UndoStack {
  id: string;
  action: 'assign' | 'unassign';
  deviceId: string;
  roomId: string;
  timestamp: Date;
}

const ITEMS_PER_PAGE = 10;
const DEVICE_COMPATIBILITY: { [key: string]: string[] } = {
  single: ['smart_lock', 'motion_sensor', 'light'],
  double: ['smart_lock', 'motion_sensor', 'thermostat', 'light'],
  suite: ['smart_lock', 'motion_sensor', 'thermostat', 'camera', 'light'],
  deluxe: ['smart_lock', 'motion_sensor', 'thermostat', 'camera', 'light', 'speaker'],
  presidential: ['smart_lock', 'motion_sensor', 'thermostat', 'camera', 'light', 'speaker']
};

@Component({
  selector: 'app-device-assignment-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-8 bg-slate-50 min-h-screen">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">⚙️ Device Assignment Manager</h1>
            <p class="text-purple-100">Super-admin device management and room assignments</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-purple-200">Last updated: {{ lastUpdateTime() | date:'short' }}</p>
          </div>
        </div>
      </div>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-cyan-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Rooms</p>
          <p class="text-3xl font-bold text-cyan-600">{{ rooms().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Devices</p>
          <p class="text-3xl font-bold text-blue-600">{{ devices().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Assigned</p>
          <p class="text-3xl font-bold text-green-600">{{ getAssignedDevicesCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Unassigned</p>
          <p class="text-3xl font-bold text-orange-600">{{ getUnassignedDevicesCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Offline</p>
          <p class="text-3xl font-bold text-red-600">{{ getOfflineDevicesCount() }}</p>
        </div>
      </div>

      <!-- Undo Stack -->
      @if (undoStack().length > 0) {
        <div class="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-blue-900">Last action: {{ getLastUndoAction() }}</p>
            <p class="text-xs text-blue-700 mt-1">Undo available for {{ Math.round((5 * 60 - getUndoTimeRemaining() / 1000) / 60) }}m more</p>
          </div>
          <button
            (click)="undoLastAction()"
            [disabled]="isUndoing()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {{ isUndoing() ? '⏳ Undoing...' : '↶ Undo' }}
          </button>
        </div>
      }

      <!-- Search & Filter -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-4">🔍 Search & Filter</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            [(ngModel)]="searchRoom"
            (keyup)="updateFilters()"
            placeholder="Search rooms..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
          />
          <select
            [(ngModel)]="selectedFloor"
            (change)="updateFilters()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
          <select
            [(ngModel)]="selectedRoomType"
            (change)="updateFilters()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
          >
            <option value="">All Room Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
            <option value="deluxe">Deluxe</option>
            <option value="presidential">Presidential</option>
          </select>
          <button
            (click)="resetFilters()"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Rooms Assignment View with Pagination -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-slate-900">📍 Room Device Assignments</h2>
          <div class="text-sm text-slate-600">
            Showing {{ (currentPage() - 1) * ITEMS_PER_PAGE + 1 }}-{{ Math.min(currentPage() * ITEMS_PER_PAGE, filteredRooms().length) }} of {{ filteredRooms().length }}
          </div>
        </div>

        <!-- Rooms List -->
        <div class="space-y-4">
          @for (room of paginatedRooms(); track room._id) {
            <div class="border border-slate-200 rounded-lg p-6 hover:shadow-md transition bg-slate-50">
              <!-- Room Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-bold text-slate-900">Room {{ room.roomNumber }}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {{ room.roomType }}
                    </span>
                    @if (room.floor) {
                      <span class="text-sm text-slate-600">📍 Floor {{ room.floor }}</span>
                    }
                    <span class="text-sm text-slate-600">👥 {{ room.capacity }} guests</span>
                  </div>
                  
                  <!-- Required Devices Warning -->
                  @if (getMissingRequiredDevices(room.roomType).length > 0) {
                    <div class="bg-orange-50 border border-orange-300 rounded px-3 py-2 mt-2">
                      <p class="text-xs font-semibold text-orange-800">⚠️ Missing required devices:</p>
                      <p class="text-xs text-orange-700 mt-1">{{ getMissingRequiredDevices(room.roomType).join(', ') }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Assigned Devices -->
              <div class="bg-white rounded-lg p-4 mb-4 border border-slate-200">
                <h4 class="font-semibold text-slate-900 mb-3">Assigned Devices ({{ getRoomDevices(room._id).length }})</h4>
                @if (getRoomDevices(room._id).length === 0) {
                  <p class="text-sm text-slate-500 italic">No devices assigned yet</p>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (device of getRoomDevices(room._id); track device._id) {
                      <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start justify-between">
                        <div class="flex-1">
                          <p class="font-mono font-medium text-slate-900">{{ device.deviceId }}</p>
                          <p class="text-xs text-slate-600 mt-1">{{ getDeviceTypeLabel(device.deviceType) }}</p>
                          @if (device.lastActivity) {
                            <p class="text-xs text-slate-500 mt-1">Last activity: {{ device.lastActivity | date:'short' }}</p>
                          }
                        </div>
                        <div class="flex flex-col items-end gap-2">
                          <!-- Status Badge -->
                          <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="{
                            'bg-green-100 text-green-700': device.status,
                            'bg-red-100 text-red-700': !device.status
                          }">
                            {{ device.status ? '🟢 Online' : '🔴 Offline' }}
                          </span>
                          
                          <!-- Battery Status -->
                          @if (device.battery !== undefined) {
                            <span class="text-xs font-semibold" [ngClass]="{
                              'text-green-600': device.battery > 50,
                              'text-orange-600': device.battery <= 50 && device.battery > 20,
                              'text-red-600': device.battery <= 20
                            }">
                              🔋 {{ device.battery }}%
                            </span>
                          }
                          
                          <!-- Unassign Button -->
                          <button
                            (click)="confirmUnassign(device._id, room._id, device.deviceId, room.roomNumber)"
                            class="text-red-600 hover:text-red-700 font-medium text-xs mt-1"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Assign Device Section -->
              <div class="border-t border-slate-200 pt-4">
                <label class="block text-sm font-semibold text-slate-900 mb-2">Assign New Device</label>
                <div class="flex gap-2">
                  <select
                    [(ngModel)]="deviceAssignments[room._id]"
                    [disabled]="getUnassignedDevices().length === 0 || isAssigning()"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 disabled:opacity-50"
                  >
                    <option value="">Select device to assign...</option>
                    @for (device of getUnassignedDevices(); track device._id) {
                      <option [value]="device._id">
                        {{ device.deviceId }} ({{ getDeviceTypeLabel(device.deviceType) }})
                        @if (!device.status) {
                          <span>- OFFLINE</span>
                        }
                        @if (device.battery !== undefined && device.battery <= 20) {
                          <span>- LOW BATTERY</span>
                        }
                      </option>
                    }
                  </select>
                  <button
                    (click)="confirmAssign(room._id)"
                    [disabled]="!deviceAssignments[room._id] || isAssigning()"
                    class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
                  >
                    {{ isAssigning() ? '⏳' : '✓ Assign' }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (filteredRooms().length === 0) {
            <div class="text-center py-12">
              <p class="text-slate-600 font-semibold">No rooms found matching your filters</p>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-200">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
            >
              ← Previous
            </button>
            
            @for (page of getPageNumbers(); track page) {
              <button
                (click)="goToPage(page)"
                [class.bg-purple-600]="currentPage() === page"
                [class.text-white]="currentPage() === page"
                class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50"
              >
                {{ page }}
              </button>
            }
            
            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
        }
      </div>

      <!-- Assignment History -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-slate-900">📋 Assignment History</h2>
          <button
            (click)="clearHistory()"
            class="text-sm px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded transition"
          >
            Clear History
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Time</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Action</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Device</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Room</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (entry of assignmentHistory(); track entry.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-600 font-mono text-xs">{{ entry.timestamp | date:'medium' }}</td>
                  <td class="px-4 py-3">
                    <span [ngClass]="{
                      'bg-green-100 text-green-700': entry.action === 'assign',
                      'bg-red-100 text-red-700': entry.action === 'unassign'
                    }" class="px-3 py-1 rounded-full text-xs font-medium capitalize">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-mono text-slate-600">{{ entry.deviceName }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ entry.roomNumber }}</td>
                </tr>
              }
            </tbody>
          </table>
          
          @if (assignmentHistory().length === 0) {
            <div class="p-8 text-center">
              <p class="text-slate-600 font-semibold">No assignment history yet</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog Overlay -->
    @if (showConfirmDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-900">{{ confirmDialogTitle() }}</h3>
          <p class="text-slate-600">{{ confirmDialogMessage() }}</p>
          <div class="flex gap-3 justify-end pt-4 border-t">
            <button
              (click)="cancelConfirm()"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              (click)="executeConfirmedAction()"
              [ngClass]="{
                'bg-green-600 hover:bg-green-700': confirmActionType() === 'assign',
                'bg-red-600 hover:bg-red-700': confirmActionType() === 'unassign'
              }"
              class="px-4 py-2 text-white font-medium rounded-lg transition"
            >
              {{ confirmActionType() === 'assign' ? 'Assign Device' : 'Unassign Device' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Toast Notifications -->
    <div class="fixed bottom-4 right-4 space-y-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div [ngClass]="{
          'bg-green-50 border-green-300 text-green-700': toast.type === 'success',
          'bg-red-50 border-red-300 text-red-700': toast.type === 'error',
          'bg-orange-50 border-orange-300 text-orange-700': toast.type === 'warning',
          'bg-blue-50 border-blue-300 text-blue-700': toast.type === 'info'
        }" class="border rounded-lg px-6 py-4 shadow-lg pointer-events-auto max-w-md">
          <p class="font-semibold">{{ toast.message }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DeviceAssignmentManagerComponent implements OnInit {
  rooms = signal<Room[]>([]);
  devices = signal<Device[]>([]);
  filteredRooms = signal<Room[]>([]);
  assignmentHistory = signal<AssignmentHistory[]>([]);
  undoStack = signal<UndoStack[]>([]);
  toasts = signal<any[]>([]);

  isAssigning = signal(false);
  isUndoing = signal(false);
  lastUpdateTime = signal(new Date());

  searchRoom = '';
  selectedFloor = '';
  selectedRoomType = '';
  deviceAssignments: { [roomId: string]: string } = {};

  currentPage = signal(1);
  ITEMS_PER_PAGE = ITEMS_PER_PAGE;

  showConfirmDialog = signal(false);
  confirmDialogTitle = signal('');
  confirmDialogMessage = signal('');
  confirmActionType = signal<'assign' | 'unassign'>('assign');
  pendingAction: { roomId?: string; deviceId?: string } = {};

  paginatedRooms = computed(() => {
    const filtered = this.filteredRooms();
    const start = (this.currentPage() - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredRooms().length / ITEMS_PER_PAGE);
  });

  Math = Math;

  constructor(
    private hotelService: HotelService,
    private toastService: ToastService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
    // Cleanup undo stack every 5 minutes
    setInterval(() => this.cleanupUndoStack(), 60000);
  }

  loadData(): void {
    // Simulated data - would normally come from API
    this.rooms.set([
      { _id: 'room_1', roomNumber: '101', roomType: 'single', floor: 1, capacity: 1, status: 'available', assignedDevices: [] },
      { _id: 'room_2', roomNumber: '102', roomType: 'double', floor: 1, capacity: 2, status: 'available', assignedDevices: [] },
      { _id: 'room_3', roomNumber: '201', roomType: 'suite', floor: 2, capacity: 4, status: 'available', assignedDevices: [] },
      { _id: 'room_4', roomNumber: '202', roomType: 'double', floor: 2, capacity: 2, status: 'occupied', assignedDevices: [] },
      { _id: 'room_5', roomNumber: '301', roomType: 'deluxe', floor: 3, capacity: 2, status: 'available', assignedDevices: [] }
    ]);

    this.devices.set([
      { _id: 'device_1', deviceId: 'lock_room_101', deviceType: 'smart_lock', status: true, battery: 85, room: 'room_1', lastActivity: new Date() },
      { _id: 'device_2', deviceId: 'motion_sensor_101', deviceType: 'motion_sensor', status: true, battery: 92, room: 'room_1', lastActivity: new Date() },
      { _id: 'device_3', deviceId: 'lock_room_102', deviceType: 'smart_lock', status: true, battery: 78, room: 'room_2', lastActivity: new Date() },
      { _id: 'device_4', deviceId: 'thermostat_201', deviceType: 'thermostat', status: true, battery: 45, room: 'room_3', lastActivity: new Date() },
      { _id: 'device_5', deviceId: 'light_sensor_001', deviceType: 'light', status: false, battery: 12, room: undefined },
      { _id: 'device_6', deviceId: 'speaker_001', deviceType: 'speaker', status: true, battery: undefined, room: undefined }
    ]);

    this.filteredRooms.set(this.rooms());
  }

  updateFilters(): void {
    let filtered = this.rooms();

    if (this.searchRoom) {
      filtered = filtered.filter(r => r.roomNumber.toLowerCase().includes(this.searchRoom.toLowerCase()));
    }

    if (this.selectedFloor) {
      filtered = filtered.filter(r => r.floor?.toString() === this.selectedFloor);
    }

    if (this.selectedRoomType) {
      filtered = filtered.filter(r => r.roomType === this.selectedRoomType);
    }

    this.filteredRooms.set(filtered);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchRoom = '';
    this.selectedFloor = '';
    this.selectedRoomType = '';
    this.updateFilters();
  }

  getRoomDevices(roomId: string): Device[] {
    return this.devices().filter(d => d.room === roomId);
  }

  getUnassignedDevices(): Device[] {
    return this.devices().filter(d => !d.room);
  }

  getAssignedDevicesCount(): number {
    return this.devices().filter(d => d.room).length;
  }

  getUnassignedDevicesCount(): number {
    return this.devices().filter(d => !d.room).length;
  }

  getOfflineDevicesCount(): number {
    return this.devices().filter(d => !d.status).length;
  }

  getDeviceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'smart_lock': '🔐 Smart Lock',
      'door_sensor': '🚪 Door Sensor',
      'motion_sensor': '🎯 Motion Sensor',
      'thermostat': '🌡️ Thermostat',
      'camera': '📹 Camera',
      'light': '💡 Light',
      'speaker': '🔊 Speaker'
    };
    return labels[type] || type;
  }

  getMissingRequiredDevices(roomType: string): string[] {
    const required = DEVICE_COMPATIBILITY[roomType] || [];
    const assignedTypes = this.devices()
      .filter(d => this.getRoomDevices(this.rooms().find(r => r.roomType === roomType)?._id || '').some(ad => ad._id === d._id))
      .map(d => d.deviceType);
    return required.filter(r => !assignedTypes.includes(r as any)).map(t => this.getDeviceTypeLabel(t));
  }

  confirmAssign(roomId: string): void {
    const deviceId = this.deviceAssignments[roomId];
    if (!deviceId) {
      this.toastService.error('Please select a device');
      return;
    }

    const device = this.devices().find(d => d._id === deviceId);
    const room = this.rooms().find(r => r._id === roomId);

    if (!device || !room) return;

    this.confirmDialogTitle.set('Assign Device');
    this.confirmDialogMessage.set(`Assign ${device.deviceId} to Room ${room.roomNumber}?`);
    this.confirmActionType.set('assign');
    this.pendingAction = { roomId, deviceId };
    this.showConfirmDialog.set(true);
  }

  confirmUnassign(deviceId: string, roomId: string, deviceName: string, roomNumber: string): void {
    this.confirmDialogTitle.set('Remove Device Assignment');
    this.confirmDialogMessage.set(`Unassign ${deviceName} from Room ${roomNumber}?`);
    this.confirmActionType.set('unassign');
    this.pendingAction = { roomId, deviceId };
    this.showConfirmDialog.set(true);
  }

  executeConfirmedAction(): void {
    if (this.confirmActionType() === 'assign') {
      this.assignDevice(this.pendingAction.roomId!, this.pendingAction.deviceId!);
    } else {
      this.unassignDevice(this.pendingAction.deviceId!, this.pendingAction.roomId!);
    }
    this.cancelConfirm();
  }

  cancelConfirm(): void {
    this.showConfirmDialog.set(false);
    this.pendingAction = {};
  }

  assignDevice(roomId: string, deviceId: string): void {
    this.isAssigning.set(true);

    setTimeout(() => {
      const device = this.devices().find(d => d._id === deviceId);
      const room = this.rooms().find(r => r._id === roomId);

      if (device && room) {
        device.room = roomId;
        device.roomNumber = parseInt(room.roomNumber);

        // Add to undo stack
        this.undoStack.update(stack => [...stack, {
          id: `undo-${Date.now()}`,
          action: 'assign',
          deviceId,
          roomId,
          timestamp: new Date()
        }]);

        // Add to history
        this.assignmentHistory.update(hist => [{
          id: `hist-${Date.now()}`,
          timestamp: new Date(),
          action: 'assign',
          deviceId,
          deviceName: device.deviceId,
          roomId,
          roomNumber: room.roomNumber
        }, ...hist]);

        this.deviceAssignments[roomId] = '';
        this.toastService.success(`✓ ${device.deviceId} assigned to Room ${room.roomNumber}`);
        this.lastUpdateTime.set(new Date());
      }

      this.isAssigning.set(false);
    }, 500);
  }

  unassignDevice(deviceId: string, roomId: string): void {
    this.isAssigning.set(true);

    setTimeout(() => {
      const device = this.devices().find(d => d._id === deviceId);
      const room = this.rooms().find(r => r._id === roomId);

      if (device && room) {
        device.room = undefined;
        device.roomNumber = undefined;

        // Add to undo stack
        this.undoStack.update(stack => [...stack, {
          id: `undo-${Date.now()}`,
          action: 'unassign',
          deviceId,
          roomId,
          timestamp: new Date()
        }]);

        // Add to history
        this.assignmentHistory.update(hist => [{
          id: `hist-${Date.now()}`,
          timestamp: new Date(),
          action: 'unassign',
          deviceId,
          deviceName: device.deviceId,
          roomId,
          roomNumber: room.roomNumber
        }, ...hist]);

        this.toastService.success(`✓ ${device.deviceId} unassigned from Room ${room.roomNumber}`);
        this.lastUpdateTime.set(new Date());
      }

      this.isAssigning.set(false);
    }, 500);
  }

  undoLastAction(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;

    const lastAction = stack[stack.length - 1];
    this.isUndoing.set(true);

    setTimeout(() => {
      if (lastAction.action === 'assign') {
        // Undo assign = unassign
        const device = this.devices().find(d => d._id === lastAction.deviceId);
        if (device) {
          device.room = undefined;
          device.roomNumber = undefined;
          this.toastService.success('✓ Undo successful');
        }
      } else {
        // Undo unassign = assign
        const device = this.devices().find(d => d._id === lastAction.deviceId);
        const room = this.rooms().find(r => r._id === lastAction.roomId);
        if (device && room) {
          device.room = lastAction.roomId;
          device.roomNumber = parseInt(room.roomNumber);
          this.toastService.success('✓ Undo successful');
        }
      }

      this.undoStack.update(stack => stack.slice(0, -1));
      this.isUndoing.set(false);
      this.lastUpdateTime.set(new Date());
    }, 500);
  }

  getLastUndoAction(): string {
    const stack = this.undoStack();
    if (stack.length === 0) return '';
    const lastAction = stack[stack.length - 1];
    return `${lastAction.action} - ${lastAction.deviceId}`;
  }

  getUndoTimeRemaining(): number {
    const stack = this.undoStack();
    if (stack.length === 0) return 0;
    const lastAction = stack[stack.length - 1];
    const elapsed = Date.now() - lastAction.timestamp.getTime();
    return Math.max(0, 5 * 60 * 1000 - elapsed);
  }

  cleanupUndoStack(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.undoStack.update(stack => stack.filter(item => item.timestamp.getTime() > fiveMinutesAgo));
  }

  clearHistory(): void {
    this.assignmentHistory.set([]);
    this.toastService.info('History cleared');
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        pages.push(i);
      }
    }

    return pages;
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
