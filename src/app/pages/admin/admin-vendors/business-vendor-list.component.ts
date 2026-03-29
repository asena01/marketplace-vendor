import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-business-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Page Header -->
      <div class="flex items-center gap-3 mb-4">
        <button
          (click)="goBack()"
          class="text-gray-600 hover:text-gray-900 transition"
          title="Back to Businesses"
        >
          <span class="material-icons text-2xl">arrow_back</span>
        </button>
        <span [class]="'material-icons text-3xl ' + getCategoryColor()">{{ getCategoryIcon() }}</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ getCategoryLabel() }} Vendors</h2>
          <p class="text-xs text-gray-600">{{ vendors().length }} vendors registered</p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search vendors..."
          class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          (click)="filterVendors()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">filter_list</span>
          <span class="hidden sm:inline">Filter</span>
        </button>
      </div>

      <!-- Vendors List -->
      <div class="space-y-3">
        @if (filteredVendors().length === 0) {
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <span class="material-icons text-6xl text-gray-300 mx-auto mb-4 block">business</span>
            <p class="text-gray-600 font-medium">No vendors found</p>
            <p class="text-gray-400 text-sm mt-1">
              @if (vendors().length === 0) {
                No {{ getCategoryLabel() | lowercase }} vendors have registered yet. Vendors can sign up through the main platform.
              } @else {
                Try adjusting your filters or search terms.
              }
            </p>
          </div>
        } @else {
          @for (vendor of filteredVendors(); track vendor._id) {
            <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <!-- Vendor Summary Row -->
              <button
                (click)="toggleVendorDetails(vendor._id)"
                class="w-full px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
              >
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="material-icons text-blue-600">business</span>
                  </div>
                  <div class="text-left min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-gray-800 truncate">{{ vendor.name }}</h3>
                    <p class="text-xs text-gray-600 truncate">{{ vendor.email }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span [class]="'inline-block px-2 py-1 rounded text-xs font-semibold ' + getStatusBadgeClass(vendor.status)">
                      {{ vendor.status }}
                    </span>
                  </div>
                </div>
                <span class="material-icons text-gray-400 ml-2 transition-transform" [style.transform]="expandedVendor() === vendor._id ? 'rotate(180deg)' : 'rotate(0deg)'">
                  expand_more
                </span>
              </button>

              <!-- Vendor Details (Collapsible) -->
              @if (expandedVendor() === vendor._id) {
                <div class="border-t border-gray-200 bg-gray-50">
                  <!-- Vendor Header Info -->
                  <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-200">
                    <div>
                      <p class="text-xs text-gray-600 font-medium">Phone</p>
                      <p class="text-sm text-gray-800 font-semibold">{{ vendor.phone || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600 font-medium">KYC Status</p>
                      <span [class]="'inline-block px-2 py-1 rounded text-xs font-semibold ' + getKycBadgeClass(vendor.kycStatus)">
                        {{ vendor.kycStatus || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600 font-medium">Rating</p>
                      <div class="flex items-center gap-1">
                        <span class="material-icons text-yellow-500 text-sm">star</span>
                        <span class="text-sm text-gray-800 font-semibold">{{ vendor.rating || 0 }}/5</span>
                      </div>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600 font-medium">Joined</p>
                      <p class="text-sm text-gray-800 font-semibold">{{ vendor.createdAt ? (vendor.createdAt | date:'short') : 'N/A' }}</p>
                    </div>
                  </div>

                  <!-- Category-Specific Sections -->
                  <div class="px-6 py-4 space-y-3">
                    @switch (businessType) {
                      @case ('hotels') {
                        <!-- Hotels Specific Sections -->
                        <div class="space-y-3">
                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            <button
                              (click)="toggleSection(vendor._id, 'staff')"
                              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                              <div class="flex items-center gap-2">
                                <span class="material-icons text-blue-600 text-sm">people</span>
                                <span class="text-sm font-semibold text-gray-800">Staff Users</span>
                              </div>
                              <span class="material-icons text-gray-400 text-sm transition-transform"
                                [style.transform]="openSection(vendor._id) === 'staff' ? 'rotate(180deg)' : 'rotate(0deg)'"
                              >expand_more</span>
                            </button>
                            @if (openSection(vendor._id) === 'staff') {
                              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div class="mb-3">
                                  <button
                                    (click)="loadStaff(vendor._id); showAddStaffModal.set(!showAddStaffModal())"
                                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                                  >
                                    <span class="material-icons text-sm">add</span>
                                    Add Staff
                                  </button>
                                </div>
                                @if (showAddStaffModal()) {
                                  <div class="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
                                    <input
                                      type="text"
                                      [(ngModel)]="newStaffName"
                                      placeholder="Name"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-1 text-xs"
                                    />
                                    <input
                                      type="email"
                                      [(ngModel)]="newStaffEmail"
                                      placeholder="Email"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-1 text-xs"
                                    />
                                    <select
                                      [(ngModel)]="newStaffRole"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-xs"
                                    >
                                      <option value="staff">Staff</option>
                                      <option value="manager">Manager</option>
                                      <option value="receptionist">Receptionist</option>
                                      <option value="housekeeping">Housekeeping</option>
                                    </select>
                                    <button
                                      (click)="addStaff(vendor._id)"
                                      class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                }
                                @if (staffList().length > 0) {
                                  <div class="text-xs">
                                    @for (staff of staffList(); track staff.id) {
                                      <div class="flex items-center justify-between p-2 border-t border-gray-200">
                                        <div>
                                          <p class="font-semibold text-gray-800">{{ staff.name }}</p>
                                          <p class="text-gray-600">{{ staff.email }} • {{ staff.role }}</p>
                                        </div>
                                        <button
                                          (click)="deleteStaff(staff.id)"
                                          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    }
                                  </div>
                                } @else {
                                  <p class="text-gray-600 text-xs py-2">No staff members added yet</p>
                                }
                              </div>
                            }
                          </div>

                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            <button
                              (click)="toggleSection(vendor._id, 'devices')"
                              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                              <div class="flex items-center gap-2">
                                <span class="material-icons text-green-600 text-sm">devices</span>
                                <span class="text-sm font-semibold text-gray-800">Smart Devices</span>
                              </div>
                              <span class="material-icons text-gray-400 text-sm transition-transform"
                                [style.transform]="openSection(vendor._id) === 'devices' ? 'rotate(180deg)' : 'rotate(0deg)'"
                              >expand_more</span>
                            </button>
                            @if (openSection(vendor._id) === 'devices') {
                              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div class="mb-3">
                                  <button
                                    (click)="loadDevices(vendor._id)"
                                    [disabled]="devicesLoading()"
                                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition disabled:opacity-50"
                                  >
                                    <span class="material-icons text-sm inline-block mr-1" [style.display]="'inline'">refresh</span>
                                    {{ devicesLoading() ? 'Loading...' : 'Load Devices' }}
                                  </button>
                                </div>
                                @if (devicesList().length > 0) {
                                  <div class="text-xs space-y-2">
                                    @for (device of devicesList(); track device._id || device.deviceId) {
                                      <div class="flex items-center justify-between p-2 border border-gray-200 rounded bg-white">
                                        <div>
                                          <p class="font-semibold text-gray-800">{{ device.name || device.deviceId }}</p>
                                          <p class="text-gray-600">{{ device.type || 'Device' }} •
                                            <span [class]="device.status === 'active' ? 'text-green-600 font-semibold' : 'text-red-600'">
                                              {{ device.status || 'unknown' }}
                                            </span>
                                          </p>
                                          @if (device.lastActive) {
                                            <p class="text-gray-500 text-xs">Last active: {{ (device.lastActivity || device.lastActive) | date:'short' }}</p>
                                          }
                                        </div>
                                        <button
                                          (click)="deleteDevice(device._id || device.deviceId)"
                                          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    }
                                  </div>
                                } @else {
                                  <p class="text-gray-600 text-xs py-2">No devices found. Click "Load Devices" to fetch from platform.</p>
                                }
                              </div>
                            }
                          </div>

                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            <button
                              (click)="toggleSection(vendor._id, 'rooms')"
                              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                              <div class="flex items-center gap-2">
                                <span class="material-icons text-purple-600 text-sm">door_front</span>
                                <span class="text-sm font-semibold text-gray-800">Rooms</span>
                              </div>
                              <span class="material-icons text-gray-400 text-sm transition-transform"
                                [style.transform]="openSection(vendor._id) === 'rooms' ? 'rotate(180deg)' : 'rotate(0deg)'"
                              >expand_more</span>
                            </button>
                            @if (openSection(vendor._id) === 'rooms') {
                              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div class="mb-3">
                                  <button
                                    (click)="loadRooms(vendor._id); showAddRoomModal.set(!showAddRoomModal())"
                                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                                  >
                                    <span class="material-icons text-sm">add</span>
                                    Add Room
                                  </button>
                                </div>
                                @if (showAddRoomModal()) {
                                  <div class="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
                                    <input
                                      type="text"
                                      [(ngModel)]="newRoomNumber"
                                      placeholder="Room Number"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-1 text-xs"
                                    />
                                    <select
                                      [(ngModel)]="newRoomType"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-1 text-xs"
                                    >
                                      <option value="standard">Standard</option>
                                      <option value="deluxe">Deluxe</option>
                                      <option value="suite">Suite</option>
                                    </select>
                                    <input
                                      type="number"
                                      [(ngModel)]="newRoomCapacity"
                                      placeholder="Capacity"
                                      min="1"
                                      max="8"
                                      class="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-xs"
                                    />
                                    <button
                                      (click)="addRoom(vendor._id)"
                                      class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                }
                                @if (roomsList().length > 0) {
                                  <div class="text-xs">
                                    @for (room of roomsList(); track room.id) {
                                      <div class="flex items-center justify-between p-2 border-t border-gray-200">
                                        <div>
                                          <p class="font-semibold text-gray-800">Room {{ room.number }}</p>
                                          <p class="text-gray-600">{{ room.type }} • {{ room.capacity }} guests • <span [class]="room.status === 'available' ? 'text-green-600 font-semibold' : 'text-orange-600'">{{ room.status }}</span></p>
                                        </div>
                                        <button
                                          (click)="deleteRoom(room.id)"
                                          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    }
                                  </div>
                                } @else {
                                  <p class="text-gray-600 text-xs py-2">No rooms added yet</p>
                                }
                              </div>
                            }
                          </div>

                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            <button
                              (click)="toggleSection(vendor._id, 'bookings')"
                              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                              <div class="flex items-center gap-2">
                                <span class="material-icons text-orange-600 text-sm">event</span>
                                <span class="text-sm font-semibold text-gray-800">Bookings</span>
                              </div>
                              <span class="material-icons text-gray-400 text-sm transition-transform"
                                [style.transform]="openSection(vendor._id) === 'bookings' ? 'rotate(180deg)' : 'rotate(0deg)'"
                              >expand_more</span>
                            </button>
                            @if (openSection(vendor._id) === 'bookings') {
                              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs">
                                <button
                                  (click)="loadBookings(vendor._id)"
                                  class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold mb-3"
                                >
                                  Refresh Bookings
                                </button>
                                @if (bookingsList().length > 0) {
                                  <div class="space-y-2">
                                    @for (booking of bookingsList(); track booking.id) {
                                      <div class="p-2 border border-gray-200 rounded bg-white">
                                        <div class="flex justify-between items-start mb-1">
                                          <p class="font-semibold text-gray-800">{{ booking.guestName }}</p>
                                          <span class="text-xs px-1 rounded bg-green-100 text-green-800 font-semibold">
                                            {{ booking.status }}
                                          </span>
                                        </div>
                                        <p class="text-gray-600 text-xs">Room {{ booking.roomNumber }}</p>
                                        <p class="text-gray-600 text-xs">{{ booking.checkIn }} to {{ booking.checkOut }}</p>
                                        <button (click)="cancelBooking(booking.id)" class="mt-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs">
                                          Cancel
                                        </button>
                                      </div>
                                    }
                                  </div>
                                } @else {
                                  <p class="text-gray-600 py-2">No bookings</p>
                                }
                              </div>
                            }
                          </div>

                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            <button
                              (click)="toggleSection(vendor._id, 'reviews')"
                              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                              <div class="flex items-center gap-2">
                                <span class="material-icons text-red-600 text-sm">star_rate</span>
                                <span class="text-sm font-semibold text-gray-800">Reviews & Ratings</span>
                              </div>
                              <span class="material-icons text-gray-400 text-sm transition-transform"
                                [style.transform]="openSection(vendor._id) === 'reviews' ? 'rotate(180deg)' : 'rotate(0deg)'"
                              >expand_more</span>
                            </button>
                            @if (openSection(vendor._id) === 'reviews') {
                              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs">
                                <button
                                  (click)="loadReviews(vendor._id)"
                                  class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold mb-3"
                                >
                                  Load Reviews
                                </button>
                                @if (reviewsList().length > 0) {
                                  <div class="space-y-2">
                                    @for (review of reviewsList(); track review.id) {
                                      <div class="p-2 border border-gray-200 rounded bg-white">
                                        <div class="flex justify-between items-start mb-1">
                                          <p class="font-semibold text-gray-800">{{ review.guestName }}</p>
                                          <div class="flex items-center gap-1">
                                            <span class="text-yellow-500 font-semibold">{{ review.rating }}</span>
                                            <span class="material-icons text-yellow-500 text-sm">star</span>
                                          </div>
                                        </div>
                                        <p class="text-gray-600 text-xs mb-1">{{ review.comment }}</p>
                                        <p class="text-gray-500 text-xs mb-1">{{ review.date }}</p>
                                        <button (click)="deleteReview(review.id)" class="px-2 py-0.5 bg-red-600 text-white rounded text-xs">
                                          Delete
                                        </button>
                                      </div>
                                    }
                                  </div>
                                } @else {
                                  <p class="text-gray-600 py-2">No reviews</p>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      }
                      @case ('restaurants') {
                        <!-- Restaurants Specific Sections -->
                        <div class="space-y-3">
                          <div class="bg-white rounded border border-gray-200 px-4 py-3">
                            <p class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <span class="material-icons text-sm">restaurant</span>
                              Menu & Orders
                            </p>
                            <p class="text-xs text-gray-600 mt-2">(To be implemented)</p>
                          </div>
                          <div class="bg-white rounded border border-gray-200 px-4 py-3">
                            <p class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <span class="material-icons text-sm">local_shipping</span>
                              Delivery Management
                            </p>
                            <p class="text-xs text-gray-600 mt-2">(To be implemented)</p>
                          </div>
                        </div>
                      }
                      @default {
                        <!-- Generic Sections for other categories -->
                        <div class="bg-white rounded border border-gray-200 px-4 py-3">
                          <p class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <span class="material-icons text-sm">info</span>
                            Category-specific details coming soon...
                          </p>
                        </div>
                      }
                    }
                  </div>

                  <!-- Action Buttons -->
                  <div class="px-6 py-4 border-t border-gray-200 bg-white flex gap-2">
                    <button
                      (click)="editVendor(vendor._id)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span class="material-icons text-sm">edit</span>
                      <span class="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      (click)="deleteVendor(vendor._id)"
                      class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span class="material-icons text-sm">delete</span>
                      <span class="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 24px;
      height: 24px;
      width: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class BusinessVendorListComponent implements OnInit {
  @Input() businessType: 'hotels' | 'restaurants' | 'retail' | 'services' | 'tours' | 'delivery' = 'hotels';

  vendors = signal<any[]>([]);
  filteredVendors = signal<any[]>([]);
  expandedVendor = signal<string | null>(null);

  searchQuery = '';
  selectedStatus = '';

  // Track open sections per vendor
  private openSections = signal<Record<string, string>>({});

  // Staff management
  staffList = signal<any[]>([]);
  showAddStaffModal = signal(false);
  newStaffName = '';
  newStaffEmail = '';
  newStaffRole = 'staff';

  // Devices management
  devicesList = signal<any[]>([]);
  devicesLoading = signal(false);

  // Rooms management
  roomsList = signal<any[]>([]);
  showAddRoomModal = signal(false);
  newRoomNumber = '';
  newRoomType = 'standard';
  newRoomCapacity = 2;

  // Bookings management
  bookingsList = signal<any[]>([]);

  // Reviews management
  reviewsList = signal<any[]>([]);

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(`🔄 Loading ${this.businessType} vendors...`);
    this.loadVendors();
  }

  loadVendors(): void {
    // Map plural form to singular for backend
    const vendorTypeMap: Record<string, string> = {
      'hotels': 'hotel',
      'restaurants': 'restaurant',
      'retail': 'retail',
      'services': 'service',
      'tours': 'tour-operator',
      'delivery': 'delivery'
    };

    const vendorType = vendorTypeMap[this.businessType] || this.businessType;
    console.log(`🔍 Querying vendors with type: ${vendorType}`);

    // Call backend with vendorType filter
    const filters = { vendorType };

    this.adminService.getVendors(1, 100, filters).subscribe({
      next: (response: any) => {
        console.log('✅ Vendors API Response:', response);

        // Handle backend response format: { status: 'success', data: [...], pagination: {...} }
        let vendorList = [];

        if (response.data && Array.isArray(response.data)) {
          vendorList = response.data;
        } else if (Array.isArray(response)) {
          vendorList = response;
        }

        console.log(`📊 Found ${vendorList.length} ${this.businessType} vendors:`, vendorList);

        this.vendors.set(vendorList);
        this.filteredVendors.set(vendorList);
      },
      error: (error: any) => {
        console.error('❌ Error loading vendors:', error);
        console.error('Error details:', error.error || error.message);
        this.vendors.set([]);
        this.filteredVendors.set([]);
      }
    });
  }

  filterVendors(): void {
    let filtered = [...this.vendors()];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((v: any) =>
        v.name?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((v: any) => v.status === this.selectedStatus);
    }

    this.filteredVendors.set(filtered);
  }

  toggleVendorDetails(vendorId: string): void {
    this.expandedVendor.set(
      this.expandedVendor() === vendorId ? null : vendorId
    );
  }

  toggleSection(vendorId: string, section: string): void {
    const sections = { ...this.openSections() };
    if (sections[vendorId] === section) {
      delete sections[vendorId];
    } else {
      sections[vendorId] = section;
    }
    this.openSections.set(sections);
  }

  openSection(vendorId: string): string | undefined {
    return this.openSections()[vendorId];
  }

  getCategoryLabel(): string {
    const labels: Record<string, string> = {
      hotels: 'Hotels',
      restaurants: 'Restaurants',
      retail: 'Retail Stores',
      services: 'Services',
      tours: 'Tours & Travel',
      delivery: 'Delivery'
    };
    return labels[this.businessType];
  }

  getCategoryIcon(): string {
    const icons: Record<string, string> = {
      hotels: 'hotel',
      restaurants: 'restaurant',
      retail: 'storefront',
      services: 'build',
      tours: 'flight_takeoff',
      delivery: 'local_shipping'
    };
    return icons[this.businessType];
  }

  getCategoryColor(): string {
    const colors: Record<string, string> = {
      hotels: 'text-blue-600',
      restaurants: 'text-orange-600',
      retail: 'text-red-600',
      services: 'text-green-600',
      tours: 'text-teal-600',
      delivery: 'text-red-700'
    };
    return colors[this.businessType];
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getKycBadgeClass(kycStatus: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return classes[kycStatus] || 'bg-gray-100 text-gray-800';
  }

  editVendor(vendorId: string): void {
    this.router.navigate(['/vendor-detail', vendorId]);
  }

  deleteVendor(vendorId: string): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.adminService.deleteVendor(vendorId).subscribe({
        next: () => {
          this.loadVendors();
          console.log('Vendor deleted successfully');
        },
        error: (error: any) => console.error('Error deleting vendor:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  // ============================================
  // STAFF MANAGEMENT
  // ============================================

  loadStaff(vendorId: string): void {
    // For now, generate mock staff data
    // In production, this would call: this.adminService.getVendorStaff(vendorId)
    const mockStaff = [
      { id: '1', name: 'John Manager', email: 'john@hotel.com', role: 'manager' },
      { id: '2', name: 'Jane Receptionist', email: 'jane@hotel.com', role: 'receptionist' },
      { id: '3', name: 'Bob Housekeeper', email: 'bob@hotel.com', role: 'housekeeping' }
    ];
    this.staffList.set(mockStaff);
  }

  addStaff(vendorId: string): void {
    if (!this.newStaffName || !this.newStaffEmail) {
      alert('Please fill all fields');
      return;
    }

    const newStaff = {
      id: Date.now().toString(),
      name: this.newStaffName,
      email: this.newStaffEmail,
      role: this.newStaffRole,
      vendorId
    };

    this.staffList.set([...this.staffList(), newStaff]);
    this.newStaffName = '';
    this.newStaffEmail = '';
    this.newStaffRole = 'staff';
    this.showAddStaffModal.set(false);
  }

  deleteStaff(staffId: string): void {
    if (confirm('Remove this staff member?')) {
      this.staffList.set(this.staffList().filter(s => s.id !== staffId));
    }
  }

  // ============================================
  // DEVICES MANAGEMENT
  // ============================================

  loadDevices(vendorId: string): void {
    this.devicesLoading.set(true);
    this.adminService.getDevices(1, 10).subscribe({
      next: (response: any) => {
        const devices = Array.isArray(response.data) ? response.data : [];
        this.devicesList.set(devices);
        console.log('✅ Devices loaded:', devices);
        this.devicesLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading devices:', error);
        this.devicesLoading.set(false);
      }
    });
  }

  deleteDevice(deviceId: string): void {
    if (confirm('Delete this device?')) {
      this.adminService.deleteDevice(deviceId).subscribe({
        next: () => {
          this.devicesList.set(this.devicesList().filter(d => d._id !== deviceId && d.deviceId !== deviceId));
          console.log('✅ Device deleted');
        },
        error: (error: any) => console.error('❌ Error deleting device:', error)
      });
    }
  }

  // ============================================
  // ROOMS MANAGEMENT
  // ============================================

  loadRooms(vendorId: string): void {
    // Mock rooms data
    const mockRooms = [
      { id: '101', number: '101', type: 'standard', capacity: 2, status: 'available' },
      { id: '102', number: '102', type: 'deluxe', capacity: 4, status: 'occupied' },
      { id: '103', number: '103', type: 'suite', capacity: 6, status: 'available' }
    ];
    this.roomsList.set(mockRooms);
  }

  addRoom(vendorId: string): void {
    if (!this.newRoomNumber) {
      alert('Please enter room number');
      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      number: this.newRoomNumber,
      type: this.newRoomType,
      capacity: this.newRoomCapacity,
      status: 'available',
      vendorId
    };

    this.roomsList.set([...this.roomsList(), newRoom]);
    this.newRoomNumber = '';
    this.newRoomType = 'standard';
    this.newRoomCapacity = 2;
    this.showAddRoomModal.set(false);
  }

  deleteRoom(roomId: string): void {
    if (confirm('Delete this room?')) {
      this.roomsList.set(this.roomsList().filter(r => r.id !== roomId));
    }
  }

  // ============================================
  // BOOKINGS MANAGEMENT
  // ============================================

  loadBookings(vendorId: string): void {
    // Mock bookings data
    const mockBookings = [
      { id: '1', guestName: 'John Doe', roomNumber: '101', checkIn: '2024-03-15', checkOut: '2024-03-18', status: 'confirmed', amount: 450 },
      { id: '2', guestName: 'Jane Smith', roomNumber: '102', checkIn: '2024-03-16', checkOut: '2024-03-20', status: 'confirmed', amount: 800 },
      { id: '3', guestName: 'Bob Johnson', roomNumber: '103', checkIn: '2024-03-17', checkOut: '2024-03-19', status: 'pending', amount: 600 }
    ];
    this.bookingsList.set(mockBookings);
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Cancel this booking?')) {
      this.bookingsList.set(
        this.bookingsList().map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    }
  }

  // ============================================
  // REVIEWS MANAGEMENT
  // ============================================

  loadReviews(vendorId: string): void {
    // Mock reviews data
    const mockReviews = [
      { id: '1', guestName: 'John Doe', rating: 5, comment: 'Excellent service!', date: '2024-03-10' },
      { id: '2', guestName: 'Jane Smith', rating: 4, comment: 'Good facilities, friendly staff', date: '2024-03-08' },
      { id: '3', guestName: 'Bob Johnson', rating: 3, comment: 'Average experience', date: '2024-03-05' }
    ];
    this.reviewsList.set(mockReviews);
  }

  deleteReview(reviewId: string): void {
    if (confirm('Delete this review?')) {
      this.reviewsList.set(this.reviewsList().filter(r => r.id !== reviewId));
    }
  }
}
