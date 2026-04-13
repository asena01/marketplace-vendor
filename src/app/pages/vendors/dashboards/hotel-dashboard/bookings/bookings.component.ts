import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-hotel-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">Bookings Management</h1>
            <p class="text-blue-100">Manage guest bookings and reservations</p>
          </div>
          <button
            (click)="showAddBookingModal()"
            class="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg hover:bg-blue-50 transition"
          >
            ➕ Add New Booking
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading bookings...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Bookings</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ bookings().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Confirmed</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('confirmed') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Pending</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('pending') }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Checked In</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ countByStatus('checked-in') }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (keyup)="filterBookings()"
          placeholder="Search by guest name or booking ID..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
        <select
          [(ngModel)]="filterStatus"
          (change)="filterBookings()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          [(ngModel)]="sortBy"
          (change)="filterBookings()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="date-desc">Latest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name">Guest Name</option>
        </select>
      </div>

      <!-- Bookings Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (filteredBookings().length === 0) {
          <div class="p-8 text-center text-slate-500">
            <p class="text-lg font-semibold">No bookings found</p>
            <p class="text-sm mt-1">Create a new booking to get started</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Guest Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Booking ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Check-in</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Check-out</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (booking of paginatedBookings(); track booking._id) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="px-6 py-4 text-sm text-slate-900 font-medium">
                      {{ booking.guestName || booking.guest?.name || booking.customerName || 'Unknown Guest' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ booking.bookingNumber || booking._id?.slice(-6) || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ booking.roomType || booking.room?.roomType || 'Unknown' }}
                      ({{ booking.roomNumber || booking.room?.roomNumber || 'TBA' }})
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(booking.checkInDate) }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(booking.checkOutDate) }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getStatusColor(booking.status)"
                      >
                        {{ booking.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-900 font-medium">₦{{ booking.totalPrice?.toLocaleString() || '0' }}</td>
                    <td class="px-6 py-4 text-sm">
                      <div class="flex gap-2">
                        <button
                          (click)="editBooking(booking)"
                          class="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled
                          class="text-red-300 cursor-not-allowed font-medium"
                          title="Deleting bookings is disabled"
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
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
              <p class="text-sm text-slate-500">
                Showing {{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} of {{ filteredBookings().length }} bookings
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
        }
      </div>

      <!-- Add/Edit Booking Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? '✏️ Edit Booking' : '➕ Add New Booking' }}
            </h2>

            <div class="space-y-4">
              <!-- Guest Name -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Guest Name</label>
                <input
                  type="text"
                  [(ngModel)]="formData.customerName"
                  placeholder="Enter guest name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Guest Email -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  [(ngModel)]="formData.customerEmail"
                  placeholder="Enter guest email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Guest Phone -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  [(ngModel)]="formData.customerPhone"
                  placeholder="Enter guest phone"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Room Number -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Room Number</label>
                <input
                  type="text"
                  [(ngModel)]="formData.roomNumber"
                  placeholder="Enter room number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Room Type -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
                <select
                  [(ngModel)]="formData.roomType"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select room type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              <!-- Check-in Date -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  [(ngModel)]="formData.checkInDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Check-out Date -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  [(ngModel)]="formData.checkOutDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Total Price -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Total Price</label>
                <input
                  type="number"
                  [(ngModel)]="formData.totalPrice"
                  placeholder="Enter total price"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  [(ngModel)]="formData.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Special Requests -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Special Requests</label>
                <textarea
                  [(ngModel)]="formData.notes"
                  placeholder="Enter any special requests..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 mt-6">
              <button
                (click)="saveBooking()"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {{ isEditing() ? 'Update Booking' : 'Create Booking' }}
              </button>
              <button
                (click)="closeModal()"
                class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class HotelBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  filteredBookings = signal<any[]>([]);
  paginatedBookings = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  showModal = signal(false);
  isEditing = signal(false);

  searchQuery = '';
  filterStatus = '';
  sortBy = 'date-desc';
  currentPage = 1;
  readonly itemsPerPage = 10;

  formData: any = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    roomNumber: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    totalPrice: 0,
    status: 'pending',
    notes: ''
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.hotelService.getHotelBookings(1, 100).subscribe({
      next: (response: any) => {
        console.log('📡 Hotel bookings response:', response);

        if (response.status === 'success' && Array.isArray(response.data)) {
          // Transform bookings to match component expectations
          const transformedBookings = response.data.map((booking: any, index: number) => {
            console.log(`\n📝 [Booking ${index}] Raw data:`, JSON.stringify(booking, null, 2));

            // Extract guest name with proper fallbacks
            let guestName = 'Unknown Guest';
            if (booking.guest) {
              if (typeof booking.guest === 'object' && booking.guest.name) {
                guestName = booking.guest.name;
                console.log('   ✅ Guest name found from object:', guestName);
              } else if (typeof booking.guest === 'string') {
                guestName = 'Guest ' + booking.guest.slice(0, 6);
                console.log('   ⚠️ Guest ID found as string:', booking.guest);
              }
            } else {
              console.log('   ❌ No guest data found');
            }

            // Extract room details with proper fallbacks
            let roomNumber = 'TBA';
            let roomType = 'Unknown';
            if (booking.room) {
              if (typeof booking.room === 'object') {
                roomNumber = booking.room.roomNumber || 'TBA';
                roomType = booking.room.roomType || 'Unknown';
                console.log('   ✅ Room found from object:', { roomNumber, roomType });
              } else if (typeof booking.room === 'string') {
                roomNumber = booking.room.slice(0, 6);
                console.log('   ⚠️ Room ID found as string:', booking.room);
              }
            } else {
              console.log('   ❌ No room data found');
            }

            // Handle dates - could be string or Date object
            let checkInDate = booking.checkInDate;
            let checkOutDate = booking.checkOutDate;
            console.log('   📅 Dates:', { checkInDate, checkOutDate, type: typeof checkInDate });

            const transformed = {
              _id: booking._id,
              guest: booking.guest || { name: guestName },
              customerName: guestName,
              room: booking.room || { roomNumber, roomType },
              roomNumber: roomNumber,
              roomType: roomType,
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              numberOfNights: booking.numberOfNights || 0,
              totalPrice: booking.totalPrice || 0,
              status: booking.status || 'pending',
              notes: booking.specialRequests || '',
              bookingNumber: booking.bookingNumber || 'N/A',
              ...booking
            };

            console.log('   ✅ Transformed:', transformed);
            return transformed;
          });

          console.log('✅ Loaded and transformed', transformedBookings.length, 'bookings');
          console.log('📊 First booking:', transformedBookings[0]);
          this.bookings.set(transformedBookings);
          this.filterBookings();
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          this.bookings.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading bookings:', error);
        this.errorMessage.set('Failed to load bookings: ' + (error.message || 'Unknown error'));
        this.isLoading.set(false);
      }
    });
  }

  filterBookings(): void {
    let result = [...this.bookings()];

    // Filter by search query
    if (this.searchQuery) {
      result = result.filter(
        b =>
          b.customerName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          b._id?.includes(this.searchQuery)
      );
    }

    // Filter by status
    if (this.filterStatus) {
      result = result.filter(b => b.status === this.filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (this.sortBy === 'date-desc') {
        return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
      } else if (this.sortBy === 'date-asc') {
        return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      } else if (this.sortBy === 'name') {
        return (a.customerName || '').localeCompare(b.customerName || '');
      }
      return 0;
    });

    this.filteredBookings.set(result);
    this.currentPage = 1;
    this.updatePaginatedBookings();
  }

  updatePaginatedBookings(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedBookings.set(this.filteredBookings().slice(start, end));
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBookings().length / this.itemsPerPage));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePaginatedBookings();
  }

  pageStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  pageEndIndex(): number {
    return Math.min(this.pageStartIndex() + this.itemsPerPage, this.filteredBookings().length);
  }

  countByStatus(status: string): number {
    return this.bookings().filter(b => b.status === status).length;
  }

  showAddBookingModal(): void {
    this.isEditing.set(false);
    this.resetFormData();
    this.showModal.set(true);
  }

  editBooking(booking: any): void {
    console.log('📝 Editing booking:', booking);

    // Convert dates to YYYY-MM-DD format for date input
    const checkInDate = this.convertToDateInputFormat(booking.checkInDate);
    const checkOutDate = this.convertToDateInputFormat(booking.checkOutDate);

    console.log('📅 Formatted dates:', { checkInDate, checkOutDate });

    this.formData = {
      _id: booking._id,
      customerName: booking.guestName || booking.guest?.name || booking.customerName || '',
      customerEmail: booking.guest?.email || booking.customerEmail || '',
      customerPhone: booking.guest?.phone || booking.customerPhone || '',
      roomNumber: booking.roomNumber || booking.room?.roomNumber || '',
      roomType: booking.roomType || booking.room?.roomType || '',
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: booking.totalPrice || 0,
      status: booking.status || 'pending',
      notes: booking.notes || booking.specialRequests || ''
    };

    console.log('✅ Form data ready:', this.formData);
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  convertToDateInputFormat(dateValue: any): string {
    if (!dateValue) return '';

    try {
      // Handle both string and Date object
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date:', dateValue);
        return '';
      }

      // Format as YYYY-MM-DD for date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const formatted = `${year}-${month}-${day}`;
      console.log('  Converted', dateValue, '→', formatted);
      return formatted;
    } catch (err) {
      console.error('❌ Error converting date:', err, 'value:', dateValue);
      return '';
    }
  }

  saveBooking(): void {
    if (!this.formData.customerName || !this.formData.checkInDate || !this.formData.checkOutDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert dates from YYYY-MM-DD format to ISO string for backend
    const bookingData = {
      ...this.formData,
      checkInDate: new Date(this.formData.checkInDate + 'T00:00:00Z').toISOString(),
      checkOutDate: new Date(this.formData.checkOutDate + 'T00:00:00Z').toISOString()
    };

    console.log('💾 Saving booking:', bookingData);

    if (this.isEditing()) {
      this.hotelService.updateBooking(bookingData._id, bookingData).subscribe({
        next: () => {
          console.log('✅ Booking updated successfully');
          this.loadBookings();
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error updating booking:', error);
          alert('Failed to update booking: ' + (error.message || 'Unknown error'));
        }
      });
    } else {
      this.hotelService.createBooking(bookingData).subscribe({
        next: () => {
          console.log('✅ Booking created successfully');
          this.loadBookings();
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error creating booking:', error);
          alert('Failed to create booking: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }

  deleteBooking(bookingId: string): void {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    this.hotelService.deleteBooking(bookingId).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error: any) => {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetFormData();
  }

  resetFormData(): void {
    this.formData = {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      roomNumber: '',
      roomType: '',
      checkInDate: '',
      checkOutDate: '',
      totalPrice: 0,
      status: 'pending',
      notes: ''
    };
  }

  formatDate(dateString: any): string {
    try {
      if (!dateString) return 'N/A';

      // Handle both string and Date object
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date:', dateString);
        return 'N/A';
      }

      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (err) {
      console.error('❌ Error formatting date:', err, 'input:', dateString);
      return 'N/A';
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      'checked-in': 'bg-blue-100 text-blue-700',
      'checked-out': 'bg-slate-100 text-slate-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  }
}
