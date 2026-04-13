import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

interface ServiceBooking {
  _id: string;
  serviceName: string;
  provider: string;
  serviceDate: string;
  serviceTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
}

@Component({
  selector: 'app-customer-services-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      @if (viewMode() === 'list') {
        <!-- Enhanced Summary Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <mat-icon>miscellaneous_services</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <p class="text-2xl font-black text-slate-900">{{ serviceBookings().length }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <mat-icon>hourglass_top</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending</p>
              <p class="text-2xl font-black text-slate-900">{{ getPendingCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
              <p class="text-2xl font-black text-slate-900">{{ getInProgressCount() }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed</p>
              <p class="text-2xl font-black text-slate-900">{{ getCompletedCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Bookings Cards -->
        @if (serviceBookings().length > 0) {
          <div class="space-y-6">
            <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
              Service Bookings
            </h3>
            <div class="grid grid-cols-1 gap-6">
              @for (booking of serviceBookings(); track booking._id) {
                <div class="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 group">
                  <div class="flex flex-col lg:flex-row">
                    <!-- Status & Left Panel -->
                    <div [class]="'lg:w-1/4 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden ' +
                      (booking.status === 'completed' ? 'bg-green-600 text-white' :
                       booking.status === 'cancelled' ? 'bg-slate-100 text-slate-400' :
                       'bg-blue-600 text-white')">

                      <div class="relative z-10">
                        <mat-icon class="text-5xl mb-4 opacity-80">miscellaneous_services</mat-icon>
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
                          <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-1">{{ booking.serviceName }}</h3>
                          <p class="text-blue-600 font-bold flex items-center gap-1">
                            <mat-icon class="text-sm">person</mat-icon>
                            Provided by {{ booking.provider }}
                          </p>
                        </div>
                        <div class="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Price</p>
                          <p class="text-2xl font-black text-slate-900">₦{{ booking.price.toLocaleString() }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-blue-500 text-sm">calendar_today</mat-icon>
                            <span class="font-bold text-slate-800">{{ formatDate(booking.serviceDate) }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-orange-500 text-sm">schedule</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.serviceTime }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-purple-500 text-sm">timer</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.duration }} mins</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-red-500 text-sm">location_on</mat-icon>
                            <span class="font-bold text-slate-800 line-clamp-1">{{ booking.location || 'On-site' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex flex-wrap gap-3 pt-6 border-t border-slate-50">
                        <button
                          (click)="viewBookingDetails(booking)"
                          class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100">
                          <mat-icon class="text-lg">info</mat-icon>
                          <span>View Details</span>
                        </button>

                        @if (booking.status === 'completed') {
                          <button
                            (click)="rateService(booking)"
                            class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100">
                            <mat-icon class="text-lg">star</mat-icon>
                            <span>Rate Service</span>
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
              <mat-icon class="text-5xl text-slate-300">miscellaneous_services</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2">No service bookings yet</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">Need something done? Browse our wide range of professional services.</p>
            <button
              class="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Explore Services
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
                <p class="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Booking Information</p>
                <h2 class="text-3xl font-black tracking-tight">{{ booking!.serviceName }}</h2>
                <p class="text-blue-100/80 font-bold mt-1 flex items-center gap-2">
                  <mat-icon class="text-sm">tag</mat-icon>
                  #{{ booking!._id.slice(0, 16) }}
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
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                <p class="font-black text-slate-900">{{ formatDate(booking!.serviceDate) }} at {{ booking!.serviceTime }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                <p class="font-black text-slate-900">{{ booking!.duration }} Minutes</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</p>
                <p class="font-black text-slate-900">₦{{ booking!.price.toLocaleString() }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <!-- Provider & Service Info -->
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <mat-icon class="text-sm">person</mat-icon>
                  Provider Details
                </h3>
                <div class="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <div class="flex items-center gap-6 mb-6">
                    <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm border border-slate-100 text-2xl">
                      {{ booking!.provider.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-black text-slate-900 text-xl">{{ booking!.provider }}</p>
                      <p class="text-sm text-blue-600 font-bold">Verified Service Provider</p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center gap-3 text-slate-600 font-bold">
                      <mat-icon class="text-blue-500">location_on</mat-icon>
                      <span>{{ booking!.location || 'Provider Location' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Details / Payment -->
              <div class="space-y-8">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <mat-icon class="text-sm">payments</mat-icon>
                    Payment Summary
                  </h3>
                  <div class="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-200">
                    <div class="space-y-4">
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Service Rate</span>
                        <span>₦{{ booking!.price.toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 font-bold text-sm">
                        <span>Service Fees</span>
                        <span>₦0.00</span>
                      </div>
                      <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span class="font-black uppercase text-xs tracking-widest">Total Amount</span>
                        <span class="text-3xl font-black text-blue-400">₦{{ booking!.price.toLocaleString() }}</span>
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
                (click)="rateService(booking!)"
                [disabled]="booking!.status !== 'completed'"
                class="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-yellow-100 flex items-center justify-center gap-2">
                <mat-icon>star</mat-icon>
                <span>Rate this Service</span>
              </button>
              <button
                (click)="viewMode.set('list')"
                class="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all">
                Return to Bookings
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
export class CustomerServicesBookingsComponent implements OnInit {
  serviceBookings = signal<ServiceBooking[]>([]);
  viewMode = signal<'list' | 'details'>('list');
  selectedBooking = signal<ServiceBooking | null>(null);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadServiceBookings();
  }

  loadServiceBookings(): void {
    this.customerService.getServiceBookings().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.serviceBookings.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading service bookings:', error);
      }
    );
  }

  getPendingCount(): number {
    return this.serviceBookings().filter(b => b.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.serviceBookings().filter(b => b.status === 'in-progress').length;
  }

  getCompletedCount(): number {
    return this.serviceBookings().filter(b => b.status === 'completed').length;
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
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      confirmed: 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      'in-progress': 'inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold',
      completed: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewBookingDetails(booking: ServiceBooking): void {
    this.selectedBooking.set(booking);
    this.viewMode.set('details');
  }

  cancelBooking(booking: ServiceBooking): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      console.log('Cancel booking:', booking._id);
      // Mock local update
      this.serviceBookings.update(bookings =>
        bookings.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b)
      );
    }
  }

  rateService(booking: ServiceBooking): void {
    console.log('Rate service:', booking._id);
    alert('Rating feature coming soon for ' + booking.serviceName);
  }
}
