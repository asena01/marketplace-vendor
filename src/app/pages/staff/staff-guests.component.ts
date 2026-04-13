import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';

interface GuestRow {
  bookingId: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
}

@Component({
  selector: 'app-staff-guests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 p-6 md:p-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Guests</h1>
        <p class="mt-1 text-slate-600">Current and upcoming guest stays for front desk operations.</p>
      </div>

      @if (errorMessage()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage() }}</div>
      }

      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Guest Stays</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ guests().length }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Checked In</p>
          <p class="mt-2 text-3xl font-bold text-emerald-700">{{ countByStatus('checked-in') }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Confirmed</p>
          <p class="mt-2 text-3xl font-bold text-blue-700">{{ countByStatus('confirmed') }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Checked Out</p>
          <p class="mt-2 text-3xl font-bold text-slate-700">{{ countByStatus('checked-out') }}</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px]">
            <thead class="border-b border-slate-200 bg-slate-100">
              <tr>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Guest</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Booking</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Room</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Check In</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Check Out</th>
                <th class="px-5 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              @if (guests().length === 0) {
                <tr>
                  <td colspan="6" class="px-5 py-8 text-center text-slate-500">No guest stays found.</td>
                </tr>
              } @else {
                @for (guest of paginatedGuests(); track guest.bookingId) {
                  <tr class="border-b border-slate-100">
                    <td class="px-5 py-4">
                      <p class="font-medium text-slate-900">{{ guest.guestName }}</p>
                      <p class="text-sm text-slate-500">{{ guest.guestEmail || 'No email' }}</p>
                      <p class="text-xs text-slate-400">{{ guest.guestPhone || 'No phone' }}</p>
                    </td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ guest.bookingNumber }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ guest.roomType }} · {{ guest.roomNumber }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ formatDate(guest.checkInDate) }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ formatDate(guest.checkOutDate) }}</td>
                    <td class="px-5 py-4 text-sm">
                      <span class="rounded-full px-3 py-1 text-xs font-semibold"
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': guest.bookingStatus === 'confirmed',
                          'bg-emerald-100 text-emerald-700': guest.bookingStatus === 'checked-in',
                          'bg-slate-100 text-slate-700': guest.bookingStatus === 'checked-out',
                          'bg-red-100 text-red-700': guest.bookingStatus === 'cancelled'
                        }"
                      >
                        {{ formatLabel(guest.bookingStatus) }}
                      </span>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
            <p class="text-sm text-slate-500">
              Showing {{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} of {{ guests().length }} guest stays
            </p>
            <div class="flex items-center gap-2">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
              >
                Previous
              </button>
              <span class="text-sm font-medium text-slate-700">Page {{ currentPage }} of {{ totalPages() }}</span>
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages()"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class StaffGuestsComponent implements OnInit {
  guests = signal<GuestRow[]>([]);
  errorMessage = signal('');
  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(private authService: AuthService, private hotelService: HotelService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
      return;
    }
    this.loadGuests();
  }

  loadGuests(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.hotelId) return;

    this.hotelService.setHotelId(user.hotelId);
    this.hotelService.getHotelBookings(1, 200).subscribe({
      next: (response: any) => {
        const bookings = response.status === 'success' && Array.isArray(response.data) ? response.data : [];
        const guestRows = bookings.map((booking: any) => ({
          bookingId: booking._id,
          bookingNumber: booking.bookingNumber || booking._id?.slice?.(-8) || 'N/A',
          guestName: booking.guest?.name || 'Unknown Guest',
          guestEmail: booking.guest?.email || '',
          guestPhone: booking.guest?.phone || '',
          roomNumber: booking.room?.roomNumber || 'TBA',
          roomType: booking.room?.roomType || 'Room',
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          bookingStatus: booking.status
        }));

        this.guests.set(guestRows);
        this.currentPage = 1;
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to load guests');
      }
    });
  }

  countByStatus(status: string): number {
    return this.guests().filter((guest) => guest.bookingStatus === status).length;
  }

  paginatedGuests(): GuestRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.guests().slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.guests().length / this.itemsPerPage));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }

  pageStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  pageEndIndex(): number {
    return Math.min(this.pageStartIndex() + this.itemsPerPage, this.guests().length);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
