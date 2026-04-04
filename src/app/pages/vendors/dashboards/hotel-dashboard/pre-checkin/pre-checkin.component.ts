import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface GuestCheckIn {
  _id?: string;
  bookingId: string;
  guestName: string;
  email: string;
  phone: string;
  idType: 'passport' | 'driver-license' | 'national-id' | 'other';
  idNumber: string;
  idImage?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  numberOfGuests: number;
  specialRequests: string;
  vehicleInfo?: string;
  emergencyContact?: string;
  status: 'pending' | 'verified' | 'completed' | 'cancelled';
  completedAt?: string;
  verifiedBy?: string;
}

interface CheckInStats {
  totalCheckIns: number;
  pendingCheckIns: number;
  verifiedCheckIns: number;
  completedCheckIns: number;
  earlyArrivals: number;
}

@Component({
  selector: 'app-pre-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Pre-Arrival Check-In</h1>
        <p class="text-slate-600 mt-1">Manage guest pre-arrival check-in and identity verification</p>
      </div>

      <!-- Check-In Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Total Check-Ins -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Check-Ins</p>
          <p class="text-2xl font-bold text-blue-600 mt-2">{{ checkInStats().totalCheckIns }}</p>
        </div>

        <!-- Pending -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Pending</p>
          <p class="text-2xl font-bold text-yellow-600 mt-2">{{ checkInStats().pendingCheckIns }}</p>
        </div>

        <!-- Verified -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Verified</p>
          <p class="text-2xl font-bold text-blue-600 mt-2">{{ checkInStats().verifiedCheckIns }}</p>
        </div>

        <!-- Completed -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Completed</p>
          <p class="text-2xl font-bold text-green-600 mt-2">{{ checkInStats().completedCheckIns }}</p>
        </div>

        <!-- Early Arrivals -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Early Arrivals</p>
          <p class="text-2xl font-bold text-purple-600 mt-2">{{ checkInStats().earlyArrivals }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search Guest</label>
            <input
              type="text"
              [(ngModel)]="searchGuest"
              (keyup)="filterCheckIns()"
              placeholder="Search by name or email..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterCheckIns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (change)="filterCheckIns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-asc">Check-In Date (Soon)</option>
              <option value="date-desc">Check-In Date (Later)</option>
              <option value="name">Guest Name</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Check-Ins Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Guest Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Check-In Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Guests</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredCheckIns().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No check-ins found
                  </td>
                </tr>
              } @else {
                @for (checkIn of filteredCheckIns(); track checkIn._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ checkIn.guestName }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ checkIn.email }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(checkIn.checkInDate) }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ checkIn.roomType | titlecase }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ checkIn.numberOfGuests }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-700': checkIn.status === 'pending',
                          'bg-blue-100 text-blue-700': checkIn.status === 'verified',
                          'bg-green-100 text-green-700': checkIn.status === 'completed',
                          'bg-red-100 text-red-700': checkIn.status === 'cancelled'
                        }"
                      >
                        {{ checkIn.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm space-x-2">
                      <button
                        (click)="viewDetails(checkIn)"
                        class="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                      @if (checkIn.status === 'pending') {
                        <button
                          (click)="verifyIdentity(checkIn)"
                          class="text-green-600 hover:text-green-700 font-medium"
                        >
                          Verify
                        </button>
                      }
                      @if (checkIn.status === 'verified') {
                        <button
                          (click)="completeCheckIn(checkIn)"
                          class="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Complete
                        </button>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Details Modal -->
      @if (showDetailsModal() && selectedCheckIn()) {
        @let checkIn = selectedCheckIn();
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Check-In Details</h2>

            <div class="space-y-6">
              <!-- Guest Information -->
              <div class="border-b pb-4">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">👤 Guest Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-slate-600">Name</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.guestName }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Email</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Phone</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Number of Guests</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.numberOfGuests }}</p>
                  </div>
                </div>
              </div>

              <!-- Identity Information -->
              <div class="border-b pb-4">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">🆔 Identity Verification</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-slate-600">ID Type</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.idType | titlecase }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">ID Number</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.idNumber }}</p>
                  </div>
                </div>
                @if (checkIn!.idImage) {
                  <div class="mt-4">
                    <p class="text-sm text-slate-600 mb-2">ID Document</p>
                    <img [src]="checkIn!.idImage" alt="ID" class="max-w-sm rounded-lg border-2 border-slate-300" />
                  </div>
                }
              </div>

              <!-- Booking Details -->
              <div class="border-b pb-4">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">🏨 Booking Details</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-slate-600">Check-In Date</p>
                    <p class="font-semibold text-slate-900">{{ formatDate(checkIn!.checkInDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Check-Out Date</p>
                    <p class="font-semibold text-slate-900">{{ formatDate(checkIn!.checkOutDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Room Type</p>
                    <p class="font-semibold text-slate-900">{{ checkIn!.roomType | titlecase }}</p>
                  </div>
                </div>
              </div>

              <!-- Special Requests -->
              @if (checkIn!.specialRequests) {
                <div class="border-b pb-4">
                  <h3 class="text-lg font-semibold text-slate-900 mb-4">📝 Special Requests</h3>
                  <p class="text-slate-700">{{ checkIn!.specialRequests }}</p>
                </div>
              }

              <!-- Vehicle Information -->
              @if (checkIn!.vehicleInfo) {
                <div class="border-b pb-4">
                  <h3 class="text-lg font-semibold text-slate-900 mb-4">🚗 Vehicle Information</h3>
                  <p class="text-slate-700">{{ checkIn!.vehicleInfo }}</p>
                </div>
              }

              <!-- Actions -->
              <div class="flex justify-end gap-3">
                <button
                  (click)="closeDetailsModal()"
                  class="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition"
                >
                  Close
                </button>
                @if (checkIn!.status === 'pending') {
                  <button
                    (click)="verifyIdentity(checkIn!); closeDetailsModal()"
                    class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    ✓ Verify Identity
                  </button>
                }
                @if (checkIn!.status === 'verified') {
                  <button
                    (click)="completeCheckIn(checkIn!); closeDetailsModal()"
                    class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                  >
                    ✓ Complete Check-In
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PreCheckinComponent implements OnInit {
  checkIns = signal<GuestCheckIn[]>([]);
  filteredCheckIns = signal<GuestCheckIn[]>([]);
  checkInStats = signal<CheckInStats>({
    totalCheckIns: 0,
    pendingCheckIns: 0,
    verifiedCheckIns: 0,
    completedCheckIns: 0,
    earlyArrivals: 0
  });

  showDetailsModal = signal(false);
  selectedCheckIn = signal<GuestCheckIn | null>(null);

  searchGuest = '';
  selectedStatus = '';
  sortBy = 'date-asc';

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadCheckIns();
  }

  loadCheckIns() {
    // Load check-ins from API
    this.hotelService.getPreCheckins(1, 100, this.selectedStatus || undefined).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.checkIns.set(response.data);
        } else {
          this.checkIns.set([]);
        }
        this.loadCheckInStats();
        this.filterCheckIns();
      },
      error: (error) => {
        console.error('Error loading check-ins:', error);
        this.checkIns.set([]);
        this.calculateStats();
      }
    });
  }

  loadCheckInStats() {
    // Load check-in stats from API
    this.hotelService.getCheckInStats().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.checkInStats.set(response.data);
        } else {
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Error loading check-in stats:', error);
        this.calculateStats();
      }
    });
  }

  calculateStats() {
    const checkIns = this.checkIns();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats: CheckInStats = {
      totalCheckIns: checkIns.length,
      pendingCheckIns: checkIns.filter(c => c.status === 'pending').length,
      verifiedCheckIns: checkIns.filter(c => c.status === 'verified').length,
      completedCheckIns: checkIns.filter(c => c.status === 'completed').length,
      earlyArrivals: checkIns.filter(c => new Date(c.checkInDate) <= tomorrow).length
    };

    this.checkInStats.set(stats);
  }

  filterCheckIns() {
    let filtered = [...this.checkIns()];

    if (this.searchGuest) {
      filtered = filtered.filter(c =>
        c.guestName.toLowerCase().includes(this.searchGuest.toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchGuest.toLowerCase())
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(c => c.status === this.selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkInDate).getTime();
      const dateB = new Date(b.checkInDate).getTime();
      
      if (this.sortBy === 'date-asc') {
        return dateA - dateB;
      } else if (this.sortBy === 'date-desc') {
        return dateB - dateA;
      } else if (this.sortBy === 'name') {
        return a.guestName.localeCompare(b.guestName);
      }
      return 0;
    });

    this.filteredCheckIns.set(filtered);
  }

  viewDetails(checkIn: GuestCheckIn) {
    this.selectedCheckIn.set(checkIn);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedCheckIn.set(null);
  }

  verifyIdentity(checkIn: GuestCheckIn) {
    if (checkIn._id) {
      // Call API to verify identity
      this.hotelService.verifyGuestIdentity(checkIn._id, 'hotel-staff').subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Update local state with response data
            const index = this.checkIns().findIndex(c => c._id === checkIn._id);
            if (index !== -1) {
              const updated_list = [...this.checkIns()];
              updated_list[index] = { ...response.data };
              this.checkIns.set(updated_list);
              this.calculateStats();
              this.filterCheckIns();
            }
          }
        },
        error: (error) => {
          console.error('Error verifying identity:', error);
        }
      });
    }
  }

  completeCheckIn(checkIn: GuestCheckIn) {
    if (checkIn._id) {
      // Call API to complete check-in
      this.hotelService.completeCheckIn(checkIn._id).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Update local state with response data
            const index = this.checkIns().findIndex(c => c._id === checkIn._id);
            if (index !== -1) {
              const updated_list = [...this.checkIns()];
              updated_list[index] = { ...response.data };
              this.checkIns.set(updated_list);
              this.calculateStats();
              this.filterCheckIns();
            }
          }
        },
        error: (error) => {
          console.error('Error completing check-in:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
