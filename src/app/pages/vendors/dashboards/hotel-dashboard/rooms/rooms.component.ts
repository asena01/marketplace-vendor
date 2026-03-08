import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { AuthService } from '../../../../../services/auth.service';

interface Room {
  _id?: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'suite' | 'deluxe' | 'villa';
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'blocked';
  amenities?: string[];
  images?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Rooms Management</h1>
          <p class="text-slate-600 mt-1">Manage hotel rooms and availability</p>
        </div>
        <button
          (click)="openAddRoomModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add New Room
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterRooms()"
              placeholder="Search room number..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
            <select
              [(ngModel)]="selectedType"
              (change)="filterRooms()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
              <option value="villa">Villa</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterRooms()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Rooms Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <p class="text-slate-600 text-sm font-medium">Total Rooms</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredRooms().length }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Available</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countByStatus('available') }}</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Occupied</p>
          <p class="text-2xl font-bold text-blue-600">{{ countByStatus('occupied') }}</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Cleaning</p>
          <p class="text-2xl font-bold text-yellow-600">{{ countByStatus('cleaning') }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Maintenance</p>
          <p class="text-2xl font-bold text-red-600">{{ countByStatus('maintenance') }}</p>
        </div>
      </div>

      <!-- Rooms Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room #</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Floor</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Capacity</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price/Night</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredRooms().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No rooms found
                  </td>
                </tr>
              } @else {
                @for (room of filteredRooms(); track room._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ room.roomNumber }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ room.roomType | titlecase }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ room.floor }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ room.capacity }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900">
                      <span class="currency-prefix">$</span>{{ room.pricePerNight }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': room.status === 'available',
                          'bg-blue-100 text-blue-700': room.status === 'occupied',
                          'bg-yellow-100 text-yellow-700': room.status === 'cleaning',
                          'bg-red-100 text-red-700': room.status === 'maintenance',
                          'bg-slate-100 text-slate-700': room.status === 'blocked'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ room.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="editRoom(room)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteRoom(room._id)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Room Modal -->
      @if (showRoomModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Room' : 'Add New Room' }}
            </h2>

            <form (ngSubmit)="saveRoom()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Room Number -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Room Number *</label>
                  <input
                    type="text"
                    [(ngModel)]="newRoom.roomNumber"
                    name="roomNumber"
                    placeholder="e.g., 101"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Room Type -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Room Type *</label>
                  <select
                    [(ngModel)]="newRoom.roomType"
                    name="roomType"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>

                <!-- Floor -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Floor *</label>
                  <input
                    type="number"
                    [(ngModel)]="newRoom.floor"
                    name="floor"
                    placeholder="e.g., 1"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Capacity -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Capacity *</label>
                  <input
                    type="number"
                    [(ngModel)]="newRoom.capacity"
                    name="capacity"
                    placeholder="e.g., 2"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Price Per Night -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Price Per Night *</label>
                  <input
                    type="number"
                    [(ngModel)]="newRoom.pricePerNight"
                    name="pricePerNight"
                    placeholder="e.g., 150"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                  <select
                    [(ngModel)]="newRoom.status"
                    name="status"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="newRoom.description"
                  name="description"
                  placeholder="Room description and special features..."
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Modal Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeRoomModal()"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {{ isEditing() ? 'Update Room' : 'Create Room' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Success/Error Messages -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-lg shadow-lg">
          {{ successMessage() }}
        </div>
      }
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class HotelRoomsComponent implements OnInit {
  rooms = signal<Room[]>([]);
  filteredRooms = signal<Room[]>([]);
  showRoomModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedType = signal('');
  selectedStatus = signal('');
  successMessage = signal('');
  errorMessage = signal('');

  newRoom: Room = this.getEmptyRoom();

  private hotelId: string = '';

  constructor(
    private hotelService: HotelService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.hotelId = localStorage.getItem('hotelId') || '';
    this.loadRooms();
  }

  loadRooms() {
    // TODO: Load rooms from hotelService
    // For now, using mock data
    const mockRooms: Room[] = [
      {
        _id: '1',
        roomNumber: '101',
        roomType: 'single',
        floor: 1,
        capacity: 1,
        pricePerNight: 50,
        status: 'available',
        description: 'Cozy single room with city view'
      },
      {
        _id: '2',
        roomNumber: '102',
        roomType: 'double',
        floor: 1,
        capacity: 2,
        pricePerNight: 80,
        status: 'occupied',
        description: 'Spacious double room'
      },
      {
        _id: '3',
        roomNumber: '103',
        roomType: 'suite',
        floor: 1,
        capacity: 4,
        pricePerNight: 150,
        status: 'available',
        description: 'Luxury suite with living area'
      }
    ];
    this.rooms.set(mockRooms);
    this.filterRooms();
  }

  filterRooms() {
    let filtered = this.rooms();

    if (this.searchQuery()) {
      filtered = filtered.filter(r =>
        r.roomNumber.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedType()) {
      filtered = filtered.filter(r => r.roomType === this.selectedType());
    }

    if (this.selectedStatus()) {
      filtered = filtered.filter(r => r.status === this.selectedStatus());
    }

    this.filteredRooms.set(filtered);
  }

  countByStatus(status: string): number {
    return this.rooms().filter(r => r.status === status).length;
  }

  openAddRoomModal() {
    this.isEditing.set(false);
    this.newRoom = this.getEmptyRoom();
    this.showRoomModal.set(true);
  }

  editRoom(room: Room) {
    this.isEditing.set(true);
    this.newRoom = { ...room };
    this.showRoomModal.set(true);
  }

  closeRoomModal() {
    this.showRoomModal.set(false);
    this.newRoom = this.getEmptyRoom();
    this.isEditing.set(false);
  }

  saveRoom() {
    if (!this.newRoom.roomNumber || !this.newRoom.floor || !this.newRoom.capacity) {
      this.errorMessage.set('Please fill in all required fields');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.isEditing()) {
      // Update existing room
      const index = this.rooms().findIndex(r => r._id === this.newRoom._id);
      if (index !== -1) {
        const updated = [...this.rooms()];
        updated[index] = this.newRoom;
        this.rooms.set(updated);
      }
      this.successMessage.set('Room updated successfully!');
    } else {
      // Add new room
      this.newRoom._id = Date.now().toString();
      this.rooms.set([...this.rooms(), this.newRoom]);
      this.successMessage.set('Room created successfully!');
    }

    this.filterRooms();
    this.closeRoomModal();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  deleteRoom(roomId?: string) {
    if (!roomId) return;

    if (confirm('Are you sure you want to delete this room?')) {
      this.rooms.set(this.rooms().filter(r => r._id !== roomId));
      this.filterRooms();
      this.successMessage.set('Room deleted successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }

  private getEmptyRoom(): Room {
    return {
      roomNumber: '',
      roomType: 'single',
      floor: 1,
      capacity: 1,
      pricePerNight: 0,
      status: 'available'
    };
  }
}
