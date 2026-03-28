import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  floor?: number;
  capacity: number;
  status: string;
  assignedDevices?: Device[];
}

interface Device {
  _id: string;
  deviceId: string;
  deviceType: 'motion_sensor' | 'smart_lock' | 'thermostat' | 'camera' | 'light' | 'speaker';
  status: boolean;
  battery?: number;
  tuyaDeviceId?: string;
  room?: string;
  roomNumber?: number;
}

interface RoomDeviceAssignment {
  room: Room;
  devices: Device[];
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
}

@Component({
  selector: 'app-room-device-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-8">
      <!-- Header -->
      <div class="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">🔌 Room-Device Assignment</h1>
          <p class="text-cyan-100">Connect smart devices to hotel rooms</p>
        </div>
      </div>

      <!-- Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-cyan-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Rooms</p>
          <p class="text-3xl font-bold text-cyan-600">{{ rooms().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Devices</p>
          <p class="text-3xl font-bold text-blue-600">{{ devices().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Assigned Devices</p>
          <p class="text-3xl font-bold text-green-600">{{ getAssignedDevicesCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Unassigned</p>
          <p class="text-3xl font-bold text-orange-600">{{ getUnassignedDevicesCount() }}</p>
        </div>
      </div>

      <!-- Connection Diagram -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-xl font-bold text-slate-900 mb-6">📊 Connection Architecture</h2>
        <div class="bg-slate-50 rounded-lg p-6 space-y-6">
          <!-- Database Structure -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Room Collection -->
            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h3 class="font-bold text-blue-900 mb-3">🏨 Room Collection</h3>
              <ul class="text-sm text-blue-800 space-y-2">
                <li>• _id (ObjectId)</li>
                <li>• roomNumber</li>
                <li>• roomType</li>
                <li>• floor</li>
                <li>• capacity</li>
                <li>• status</li>
                <li class="text-orange-600 font-semibold">• hotel (ref)</li>
              </ul>
            </div>

            <!-- Connection Arrow -->
            <div class="flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-2">↔️</div>
                <p class="text-sm font-bold text-slate-600">ONE-TO-MANY</p>
                <p class="text-xs text-slate-500">1 Room has<br/>Many Devices</p>
              </div>
            </div>

            <!-- Device Collection -->
            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <h3 class="font-bold text-green-900 mb-3">⚙️ Device Collection</h3>
              <ul class="text-sm text-green-800 space-y-2">
                <li>• _id (ObjectId)</li>
                <li>• deviceId</li>
                <li>• deviceType</li>
                <li>• status</li>
                <li>• battery</li>
                <li class="text-blue-600 font-semibold">• room (ref) ← KEY</li>
                <li class="text-blue-600 font-semibold">• roomNumber</li>
              </ul>
            </div>
          </div>

          <!-- How it Works -->
          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h4 class="font-bold text-yellow-900 mb-2">🔑 Key Connection Point</h4>
            <p class="text-sm text-yellow-800">
              <strong>Device.room</strong> is a MongoDB reference (ObjectId) to <strong>Room._id</strong>
              <br/>When you assign a device to a room, you're setting: <code class="bg-yellow-100 px-2 py-1 rounded">device.room = room._id</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Assignment Interface -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-6">📍 Assign Devices to Rooms</h2>

        <!-- Search & Filter -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            [(ngModel)]="searchRoom"
            (keyup)="filterRooms()"
            placeholder="Search rooms by number..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600"
          />
          <select
            [(ngModel)]="selectedFloor"
            (change)="filterRooms()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600"
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
          <button
            (click)="resetFilters()"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition"
          >
            Reset Filters
          </button>
        </div>

        <!-- Rooms with Assignment Options -->
        <div class="space-y-4">
          @for (room of filteredRooms(); track room._id) {
            <div class="border border-slate-200 rounded-lg p-6 hover:shadow-md transition">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-bold text-slate-900">Room {{ room.roomNumber }}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {{ room.roomType }}
                    </span>
                    @if (room.floor) {
                      <span class="text-sm text-slate-600">Floor {{ room.floor }}</span>
                    }
                  </div>
                  <p class="text-sm text-slate-600 mt-1">Capacity: {{ room.capacity }} guests</p>
                </div>
              </div>

              <!-- Assigned Devices for this Room -->
              <div class="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-slate-900 mb-3">Assigned Devices ({{ getRoomDevices(room._id).length }})</h4>
                @if (getRoomDevices(room._id).length === 0) {
                  <p class="text-sm text-slate-500 italic">No devices assigned yet</p>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (device of getRoomDevices(room._id); track device._id) {
                      <div class="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                        <div class="flex-1">
                          <p class="font-medium text-slate-900">{{ device.deviceId }}</p>
                          <p class="text-xs text-slate-500">{{ getDeviceTypeLabel(device.deviceType) }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="{
                            'bg-green-100 text-green-700': device.status,
                            'bg-red-100 text-red-700': !device.status
                          }">
                            {{ device.status ? 'Online' : 'Offline' }}
                          </span>
                          <button
                            (click)="unassignDevice(device._id, room._id)"
                            class="text-red-600 hover:text-red-700 font-medium text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Assign New Device -->
              <div class="flex gap-2">
                <select
                  [(ngModel)]="deviceAssignments[room._id]"
                  [disabled]="getUnassignedDevices().length === 0"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600"
                >
                  <option value="">Select device to assign...</option>
                  @for (device of getUnassignedDevices(); track device._id) {
                    <option [value]="device._id">
                      {{ device.deviceId }} ({{ getDeviceTypeLabel(device.deviceType) }})
                    </option>
                  }
                </select>
                <button
                  (click)="assignDevice(room._id)"
                  [disabled]="!deviceAssignments[room._id] || isAssigning()"
                  class="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
                >
                  {{ isAssigning() ? '⏳' : '✓ Assign' }}
                </button>
              </div>
            </div>
          }

          @if (filteredRooms().length === 0) {
            <div class="text-center py-8">
              <p class="text-slate-600 font-semibold">No rooms found</p>
            </div>
          }
        </div>
      </div>

      <!-- Unassigned Devices -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-6">📦 Unassigned Devices</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Device ID</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Type</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Battery</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (device of getUnassignedDevices(); track device._id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-3 font-mono text-slate-900">{{ device.deviceId }}</td>
                  <td class="px-6 py-3 text-slate-600">
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {{ getDeviceTypeLabel(device.deviceType) }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-700': device.status,
                      'bg-red-100 text-red-700': !device.status
                    }">
                      {{ device.status ? '🟢 Online' : '🔴 Offline' }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-slate-600">
                    @if (device.battery !== undefined) {
                      <span [ngClass]="{
                        'text-green-600 font-semibold': device.battery > 50,
                        'text-orange-600 font-semibold': device.battery <= 50
                      }">
                        {{ device.battery }}%
                      </span>
                    } @else {
                      <span class="text-slate-400">—</span>
                    }
                  </td>
                  <td class="px-6 py-3 text-center">
                    <button
                      (click)="quickAssignToNextRoom(device._id)"
                      class="text-cyan-600 hover:text-cyan-700 font-medium text-xs"
                    >
                      Quick Assign
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (getUnassignedDevices().length === 0) {
            <div class="p-8 text-center">
              <p class="text-slate-600 font-semibold">✓ All devices are assigned!</p>
            </div>
          }
        </div>
      </div>

      <!-- Information -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-green-50 border border-green-300 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <p class="font-semibold">✓ {{ successMessage() }}</p>
        </div>
      }
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <p class="font-semibold">✗ {{ errorMessage() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class RoomDeviceAssignmentComponent implements OnInit {
  rooms = signal<Room[]>([]);
  devices = signal<Device[]>([]);
  filteredRooms = signal<Room[]>([]);

  isAssigning = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  searchRoom = '';
  selectedFloor = '';
  deviceAssignments: { [roomId: string]: string } = {};

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Simulated data
    this.rooms.set([
      {
        _id: 'room_1',
        roomNumber: '101',
        roomType: 'single',
        floor: 1,
        capacity: 1,
        status: 'available',
        assignedDevices: []
      },
      {
        _id: 'room_2',
        roomNumber: '102',
        roomType: 'double',
        floor: 1,
        capacity: 2,
        status: 'available',
        assignedDevices: []
      },
      {
        _id: 'room_3',
        roomNumber: '201',
        roomType: 'suite',
        floor: 2,
        capacity: 4,
        status: 'available',
        assignedDevices: []
      },
      {
        _id: 'room_4',
        roomNumber: '202',
        roomType: 'double',
        floor: 2,
        capacity: 2,
        status: 'occupied',
        assignedDevices: []
      },
      {
        _id: 'room_5',
        roomNumber: '301',
        roomType: 'deluxe',
        floor: 3,
        capacity: 2,
        status: 'available',
        assignedDevices: []
      }
    ]);

    this.devices.set([
      {
        _id: 'device_1',
        deviceId: 'lock_room_101',
        deviceType: 'smart_lock',
        status: true,
        battery: 85,
        tuyaDeviceId: 'tuya_1',
        room: 'room_1'
      },
      {
        _id: 'device_2',
        deviceId: 'motion_sensor_101',
        deviceType: 'motion_sensor',
        status: true,
        battery: 92,
        room: 'room_1'
      },
      {
        _id: 'device_3',
        deviceId: 'lock_room_102',
        deviceType: 'smart_lock',
        status: true,
        battery: 78,
        room: 'room_2'
      },
      {
        _id: 'device_4',
        deviceId: 'thermostat_201',
        deviceType: 'thermostat',
        status: true,
        battery: 45,
        room: 'room_3'
      },
      {
        _id: 'device_5',
        deviceId: 'light_sensor_001',
        deviceType: 'light',
        status: false,
        battery: 12,
        room: undefined // Unassigned
      },
      {
        _id: 'device_6',
        deviceId: 'speaker_001',
        deviceType: 'speaker',
        status: true,
        battery: undefined,
        room: undefined // Unassigned
      }
    ]);

    this.filteredRooms.set(this.rooms());
  }

  filterRooms(): void {
    let filtered = this.rooms();

    if (this.searchRoom) {
      filtered = filtered.filter(r =>
        r.roomNumber.toLowerCase().includes(this.searchRoom.toLowerCase())
      );
    }

    if (this.selectedFloor) {
      filtered = filtered.filter(r => r.floor?.toString() === this.selectedFloor);
    }

    this.filteredRooms.set(filtered);
  }

  resetFilters(): void {
    this.searchRoom = '';
    this.selectedFloor = '';
    this.filterRooms();
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

  getDeviceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'smart_lock': '🔐 Smart Lock',
      'motion_sensor': '🎯 Motion Sensor',
      'thermostat': '🌡️ Thermostat',
      'camera': '📹 Camera',
      'light': '💡 Light',
      'speaker': '🔊 Speaker'
    };
    return labels[type] || type;
  }

  assignDevice(roomId: string): void {
    const deviceId = this.deviceAssignments[roomId];
    if (!deviceId) {
      this.errorMessage.set('Please select a device');
      return;
    }

    this.isAssigning.set(true);

    setTimeout(() => {
      const device = this.devices().find(d => d._id === deviceId);
      const room = this.rooms().find(r => r._id === roomId);

      if (device && room) {
        device.room = roomId;
        device.roomNumber = parseInt(room.roomNumber);

        if (!room.assignedDevices) room.assignedDevices = [];
        room.assignedDevices.push(device);

        this.deviceAssignments[roomId] = '';
        this.successMessage.set(`✓ ${device.deviceId} assigned to Room ${room.roomNumber}`);
        setTimeout(() => this.successMessage.set(''), 3000);
      }

      this.isAssigning.set(false);
    }, 1000);
  }

  unassignDevice(deviceId: string, roomId: string): void {
    const device = this.devices().find(d => d._id === deviceId);
    const room = this.rooms().find(r => r._id === roomId);

    if (device && room) {
      device.room = undefined;
      device.roomNumber = undefined;

      if (room.assignedDevices) {
        room.assignedDevices = room.assignedDevices.filter(d => d._id !== deviceId);
      }

      this.successMessage.set(`✓ ${device.deviceId} unassigned from Room ${room.roomNumber}`);
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }

  quickAssignToNextRoom(deviceId: string): void {
    const device = this.devices().find(d => d._id === deviceId);
    if (!device) return;

    const unassignedRooms = this.rooms().filter(r => !this.getRoomDevices(r._id).some(d => d.deviceType === device.deviceType));

    if (unassignedRooms.length === 0) {
      this.errorMessage.set('No available rooms for this device type');
      return;
    }

    const targetRoom = unassignedRooms[0];
    this.deviceAssignments[targetRoom._id] = deviceId;
    this.assignDevice(targetRoom._id);
  }
}
