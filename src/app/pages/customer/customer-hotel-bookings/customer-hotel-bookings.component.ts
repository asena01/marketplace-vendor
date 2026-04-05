import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';
import { HotelService } from '../../../services/hotel.service';
import { ToastService } from '../../../services/toast.service';

interface HotelBooking {
  _id: string;
  hotelId?: string;
  hotel?: any;
  hotelName: string;
  roomId?: string;
  room?: any;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'completed' | 'cancelled';
  roomServiceOrders?: any[];
  bedType?: string;
  guestCount?: number;
}

interface RoomServiceItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  image?: string;
}

@Component({
  selector: 'app-customer-hotel-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Bookings</p>
          <p class="text-3xl font-bold text-gray-800">{{ bookings().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Confirmed</p>
          <p class="text-3xl font-bold text-gray-800">{{ getConfirmedCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm">Upcoming</p>
          <p class="text-3xl font-bold text-gray-800">{{ getUpcomingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm">Completed</p>
          <p class="text-3xl font-bold text-gray-800">{{ getCompletedCount() }}</p>
        </div>
      </div>

      <!-- Bookings Table -->
      @if (bookings().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hotel Name</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Room Type</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-in</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nights</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Price</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (booking of bookings(); track booking._id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm text-gray-700 font-mono">{{ booking._id.slice(0, 8) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ booking.hotelName }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ booking.roomType }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ formatDate(booking.checkIn) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ booking.nights }}</td>
                  <td class="px-6 py-3 text-sm font-semibold text-gray-900">₦{{ booking.totalPrice.toLocaleString() }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span [class]="getStatusBadgeClass(booking.status)">
                      {{ getStatusBadge(booking.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm space-x-2">
                    <button
                      (click)="viewBookingDetails(booking)"
                      class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 inline-flex">
                      <mat-icon class="text-sm">visibility</mat-icon>
                      <span>View</span>
                    </button>
                    @if (booking.status === 'checked-in' || booking.status === 'confirmed') {
                      <button
                        (click)="orderRoomService(booking)"
                        class="text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 inline-flex">
                        <mat-icon class="text-sm">room_service</mat-icon>
                        <span>Room Service</span>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-400">hotel</mat-icon>
          </div>
          <p class="text-gray-500 text-lg mb-2 font-semibold">No hotel bookings yet</p>
          <p class="text-gray-400 text-sm">Start exploring hotels and make your first booking!</p>
        </div>
      }

      <!-- Room Service Modal -->
      @if (showRoomServiceModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-600">room_service</mat-icon>
                <h3 class="text-lg font-semibold">Room Service & Drinks</h3>
              </div>
              <button
                (click)="showRoomServiceModal.set(false)"
                class="text-gray-500 hover:text-gray-700">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="p-6">
              @if (selectedBooking()) {
                <p class="text-sm text-gray-600 mb-4">
                  <strong>Booking:</strong> {{ selectedBooking()?.hotelName }} - Room {{ selectedBooking()?.roomType }}
                </p>
              }

              <!-- Room Service Items -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">Available Items:</h4>
                @if (roomServiceItems().length > 0) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    @for (item of roomServiceItems(); track item._id) {
                      <div class="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                           (click)="selectItem(item)"
                           [class.ring-2]="selectedItems().includes(item._id)"
                           [class.ring-blue-500]="selectedItems().includes(item._id)">
                        <!-- Item Image -->
                        @if (item.image) {
                          <div class="relative w-full h-32 bg-slate-100 overflow-hidden">
                            <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                          </div>
                        }

                        <!-- Item Details -->
                        <div class="p-4">
                          <p class="font-semibold text-gray-900">{{ item.name }}</p>
                          <p class="text-sm text-gray-600">{{ item.category }}</p>
                          <p class="text-sm text-gray-700 mt-2">{{ item.description }}</p>
                          <p class="text-lg font-bold text-green-600 mt-2">₦{{ item.price.toLocaleString() }}</p>
                          @if (!item.available) {
                            <p class="text-xs text-red-600 font-semibold mt-2">Currently Unavailable</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-gray-500">Loading room service items...</p>
                }
              </div>

              <!-- Order Summary & Review -->
              @if (selectedItems().length > 0) {
                <div class="mt-6 border-t pt-4">
                  <h4 class="font-semibold text-gray-900 mb-3">Order Review:</h4>
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    @for (itemId of selectedItems(); track itemId) {
                      @for (item of roomServiceItems(); track item._id) {
                        @if (item._id === itemId) {
                          <div class="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div class="flex-1">
                              <p class="font-medium text-gray-900">{{ item.name }}</p>
                              <p class="text-xs text-gray-600">{{ item.category }}</p>
                            </div>
                            <div class="text-right">
                              <p class="font-semibold text-gray-900">₦{{ item.price.toLocaleString() }}</p>
                              <p class="text-xs text-gray-600">x1</p>
                            </div>
                          </div>
                        }
                      }
                    }
                  </div>
                  <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <p class="text-lg font-bold text-gray-900">Order Total:</p>
                      <p class="text-2xl font-bold text-green-600">₦{{ calculateOrderTotal().toLocaleString() }}</p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 mt-6">
                  <button
                    (click)="showOrderConfirmation.set(true)"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <mat-icon class="text-lg">check_circle</mat-icon>
                    <span>Confirm & Place Order</span>
                  </button>
                  <button
                    (click)="clearSelectedItems()"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <mat-icon class="text-lg">edit</mat-icon>
                    <span>Edit Selection</span>
                  </button>
                </div>
              } @else {
                <div class="flex gap-3 mt-6">
                  <button
                    (click)="showRoomServiceModal.set(false)"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <mat-icon class="text-lg">cancel</mat-icon>
                    <span>Close</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Order Confirmation Modal -->
      @if (showOrderConfirmation()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
            <!-- Header -->
            <div class="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 border-b border-orange-800">
              <div class="flex items-center justify-center gap-3">
                <mat-icon class="text-3xl">warning</mat-icon>
                <h2 class="text-xl font-bold">Confirm Your Order</h2>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-4">
              <p class="text-gray-700 text-center font-semibold">
                You are about to place an order for:
              </p>

              <!-- Order Items List -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                @for (itemId of selectedItems(); track itemId) {
                  @for (item of roomServiceItems(); track item._id) {
                    @if (item._id === itemId) {
                      <div class="flex items-center justify-between text-sm py-2 border-b last:border-b-0">
                        <span class="text-gray-900 font-medium">{{ item.name }}</span>
                        <span class="font-semibold text-gray-900">₦{{ item.price.toLocaleString() }}</span>
                      </div>
                    }
                  }
                }
              </div>

              <!-- Total Price -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <p class="text-lg font-bold text-gray-900">Order Total:</p>
                  <p class="text-2xl font-bold text-green-600">₦{{ calculateOrderTotal().toLocaleString() }}</p>
                </div>
              </div>

              <!-- Confirmation Message -->
              <p class="text-sm text-gray-600 text-center">
                Once placed, your order will be prepared and delivered to your room. Continue?
              </p>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4 border-t">
                <button
                  (click)="submitRoomServiceOrder()"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-lg">done_all</mat-icon>
                  <span>Yes, Place Order</span>
                </button>
                <button
                  (click)="showOrderConfirmation.set(false)"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-lg">close</mat-icon>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Booking Details Modal -->
      @if (showBookingDetailsModal() && bookingDetailsData()) {
        @let booking = bookingDetailsData();
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800 sticky top-0">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Booking Details</h2>
                <button (click)="closeBookingDetails()" class="text-3xl font-bold hover:text-blue-100 transition">✕</button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Hotel & Room Info -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-bold text-gray-900 mb-4">Hotel & Room Information</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Hotel Name</span>
                    <span class="font-semibold text-gray-900">{{ booking!.hotelName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Room Type</span>
                    <span class="font-semibold text-gray-900">{{ booking!.roomType }}</span>
                  </div>
                  @if (booking!.bedType) {
                    <div class="flex justify-between">
                      <span class="text-gray-600">Bed Type</span>
                      <span class="font-semibold text-gray-900">{{ booking!.bedType }}</span>
                    </div>
                  }
                  <div class="flex justify-between">
                    <span class="text-gray-600">Booking ID</span>
                    <span class="font-mono text-gray-900">{{ booking!._id.slice(0, 12) }}...</span>
                  </div>
                </div>
              </div>

              <!-- Dates Info -->
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 class="font-bold text-gray-900 mb-4">Stay Duration</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Check-in</span>
                    <span class="font-semibold text-gray-900">{{ formatDate(booking!.checkIn) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Check-out</span>
                    <span class="font-semibold text-gray-900">{{ formatDate(booking!.checkOut) }}</span>
                  </div>
                  <div class="flex justify-between border-t pt-3">
                    <span class="text-gray-600">Number of Nights</span>
                    <span class="font-bold text-emerald-600">{{ booking!.nights }}</span>
                  </div>
                </div>
              </div>

              <!-- Pricing Info -->
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 class="font-bold text-gray-900 mb-4">Pricing</h3>
                <div class="space-y-3">
                  <div class="flex justify-between text-lg">
                    <span class="text-gray-600">Total Price</span>
                    <span class="font-bold text-purple-600">₦{{ booking!.totalPrice.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Status Info -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 class="font-bold text-gray-900 mb-4">Booking Status</h3>
                <div class="flex items-center gap-3">
                  <span [class]="getStatusBadgeClass(booking!.status)">
                    {{ getStatusBadge(booking!.status) }}
                  </span>
                  <span class="text-sm text-gray-600">Last updated: Today</span>
                </div>
              </div>

              <!-- Room Service Orders History -->
              @if (booking!.roomServiceOrders && booking!.roomServiceOrders.length > 0) {
                <div class="border rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <mat-icon class="text-orange-600">room_service</mat-icon>
                    Room Service Orders
                  </h3>
                  <div class="space-y-3">
                    @for (order of booking!.roomServiceOrders; track order._id) {
                      <div class="bg-gray-50 border rounded-lg p-3">
                        <div class="flex items-center justify-between mb-2">
                          <p class="font-semibold text-gray-900 text-sm">Order ID: {{ order._id.substring(0, 8) }}</p>
                          <span [class]="getOrderStatusBadgeClass(order.status)">
                            {{ getOrderStatusBadge(order.status) }}
                          </span>
                        </div>
                        <div class="space-y-1 text-xs text-gray-600 mb-2">
                          <p><strong>Ordered:</strong> {{ formatDate(order.orderedAt) }}</p>
                          @if (order.deliveredAt) {
                            <p><strong>Delivered:</strong> {{ formatDate(order.deliveredAt) }}</p>
                          }
                        </div>
                        <div class="bg-white border-t pt-2">
                          <p class="text-xs font-semibold text-gray-900 mb-1">Items:</p>
                          <div class="space-y-1">
                            @for (item of order.items; track item.itemId) {
                              <div class="flex items-center justify-between text-xs">
                                <span class="text-gray-700">{{ item.name }} x{{ item.quantity }}</span>
                                <span class="font-semibold text-gray-900">₦{{ (item.price * item.quantity).toLocaleString() }}</span>
                              </div>
                            }
                          </div>
                          <div class="border-t mt-2 pt-2 flex items-center justify-between text-sm">
                            <span class="font-semibold text-gray-900">Total:</span>
                            <span class="font-bold text-orange-600">₦{{ order.totalPrice.toLocaleString() }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <mat-icon class="text-3xl text-gray-400 block mx-auto mb-2">room_service</mat-icon>
                  <p class="text-sm text-gray-600">No room service orders yet</p>
                </div>
              }

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4 border-t">
                @if (booking!.status === 'checked-in' || booking!.status === 'confirmed') {
                  <button
                    (click)="orderRoomService(booking!)"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <mat-icon>room_service</mat-icon>
                    <span>Order Room Service</span>
                  </button>
                }
                <button
                  (click)="closeBookingDetails()"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-3 rounded-lg font-semibold transition">
                  Close
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
  `]
})
export class CustomerHotelBookingsComponent implements OnInit {
  bookings = signal<HotelBooking[]>([]);
  roomServiceItems = signal<RoomServiceItem[]>([]);
  selectedBooking = signal<HotelBooking | null>(null);
  selectedItems = signal<string[]>([]);
  showRoomServiceModal = signal(false);
  showBookingDetailsModal = signal(false);
  bookingDetailsData = signal<HotelBooking | null>(null);
  showOrderConfirmation = signal(false);

  constructor(
    private customerService: CustomerService,
    private hotelService: HotelService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
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

        // Transform backend data to match HotelBooking interface
        const transformedBookings = bookingsData.map((booking: any) => {
          console.log('📝 Transforming booking:', booking);
          console.log('   Hotel object:', booking.hotel);
          console.log('   Room object:', booking.room);

          // Get hotel name from different possible locations
          const hotelName = booking.hotel?.name ||
                           (booking.hotel && typeof booking.hotel === 'string' ? booking.hotel : null) ||
                           booking.hotelName ||
                           'Unknown Hotel';

          // Get room type from different possible locations
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
            hotelName: hotelName,
            roomId: booking.room?._id || booking.roomId,
            room: booking.room,
            roomType: roomType,
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
            roomServiceOrders: booking.roomServiceOrders
          };
        });

        console.log('✅ Found', transformedBookings.length, 'bookings');
        console.log('📊 Transformed bookings:', transformedBookings);
        this.bookings.set(transformedBookings);
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    this.showBookingDetailsModal.set(true);
  }

  closeBookingDetails(): void {
    this.showBookingDetailsModal.set(false);
    this.bookingDetailsData.set(null);
  }

  orderRoomService(booking: HotelBooking): void {
    this.selectedBooking.set(booking);
    this.selectedItems.set([]);
    this.showRoomServiceModal.set(true);
    // Close booking details modal if it's open
    this.showBookingDetailsModal.set(false);
    this.bookingDetailsData.set(null);
    this.loadRoomServiceItems(booking._id);
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
        if (response.success) {
          this.toastService.success('Room service order placed successfully!');
          this.showOrderConfirmation.set(false);
          this.showRoomServiceModal.set(false);
          this.selectedItems.set([]);
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
}
