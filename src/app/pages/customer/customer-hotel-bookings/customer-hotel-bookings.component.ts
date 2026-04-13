import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { BookingSmartLockAccessData, HotelAmenityService, HotelService } from '../../../services/hotel.service';
import { ChatRealtimeService, ChatRealtimeEvent } from '../../../services/chat-realtime.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { BrowserNotificationService } from '../../../services/browser-notification.service';

interface HotelBooking {
  _id: string;
  hotelId?: string;
  hotel?: any;
  hotelName: string;
  roomId?: string;
  room?: any;
  roomNumber?: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'completed' | 'cancelled';
  roomServiceOrders?: any[];
  hotelServiceOrders?: any[];
  amenities?: string[];
  bedType?: string;
  guestCount?: number;
}

interface HotelStayReviewDraft {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  roomLabel: string;
}

interface SmartKeyStayData extends BookingSmartLockAccessData {}

interface RoomServiceItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  image?: string;
}

interface ChatMessage {
  _id: string;
  sender: 'customer' | 'vendor';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface VendorChat {
  _id: string;
  bookingId?: string;
  orderId?: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'hotel' | 'restaurant' | 'retail' | 'service' | 'tour' | 'delivery';
  vendorIcon: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  unreadForCustomer?: number;
  unreadForVendor?: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

type HotelStayServiceCategory = 'service' | 'massage' | 'spa' | 'gym' | 'shuttle';

type StayMenuItem = 'restaurant' | 'bar' | 'service' | 'massage' | 'spa' | 'gym' | 'shuttle' | 'orders' | 'chat' | 'call' | 'review' | 'checkout' | 'smart-key';

@Component({
  selector: 'app-customer-hotel-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="space-y-8">
      @if (viewMode() === 'list') {
        <!-- Enhanced Summary Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <mat-icon>hotel</mat-icon>
            </div>
            <div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <p class="text-2xl font-black text-slate-900">{{ bookings().length }}</p>
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

        @if (activeBookings().length > 0) {
          <div class="space-y-6">
            <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-2 h-8 bg-emerald-600 rounded-full"></span>
              {{ getRoomLabel(activeBookings()[0]) }}
            </h3>
            @for (booking of activeBookings(); track booking._id) {
              <div
                (click)="openStayMenuPage(booking)"
                class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-emerald-100 group cursor-pointer"
              >
                <div class="flex flex-col lg:flex-row">
                  <div class="lg:w-1/4 p-5 flex flex-col justify-between items-center text-center relative overflow-hidden bg-emerald-600 text-white">
                    <div class="relative z-10">
                      <mat-icon class="text-4xl mb-3 opacity-80">hotel</mat-icon>
                      <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{{ getRoomLabel(booking) }}</p>
                      <p class="text-base font-black uppercase tracking-tight">{{ getStatusBadge(booking.status) }}</p>
                    </div>
                    <div class="relative z-10 mt-5 pt-4 border-t border-white/20 w-full">
                      <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Room</p>
                      <p class="text-sm font-black">{{ getRoomLabel(booking) }}</p>
                    </div>
                    <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                  </div>

                  <div class="lg:w-3/4 p-5">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
                      <div>
                        <h3 class="text-xl font-black text-slate-900 tracking-tight mb-1">{{ booking.hotelName }}</h3>
                        <p class="text-emerald-600 font-bold flex items-center gap-1">
                          <mat-icon class="text-sm">meeting_room</mat-icon>
                          {{ getRoomLabel(booking) }}
                        </p>
                      </div>
                      <div class="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-out</p>
                        <p class="text-base font-black text-slate-900">{{ formatDate(booking.checkOut) }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                        <p class="font-bold text-slate-800">{{ booking.roomType | titlecase }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                        <p class="font-bold text-slate-800">{{ booking.guestCount || 1 }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Length</p>
                        <p class="font-bold text-slate-800">{{ booking.nights }} Night{{ booking.nights > 1 ? 's' : '' }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</p>
                        <p class="font-bold text-emerald-600">Tap card to open stay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Enhanced Bookings Cards -->
        @if (historyBookings().length > 0) {
          <div class="space-y-6">
            <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
              Booking History
            </h3>
            <div class="grid grid-cols-1 gap-4">
              @for (booking of historyBookings(); track booking._id) {
                <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                  <div class="flex flex-col lg:flex-row">
                    <!-- Booking Status & Left Panel -->
                    <div [class]="'lg:w-1/4 p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ' +
                      (booking.status === 'confirmed' || booking.status === 'checked-in' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600')">

                      <div class="relative z-10">
                        <mat-icon class="text-4xl mb-3 opacity-80">hotel</mat-icon>
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Status</p>
                        <p class="text-base font-black uppercase tracking-tight">{{ getStatusBadge(booking.status) }}</p>
                      </div>

                      <div class="relative z-10 mt-5 pt-4 border-t border-white/20 w-full">
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Booking ID</p>
                        <p class="text-xs font-mono font-bold">#{{ booking._id.slice(-8) }}</p>
                      </div>

                      <!-- Decorative circle -->
                      <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>

                    <!-- Right Panel Info -->
                    <div class="lg:w-3/4 p-5">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
                        <div>
                          <h3 class="text-xl font-black text-slate-900 tracking-tight mb-1">{{ booking.hotelName }}</h3>
                          <p class="text-blue-600 font-bold flex items-center gap-1">
                            <mat-icon class="text-sm">bed</mat-icon>
                            {{ booking.roomType | titlecase }} Room
                          </p>
                        </div>
                        <div class="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-right">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                          <p class="text-xl font-black text-slate-900">₦{{ booking.totalPrice.toLocaleString() }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-blue-500 text-sm">login</mat-icon>
                            <span class="font-bold text-slate-800">{{ formatDate(booking.checkIn) }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-red-500 text-sm">logout</mat-icon>
                            <span class="font-bold text-slate-800">{{ formatDate(booking.checkOut) }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Length</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-slate-400 text-sm">nights_stay</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.nights }} Night{{ booking.nights > 1 ? 's' : '' }}</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                          <div class="flex items-center gap-2">
                            <mat-icon class="text-slate-400 text-sm">people</mat-icon>
                            <span class="font-bold text-slate-800">{{ booking.guestCount || '1' }} Person{{ (booking.guestCount || 1) > 1 ? 's' : '' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Actions -->
                        <div class="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                          <p class="text-sm text-slate-500 font-medium">
                            {{ booking.status === 'cancelled' ? 'Cancelled booking' : 'Booking record available for reference' }}
                          </p>
                          <div class="flex items-center gap-2">
                            @if (canReviewBooking(booking)) {
                              <button
                                (click)="openStayMenuPage(booking, 'review')"
                                class="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-slate-900 text-white hover:bg-blue-700 shadow-lg shadow-slate-200"
                              >
                                Review Stay
                              </button>
                            }
                            @if (!canReviewBooking(booking) && booking.status !== 'cancelled') {
                              <button
                                (click)="openStayMenuPage(booking, 'orders')"
                                class="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Open Stay
                              </button>
                            }
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else if (activeBookings().length === 0) {
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-5xl text-slate-300">hotel</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2">No hotel bookings yet</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">Ready for a getaway? Start exploring our premium collection of hotels.</p>
            <button (click)="switchToHotelsTab()"
              class="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Discover Hotels
            </button>
          </div>
        }
      }

      @if (viewMode() === 'stay-menu' && selectedBooking()) {
        @let stay = selectedBooking();
        <div class="space-y-8">
          <div class="bg-white rounded-[28px] shadow-xl overflow-hidden border border-slate-100">
            <div class="flex flex-col lg:flex-row min-h-[620px]">
              <aside class="lg:w-80 bg-slate-900 text-white p-6 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-black">Stay Menu</h3>
                <button (click)="viewMode.set('list')" class="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <div class="bg-white/10 rounded-2xl p-4 space-y-2 text-sm">
                <div class="flex justify-between gap-3">
                  <span class="text-slate-300">Booking #</span>
                  <span class="font-bold">#{{ stay!._id.slice(-8) }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-300">Room</span>
                  <span class="font-bold">{{ getRoomLabel(stay!) }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-300">Guests</span>
                  <span class="font-bold">{{ stay!.guestCount || 1 }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-300">Status</span>
                  <span class="font-bold">{{ getStatusBadge(stay!.status) }}</span>
                </div>
              </div>

              <nav class="space-y-2">
                <button (click)="setStayMenuItem('service')" [disabled]="isClosedStay(stay!) || !hasAmenity(stay!, ['service', 'room service', 'concierge', 'laundry'])" [ngClass]="getStayMenuButtonClass('service', isClosedStay(stay!) || !hasAmenity(stay!, ['service', 'room service', 'concierge', 'laundry']))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">support_agent</mat-icon>
                  Hotel Services
                </button>
                <button (click)="setStayMenuItem('restaurant')" [disabled]="isClosedStay(stay!)" [ngClass]="getStayMenuButtonClass('restaurant', isClosedStay(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">restaurant</mat-icon>
                  Restaurant
                </button>
                <button (click)="setStayMenuItem('bar')" [disabled]="isClosedStay(stay!)" [ngClass]="getStayMenuButtonClass('bar', isClosedStay(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">local_bar</mat-icon>
                  Bar
                </button>
                <button (click)="setStayMenuItem('spa')" [disabled]="isClosedStay(stay!) || !hasAmenity(stay!, ['massage', 'spa'])" [ngClass]="getStayMenuButtonClass('spa', isClosedStay(stay!) || !hasAmenity(stay!, ['massage', 'spa']))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">spa</mat-icon>
                  Massage / Spa
                </button>
                <button (click)="setStayMenuItem('gym')" [disabled]="isClosedStay(stay!) || !hasAmenity(stay!, ['gym', 'fitness'])" [ngClass]="getStayMenuButtonClass('gym', isClosedStay(stay!) || !hasAmenity(stay!, ['gym', 'fitness']))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">fitness_center</mat-icon>
                  Gym
                </button>
                <button (click)="setStayMenuItem('shuttle')" [disabled]="isClosedStay(stay!) || !hasAmenity(stay!, ['shuttle', 'airport', 'transfer'])" [ngClass]="getStayMenuButtonClass('shuttle', isClosedStay(stay!) || !hasAmenity(stay!, ['shuttle', 'airport', 'transfer']))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">airport_shuttle</mat-icon>
                  Airport Shuttle
                </button>
                <button (click)="setStayMenuItem('orders')" [disabled]="isClosedStay(stay!)" [ngClass]="getStayMenuButtonClass('orders', isClosedStay(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">receipt_long</mat-icon>
                  Track Orders
                </button>
                <button (click)="setStayMenuItem('chat')" [disabled]="isClosedStay(stay!)" [ngClass]="getStayMenuButtonClass('chat', isClosedStay(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-between text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <span class="inline-flex items-center gap-2">
                    <mat-icon class="text-base">chat</mat-icon>
                    Chat Front Desk
                  </span>
                  @if ((hotelChat()?.unreadForCustomer || 0) > 0) {
                    <span class="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">{{ hotelChat()?.unreadForCustomer }}</span>
                  }
                </button>
                <button (click)="setStayMenuItem('call')" [disabled]="isClosedStay(stay!)" [ngClass]="getStayMenuButtonClass('call', isClosedStay(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">phone</mat-icon>
                  Call Hotel
                </button>
                @if (canReviewBooking(stay!)) {
                  <button (click)="setStayMenuItem('review')" [ngClass]="getStayMenuButtonClass('review')" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2">
                    <mat-icon class="text-base">star_rate</mat-icon>
                    Review Stay
                  </button>
                }
                <button (click)="setStayMenuItem('smart-key')" [disabled]="isClosedStay(stay!) || !canUseSmartKey(stay!)" [ngClass]="getStayMenuButtonClass('smart-key', isClosedStay(stay!) || !canUseSmartKey(stay!))" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition !justify-start text-left !inline-flex items-center gap-2 disabled:cursor-not-allowed">
                  <mat-icon class="text-base">vpn_key</mat-icon>
                  Smart Key
                </button>
              </nav>
              </aside>

              <div class="flex-1 p-6 md:p-8">
                <div class="mb-6">
                  <p class="text-xs uppercase tracking-widest text-slate-400 font-black">{{ getRoomLabel(stay!) }}</p>
                  <h2 class="text-2xl font-black text-slate-900 mt-1">{{ stay!.hotelName }}</h2>
                  <p class="text-slate-600 mt-1">{{ getRoomLabel(stay!) }} • Check-out {{ formatDate(stay!.checkOut) }} • {{ stay!.nights }} night{{ stay!.nights > 1 ? 's' : '' }}</p>
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                @if (activeStayMenuItem() === 'smart-key') {
                  <div class="space-y-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Room Access</p>
                        <h3 class="text-2xl font-black text-slate-900 mt-2">Smart Key</h3>
                        <p class="text-slate-500 mt-2 max-w-2xl">Use your digital room access for this stay. It expires automatically at checkout.</p>
                      </div>
                      @if (smartKeyData()?.smartLockAccess?.enabled) {
                        <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">
                          Active Access
                        </span>
                      } @else {
                        <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700">
                          No Active Key
                        </span>
                      }
                    </div>

                    @if (smartKeyLoading()) {
                      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
                        Loading smart key details...
                      </div>
                    } @else if (smartKeyError()) {
                      <div class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {{ smartKeyError() }}
                      </div>
                    } @else if (smartKeyData()?.smartLockAccess?.enabled) {
                      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <p class="text-xs uppercase tracking-wide text-slate-500">Access Token</p>
                          <p class="mt-3 break-all rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900">{{ smartKeyData()?.smartLockAccess?.accessToken }}</p>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <p class="text-xs uppercase tracking-wide text-slate-500">Backup PIN</p>
                          <p class="mt-3 rounded-xl bg-amber-50 px-4 py-4 text-center font-mono text-3xl font-black tracking-[0.35em] text-amber-700">{{ smartKeyData()?.smartLockAccess?.backupPin }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <p class="text-xs uppercase tracking-wide text-blue-700">Check-in</p>
                          <p class="mt-2 text-lg font-bold text-slate-900">{{ formatDateTimeShort(smartKeyData()?.checkInDate) }}</p>
                        </div>
                        <div class="rounded-2xl border border-red-100 bg-red-50 p-4">
                          <p class="text-xs uppercase tracking-wide text-red-700">Expires</p>
                          <p class="mt-2 text-lg font-bold text-slate-900">{{ formatDateTimeShort(smartKeyData()?.smartLockAccess?.expiresAt || smartKeyData()?.checkOutDate) }}</p>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs uppercase tracking-wide text-slate-500">Unlock Attempts</p>
                          <p class="mt-2 text-lg font-bold text-slate-900">{{ smartKeyData()?.smartLockAccess?.unlockAttempts?.length || 0 }}</p>
                        </div>
                      </div>

                      @if (smartKeyData()?.smartLockAccess?.qrCode) {
                        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <p class="text-xs uppercase tracking-wide text-slate-500">Unlock QR</p>
                          <img [src]="smartKeyData()?.smartLockAccess?.qrCode" alt="Smart key QR code" class="mt-4 h-40 w-40 rounded-2xl border border-slate-200 object-contain" />
                        </div>
                      }
                    } @else {
                      <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <mat-icon class="text-3xl">vpn_key_off</mat-icon>
                        </div>
                        <p class="mt-4 text-base font-bold text-slate-900">Smart key not active yet</p>
                        <p class="mt-2 text-sm text-slate-500">Front desk can still help if digital access has not been provisioned for this stay.</p>
                      </div>
                    }
                  </div>
                }

                @if (activeStayMenuItem() === 'chat') {
                  <div class="space-y-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Hotel Support</p>
                        <h3 class="text-2xl font-black text-slate-900 mt-2">Chat Front Desk</h3>
                        <p class="text-slate-500 mt-2 max-w-2xl">Message the hotel team without leaving your stay screen. Ask for help, updates, or room assistance here.</p>
                      </div>
                      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                        <p class="font-bold text-slate-900">{{ stay!.hotelName }}</p>
                        <p class="text-slate-500">{{ getRoomLabel(stay!) }}</p>
                      </div>
                    </div>

                    <div class="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
                        <div class="flex items-center gap-3">
                          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                            <mat-icon>support_agent</mat-icon>
                          </div>
                          <div>
                            <p class="font-black">Front Desk Conversation</p>
                            <p class="text-xs text-slate-300">
                              @if (hotelChat()) {
                                {{ hotelChat()?.status === 'closed' ? 'Closed chat' : 'Live support thread' }}
                              } @else {
                                Preparing chat...
                              }
                            </p>
                          </div>
                        </div>
                        @if (hotelChat()) {
                          <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
                            [ngClass]="{
                              'bg-emerald-100 text-emerald-700': hotelChat()?.status === 'open',
                              'bg-amber-100 text-amber-700': hotelChat()?.status === 'pending',
                              'bg-slate-200 text-slate-700': hotelChat()?.status === 'closed'
                            }">
                            {{ hotelChat()?.status || 'open' }}
                          </span>
                        }
                      </div>

                      @if (chatError()) {
                        <div class="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{{ chatError() }}</div>
                      }

                      <div class="min-h-[360px] max-h-[420px] space-y-4 overflow-y-auto bg-slate-50 px-5 py-5">
                        @if (chatLoading()) {
                          <div class="flex h-[280px] items-center justify-center text-slate-500">
                            <div class="text-center">
                              <mat-icon class="mb-3 text-4xl">hourglass_top</mat-icon>
                              <p class="font-semibold">Loading conversation...</p>
                            </div>
                          </div>
                        } @else if (hotelChat()?.messages?.length) {
                          @for (message of hotelChat()!.messages; track message._id) {
                            <div [class]="'flex ' + (message.sender === 'customer' ? 'justify-end' : 'justify-start')">
                              <div [class]="'max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ' +
                                (message.sender === 'customer'
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md')">
                                <p class="text-[11px] font-bold uppercase tracking-wider opacity-70">{{ message.senderName }}</p>
                                <p class="mt-1 text-sm leading-relaxed">{{ message.message }}</p>
                                <p class="mt-2 text-[11px] opacity-70">{{ message.timestamp | date:'MMM d, HH:mm' }}</p>
                              </div>
                            </div>
                          }
                        } @else {
                          <div class="flex h-[280px] items-center justify-center">
                            <div class="max-w-sm text-center text-slate-500">
                              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                                <mat-icon class="text-3xl">chat_bubble_outline</mat-icon>
                              </div>
                              <p class="text-lg font-bold text-slate-800">No messages yet</p>
                              <p class="mt-2 text-sm">Start the conversation and the hotel team will reply in this thread.</p>
                            </div>
                          </div>
                        }
                      </div>

                      @if (hotelChat()?.status !== 'closed') {
                        <div class="border-t border-slate-100 bg-white p-4">
                          <div class="flex flex-col gap-3 md:flex-row">
                            <textarea
                              [ngModel]="chatDraft()"
                              (ngModelChange)="chatDraft.set($event)"
                              rows="3"
                              placeholder="Type a message to the front desk..."
                              class="min-h-[88px] flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                            <button
                              (click)="sendHotelChatMessage()"
                              [disabled]="chatSending() || !chatDraft().trim()"
                              class="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {{ chatSending() ? 'Sending...' : 'Send Message' }}
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (activeStayMenuItem() === 'call') {
                  <div class="space-y-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Hotel Support</p>
                        <h3 class="text-2xl font-black text-slate-900 mt-2">Call Desk</h3>
                        <p class="text-slate-500 mt-2 max-w-2xl">Reach the hotel directly from your stay workspace. Use the number below for front desk, room support, or urgent assistance.</p>
                      </div>
                    </div>

                    <div class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                      <div class="rounded-[28px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-7 text-white shadow-lg">
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-emerald-100">Direct Line</p>
                        <h4 class="mt-3 text-3xl font-black">{{ getHotelDisplayPhone(stay!) }}</h4>
                        <p class="mt-3 max-w-md text-sm text-emerald-50">Use this line for room requests, service follow-up, or front desk assistance during your stay.</p>
                        <div class="mt-6 flex flex-wrap gap-3">
                          <button
                            (click)="callHotelSupport(stay!)"
                            class="rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Call Now
                          </button>
                        </div>
                      </div>

                      <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Stay Contact</p>
                        <div class="mt-4 space-y-4">
                          <div class="rounded-2xl bg-slate-50 p-4">
                            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hotel</p>
                            <p class="mt-2 text-lg font-black text-slate-900">{{ stay!.hotelName }}</p>
                          </div>
                          <div class="rounded-2xl bg-slate-50 p-4">
                            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Room</p>
                            <p class="mt-2 text-lg font-black text-slate-900">{{ getRoomLabel(stay!) }}</p>
                          </div>
                          <div class="rounded-2xl bg-slate-50 p-4">
                            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Fallback</p>
                            <p class="mt-2 text-sm font-semibold text-slate-700">If the hotel line is unavailable, the support line is used automatically.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                @if (activeStayMenuItem() === 'review') {
                  <div class="space-y-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Guest Feedback</p>
                        <h3 class="text-2xl font-black text-slate-900 mt-2">Review Your Stay</h3>
                        <p class="text-slate-500 mt-2 max-w-2xl">Rate your stay and send feedback directly to the hotel review dashboard.</p>
                      </div>
                    </div>

                    <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      @if (hasReviewForBooking(stay!)) {
                        <div class="py-10 text-center">
                          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                            <mat-icon class="text-3xl">check_circle</mat-icon>
                          </div>
                          <p class="text-xl font-black text-slate-900">Review Submitted</p>
                          <p class="mt-2 text-sm text-slate-500">Your feedback has already been recorded for this stay.</p>
                        </div>
                      } @else {
                        <div class="space-y-5">
                          <div>
                            <p class="text-sm font-black text-slate-900 mb-3">Overall Rating</p>
                            <div class="flex items-center gap-2">
                              @for (star of [1, 2, 3, 4, 5]; track star) {
                                <button
                                  type="button"
                                  (click)="reviewRating.set(star)"
                                  class="text-3xl transition-transform hover:scale-110"
                                  [class.text-amber-400]="star <= reviewRating()"
                                  [class.text-slate-200]="star > reviewRating()"
                                >
                                  ★
                                </button>
                              }
                            </div>
                          </div>

                          <div>
                            <label class="block text-sm font-black text-slate-900 mb-2">Title</label>
                            <input
                              type="text"
                              [(ngModel)]="reviewTitle"
                              placeholder="Summarize your stay"
                              class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label class="block text-sm font-black text-slate-900 mb-2">Review</label>
                            <textarea
                              [(ngModel)]="reviewComment"
                              rows="5"
                              placeholder="Share your thoughts about the room, service, and overall experience."
                              class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm resize-none"
                            ></textarea>
                          </div>

                          <div class="flex justify-end">
                            <button
                              type="button"
                              (click)="submitHotelReviewForBooking(stay!)"
                              [disabled]="reviewSubmitting()"
                              class="px-5 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                              {{ reviewSubmitting() ? 'Submitting...' : 'Submit Review' }}
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (activeStayMenuItem() === 'restaurant' || activeStayMenuItem() === 'bar') {
                  <div class="space-y-6">
                    <div class="flex justify-between items-center">
                      <h3 class="text-xl font-black text-slate-900">{{ activeStayMenuItem() === 'restaurant' ? 'Restaurant Menu' : 'Bar Menu' }}</h3>
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ filteredRoomServiceItems().length }} Items</span>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      @for (item of paginatedRoomServiceItems(); track item._id) {
                        <div
                          (click)="selectItem(item)"
                          [class]="'group cursor-pointer rounded-2xl border-2 transition-all p-3 flex flex-col h-full ' +
                            (selectedItems().includes(item._id)
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-white bg-white hover:border-blue-100 shadow-sm')">

                          <div class="aspect-[4/5] rounded-xl bg-slate-100 overflow-hidden mb-3 relative">
                            @if (item.image) {
                              <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                   onerror="this.src='https://placehold.co/400x500?text=No+Image'"/>
                            } @else {
                              <div class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <mat-icon class="text-3xl mb-1">{{ activeStayMenuItem() === 'restaurant' ? 'restaurant' : 'local_bar' }}</mat-icon>
                                <span class="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                              </div>
                            }

                            @if (selectedItems().includes(item._id)) {
                              <div class="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                <div class="bg-white text-blue-600 rounded-full p-1.5 shadow-lg">
                                  <mat-icon class="text-lg">check_circle</mat-icon>
                                </div>
                              </div>
                            }

                            @if (!item.available) {
                              <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                <span class="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Sold Out</span>
                              </div>
                            }
                          </div>

                          <div class="flex-1 flex flex-col">
                            <div class="flex justify-between items-start gap-2 mb-1">
                              <h4 class="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">{{ item.name }}</h4>
                              <span class="text-blue-600 font-black text-xs whitespace-nowrap">₦{{ item.price.toLocaleString() }}</span>
                            </div>
                            <p class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2 text-justify">{{ item.description }}</p>

                            <div class="mt-auto">
                              @if (selectedItems().includes(item._id)) {
                                <span class="text-[9px] font-black text-blue-600 flex items-center gap-1">
                                  <mat-icon class="text-[12px] w-[12px] h-[12px]">check_circle</mat-icon> Selected
                                </span>
                              } @else if (item.available) {
                                <button
                                  type="button"
                                  (click)="selectItem(item); $event.stopPropagation()"
                                  class="w-full bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <mat-icon class="text-[12px] w-[12px] h-[12px]">add_shopping_cart</mat-icon>
                                  Order Now
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>

                    @if (totalPages() > 1) {
                      <div class="flex items-center justify-center gap-2 pt-4">
                        <button
                          (click)="currentPage.set(currentPage() - 1)"
                          [disabled]="currentPage() === 1"
                          class="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all">
                          <mat-icon>chevron_left</mat-icon>
                        </button>

                        <div class="flex items-center gap-1">
                          @for (p of [].constructor(totalPages()); track $index) {
                            <button
                              (click)="currentPage.set($index + 1)"
                              [class]="$index + 1 === currentPage() ? 'bg-blue-600 text-white' : 'hover:bg-white text-slate-600'"
                              class="w-8 h-8 rounded-lg text-xs font-bold transition-all">
                              {{ $index + 1 }}
                            </button>
                          }
                        </div>

                        <button
                          (click)="currentPage.set(currentPage() + 1)"
                          [disabled]="currentPage() === totalPages()"
                          class="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all">
                          <mat-icon>chevron_right</mat-icon>
                        </button>
                      </div>
                    }

                    @if (selectedItems().length > 0) {
                      <div class="pt-6 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Total</p>
                          <p class="text-xl font-black text-slate-900">₦{{ calculateOrderTotal().toLocaleString() }}</p>
                        </div>
                        <button
                          (click)="activeStayMenuItem.set('checkout')"
                          class="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                          <mat-icon>shopping_cart</mat-icon>
                          <span>Review Order</span>
                        </button>
                      </div>
                    }

                    @if (roomServiceItems().length > 0 && !hasItemsInCategory()) {
                      <div class="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <mat-icon class="text-4xl text-slate-200 mb-2">restaurant_menu</mat-icon>
                        <p class="text-slate-400 font-bold text-sm">No items available in this category.</p>
                      </div>
                    }
                  </div>
                }
                @if (isHotelServiceCategory(activeStayMenuItem())) {
                  <div class="space-y-6">
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <h3 class="text-xl font-black text-slate-900 mb-2">{{ getHotelServiceCategoryMeta(activeStayMenuItem()).title }}</h3>
                        <p class="text-slate-600 text-justify">{{ getHotelServiceCategoryMeta(activeStayMenuItem()).description }}</p>
                      </div>
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ currentHotelServices().length }} Services</span>
                    </div>

                    @if (currentHotelServices().length === 0) {
                      <div class="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <mat-icon class="text-4xl text-slate-200 mb-2">room_service</mat-icon>
                        <p class="text-slate-500 font-bold text-sm">No live services configured for this category yet.</p>
                      </div>
                    } @else {
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @for (service of currentHotelServices(); track service._id) {
                          <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm overflow-hidden">
                            <div class="flex items-start gap-4 mb-4">
                              <div class="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                                @if (service.image) {
                                  <img [src]="service.image" [alt]="service.name" class="w-full h-full object-cover" />
                                } @else {
                                  <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                                    <span class="text-3xl leading-none">{{ service.icon || '✨' }}</span>
                                    <span class="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
                                  </div>
                                }
                              </div>

                              <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <div class="flex items-center gap-2">
                                      <span class="text-2xl">{{ service.icon || '✨' }}</span>
                                      <h4 class="text-lg font-black text-slate-900">{{ service.name }}</h4>
                                    </div>
                                    <p class="text-sm text-slate-500 mt-1">{{ service.description }}</p>
                                  </div>
                                  <div class="text-right shrink-0">
                                    <p class="text-lg font-black text-slate-900">₦{{ service.price.toLocaleString() }}</p>
                                    <p class="text-[10px] uppercase tracking-widest text-slate-400">{{ service.pricingType || 'per-request' }}</p>
                                  </div>
                                </div>

                                <div class="flex flex-wrap gap-2 mb-4">
                                  <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold capitalize">{{ getHotelServiceCategoryMeta(activeStayMenuItem()).shortLabel }}</span>
                                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{{ service.duration || 'On request' }}</span>
                                  <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{{ service.availability || 'Available daily' }}</span>
                                </div>
                              </div>
                            </div>

                            @if (service.serviceDetails) {
                              <div class="bg-slate-50 rounded-2xl p-3 text-sm text-slate-600 mb-3">
                                {{ service.serviceDetails }}
                              </div>
                            }

                            <button
                              (click)="requestAmenityService(stay!, service)"
                              [disabled]="submittingHotelServiceId() === service._id"
                              class="px-5 py-3 rounded-xl text-white font-bold transition-all"
                              [ngClass]="getHotelServiceCategoryMeta(activeStayMenuItem()).buttonClass"
                            >
                              {{ submittingHotelServiceId() === service._id ? 'Requesting...' : 'Request ' + service.name }}
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                @if (activeStayMenuItem() === 'orders') {
                  <div class="space-y-6">
                    <div class="flex justify-between items-center">
                      <h3 class="text-xl font-black text-slate-900">Order History</h3>
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ (stay!.roomServiceOrders?.length || 0) + (stay!.hotelServiceOrders?.length || 0) }} Orders</span>
                    </div>

                    @if ((stay!.roomServiceOrders && stay!.roomServiceOrders.length > 0) || (stay!.hotelServiceOrders && stay!.hotelServiceOrders.length > 0)) {
                      <div class="space-y-4">
                        @for (order of stay!.roomServiceOrders || []; track order._id) {
                          <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-4">
                              <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                  <mat-icon class="text-sm">restaurant</mat-icon>
                                </div>
                                <div>
                                  <p class="text-sm font-black text-slate-900">Order #{{ order._id.substring(0, 8) }}</p>
                                  <p class="text-[10px] text-slate-400 font-bold">{{ formatDate(order.orderedAt) }}</p>
                                </div>
                              </div>
                              <span [class]="getOrderStatusBadgeClass(order.status) + ' px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest'">
                                {{ getOrderStatusBadge(order.status) }}
                              </span>
                            </div>
                            <div class="bg-slate-50/50 rounded-2xl p-4">
                              <div class="mb-4">
                                <div class="flex items-center gap-4">
                                  <div class="relative w-20 h-20 shrink-0">
                                    <svg viewBox="0 0 36 36" class="w-20 h-20 -rotate-90">
                                      <path
                                        d="M18 2.0845
                                          a 15.9155 15.9155 0 0 1 0 31.831
                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        stroke-width="3"
                                      />
                                      <path
                                        d="M18 2.0845
                                          a 15.9155 15.9155 0 0 1 0 31.831
                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#2563eb"
                                        stroke-width="3"
                                        stroke-linecap="round"
                                        [attr.stroke-dasharray]="getRoomServiceProgress(order.status) + ', 100'"
                                      />
                                    </svg>
                                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                                      <span class="text-lg font-black text-slate-900">{{ getRoomServiceProgress(order.status) }}%</span>
                                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                                    </div>
                                  </div>

                                  <div class="flex-1">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivery Stage</p>
                                    <p class="text-sm font-black text-blue-600 mb-2">{{ getOrderStatusBadge(order.status) }}</p>
                                    <div class="flex flex-wrap gap-2">
                                      @for (step of getRoomServiceTrackingSteps(order.status); track step.label) {
                                        <span
                                          class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                          [class]="step.active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'"
                                        >
                                          {{ step.label }}
                                        </span>
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="mb-4 flex items-center justify-between rounded-2xl bg-white border border-slate-100 px-4 py-3">
                                <div>
                                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Arrival</p>
                                  <p class="text-sm font-bold text-slate-900">{{ getRoomServiceEtaLabel(order) }}</p>
                                </div>
                                <div class="text-right">
                                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Countdown</p>
                                  <p class="text-lg font-black text-blue-600">{{ getRoomServiceCountdown(order) }}</p>
                                </div>
                              </div>
                              <div class="space-y-2 mb-4">
                                @for (item of getRoomServiceOrderItems(order); track item.itemId || item.name) {
                                  <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                                    <span>{{ item.name }} x{{ item.quantity }}</span>
                                    <span class="text-slate-900">₦{{ (item.price * item.quantity).toLocaleString() }}</span>
                                  </div>
                                }
                              </div>
                              <div class="border-t border-slate-100 pt-3 flex items-center justify-between">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                <span class="font-black text-slate-900">₦{{ order.totalPrice.toLocaleString() }}</span>
                              </div>
                            </div>
                          </div>
                        }

                        @for (order of stay!.hotelServiceOrders || []; track order._id) {
                          <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-4">
                              <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                  <mat-icon class="text-sm">room_service</mat-icon>
                                </div>
                                <div>
                                  <p class="font-black text-slate-900">{{ order.name }}</p>
                                  <p class="text-sm text-slate-500 capitalize">{{ order.category }}</p>
                                </div>
                              </div>
                              <span [class]="getOrderStatusClass(order.status)">{{ getServiceOrderStatusBadge(order.status) }}</span>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Requested</p>
                                <p class="font-semibold text-slate-800">{{ formatDate(order.requestedAt) }}</p>
                              </div>
                              <div>
                                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Quantity</p>
                                <p class="font-semibold text-slate-800">{{ order.quantity || 1 }}</p>
                              </div>
                              <div>
                                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Amount</p>
                                <p class="font-semibold text-slate-800">₦{{ formatAmount(order.totalPrice) }}</p>
                              </div>
                              <div>
                                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Status</p>
                                <p class="font-semibold text-slate-800 capitalize">{{ order.status }}</p>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <mat-icon class="text-4xl text-slate-200 mb-2">history</mat-icon>
                        <p class="text-slate-400 font-bold text-sm">You haven't placed any orders during this stay yet.</p>
                        <button (click)="activeStayMenuItem.set('restaurant')" class="mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all">
                          Order Room Service
                        </button>
                      </div>
                    }
                  </div>
                }

                @if (activeStayMenuItem() === 'checkout') {
                  <div class="space-y-6">
                    <div class="flex items-center gap-3 mb-2">
                      <button (click)="activeStayMenuItem.set('restaurant')" class="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-blue-600">
                        <mat-icon>arrow_back</mat-icon>
                      </button>
                      <h3 class="text-xl font-black text-slate-900">Review Your Order</h3>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div class="p-6 space-y-4">
                        @for (itemId of selectedItems(); track itemId) {
                          @let item = this.getItemById(itemId);
                          @if (item) {
                            <div class="flex items-center justify-between group">
                              <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                  @if (item.image) {
                                    <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover" />
                                  } @else {
                                    <div class="w-full h-full flex items-center justify-center text-slate-300">
                                      <mat-icon class="text-xl">restaurant</mat-icon>
                                    </div>
                                  }
                                </div>
                                <div>
                                  <h4 class="font-bold text-slate-900 text-sm">{{ item.name }}</h4>
                                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ item.category }}</p>
                                </div>
                              </div>
                              <div class="flex items-center gap-6">
                                <span class="font-black text-slate-900">₦{{ item.price.toLocaleString() }}</span>
                                <button (click)="selectItem(item)" class="text-red-400 hover:text-red-600 transition-colors">
                                  <mat-icon class="text-lg">delete_outline</mat-icon>
                                </button>
                              </div>
                            </div>
                          }
                        }

                        <div class="pt-6 border-t border-slate-100">
                          <div class="flex justify-between items-center mb-6">
                            <div>
                              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                              <p class="text-2xl font-black text-blue-600">₦{{ calculateOrderTotal().toLocaleString() }}</p>
                            </div>
                            <div class="text-right">
                              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery To</p>
                              <p class="font-bold text-slate-900">Room {{ stay!.roomType }}</p>
                            </div>
                          </div>

                          <div class="flex gap-3">
                            <button
                              (click)="activeStayMenuItem.set('restaurant')"
                              class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black py-4 rounded-2xl transition-all border border-slate-100">
                              Add More Items
                            </button>
                            <button
                              (click)="showOrderConfirmation.set(true)"
                              class="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                              <mat-icon>check_circle</mat-icon>
                              <span>Confirm Order</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                      <mat-icon class="text-blue-600">info</mat-icon>
                      <p class="text-xs text-blue-800 font-medium leading-relaxed">
                        Your order will be charged to your room and delivered within 20-30 minutes.
                        Please ensure someone is present in the room to receive it.
                      </p>
                    </div>
                  </div>
                }
                </div>
              </div>
            </div>
          </div>

          @if (historyBookings().length > 0) {
            <div class="space-y-4">
              <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
                Booking History
              </h3>
              <div class="grid grid-cols-1 gap-4">
                @for (booking of historyBookings(); track booking._id) {
                  <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div class="flex flex-col lg:flex-row">
                      <div [class]="'lg:w-1/4 p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ' +
                        (booking.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600')">
                        <div class="relative z-10">
                          <mat-icon class="text-4xl mb-3 opacity-80">history</mat-icon>
                          <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Status</p>
                          <p class="text-base font-black uppercase tracking-tight">{{ getStatusBadge(booking.status) }}</p>
                        </div>
                      </div>

                      <div class="lg:w-3/4 p-5">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
                          <div>
                            <h3 class="text-xl font-black text-slate-900 tracking-tight mb-1">{{ booking.hotelName }}</h3>
                            <p class="text-blue-600 font-bold flex items-center gap-1">
                              <mat-icon class="text-sm">meeting_room</mat-icon>
                              {{ getRoomLabel(booking) }}
                            </p>
                          </div>
                          <div class="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-right">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                            <p class="text-xl font-black text-slate-900">₦{{ booking.totalPrice.toLocaleString() }}</p>
                          </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                            <p class="font-bold text-slate-800">{{ formatDate(booking.checkIn) }}</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                            <p class="font-bold text-slate-800">{{ formatDate(booking.checkOut) }}</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Length</p>
                            <p class="font-bold text-slate-800">{{ booking.nights }} Night{{ booking.nights > 1 ? 's' : '' }}</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                            <p class="font-bold text-slate-800">{{ booking.guestCount || 1 }}</p>
                          </div>
                        </div>

                        <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                          <p class="text-sm text-slate-500 font-medium">
                            {{ booking.status === 'cancelled' ? 'Cancelled booking' : 'Booking record available for reference' }}
                          </p>
                          <div class="flex items-center gap-2">
                            @if (canReviewBooking(booking)) {
                              <button
                                (click)="openStayMenuPage(booking, 'review')"
                                class="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-slate-900 text-white hover:bg-blue-700 shadow-lg shadow-slate-200"
                              >
                                Review Stay
                              </button>
                            }
                            @if (!canReviewBooking(booking) && booking.status !== 'cancelled') {
                              <button
                                (click)="openStayMenuPage(booking, 'orders')"
                                class="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Open Stay
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Enhanced Room Service View -->
      @if (viewMode() === 'room-service') {
        <div class="bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col animate-in duration-300">
          <!-- Header -->
          <div class="bg-slate-900 text-white p-8 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <mat-icon>room_service</mat-icon>
              </div>
              <div>
                <h3 class="text-xl font-black tracking-tight">Room Service & Dining</h3>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                  {{ selectedBooking()?.hotelName }} • Room {{ selectedBooking()?.roomType }}
                </p>
              </div>
            </div>
            <button
              (click)="viewMode.set('list')"
              class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
              <mat-icon>arrow_back</mat-icon>
              <span class="font-bold text-sm">Back to Bookings</span>
            </button>
          </div>

          <div class="flex-1 p-8">
            <!-- Category Tabs -->
            <div class="flex gap-4 mb-8 p-1.5 bg-slate-100 w-fit rounded-2xl">
              <button
                (click)="roomServiceCategory.set('Food')"
                [class]="'px-8 py-3 rounded-xl font-black text-sm transition-all ' +
                  (roomServiceCategory() === 'Food' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')">
                Food Menu
              </button>
              <button
                (click)="roomServiceCategory.set('Beverage')"
                [class]="'px-8 py-3 rounded-xl font-black text-sm transition-all ' +
                  (roomServiceCategory() === 'Beverage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')">
                Drinks & Beverages
              </button>
            </div>

            <!-- Menu Items Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for (item of paginatedRoomServiceItems(); track item._id) {
                <div
                  (click)="selectItem(item)"
                  [class]="'group cursor-pointer rounded-[32px] border-2 transition-all duration-300 overflow-hidden flex flex-col h-full ' +
                    (selectedItems().includes(item._id)
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm')">

                  <div class="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                    @if (item.image) {
                      <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                           onerror="this.src='https://placehold.co/400x500?text=No+Image'"/>
                    } @else {
                      <div class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <mat-icon class="text-4xl mb-2">restaurant</mat-icon>
                        <span class="text-xs font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    }

                    @if (selectedItems().includes(item._id)) {
                      <div class="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div class="bg-white text-blue-600 rounded-full p-2 shadow-lg">
                          <mat-icon>check_circle</mat-icon>
                        </div>
                      </div>
                    }

                    @if (!item.available) {
                      <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span class="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">Out of Stock</span>
                      </div>
                    }
                  </div>

                  <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-start gap-2 mb-2">
                      <h4 class="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{{ item.name }}</h4>
                      <span class="text-blue-600 font-black whitespace-nowrap">₦{{ item.price.toLocaleString() }}</span>
                    </div>
                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{{ item.description }}</p>

                    <div class="mt-auto flex items-center justify-between">
                      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                        {{ item.category }}
                      </span>
                      @if (selectedItems().includes(item._id)) {
                        <span class="text-[10px] font-black text-blue-600 flex items-center gap-1">
                          <mat-icon class="text-sm">check_circle</mat-icon>
                          Selected
                        </span>
                      } @else if (item.available) {
                        <button
                          type="button"
                          (click)="selectItem(item); $event.stopPropagation()"
                          class="bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition flex items-center gap-1"
                        >
                          <mat-icon class="text-sm">add_shopping_cart</mat-icon>
                          Order Now
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            @if (totalPages() > 1) {
              <div class="flex items-center justify-center gap-2 mt-10">
                <button
                  (click)="currentPage.set(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm">
                  <mat-icon>chevron_left</mat-icon>
                </button>

                <div class="flex items-center gap-2">
                  @for (p of [].constructor(totalPages()); track $index) {
                    <button
                      (click)="currentPage.set($index + 1)"
                      [class]="$index + 1 === currentPage() ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'"
                      class="w-12 h-12 rounded-2xl text-sm font-black transition-all border border-slate-100">
                      {{ $index + 1 }}
                    </button>
                  }
                </div>

                <button
                  (click)="currentPage.set(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            }

            @if (roomServiceItems().length > 0 && !hasItemsInCategory()) {
              <div class="py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                <mat-icon class="text-5xl text-slate-300 mb-4">restaurant_menu</mat-icon>
                <p class="text-slate-500 font-bold">No items available in this category yet.</p>
              </div>
            }
          </div>

          <!-- Order Summary Footer -->
          <div class="p-8 bg-slate-50 border-t border-slate-100">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p class="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Current Order Total</p>
                <p class="text-3xl font-black text-slate-900">₦{{ calculateOrderTotal().toLocaleString() }}</p>
              </div>

              <div class="flex gap-4 w-full md:w-auto">
                <button
                  (click)="clearSelectedItems()"
                  [disabled]="selectedItems().length === 0"
                  class="px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-white transition-all disabled:opacity-30">
                  Clear Selection
                </button>
                <button
                  (click)="showOrderConfirmation.set(true)"
                  [disabled]="selectedItems().length === 0"
                  class="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
                  <mat-icon>shopping_cart</mat-icon>
                  <span>Proceed to Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Booking Details View -->
      @if (viewMode() === 'details' && bookingDetailsData()) {
        @let booking = bookingDetailsData();
        <div class="bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col animate-in duration-300">
          <!-- Header -->
          <div class="bg-blue-600 text-white p-10 relative overflow-hidden">
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Reservation Details</p>
                <h2 class="text-3xl font-black tracking-tight">{{ booking!.hotelName }}</h2>
                <p class="text-blue-100/80 font-bold mt-1 flex items-center gap-2">
                  <mat-icon class="text-sm">confirmation_number</mat-icon>
                  #{{ booking!._id.slice(0, 16) }}
                </p>
              </div>
              <button (click)="closeBookingDetails()" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-colors">
                <mat-icon>arrow_back</mat-icon>
                <span class="font-bold">Back to List</span>
              </button>
            </div>
            <!-- Decorative background element -->
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
          </div>

          <!-- Content -->
          <div class="p-10 space-y-10">
            <!-- Summary Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                <p class="font-black text-slate-900">{{ formatDate(booking!.checkIn) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                <p class="font-black text-slate-900">{{ formatDate(booking!.checkOut) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                <p class="font-black text-slate-900">{{ booking!.guestCount || 1 }} Person{{ (booking!.guestCount || 1) > 1 ? 's' : '' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</p>
                <p class="font-black text-blue-600">{{ booking!.roomType | titlecase }}</p>
              </div>
            </div>

            <!-- Pricing & Financials -->
            <div class="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <mat-icon class="text-sm">payments</mat-icon>
                Payment Summary
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Rate ({{ booking!.nights }} Nights)</span>
                  <span>₦{{ booking!.totalPrice.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Service Fees</span>
                  <span>₦0.00</span>
                </div>
                <div class="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span class="font-black text-slate-900 uppercase text-xs tracking-widest">Total Paid</span>
                  <span class="text-3xl font-black text-blue-600">₦{{ booking!.totalPrice.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Room Service Orders History -->
            <div>
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <mat-icon class="text-sm">room_service</mat-icon>
                Service History
              </h3>
              @if ((booking!.roomServiceOrders && booking!.roomServiceOrders.length > 0) || (booking!.hotelServiceOrders && booking!.hotelServiceOrders.length > 0)) {
                <div class="space-y-4">
                  @for (order of booking!.roomServiceOrders || []; track order._id) {
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <mat-icon class="text-sm">restaurant</mat-icon>
                          </div>
                          <div>
                            <p class="text-sm font-black text-slate-900">Order #{{ order._id.substring(0, 8) }}</p>
                            <p class="text-[10px] text-slate-400 font-bold">{{ formatDate(order.orderedAt) }}</p>
                          </div>
                        </div>
                        <span [class]="getOrderStatusBadgeClass(order.status) + ' rounded-lg font-black uppercase tracking-tighter'">
                          {{ getOrderStatusBadge(order.status) }}
                        </span>
                      </div>
                      <div class="bg-slate-50/50 rounded-2xl p-4">
                        <div class="space-y-2 mb-4">
                          @for (item of getRoomServiceOrderItems(order); track item.itemId || item.name) {
                            <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                              <span>{{ item.name }} x{{ item.quantity }}</span>
                              <span class="text-slate-900">₦{{ (item.price * item.quantity).toLocaleString() }}</span>
                            </div>
                          }
                        </div>
                        <div class="border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                          <span class="font-black text-slate-900">₦{{ order.totalPrice.toLocaleString() }}</span>
                        </div>
                      </div>
                    </div>
                  }
                  @for (order of booking!.hotelServiceOrders || []; track order._id) {
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <mat-icon class="text-sm">room_service</mat-icon>
                          </div>
                          <div>
                            <p class="text-sm font-black text-slate-900">{{ order.name }}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ order.category }}</p>
                          </div>
                        </div>
                        <span [class]="getOrderStatusClass(order.status)">
                          {{ getServiceOrderStatusBadge(order.status) }}
                        </span>
                      </div>
                      <div class="bg-slate-50/50 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Requested</p>
                          <p class="font-semibold text-slate-800">{{ formatDate(order.requestedAt) }}</p>
                        </div>
                        <div>
                          <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Quantity</p>
                          <p class="font-semibold text-slate-800">{{ order.quantity || 1 }}</p>
                        </div>
                        <div>
                          <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Amount</p>
                          <p class="font-semibold text-slate-800">₦{{ formatAmount(order.totalPrice) }}</p>
                        </div>
                        <div>
                          <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Status</p>
                          <p class="font-semibold text-slate-800 capitalize">{{ order.status }}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="bg-slate-50 rounded-[32px] p-10 text-center border-2 border-dashed border-slate-200">
                  <p class="text-slate-400 font-bold text-sm">No service history for this stay.</p>
                  <button (click)="orderRoomService(booking!)" class="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                    Order Room Service
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-10 bg-slate-50 border-t border-slate-100">
            <div class="flex gap-4">
              @if (booking!.status === 'checked-in' || booking!.status === 'confirmed') {
                <button
                  (click)="orderRoomService(booking!)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  <mat-icon>room_service</mat-icon>
                  <span>Request New Service</span>
                </button>
              }
              <button
                (click)="closeBookingDetails()"
                class="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all">
                Return to Bookings
              </button>
            </div>
          </div>
        </div>
      }

      @if (showReviewModal() && reviewTarget()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div class="bg-white rounded-[32px] shadow-2xl max-w-xl w-full overflow-hidden">
            <div class="px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-blue-500">Hotel Review</p>
                <h2 class="text-2xl font-black text-slate-900 mt-1">{{ reviewTarget()!.hotelName }}</h2>
                <p class="text-sm text-slate-500 mt-1">{{ reviewTarget()!.roomLabel }}</p>
              </div>
              <button (click)="closeHotelReviewModal()" class="text-slate-400 hover:text-slate-700 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="p-8 space-y-6">
              <div>
                <p class="text-sm font-black text-slate-900 mb-3">Rating</p>
                <div class="flex items-center gap-2">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button
                      type="button"
                      (click)="reviewRating.set(star)"
                      class="text-3xl transition-transform hover:scale-110"
                      [class.text-amber-400]="star <= reviewRating()"
                      [class.text-slate-200]="star > reviewRating()"
                    >
                      ★
                    </button>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-black text-slate-900 mb-2">Title</label>
                <input
                  type="text"
                  [(ngModel)]="reviewTitle"
                  placeholder="Summarize your stay"
                  class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-black text-slate-900 mb-2">Review</label>
                <textarea
                  [(ngModel)]="reviewComment"
                  rows="5"
                  placeholder="Share your experience with the room, staff, service, and cleanliness."
                  class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm resize-none"
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="closeHotelReviewModal()"
                  class="px-4 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="submitHotelReview()"
                  [disabled]="reviewSubmitting()"
                  class="px-5 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {{ reviewSubmitting() ? 'Submitting...' : 'Submit Review' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Order Confirmation Modal (Keep as Modal) -->
      @if (showOrderConfirmation()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div class="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <!-- Header -->
            <div class="bg-orange-500 text-white p-8 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-3xl">restaurant</mat-icon>
              </div>
              <h2 class="text-2xl font-black tracking-tight">Confirm Order</h2>
              <p class="text-orange-100 text-sm font-bold uppercase tracking-widest mt-1">Room Service Delivery</p>
            </div>

            <!-- Content -->
            <div class="p-8">
              <p class="text-slate-500 text-center text-sm mb-6">You are placing an order for the following items to be delivered to your room:</p>

              <!-- Order Items List -->
              <div class="bg-slate-50 rounded-2xl p-6 mb-6 space-y-3">
                @for (itemId of selectedItems(); track itemId) {
                  @for (item of roomServiceItems(); track item._id) {
                    @if (item._id === itemId) {
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-slate-900 font-bold">{{ item.name }}</span>
                        <span class="font-black text-slate-400">₦{{ item.price.toLocaleString() }}</span>
                      </div>
                    }
                  }
                }
                <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span class="font-black text-slate-900 uppercase tracking-widest text-xs">Total Amount</span>
                  <span class="font-black text-blue-600 text-xl">₦{{ calculateOrderTotal().toLocaleString() }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-1 gap-3">
                <button
                  (click)="submitRoomServiceOrder()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  <mat-icon>check_circle</mat-icon>
                  <span>Place Order Now</span>
                </button>
                <button
                  (click)="showOrderConfirmation.set(false)"
                  class="w-full bg-white border-2 border-slate-100 text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <span>Go Back</span>
                </button>
              </div>
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
    .zoom-in-95 {
      animation: zoomIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class CustomerHotelBookingsComponent implements OnInit, OnDestroy {
  bookings = signal<HotelBooking[]>([]);
  roomServiceItems = signal<RoomServiceItem[]>([]);
  hotelAmenityServices = signal<HotelAmenityService[]>([]);
  submittingHotelServiceId = signal<string | null>(null);
  selectedBooking = signal<HotelBooking | null>(null);
  selectedItems = signal<string[]>([]);
  viewMode = signal<'list' | 'details' | 'room-service' | 'stay-menu'>('list');
  roomServiceCategory = signal<'Food' | 'Beverage'>('Food');
  bookingDetailsData = signal<HotelBooking | null>(null);
  showOrderConfirmation = signal(false);
  activeStayMenuItem = signal<StayMenuItem>('restaurant');
  currentPage = signal(1);
  now = signal(Date.now());
  itemsPerPage = 10;
  hotelChat = signal<VendorChat | null>(null);
  chatDraft = signal('');
  chatLoading = signal(false);
  chatSending = signal(false);
  chatError = signal('');
  showReviewModal = signal(false);
  reviewTarget = signal<HotelStayReviewDraft | null>(null);
  reviewRating = signal(5);
  reviewTitle = signal('');
  reviewComment = signal('');
  reviewSubmitting = signal(false);
  reviewedBookingIds = signal<Set<string>>(new Set());
  smartKeyData = signal<SmartKeyStayData | null>(null);
  smartKeyLoading = signal(false);
  smartKeyError = signal('');
  private chatStreamDisconnect: (() => void) | null = null;

  activeBookings = computed(() =>
    this.bookings().filter((booking) => this.isActiveBooking(booking))
  );

  historyBookings = computed(() =>
    this.bookings().filter((booking) => !this.isActiveBooking(booking))
  );

  filteredRoomServiceItems = computed(() => {
    const category = this.roomServiceCategory();
    const items = this.roomServiceItems();
    return items.filter(item => {
      const itemCat = (item.category || '').toLowerCase();
      const isBeverage = itemCat === 'drinks' || itemCat === 'beverage' || itemCat === 'beverages' || itemCat === 'drink';

      if (category === 'Beverage') {
        return isBeverage;
      } else {
        // Food is the default and catch-all for anything not identified as beverage
        return !isBeverage;
      }
    });
  });

  paginatedRoomServiceItems = computed(() => {
    const items = this.filteredRoomServiceItems();
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredRoomServiceItems().length / this.itemsPerPage);
  });

  hasItemsInCategory = computed(() => {
    return this.filteredRoomServiceItems().length > 0;
  });

  currentHotelServices = computed(() => {
    const activeItem = this.activeStayMenuItem();
      const supportedCategories: HotelStayServiceCategory[] = ['service', 'massage', 'spa', 'gym', 'shuttle'];

    if (!supportedCategories.includes(activeItem as HotelStayServiceCategory)) {
      return [];
    }

    return this.hotelAmenityServices().filter((service) => {
      const matchesCategory = activeItem === 'service'
        ? service.category === 'service' || service.category === 'laundry'
        : activeItem === 'spa' || activeItem === 'massage'
          ? service.category === 'spa' || service.category === 'massage'
          : activeItem === 'shuttle'
            ? service.category === 'shuttle'
          : service.category === activeItem;

      return matchesCategory &&
        service.isActive !== false &&
        service.available !== false;
    });
  });

  getItemById(id: string): RoomServiceItem | undefined {
    return this.roomServiceItems().find(item => item._id === id);
  }

  constructor(
    private customerService: CustomerService,
    private hotelService: HotelService,
    private chatRealtimeService: ChatRealtimeService,
    private toastService: ToastService,
    private authService: AuthService,
    private browserNotificationService: BrowserNotificationService
  ) {}

  ngOnInit(): void {
    window.addEventListener('openHotelStay', this.handleOpenHotelStay as EventListener);
    this.browserNotificationService.requestPermission();
    this.startClock();
    this.connectChatStream();
    this.checkPendingHotelStay();
    this.loadBookings();
  }

  ngOnDestroy(): void {
    window.removeEventListener('openHotelStay', this.handleOpenHotelStay as EventListener);
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    this.chatStreamDisconnect?.();
  }

  private handleOpenHotelStay = (event: CustomEvent<{ bookingId?: string; stayMenuItem?: StayMenuItem }>): void => {
    const bookingId = event.detail?.bookingId;
    const stayMenuItem = event.detail?.stayMenuItem;
    if (!bookingId) return;

    const booking = this.bookings().find((item) => item._id === bookingId);
    if (booking) {
      sessionStorage.removeItem('pendingHotelStay');
      this.openStayMenuPage(booking, stayMenuItem);
      return;
    }

    sessionStorage.setItem('pendingHotelStay', JSON.stringify({ bookingId, stayMenuItem }));
  };

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  private checkPendingHotelStay(): void {
    const pendingStay = sessionStorage.getItem('pendingHotelStay');
    if (!pendingStay) {
      return;
    }

    try {
      const parsed = JSON.parse(pendingStay) as { bookingId?: string; stayMenuItem?: StayMenuItem };
      if (!parsed.bookingId) {
        sessionStorage.removeItem('pendingHotelStay');
        return;
      }

      const booking = this.bookings().find((item) => item._id === parsed.bookingId);
      if (!booking) {
        return;
      }

      sessionStorage.removeItem('pendingHotelStay');
      this.openStayMenuPage(booking, parsed.stayMenuItem);
    } catch {
      sessionStorage.removeItem('pendingHotelStay');
    }
  }

  private startClock(): void {
    this.clockInterval = setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  private connectChatStream(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return;
    }

    this.chatStreamDisconnect = this.chatRealtimeService.connectCustomer(userId, (event: ChatRealtimeEvent) => {
      const selectedBooking = this.selectedBooking();
      if (!selectedBooking?._id || event.vendorType !== 'hotel') {
        return;
      }

      if (event.bookingId && event.bookingId !== selectedBooking._id) {
        return;
      }

      if (event.event === 'message-created' && (!this.browserNotificationService.isDocumentVisible() || this.activeStayMenuItem() !== 'chat')) {
        this.browserNotificationService.show(`${selectedBooking.hotelName} replied`, {
          body: 'You have a new front desk message.',
          tag: event.chatId || `hotel-chat-${selectedBooking._id}`
        });
      }

      this.loadBookings();
      if (this.activeStayMenuItem() === 'chat') {
        this.ensureHotelChat(selectedBooking, true);
      }
    });
  }

  loadBookings(): void {
    console.log('🏨 Loading hotel bookings...');
    this.customerService.getMyHotelBookings().subscribe(
      (response: any) => {
        console.log('📡 Hotel bookings response:', response);
        let bookingsData = [];

        if (response.success && response.data) {
          bookingsData = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          bookingsData = response.data;
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          return;
        }

        const transformedBookings = bookingsData.map((booking: any) => this.transformBooking(booking));

        console.log('✅ Found', transformedBookings.length, 'bookings');
        console.log('📊 Transformed bookings:', transformedBookings);
        this.bookings.set(transformedBookings);
        this.checkPendingHotelStay();

        if (this.viewMode() === 'list') {
          const firstActiveBooking = transformedBookings.find((booking: HotelBooking) => this.isActiveBooking(booking));
          if (firstActiveBooking) {
            this.openStayMenuPage(firstActiveBooking);
          }
        }

        const currentSelected = this.selectedBooking();
        if (currentSelected) {
          const refreshed = transformedBookings.find((booking: HotelBooking) => booking._id === currentSelected._id);
          if (refreshed) {
            this.selectedBooking.set(refreshed);
          }
        }

        const currentDetails = this.bookingDetailsData();
        if (currentDetails) {
          const refreshed = transformedBookings.find((booking: HotelBooking) => booking._id === currentDetails._id);
          if (refreshed) {
            this.bookingDetailsData.set(refreshed);
          }
        }
      },
      (error) => {
        console.error('❌ Error loading hotel bookings:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
      }
    );
  }

  getConfirmedCount(): number {
    return this.bookings().filter(b => b.status === 'confirmed').length;
  }

  getUpcomingCount(): number {
    return this.bookings().filter(b => this.isUpcoming(b)).length;
  }

  getCompletedCount(): number {
    return this.bookings().filter(b => b.status === 'completed' || b.status === 'checked-out').length;
  }

  isUpcoming(booking: HotelBooking): boolean {
    return new Date(booking.checkIn) > new Date();
  }

  isActiveBooking(booking: HotelBooking): boolean {
    return booking.status === 'checked-in' || booking.status === 'confirmed';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRoomLabel(booking: HotelBooking): string {
    const roomNumber = booking.roomNumber || booking.room?.roomNumber;
    return roomNumber ? `Room ${roomNumber}` : `${booking.roomType} Room`;
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      'checked-in': 'Checked In',
      'checked-out': 'Checked Out',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      confirmed: 'inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      'checked-in': 'inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      'checked-out': 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold',
      completed: 'inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  viewBookingDetails(booking: HotelBooking): void {
    console.log('View booking details:', booking);
    this.bookingDetailsData.set(booking);
    this.viewMode.set('details');
  }

  closeBookingDetails(): void {
    this.viewMode.set('list');
    this.bookingDetailsData.set(null);
  }

  orderRoomService(booking: HotelBooking): void {
    this.selectedBooking.set(booking);
    this.selectedItems.set([]);
    this.roomServiceCategory.set('Food');
    this.currentPage.set(1);
    this.viewMode.set('room-service');
    this.bookingDetailsData.set(null);
    if (booking.hotelId || booking.hotel?._id) {
      this.hotelService.setHotelId(booking.hotelId || booking.hotel?._id);
    }
    this.loadRoomServiceItems(booking._id);
  }

  openRoomServiceCategory(booking: HotelBooking, category: 'Food' | 'Beverage'): void {
    this.orderRoomService(booking);
    this.roomServiceCategory.set(category);
    this.currentPage.set(1);
  }

  openStayMenuPage(booking: HotelBooking, initialItem: StayMenuItem = 'restaurant'): void {
    this.selectedBooking.set(booking);
    this.activeStayMenuItem.set(initialItem);
    this.smartKeyData.set(null);
    this.smartKeyError.set('');
    this.roomServiceCategory.set('Food');
    this.currentPage.set(1);
    this.viewMode.set('stay-menu');
    if (booking.hotelId || booking.hotel?._id) {
      this.hotelService.setHotelId(booking.hotelId || booking.hotel?._id);
    }
    this.loadRoomServiceItems(booking._id);
    this.loadHotelAmenityServices(booking);
    if (initialItem === 'chat') {
      this.ensureHotelChat(booking);
    } else if (initialItem === 'smart-key') {
      this.loadSmartKeyAccess(booking);
    }
  }

  setStayMenuItem(item: StayMenuItem): void {
    this.activeStayMenuItem.set(item);
    this.currentPage.set(1);
    if (item === 'restaurant') {
      this.roomServiceCategory.set('Food');
    } else if (item === 'bar') {
      this.roomServiceCategory.set('Beverage');
    } else if (item === 'chat' && this.selectedBooking()) {
      this.ensureHotelChat(this.selectedBooking()!);
    } else if (item === 'smart-key' && this.selectedBooking()) {
      this.loadSmartKeyAccess(this.selectedBooking()!);
    }
  }

  getStayMenuButtonClass(item: StayMenuItem, disabled: boolean = false): string {
    if (disabled) {
      return 'bg-slate-800/40 text-slate-500 border border-slate-700';
    }
    return this.activeStayMenuItem() === item
      ? 'bg-white text-slate-900 border border-white'
      : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10';
  }

  callHotelSupport(booking: HotelBooking): void {
    const hotelPhone = this.getHotelPhone(booking);
    const fallbackPhone = '+234 700 000 0000';
    const targetPhone = hotelPhone || fallbackPhone;

    if (!hotelPhone) {
      this.toastService.warning('Hotel phone was not available. Calling support instead.');
    }

    window.location.href = `tel:${targetPhone.replace(/\s/g, '')}`;
  }

  getHotelSupportLabel(booking: HotelBooking): string {
    return this.getHotelPhone(booking) ? 'Hotel' : 'Support';
  }

  getHotelDisplayPhone(booking: HotelBooking): string {
    return this.getHotelPhone(booking) || '+234 700 000 0000';
  }

  private getHotelPhone(booking: HotelBooking): string {
    return booking.hotel?.phone || booking.hotel?.contactPhone || booking.hotel?.phoneNumber || '';
  }

  private ensureHotelChat(booking: HotelBooking, forceRefresh: boolean = false): void {
    const currentChat = this.hotelChat();
    if (!forceRefresh && currentChat?.bookingId === booking._id) {
      return;
    }

    this.chatLoading.set(true);
    this.chatError.set('');

    this.customerService.getVendorChats().subscribe({
      next: (response: any) => {
        const chats = response.success && Array.isArray(response.data) ? response.data as VendorChat[] : [];
        const existingChat = chats.find((chat) => chat.vendorType === 'hotel' && chat.bookingId === booking._id);

        if (existingChat) {
          this.hotelChat.set(existingChat);
          if ((existingChat.unreadForCustomer || 0) > 0) {
            this.markHotelChatAsRead(existingChat._id);
          }
          this.chatLoading.set(false);
          return;
        }

        this.customerService.startVendorChat('hotel', booking._id, booking.hotelName).subscribe({
          next: (chatResponse: any) => {
            if (chatResponse.success && chatResponse.data) {
              const chat = chatResponse.data as VendorChat;
              chat.vendorIcon = chat.vendorIcon || '🏨';
              this.hotelChat.set(chat);
              this.chatError.set('');
            } else {
              this.chatError.set('Unable to open hotel chat right now.');
            }
            this.chatLoading.set(false);
          },
          error: () => {
            this.chatError.set('Unable to open hotel chat right now.');
            this.chatLoading.set(false);
          }
        });
      },
      error: () => {
        this.chatError.set('Unable to load hotel support chat right now.');
        this.chatLoading.set(false);
      }
    });
  }

  canUseSmartKey(booking: HotelBooking): boolean {
    return ['confirmed', 'checked-in', 'pending'].includes(booking.status);
  }

  private loadSmartKeyAccess(booking: HotelBooking): void {
    this.smartKeyLoading.set(true);
    this.smartKeyError.set('');

    this.hotelService.getBookingSmartLockAccess(booking._id).subscribe({
      next: (response: any) => {
        this.smartKeyLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.smartKeyData.set(response.data);
          return;
        }
        this.smartKeyData.set(null);
        this.smartKeyError.set(response.message || 'Unable to load smart key details.');
      },
      error: (error: any) => {
        this.smartKeyLoading.set(false);
        this.smartKeyData.set(null);
        this.smartKeyError.set(error?.error?.message || 'Unable to load smart key details.');
      }
    });
  }

  formatDateTimeShort(value?: string | null): string {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  }

  sendHotelChatMessage(): void {
    const draft = this.chatDraft().trim();
    const chat = this.hotelChat();
    if (!draft || !chat?._id) {
      return;
    }

    this.chatSending.set(true);
    this.chatError.set('');

    this.customerService.sendVendorChatMessage(chat._id, draft).subscribe({
      next: (response: any) => {
          if (response.success && response.data) {
            const currentChat = this.hotelChat();
            if (currentChat) {
              currentChat.messages = [...(currentChat.messages || []), response.data as ChatMessage];
              currentChat.updatedAt = new Date().toISOString();
              currentChat.unreadForCustomer = 0;
              this.hotelChat.set({ ...currentChat });
            }
            this.chatDraft.set('');
        } else {
          this.chatError.set('Message sent, but the conversation did not refresh.');
        }
        this.chatSending.set(false);
      },
      error: (error) => {
        const fallbackMessage: ChatMessage = {
          _id: `local-${Date.now()}`,
          sender: 'customer',
          senderName: this.getCustomerDisplayName(),
          message: draft,
          timestamp: new Date().toISOString(),
          read: false
        };

        const currentChat = this.hotelChat();
        if (currentChat) {
          currentChat.messages = [...(currentChat.messages || []), fallbackMessage];
          currentChat.updatedAt = new Date().toISOString();
          this.hotelChat.set({ ...currentChat });
        }

        this.chatDraft.set('');
        this.chatError.set(error?.error?.message || 'Hotel chat is temporarily offline. Your message was kept locally.');
        this.chatSending.set(false);
      }
    });
  }

  private getCustomerDisplayName(): string {
    return this.authService.getCurrentUser()?.name || 'Customer';
  }

  private markHotelChatAsRead(chatId: string): void {
    this.customerService.markVendorChatRead(chatId).subscribe({
      next: () => {
        const currentChat = this.hotelChat();
        if (currentChat?._id === chatId) {
          this.hotelChat.set({ ...currentChat, unreadForCustomer: 0 });
        }
      }
    });
  }

  canReviewBooking(booking: HotelBooking): boolean {
    return booking.status === 'checked-out' || booking.status === 'completed';
  }

  isClosedStay(booking: HotelBooking): boolean {
    return this.canReviewBooking(booking) || booking.status === 'cancelled';
  }

  hasReviewForBooking(booking: HotelBooking): boolean {
    return this.reviewedBookingIds().has(booking._id);
  }

  openHotelReviewModal(booking: HotelBooking): void {
    const hotelId = booking.hotelId || booking.hotel?._id;
    if (!hotelId) {
      this.toastService.error('Hotel information is missing for this stay.');
      return;
    }

    this.reviewTarget.set({
      bookingId: booking._id,
      hotelId,
      hotelName: booking.hotelName,
      roomLabel: this.getRoomLabel(booking)
    });
    this.reviewRating.set(5);
    this.reviewTitle.set('');
    this.reviewComment.set('');
    this.showReviewModal.set(true);
  }

  closeHotelReviewModal(): void {
    this.showReviewModal.set(false);
    this.reviewTarget.set(null);
    this.reviewSubmitting.set(false);
  }

  submitHotelReview(): void {
    const target = this.reviewTarget();
    const currentUser = this.authService.getCurrentUser();

    if (!target || !currentUser?._id) {
      this.toastService.error('Unable to verify your account for review submission.');
      return;
    }

    const title = this.reviewTitle().trim();
    const comment = this.reviewComment().trim();

    if (!title || !comment) {
      this.toastService.warning('Please add both a title and review comment.');
      return;
    }

    this.reviewSubmitting.set(true);

    this.hotelService.createHotelReview(target.hotelId, {
      bookingId: target.bookingId,
      customerId: currentUser._id,
      customerName: currentUser.name || 'Customer',
      customerEmail: currentUser.email || '',
      rating: this.reviewRating(),
      title,
      comment
    }).subscribe({
      next: () => {
        const reviewed = new Set(this.reviewedBookingIds());
        reviewed.add(target.bookingId);
        this.reviewedBookingIds.set(reviewed);
        this.closeHotelReviewModal();
        this.toastService.success('Your hotel review has been submitted.');
      },
      error: (error) => {
        this.reviewSubmitting.set(false);
        this.toastService.error(error?.error?.message || 'Failed to submit hotel review.');
      }
    });
  }

  submitHotelReviewForBooking(booking: HotelBooking): void {
    const hotelId = booking.hotelId || booking.hotel?._id;
    if (!hotelId) {
      this.toastService.error('Hotel information is missing for this stay.');
      return;
    }

    this.reviewTarget.set({
      bookingId: booking._id,
      hotelId,
      hotelName: booking.hotelName,
      roomLabel: this.getRoomLabel(booking)
    });

    this.submitHotelReview();
  }

  hasAmenity(booking: HotelBooking, keywords: string[]): boolean {
    const categoryMap: Record<string, HotelStayServiceCategory> = {
      service: 'service',
      'room service': 'service',
      concierge: 'service',
      laundry: 'service',
      massage: 'massage',
      spa: 'spa',
      gym: 'gym',
      fitness: 'gym',
      shuttle: 'shuttle',
      airport: 'shuttle',
      transfer: 'shuttle'
    };

    const categoryMatch = keywords.some((keyword) => {
      const mappedCategory = categoryMap[keyword.toLowerCase()];
      return mappedCategory
        ? this.hotelAmenityServices().some((service) => service.category === mappedCategory && service.isActive !== false && service.available !== false)
        : false;
    });

    if (categoryMatch) {
      return true;
    }

    const amenities = this.getBookingAmenities(booking);
    if (!amenities.length) {
      return false;
    }

    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
    return amenities.some((amenity) => normalizedKeywords.some((keyword) => amenity.includes(keyword)));
  }

  requestAmenityService(booking: HotelBooking, service: HotelAmenityService): void {
    if (!service._id) {
      this.toastService.error('Service is missing an identifier.');
      return;
    }

    this.submittingHotelServiceId.set(service._id);
    this.customerService.requestHotelService({
      bookingId: booking._id,
      serviceId: service._id,
      quantity: 1,
      notes: ''
    }).subscribe({
      next: (response: any) => {
        const requestSucceeded = response?.success === true || response?.status === 'success';
        if (requestSucceeded) {
          this.toastService.success(`${service.name} requested successfully.`);
          const updatedBooking = response?.data?.booking;
          if (updatedBooking) {
            this.syncBookingState(updatedBooking);
          }
          this.loadBookings();
          this.activeStayMenuItem.set('orders');
        } else {
          this.toastService.error('Failed to request hotel service.');
        }
        this.submittingHotelServiceId.set(null);
      },
      error: (error) => {
        console.error('❌ Error requesting hotel service:', error);
        this.toastService.error('Failed to request hotel service.');
        this.submittingHotelServiceId.set(null);
      }
    });
  }

  private syncBookingState(rawBooking: any): void {
    const updatedBooking = this.transformBooking(rawBooking);

    this.bookings.update((bookings) =>
      bookings.map((booking) => booking._id === updatedBooking._id ? updatedBooking : booking)
    );

    if (this.selectedBooking()?._id === updatedBooking._id) {
      this.selectedBooking.set(updatedBooking);
    }

    if (this.bookingDetailsData()?._id === updatedBooking._id) {
      this.bookingDetailsData.set(updatedBooking);
    }
  }

  private getBookingAmenities(booking: HotelBooking): string[] {
    const amenitySources = [
      booking?.amenities,
      booking?.hotel?.amenities,
      booking?.room?.amenities
    ];

    return amenitySources
      .filter(Array.isArray)
      .flat()
      .filter((amenity: unknown): amenity is string => typeof amenity === 'string')
      .map((amenity) => amenity.toLowerCase());
  }

  loadRoomServiceItems(bookingId: string): void {
    console.log('🍽️ Loading room service items for booking:', bookingId);

    this.hotelService.getRoomServiceItems(1, 50).subscribe({
      next: (response: any) => {
        console.log('📡 Room service items response:', response);

        let items = [];
        if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response.status === 'success' && response.data) {
          items = Array.isArray(response.data) ? response.data : [response.data];
        }

        console.log('✅ Loaded', items.length, 'room service items');

        // Transform items to match RoomServiceItem interface
        const transformedItems = items.map((item: any) => ({
          _id: item._id || item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
          available: item.available !== false, // Default to true if not specified
          image: item.image
        }));

        this.roomServiceItems.set(transformedItems);
      },
      error: (error: any) => {
        console.error('❌ Error loading room service items:', error);
        // Fall back to mock data on error
        console.log('📦 Using fallback mock data');
        this.roomServiceItems.set([
          {
            _id: '1',
            name: 'Burger & Fries',
            category: 'Food',
            price: 2500,
            description: 'Delicious cheese burger with crispy fries',
            available: true
          },
          {
            _id: '2',
            name: 'Pizza Margherita',
            category: 'Food',
            price: 3500,
            description: 'Classic Italian pizza',
            available: true
          },
          {
            _id: '3',
            name: 'Soft Drink',
            category: 'Drinks',
            price: 800,
            description: 'Coca-Cola, Sprite, or Fanta',
            available: true
          },
          {
            _id: '4',
            name: 'Fruit Juice',
            category: 'Drinks',
            price: 1200,
            description: 'Fresh orange or pineapple juice',
            available: true
          }
        ]);
      }
    });
  }

  loadHotelAmenityServices(booking: HotelBooking): void {
    const hotelId = booking.hotelId || booking.hotel?._id;
    if (!hotelId) {
      this.hotelAmenityServices.set([]);
      return;
    }

    this.hotelService.setHotelId(hotelId);
    this.hotelService.getAmenityServices(1, 100).subscribe({
      next: (response) => {
        const services = Array.isArray(response.data) ? response.data : [];
        this.hotelAmenityServices.set(services);
      },
      error: (error) => {
        console.error('❌ Error loading hotel amenity services:', error);
        this.hotelAmenityServices.set([]);
      }
    });
  }

  private transformBooking(booking: any): HotelBooking {
    console.log('📝 Transforming booking:', booking);
    console.log('   Hotel object:', booking.hotel);
    console.log('   Room object:', booking.room);

    const hotelName = booking.hotel?.name ||
      (booking.hotel && typeof booking.hotel === 'string' ? booking.hotel : null) ||
      booking.hotelName ||
      'Unknown Hotel';

    const roomType = booking.room?.roomType ||
      booking.room?.type ||
      (booking.room && typeof booking.room === 'string' ? booking.room : null) ||
      booking.roomType ||
      'Unknown Room';

    console.log('   Final hotelName:', hotelName);
    console.log('   Final roomType:', roomType);

    return {
      _id: booking._id,
      hotelId: booking.hotel?._id || booking.hotelId,
      hotel: booking.hotel,
      hotelName,
      roomId: booking.room?._id || booking.roomId,
      room: booking.room,
      roomNumber: booking.room?.roomNumber || booking.roomNumber,
      amenities: booking.amenities,
      roomType,
      bedType: booking.room?.bedType,
      checkIn: booking.checkInDate || booking.checkIn,
      checkOut: booking.checkOutDate || booking.checkOut,
      nights: booking.numberOfNights || Math.ceil(
        (new Date(booking.checkOutDate || booking.checkOut).getTime() -
         new Date(booking.checkInDate || booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ),
      totalPrice: booking.totalPrice,
      guestCount: booking.numberOfGuests,
      status: booking.status,
      roomServiceOrders: Array.isArray(booking.roomServiceOrders) ? booking.roomServiceOrders : [],
      hotelServiceOrders: Array.isArray(booking.hotelServiceOrders) ? booking.hotelServiceOrders : []
    };
  }

  getRoomServiceOrderItems(order: any): Array<{ itemId?: string; name: string; quantity: number; price: number }> {
    if (!Array.isArray(order?.items)) {
      return [];
    }

    return order.items
      .filter((item: any) => item && typeof item === 'object')
      .map((item: any) => ({
        itemId: item.itemId,
        name: item.name || 'Item',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0)
      }));
  }

  selectItem(item: RoomServiceItem): void {
    const selected = this.selectedItems();
    const index = selected.indexOf(item._id);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(item._id);
    }
    this.selectedItems.set([...selected]);
  }

  clearSelectedItems(): void {
    this.selectedItems.set([]);
  }

  calculateOrderTotal(): number {
    const items = this.roomServiceItems();
    return this.selectedItems().reduce((total, itemId) => {
      const item = items.find(i => i._id === itemId);
      return total + (item?.price || 0);
    }, 0);
  }

  submitRoomServiceOrder(): void {
    if (!this.selectedBooking() || this.selectedItems().length === 0) {
      this.toastService.warning('Please select at least one item');
      return;
    }

    const booking = this.selectedBooking();
    const items = this.roomServiceItems();

    // Transform selected item IDs into full item objects with quantities
    const orderItems = this.selectedItems().map(itemId => {
      const item = items.find(i => i._id === itemId);
      return {
        itemId: item?._id,
        name: item?.name,
        price: item?.price,
        quantity: 1
      };
    });

    const orderData = {
      bookingId: booking?._id,
      hotelId: booking?.hotelId,
      items: orderItems,
      totalPrice: this.calculateOrderTotal(),
      notes: ''
    };

    console.log('📤 Submitting room service order:', orderData);

    this.customerService.orderRoomService(orderData).subscribe(
      (response: any) => {
        console.log('✅ Room service order response:', response);
        const orderSucceeded = response?.success === true || response?.status === 'success';
        if (orderSucceeded) {
          this.toastService.success('Room service order placed successfully!');
          this.showOrderConfirmation.set(false);
          this.selectedItems.set([]);
          this.activeStayMenuItem.set('restaurant');
          this.viewMode.set('stay-menu');
          // Reload bookings to show new order
          this.loadBookings();
        } else {
          this.toastService.error('Failed to place room service order');
        }
      },
      (error) => {
        console.error('❌ Error placing room service order:', error);
        this.toastService.error('Failed to place room service order');
      }
    );
  }

  getOrderStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready for Pickup',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getOrderStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      preparing: 'inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      ready: 'inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      delivered: 'inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold',
      cancelled: 'inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold';
  }

  getRoomServiceTrackingSteps(status: string): Array<{ label: string; active: boolean; complete: boolean }> {
    const steps = ['Placed', 'Preparing', 'Ready', 'Delivered'];
    const statusIndexMap: Record<string, number> = {
      pending: 0,
      preparing: 1,
      ready: 2,
      delivered: 3,
      cancelled: 0
    };

    const currentIndex = statusIndexMap[status] ?? 0;

    return steps.map((label, index) => ({
      label,
      active: status !== 'cancelled' && index <= currentIndex,
      complete: status !== 'cancelled' && index < currentIndex
    }));
  }

  getRoomServiceProgress(status: string): number {
    const progressMap: Record<string, number> = {
      pending: 25,
      preparing: 50,
      ready: 75,
      delivered: 100,
      cancelled: 0
    };

    return progressMap[status] ?? 0;
  }

  getRoomServiceCountdown(order: any): string {
    if (order.status === 'delivered') {
      return 'Delivered';
    }

    if (order.status === 'cancelled') {
      return 'Cancelled';
    }

    const etaAt = this.getRoomServiceEtaAt(order);
    const remainingMs = etaAt.getTime() - this.now();

    if (remainingMs <= 0) {
      return 'Any moment';
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getRoomServiceEtaLabel(order: any): string {
    if (order.status === 'delivered') {
      return order.deliveredAt ? `Delivered ${this.formatDate(order.deliveredAt)}` : 'Delivered';
    }

    if (order.status === 'cancelled') {
      return 'Order cancelled';
    }

    return this.getRoomServiceEtaAt(order).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  private getRoomServiceEtaAt(order: any): Date {
    if (order.etaAt) {
      return new Date(order.etaAt);
    }

    const orderedAt = order.orderedAt ? new Date(order.orderedAt) : new Date();
    const durationMinutes = Number(order.estimatedDurationMinutes || 30);
    return new Date(orderedAt.getTime() + durationMinutes * 60 * 1000);
  }

  getServiceOrderStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getOrderStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      preparing: 'inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      ready: 'inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold',
      delivered: 'inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold',
      confirmed: 'inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      'in-progress': 'inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      completed: 'inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold',
      cancelled: 'inline-flex px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };
    return classes[status] || 'inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold';
  }

  isHotelServiceCategory(item: StayMenuItem): item is HotelStayServiceCategory {
    return ['service', 'laundry', 'massage', 'spa', 'gym', 'shuttle'].includes(item);
  }

  getHotelServiceCategoryMeta(item: StayMenuItem): { title: string; shortLabel: string; description: string; buttonClass: string } {
    const meta: Record<HotelStayServiceCategory, { title: string; shortLabel: string; description: string; buttonClass: string }> = {
      service: {
        title: 'Concierge & House Services',
        shortLabel: 'Concierge',
        description: 'Request concierge help, laundry, porter support, wake-up calls, and other in-house guest services.',
        buttonClass: 'bg-blue-600 hover:bg-blue-700'
      },
      massage: {
        shortLabel: 'Massage',
        title: 'Massage',
        description: 'Book massage sessions and wellness treatments attached to your current stay.',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700'
      },
      spa: {
        shortLabel: 'Massage / Spa',
        title: 'Massage / Spa',
        description: 'Browse massage and spa treatments available during your stay and request them directly from the hotel.',
        buttonClass: 'bg-fuchsia-600 hover:bg-fuchsia-700'
      },
      gym: {
        shortLabel: 'Gym',
        title: 'Gym',
        description: 'Access paid gym-related services, sessions, or packages offered by the hotel.',
        buttonClass: 'bg-violet-600 hover:bg-violet-700'
      },
      shuttle: {
        shortLabel: 'Airport Shuttle',
        title: 'Airport Shuttle',
        description: 'Request pickup, drop-off, and transfer services configured by the hotel.',
        buttonClass: 'bg-cyan-600 hover:bg-cyan-700'
      }
    };

    return meta[this.isHotelServiceCategory(item) ? item : 'service'];
  }

  formatAmount(value: number): string {
    return Number(value || 0).toLocaleString();
  }

  switchToHotelsTab(): void {
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'hotels' }));
  }
}
