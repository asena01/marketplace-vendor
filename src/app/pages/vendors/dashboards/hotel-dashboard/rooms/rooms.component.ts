import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { AuthService } from '../../../../../services/auth.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';
import { forkJoin } from 'rxjs';

interface Room {
  _id?: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'suite' | 'deluxe' | 'villa';
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
  displayStatus?: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
  amenities?: string[];
  images?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoomTask {
  _id?: string;
  room?: { _id?: string; roomNumber?: string; floor?: number; status?: string } | string;
  roomNumber: string;
  booking?: { bookingNumber?: string; checkOutDate?: string; status?: string } | string;
  taskType: 'checkout-cleaning' | 'stayover-cleaning' | 'deep-cleaning' | 'maintenance' | 'inspection' | 'minibar-restock' | 'room-service-delivery' | 'hotel-service-request';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  dueAt?: string;
  assignedStaff?: { _id?: string; name?: string; position?: string; department?: string } | string;
  completionNotes?: string;
  source?: string;
}

interface StaffOption {
  _id: string;
  name: string;
  position: string;
  department: string;
}

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">Rooms Management</h1>
            <p class="text-blue-100">Manage room inventory with booking-synced availability</p>
          </div>
          <button
            (click)="openAddRoomModal()"
            class="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg hover:bg-blue-50 transition"
          >
            ➕ Add New Room
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading rooms...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Search & Filter Bar -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (keyup)="filterRooms()"
          placeholder="Search by room number..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
        <select
          [(ngModel)]="selectedType"
          (change)="filterRooms()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
          <option value="villa">Villa</option>
        </select>
        <select
          [(ngModel)]="selectedStatus"
          (change)="filterRooms()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
        <p class="text-sm font-medium">
          Room availability shown here is derived from both room records and active bookings.
        </p>
      </div>

      <!-- Rooms Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-slate-500">
          <p class="text-slate-600 text-sm font-medium">Total Rooms</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ rooms().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Available</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('available') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Occupied</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('occupied') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-indigo-500">
          <p class="text-slate-600 text-sm font-medium">Reserved</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('reserved') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Cleaning</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('cleaning') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Maintenance</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('maintenance') }}</p>
        </div>
      </div>

      <div class="space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Room Operations Queue</h2>
            <p class="mt-1 text-sm text-slate-500">
              Checkout cleaning tasks are created automatically after checkout. Assign housekeeping, inspections, and maintenance from here.
            </p>
          </div>
          <div class="flex flex-col gap-3 md:flex-row">
            <select
              [(ngModel)]="selectedTaskType"
              (change)="loadRoomTasks()"
              class="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Task Types</option>
              <option value="checkout-cleaning">Checkout Cleaning</option>
              <option value="stayover-cleaning">Stayover Cleaning</option>
              <option value="deep-cleaning">Deep Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="minibar-restock">Minibar Restock</option>
            </select>
            <select
              [(ngModel)]="selectedTaskStatus"
              (change)="loadRoomTasks()"
              class="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              (click)="openTaskModal()"
              class="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800"
            >
              Create Room Task
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Open Tasks</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ countTasksByStatus('open') + countTasksByStatus('assigned') + countTasksByStatus('in-progress') }}</p>
          </div>
          <div class="rounded-lg bg-amber-50 p-4">
            <p class="text-sm text-slate-500">Cleaning Tasks</p>
            <p class="mt-2 text-2xl font-bold text-amber-700">{{ countTasksByType('checkout-cleaning') + countTasksByType('stayover-cleaning') + countTasksByType('deep-cleaning') }}</p>
          </div>
          <div class="rounded-lg bg-red-50 p-4">
            <p class="text-sm text-slate-500">Maintenance Tasks</p>
            <p class="mt-2 text-2xl font-bold text-red-700">{{ countTasksByType('maintenance') }}</p>
          </div>
          <div class="rounded-lg bg-emerald-50 p-4">
            <p class="text-sm text-slate-500">Completed</p>
            <p class="mt-2 text-2xl font-bold text-emerald-700">{{ countTasksByStatus('completed') }}</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full min-w-[1180px]">
            <thead class="border-b border-slate-200 bg-slate-100">
              <tr>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Room</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Task</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Scheduled</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Priority</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Assigned</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @if (roomTasks().length === 0) {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-slate-500">No room tasks found for the current filter.</td>
                </tr>
              } @else {
                @for (task of roomTasks(); track task._id) {
                  <tr>
                    <td class="px-5 py-4">
                      <p class="font-medium text-slate-900">{{ task.roomNumber }}</p>
                      <p class="text-xs text-slate-500">Source: {{ formatTaskLabel(task.source || 'manual') }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-medium text-slate-900">{{ task.title }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ formatTaskLabel(task.taskType) }}</p>
                    </td>
                    <td class="px-5 py-4 text-sm text-slate-600">
                      <p>{{ formatDate(task.scheduledDate) }}</p>
                      @if (task.booking && $any(task.booking).bookingNumber) {
                        <p class="mt-1 text-xs text-slate-400">Booking {{ $any(task.booking).bookingNumber }}</p>
                      }
                    </td>
                    <td class="px-5 py-4 text-sm">
                      <span class="rounded-full px-3 py-1 text-xs font-semibold"
                        [ngClass]="{
                          'bg-slate-100 text-slate-700': task.priority === 'low',
                          'bg-blue-100 text-blue-700': task.priority === 'medium',
                          'bg-amber-100 text-amber-700': task.priority === 'high',
                          'bg-red-100 text-red-700': task.priority === 'critical'
                        }"
                      >
                        {{ task.priority | titlecase }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <select
                        [ngModel]="assignedStaffId(task)"
                        (ngModelChange)="assignTask(task, $event)"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        @for (staff of staffOptionsForTask(task); track staff._id) {
                          <option [value]="staff._id">{{ staff.name }} · {{ formatTaskLabel(staff.position) }}</option>
                        }
                      </select>
                    </td>
                    <td class="px-5 py-4">
                      <span class="rounded-full px-3 py-1 text-xs font-semibold"
                        [ngClass]="{
                          'bg-slate-100 text-slate-700': task.status === 'open',
                          'bg-sky-100 text-sky-700': task.status === 'assigned',
                          'bg-amber-100 text-amber-700': task.status === 'in-progress',
                          'bg-emerald-100 text-emerald-700': task.status === 'completed',
                          'bg-red-100 text-red-700': task.status === 'cancelled'
                        }"
                      >
                        {{ formatTaskLabel(task.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-wrap gap-2">
                        @if (task.status !== 'completed') {
                          <button (click)="markTaskStatus(task, 'in-progress')" class="text-sm font-medium text-blue-600 hover:text-blue-700">Start</button>
                          <button (click)="markTaskStatus(task, 'completed')" class="text-sm font-medium text-emerald-600 hover:text-emerald-700">Complete</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
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
            <tbody class="divide-y divide-slate-200">
              @if (filteredRooms().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No rooms found
                  </td>
                </tr>
              } @else {
                @for (room of paginatedRooms(); track room._id) {
                  <tr class="hover:bg-slate-50 transition">
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
                          'bg-emerald-100 text-emerald-700': (room.displayStatus || room.status) === 'available',
                          'bg-blue-100 text-blue-700': (room.displayStatus || room.status) === 'occupied',
                          'bg-indigo-100 text-indigo-700': (room.displayStatus || room.status) === 'reserved',
                          'bg-yellow-100 text-yellow-700': (room.displayStatus || room.status) === 'cleaning',
                          'bg-red-100 text-red-700': (room.displayStatus || room.status) === 'maintenance'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ (room.displayStatus || room.status) | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <div class="flex gap-2">
                        <button
                          (click)="editRoom(room)"
                          class="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          (click)="deleteRoom(room._id)"
                          class="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            <p class="text-sm text-slate-500">
              Showing {{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} of {{ filteredRooms().length }} rooms
            </p>
            <div class="flex items-center gap-2">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Previous
              </button>
              <span class="text-sm font-medium text-slate-700">Page {{ currentPage }} of {{ totalPages() }}</span>
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages()"
                class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        }
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
                    <option value="reserved">Reserved</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <!-- Room Images -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Room Images</label>

                @if (isUploadingImages()) {
                  <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span class="text-sm font-medium text-blue-900">Uploading images...</span>
                    </div>
                  </div>
                }

                <div
                  class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                  (dragover)="$event.preventDefault(); isDragging.set(true)"
                  (dragleave)="isDragging.set(false)"
                  (drop)="onDropImages($event)"
                  [class.border-blue-500]="isDragging()"
                  [class.bg-blue-50]="isDragging()"
                  [class.opacity-50]="isUploadingImages()"
                  [class.pointer-events-none]="isUploadingImages()"
                >
                  <input
                    #imageInput
                    type="file"
                    multiple
                    accept="image/*"
                    (change)="onImageSelected($event)"
                    [disabled]="isUploadingImages()"
                    style="display: none"
                    class="hidden"
                  />
                  <div (click)="imageInput.click()" [class.cursor-not-allowed]="isUploadingImages()">
                    <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>

                @if (newRoom.images && newRoom.images.length > 0) {
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-700 mb-3">Room Images ({{ newRoom.images.length }})</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      @for (img of newRoom.images; track img) {
                        <div class="relative group">
                          <img [src]="img" alt="Room image" class="w-full h-24 object-cover rounded-lg border-2 border-slate-300 group-hover:opacity-75 transition" />
                          <button
                            type="button"
                            (click)="removeImage(img)"
                            [disabled]="isUploadingImages()"
                            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition rounded-lg disabled:opacity-50"
                          >
                            <span class="text-2xl">×</span>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
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

      @if (showTaskModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">Create Room Task</h2>
                <p class="mt-1 text-sm text-slate-500">Use this for manual maintenance, inspections, restocking, or planned cleaning.</p>
              </div>
              <button (click)="closeTaskModal()" class="text-xl text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form (ngSubmit)="saveTask()" class="mt-6 space-y-5">
              <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Room *</label>
                  <select [(ngModel)]="newTask.roomId" name="roomId" required class="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="">Select room</option>
                    @for (room of rooms(); track room._id) {
                      <option [value]="room._id">{{ room.roomNumber }} · Floor {{ room.floor }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Task Type *</label>
                  <select [(ngModel)]="newTask.taskType" name="taskType" required class="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="checkout-cleaning">Checkout Cleaning</option>
                    <option value="stayover-cleaning">Stayover Cleaning</option>
                    <option value="deep-cleaning">Deep Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="minibar-restock">Minibar Restock</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Scheduled Date *</label>
                  <input [(ngModel)]="newTask.scheduledDate" name="scheduledDate" type="date" required class="w-full rounded-lg border border-slate-300 px-4 py-2" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                  <select [(ngModel)]="newTask.priority" name="priority" class="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input [(ngModel)]="newTask.title" name="title" class="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea [(ngModel)]="newTask.description" name="description" rows="3" class="w-full rounded-lg border border-slate-300 px-4 py-2"></textarea>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Assign To</label>
                <select [(ngModel)]="newTask.assignedStaffId" name="assignedStaffId" class="w-full rounded-lg border border-slate-300 px-4 py-2">
                  <option value="">Leave unassigned</option>
                  @for (staff of staffOptionsForTaskType(newTask.taskType); track staff._id) {
                    <option [value]="staff._id">{{ staff.name }} · {{ formatTaskLabel(staff.position) }}</option>
                  }
                </select>
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="closeTaskModal()" class="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" class="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-800">Create Task</button>
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
  paginatedRooms = signal<Room[]>([]);
  roomTasks = signal<RoomTask[]>([]);
  staffOptions = signal<StaffOption[]>([]);
  showRoomModal = signal(false);
  showTaskModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedType = signal('');
  selectedStatus = signal('');
  selectedTaskType = signal('');
  selectedTaskStatus = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isUploadingImages = signal(false);
  isDragging = signal(false);
  currentPage = 1;
  readonly itemsPerPage = 10;

  newRoom: Room = this.getEmptyRoom();
  newTask = this.getEmptyTask();

  private hotelId: string = '';

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit() {
    // Try to get hotelId, fallback to userId for backward compatibility with existing sessions
    this.hotelId = localStorage.getItem('hotelId') || localStorage.getItem('userId') || '';
    this.loadRooms();
  }

  loadRooms() {
    if (!this.hotelId) {
      this.errorMessage.set('Hotel ID not found');
      return;
    }

    this.isLoading.set(true);
    forkJoin({
      rooms: this.hotelService.getRooms(1, 200),
      bookings: this.hotelService.getHotelBookings(1, 500),
      staff: this.hotelService.getStaff(1, 200, 'active')
    }).subscribe({
      next: ({ rooms: response, bookings: bookingsResponse, staff: staffResponse }: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          const bookings = bookingsResponse.status === 'success' && Array.isArray(bookingsResponse.data)
            ? bookingsResponse.data
            : [];
          const syncedRooms = response.data.map((room: Room) => this.mapRoomWithBookingStatus(room, bookings));
          this.rooms.set(syncedRooms);
          this.staffOptions.set(
            staffResponse.status === 'success' && Array.isArray(staffResponse.data)
              ? staffResponse.data
              : []
          );
          this.errorMessage.set('');
          this.filterRooms();
          this.loadRoomTasks();
        } else {
          // Fallback to empty array if no data
          this.rooms.set([]);
          this.staffOptions.set([]);
          this.filterRooms();
          this.loadRoomTasks();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading rooms:', error);
        this.errorMessage.set('Failed to load rooms. Please try again later.');
        // Keep existing rooms in case of error
        this.filterRooms();
      }
    });
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
      filtered = filtered.filter(r => (r.displayStatus || r.status) === this.selectedStatus());
    }

    this.filteredRooms.set(filtered);
    this.currentPage = 1;
    this.updatePaginatedRooms();
  }

  countByStatus(status: string): number {
    return this.rooms().filter(r => (r.displayStatus || r.status) === status).length;
  }

  loadRoomTasks(): void {
    this.hotelService.getRoomTasks(1, 100, this.selectedTaskStatus() || undefined, this.selectedTaskType() || undefined).subscribe({
      next: (response: any) => {
        this.roomTasks.set(response.status === 'success' && Array.isArray(response.data) ? response.data : []);
      },
      error: (error: any) => {
        console.error('Error loading room tasks:', error);
        this.roomTasks.set([]);
      }
    });
  }

  countTasksByStatus(status: RoomTask['status']): number {
    return this.roomTasks().filter((task) => task.status === status).length;
  }

  countTasksByType(taskType: RoomTask['taskType']): number {
    return this.roomTasks().filter((task) => task.taskType === taskType).length;
  }

  updatePaginatedRooms(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedRooms.set(this.filteredRooms().slice(start, end));
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRooms().length / this.itemsPerPage));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePaginatedRooms();
  }

  pageStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  pageEndIndex(): number {
    return Math.min(this.pageStartIndex() + this.itemsPerPage, this.filteredRooms().length);
  }

  openAddRoomModal() {
    this.isEditing.set(false);
    this.newRoom = this.getEmptyRoom();
    this.showRoomModal.set(true);
  }

  openTaskModal() {
    this.newTask = this.getEmptyTask();
    this.showTaskModal.set(true);
  }

  closeTaskModal() {
    this.showTaskModal.set(false);
    this.newTask = this.getEmptyTask();
  }

  saveTask(): void {
    if (!this.newTask.roomId || !this.newTask.taskType || !this.newTask.scheduledDate) {
      this.errorMessage.set('Please complete the room task form.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    this.hotelService.createRoomTask({
      roomId: this.newTask.roomId,
      taskType: this.newTask.taskType,
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      scheduledDate: this.newTask.scheduledDate,
      dueAt: this.newTask.scheduledDate,
      assignedStaff: this.newTask.assignedStaffId || undefined,
      assignedBy: currentUser?._id,
      assignedByName: currentUser?.name || currentUser?.email || 'hotel-admin'
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.flashSuccess('Room task created successfully.');
          this.closeTaskModal();
          this.loadRoomTasks();
          this.loadRooms();
          return;
        }
        this.errorMessage.set('Failed to create room task.');
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to create room task.');
      }
    });
  }

  assignTask(task: RoomTask, assignedStaffId: string): void {
    const currentUser = this.authService.getCurrentUser();
    this.hotelService.assignRoomTask(
      task._id || '',
      assignedStaffId || undefined,
      currentUser?._id,
      currentUser?.name || currentUser?.email || 'hotel-admin'
    ).subscribe({
      next: () => {
        this.loadRoomTasks();
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to update task assignment.');
      }
    });
  }

  markTaskStatus(task: RoomTask, status: RoomTask['status']): void {
    this.hotelService.updateRoomTaskStatus(task._id || '', status).subscribe({
      next: () => {
        this.loadRoomTasks();
        this.loadRooms();
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to update task status.');
      }
    });
  }

  assignedStaffId(task: RoomTask): string {
    if (!task.assignedStaff) return '';
    return typeof task.assignedStaff === 'string' ? task.assignedStaff : task.assignedStaff._id || '';
  }

  staffOptionsForTask(task: RoomTask): StaffOption[] {
    return this.staffOptionsForTaskType(task.taskType);
  }

  staffOptionsForTaskType(taskType: RoomTask['taskType']): StaffOption[] {
    return this.staffOptions().filter((staff) => {
      if (taskType === 'maintenance') {
        return ['maintenance', 'manager'].includes(staff.position) || ['maintenance', 'admin'].includes(staff.department || '');
      }

      if (taskType === 'room-service-delivery') {
        return ['waiter', 'chef', 'bellboy', 'manager'].includes(staff.position) ||
          ['restaurant', 'kitchen'].includes(staff.department || '');
      }

      if (taskType === 'hotel-service-request') {
        return ['receptionist', 'bellboy', 'manager'].includes(staff.position) ||
          ['front-office', 'admin'].includes(staff.department || '');
      }

      return ['housekeeping', 'housekeeper', 'manager'].includes(staff.position) ||
        ['housekeeping', 'admin'].includes(staff.department || '');
    });
  }

  formatTaskLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatDate(value?: string): string {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  editRoom(room: Room) {
    this.isEditing.set(true);
    this.newRoom = { ...room };
    // Ensure images array is properly initialized for editing
    if (!this.newRoom.images) {
      this.newRoom.images = [];
    }
    // Create a new array to avoid mutating the original room's images
    this.newRoom.images = [...this.newRoom.images];
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

    if (this.isEditing() && this.newRoom._id) {
      // Update existing room via API
      this.isLoading.set(true);
      this.hotelService.updateRoom(this.newRoom._id, this.newRoom).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.successMessage.set('Room updated successfully!');
            this.loadRooms();
          } else {
            this.errorMessage.set('Failed to update room');
          }
          this.closeRoomModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to update room');
          console.error('Error updating room:', error);
        }
      });
    } else {
      // Create new room via API
      this.isLoading.set(true);
      this.hotelService.createRoom(this.newRoom).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success' && response.data) {
            this.successMessage.set('Room created successfully!');
            this.loadRooms();
          } else {
            this.errorMessage.set('Failed to create room');
          }
          this.closeRoomModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to create room');
          console.error('Error creating room:', error);
        }
      });
    }
  }

  deleteRoom(roomId?: string) {
    if (!roomId) return;

    if (confirm('Are you sure you want to delete this room?')) {
      this.isLoading.set(true);
      this.hotelService.deleteRoom(roomId).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.successMessage.set('Room deleted successfully!');
            this.loadRooms();
            setTimeout(() => this.successMessage.set(''), 3000);
          } else {
            this.errorMessage.set('Failed to delete room');
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete room');
          console.error('Error deleting room:', error);
        }
      });
    }
  }

  // IMAGE UPLOAD METHODS
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files: File[] = Array.from(input.files || []);

    if (!files.length) return;

    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        this.errorMessage.set(`File "${file.name}" is too large. Max size is 10MB.`);
        return;
      }

      if (!validTypes.includes(file.type)) {
        this.errorMessage.set(`File "${file.name}" is not a valid image format.`);
        return;
      }
    }

    this.isUploadingImages.set(true);

    // Generate upload path
    const uploadPath = `rooms/${this.hotelId}/${this.newRoom.roomNumber || 'new'}`;

    // Use ImageUploadService to upload multiple images
    this.imageUploadService.uploadMultipleImages(files, uploadPath).subscribe({
      next: (imageUrls: string[]) => {
        if (!imageUrls.length) {
          this.errorMessage.set('Upload failed: No image URLs returned');
          this.isUploadingImages.set(false);
          return;
        }

        // Initialize images array if not exists
        if (!this.newRoom.images) {
          this.newRoom.images = [];
        }

        // Add new images to existing ones
        this.newRoom.images = [...this.newRoom.images, ...imageUrls];

        this.isUploadingImages.set(false);
        this.successMessage.set(`✅ ${imageUrls.length} image(s) uploaded successfully`);

        console.log(`✅ Room images uploaded: ${imageUrls.length} total`);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.isUploadingImages.set(false);
        const errorMsg = error?.message || 'Unknown error';
        this.errorMessage.set(`Upload failed: ${errorMsg}`);
        console.error('❌ Image upload error:', error);
      }
    });

    // Clear input
    input.value = '';
  }

  removeImage(image: string): void {
    if (this.newRoom.images) {
      this.newRoom.images = this.newRoom.images.filter(img => img !== image);
      console.log('🗑️ Room image removed');
    }
  }

  onDropImages(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      // Create a synthetic event
      const syntheticEvent = {
        target: {
          files: files
        }
      } as any;
      this.onImageSelected(syntheticEvent);
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

  private getEmptyTask() {
    return {
      roomId: '',
      taskType: 'checkout-cleaning' as RoomTask['taskType'],
      title: '',
      description: '',
      priority: 'medium' as RoomTask['priority'],
      scheduledDate: new Date().toISOString().slice(0, 10),
      assignedStaffId: ''
    };
  }

  private flashSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  private mapRoomWithBookingStatus(room: Room, bookings: any[]): Room {
    const activeBooking = bookings.find((booking) =>
      (booking.room?._id === room._id || booking.room === room._id) &&
      ['pending', 'confirmed', 'checked-in'].includes(booking.status)
    );

    let displayStatus: Room['displayStatus'] = room.status;

    if (room.status !== 'maintenance' && room.status !== 'cleaning') {
      if (activeBooking?.status === 'checked-in') {
        displayStatus = 'occupied';
      } else if (activeBooking?.status === 'confirmed' || activeBooking?.status === 'pending') {
        displayStatus = 'reserved';
      } else if (room.status === 'occupied' || room.status === 'reserved') {
        displayStatus = 'available';
      }
    }

    return {
      ...room,
      displayStatus
    };
  }
}
