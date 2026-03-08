import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../../../services/tour.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Tour Bookings</h1>
        <button
          (click)="openCreateModal()"
          class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          + New Booking
        </button>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading bookings...</p>
        </div>
      }

      @if (successMessage()) {
        <div class="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ successMessage() }}</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      @if (bookings().length === 0) {
        <div class="bg-white rounded-lg p-12 shadow-md text-center">
          <p class="text-slate-600 font-semibold text-lg">No bookings yet</p>
          <p class="text-slate-500 mt-2">Click "New Booking" to create your first booking</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tour</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Guests</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Price</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (booking of bookings(); track booking._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <span class="font-medium text-slate-900">{{ booking.customerName || 'Guest' }}</span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ booking.tourName || 'N/A' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ booking.touristCount || 1 }} person(s)</td>
                    <td class="px-6 py-4 text-slate-900 font-medium">{{ booking.totalPrice | currency }}</td>
                    <td class="px-6 py-4">
                      <span
                        [class]="getStatusClass(booking.status)"
                      >
                        {{ booking.status || 'Pending' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ (booking.bookingDate | date:'short') || 'N/A' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="openEditModal(booking)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          (click)="confirmDelete(booking._id, booking.customerName)"
                          class="text-red-600 hover:text-red-700 font-medium text-sm"
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
        </div>
      }

      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Booking' : 'Create New Booking' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input
                  [(ngModel)]="bookingForm.customerName"
                  type="text"
                  placeholder="e.g., John Doe"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Customer Email *</label>
                <input
                  [(ngModel)]="bookingForm.customerEmail"
                  type="email"
                  placeholder="e.g., john@example.com"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Customer Phone *</label>
                <input
                  [(ngModel)]="bookingForm.customerPhone"
                  type="tel"
                  placeholder="e.g., +1234567890"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Tour Name *</label>
                  <input
                    [(ngModel)]="bookingForm.tourName"
                    type="text"
                    placeholder="e.g., Paris City Explorer"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Number of Tourists *</label>
                  <input
                    [(ngModel)]="bookingForm.touristCount"
                    type="number"
                    placeholder="e.g., 4"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Booking Date *</label>
                  <input
                    [(ngModel)]="bookingForm.bookingDate"
                    type="date"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Tour Date *</label>
                  <input
                    [(ngModel)]="bookingForm.tourDate"
                    type="date"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Total Price *</label>
                <input
                  [(ngModel)]="bookingForm.totalPrice"
                  type="number"
                  placeholder="e.g., 6000"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select
                  [(ngModel)]="bookingForm.status"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
                <textarea
                  [(ngModel)]="bookingForm.specialRequests"
                  rows="3"
                  placeholder="Any special requests or notes..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <p class="font-semibold text-sm">{{ formError() }}</p>
              </div>
            }

            <div class="flex gap-3 mt-8">
              <button
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="saveBooking()"
                class="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
              >
                {{ isEditing() ? 'Update Booking' : 'Create Booking' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Delete Booking</h3>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete booking for <strong>{{ deleteConfirmName() }}</strong>? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                (click)="showDeleteConfirm.set(false)"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="deleteBooking()"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToursBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  formError = signal('');
  deleteConfirmName = signal('');
  deleteConfirmId = signal('');

  bookingForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    tourName: '',
    touristCount: 1,
    bookingDate: '',
    tourDate: '',
    totalPrice: 0,
    status: 'Pending',
    specialRequests: ''
  };

  editingBookingId = '';

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.tourService.getBookings(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.bookings.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.errorMessage.set('Failed to load bookings');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingBookingId = '';
    this.showModal.set(true);
  }

  openEditModal(booking: any): void {
    this.bookingForm = {
      customerName: booking.customerName || '',
      customerEmail: booking.customerEmail || '',
      customerPhone: booking.customerPhone || '',
      tourName: booking.tourName || '',
      touristCount: booking.touristCount || 1,
      bookingDate: this.formatDateForInput(booking.bookingDate),
      tourDate: this.formatDateForInput(booking.tourDate),
      totalPrice: booking.totalPrice || 0,
      status: booking.status || 'Pending',
      specialRequests: booking.specialRequests || ''
    };
    this.editingBookingId = booking._id;
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.bookingForm = {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      tourName: '',
      touristCount: 1,
      bookingDate: '',
      tourDate: '',
      totalPrice: 0,
      status: 'Pending',
      specialRequests: ''
    };
    this.formError.set('');
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveBooking(): void {
    this.formError.set('');

    if (!this.bookingForm.customerName || !this.bookingForm.customerEmail || !this.bookingForm.tourName || !this.bookingForm.touristCount || !this.bookingForm.totalPrice) {
      this.formError.set('Please fill in all required fields');
      return;
    }

    if (this.isEditing()) {
      this.tourService.updateBooking(this.editingBookingId, this.bookingForm).subscribe({
        next: () => {
          this.successMessage.set('Booking updated successfully');
          this.closeModal();
          this.loadBookings();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error updating booking:', error);
          this.formError.set('Failed to update booking');
        }
      });
    } else {
      this.tourService.createBooking(this.bookingForm).subscribe({
        next: () => {
          this.successMessage.set('Booking created successfully');
          this.closeModal();
          this.loadBookings();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error creating booking:', error);
          this.formError.set('Failed to create booking');
        }
      });
    }
  }

  confirmDelete(id: string, name: string): void {
    this.deleteConfirmId.set(id);
    this.deleteConfirmName.set(name);
    this.showDeleteConfirm.set(true);
  }

  deleteBooking(): void {
    this.tourService.deleteBooking(this.deleteConfirmId()).subscribe({
      next: () => {
        this.successMessage.set('Booking deleted successfully');
        this.showDeleteConfirm.set(false);
        this.loadBookings();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error deleting booking:', error);
        this.errorMessage.set('Failed to delete booking');
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  getStatusClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Confirmed':
        return `${baseClass} bg-emerald-100 text-emerald-700`;
      case 'Completed':
        return `${baseClass} bg-blue-100 text-blue-700`;
      case 'Cancelled':
        return `${baseClass} bg-red-100 text-red-700`;
      default:
        return `${baseClass} bg-yellow-100 text-yellow-700`;
    }
  }
}
