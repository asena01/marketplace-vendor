import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

interface TourBooking {
  _id: string;
  tourName: string;
  destination: string;
  agency: string;
  startDate: string;
  endDate: string;
  duration: number;
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  highlights: string[];
}

@Component({
  selector: 'app-customer-tours-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      @if (viewMode() === 'list') {
        <!-- Enhanced Summary Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <mat-icon>flight</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <p class="text-2xl font-black text-slate-900">{{ tourBookings().length }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Confirmed</p>
              <p class="text-2xl font-black text-slate-900">{{ getConfirmedCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <mat-icon>event</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Upcoming</p>
              <p class="text-2xl font-black text-slate-900">{{ getUpcomingCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <mat-icon>history</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed</p>
              <p class="text-2xl font-black text-slate-900">{{ getCompletedCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Bookings Cards -->
        @if (tourBookings().length > 0) {
          <div class="space-y-6">
            <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
              Adventure History
            </h3>
            <div class="grid grid-cols-1 gap-6">
              @for (booking of tourBookings(); track booking._id) {
                <div class="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 group">
                  <div class="flex flex-col lg:flex-row">
                    <!-- Status & Left Panel -->
                    <div [class]="'lg:w-1/4 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden ' +
                      (booking.status === 'confirmed' || booking.status === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600')">

                      <div class="relative z-10">
                        <mat-icon class="text-5xl mb-4 opacity-80">explore</mat-icon>
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Status</p>
                        <p class="text-xl font-black uppercase tracking-tight">{{ getStatusBadge(booking.status) }}</p>
                      </div>

                      <div class="relative z-10 mt-8 pt-6 border-t border-white/20 w-full">
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Booking ID</p>
                        <p class="text-xs font-mono font-bold">#{{ booking._id.slice(-8) }}</p>
                      </div>

                      <!-- Decorative circle -->
                      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                    </div>

                    <!-- Right Panel Info -->
                    <div class="lg:w-3/4 p-8">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                          <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-1">{{ booking.tourName }}</h3>
                          <p class="text-blue-600 font-bold flex items-center gap-1">
                            <mat-icon class="text-sm">location_on</mat-icon>
                            {{ booking.destination }}
                          </p>
                        </div>
                        <div class="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Package</p>
                          <p class="text-2xl font-black text-slate-900">₦{{ booking.totalPrice.toLocaleString() }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-blue-500 text-sm">event_available</mat-icon>
                            <span class="font-bold text-slate-800">{{ formatDate(booking.startDate) }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-orange-500 text-sm">wb_sunny</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.duration }} Days</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-purple-500 text-sm">groups</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.participants }} Person{{ booking.participants > 1 ? 's' : '' }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agency</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-slate-400 text-sm">business</mat-icon>
                            <span class="font-bold text-slate-800 line-clamp-1">{{ booking.agency }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Highlights -->
                      <div class="flex flex-wrap gap-2 mb-8">
                        @for (highlight of booking.highlights.slice(0, 4); track highlight) {
                          <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border border-blue-100">
                            {{ highlight }}
                          </span>
                        }
                      </div>

                      <!-- Actions -->
                      <div class="flex flex-wrap gap-3 pt-6 border-t border-slate-50">
                        <button
                          (click)="viewBookingDetails(booking)"
                          class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100">
                          <mat-icon class="text-lg">info</mat-icon>
                          <span>Adventure Details</span>
                        </button>

                        @if (booking.status === 'completed') {
                          <button
                            (click)="rateExperience(booking)"
                            class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100">
                            <mat-icon class="text-lg">star</mat-icon>
                            <span>Rate Experience</span>
                          </button>
                        }

                        @if (booking.status === 'pending') {
                          <button
                            (click)="cancelBooking(booking)"
                            class="px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                            <mat-icon class="text-lg">cancel</mat-icon>
                            <span>Cancel</span>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-5xl text-slate-300">explore</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2">No tour bookings yet</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">Ready for an adventure? Explore our curated tours and experiences worldwide.</p>
            <button
              class="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Discover Experiences
            </button>
          </div>
        }
      }

      <!-- Booking Details View -->
      @if (viewMode() === 'details' && selectedBooking()) {
        @let booking = selectedBooking();
        <div class="bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col animate-in duration-300">
          <!-- Header -->
          <div class="bg-blue-600 text-white p-10 relative overflow-hidden">
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Tour Information</p>
                <h2 class="text-3xl font-black tracking-tight">{{ booking!.tourName }}</h2>
                <p class="text-blue-100/80 font-bold mt-1 flex items-center gap-2">
                  <mat-icon class="text-sm">location_on</mat-icon>
                  {{ booking!.destination }}
                </p>
              </div>
              <button (click)="viewMode.set('list')" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-colors">
                <mat-icon>arrow_back</mat-icon>
                <span class="font-bold">Back to List</span>
              </button>
            </div>
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
          </div>

          <!-- Content -->
          <div class="p-10 space-y-10">
            <!-- Summary Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <p class="font-black text-blue-600 uppercase">{{ getStatusBadge(booking!.status) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</p>
                <p class="font-black text-slate-900">{{ formatDate(booking!.startDate) }} - {{ formatDate(booking!.endDate) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
                <p class="font-black text-slate-900">{{ booking!.participants }} People</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</p>
                <p class="font-black text-slate-900">₦{{ booking!.totalPrice.toLocaleString() }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <!-- Tour Highlights -->
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <mat-icon class="text-sm">star</mat-icon>
                  Experience Highlights
                </h3>
                <div class="grid grid-cols-1 gap-4">
                  @for (highlight of booking!.highlights; track highlight) {
                    <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                      <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                        <mat-icon class="text-sm">check</mat-icon>
                      </div>
                      <p class="font-black text-slate-900">{{ highlight }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Agency & Payment -->
              <div class="space-y-8">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <mat-icon class="text-sm">business</mat-icon>
                    Tour Agency
                  </h3>
                  <div class="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <div class="flex items-center gap-6 mb-6">
                      <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl">
                        {{ booking!.agency.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-black text-slate-900 text-xl">{{ booking!.agency }}</p>
                        <p class="text-sm text-blue-600 font-bold flex items-center gap-1">
                          <mat-icon class="text-sm">verified</mat-icon>
                          Partner Agency
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <mat-icon class="text-sm">payments</mat-icon>
                    Payment Summary
                  </h3>
                  <div class="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-200">
                    <div class="space-y-4">
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Package Rate</span>
                        <span>₦{{ booking!.totalPrice.toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Booking Fees</span>
                        <span>₦0.00</span>
                      </div>
                      <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span class="font-black uppercase text-xs tracking-widest">Total Paid</span>
                        <span class="text-3xl font-black text-blue-400">₦{{ booking!.totalPrice.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-10 bg-slate-50 border-t border-slate-100">
            <div class="flex gap-4">
              <button
                (click)="rateExperience(booking!)"
                [disabled]="booking!.status !== 'completed'"
                class="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-yellow-100 flex items-center justify-center gap-2">
                <mat-icon>star</mat-icon>
                <span>Rate this Experience</span>
              </button>
              <button
                (click)="viewMode.set('list')"
                class="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all">
                Return to Adventures
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }
    .animate-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class CustomerToursBookingsComponent implements OnInit {
  tourBookings = signal<TourBooking[]>([]);
  viewMode = signal<'list' | 'details'>('list');
  selectedBooking = signal<TourBooking | null>(null);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadTourBookings();
  }

  loadTourBookings(): void {
    this.customerService.getMyTourBookings().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.tourBookings.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading tour bookings:', error);
      }
    );
  }

  getConfirmedCount(): number {
    return this.tourBookings().filter(b => b.status === 'confirmed').length;
  }

  getUpcomingCount(): number {
    return this.tourBookings().filter(b => this.isUpcoming(b)).length;
  }

  getCompletedCount(): number {
    return this.tourBookings().filter(b => b.status === 'completed').length;
  }

  isUpcoming(booking: TourBooking): boolean {
    return new Date(booking.startDate) > new Date();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-green-200 text-green-900 text-xs font-semibold',
      'in-progress': 'inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-xs font-semibold',
      completed: 'inline-block px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-200 text-red-900 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900 text-xs font-semibold';
  }

  viewBookingDetails(booking: TourBooking): void {
    this.selectedBooking.set(booking);
    this.viewMode.set('details');
  }

  cancelBooking(booking: TourBooking): void {
    if (confirm('Are you sure you want to cancel this tour booking?')) {
      console.log('Cancel booking:', booking._id);
      // Mock update
      this.tourBookings.update(bookings =>
        bookings.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b)
      );
    }
  }

  rateExperience(booking: TourBooking): void {
    console.log('Rate experience:', booking._id);
    alert('Rating feature coming soon for ' + booking.tourName);
  }
}
