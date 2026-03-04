import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

interface HotelBooking {
  _id: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'completed' | 'cancelled';
  roomServiceOrders?: any[];
}

interface RoomServiceItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

@Component({
  selector: 'app-customer-hotel-bookings',
  standalone: true,
  imports: [CommonModule],
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
                      class="text-blue-600 hover:text-blue-800 font-semibold">
                      View
                    </button>
                    @if (booking.status === 'checked-in' || booking.status === 'confirmed') {
                      <button 
                        (click)="orderRoomService(booking)"
                        class="text-green-600 hover:text-green-800 font-semibold">
                        🍽️ Room Service
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
          <p class="text-gray-500 text-lg mb-4">🏨 No hotel bookings yet</p>
          <p class="text-gray-400 text-sm">Start exploring hotels and make your first booking!</p>
        </div>
      }

      <!-- Room Service Modal -->
      @if (showRoomServiceModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
              <h3 class="text-lg font-semibold">🍽️ Room Service & Drinks</h3>
              <button 
                (click)="showRoomServiceModal.set(false)"
                class="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
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
                      <div class="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                           (click)="selectItem(item)"
                           [class.ring-2]="selectedItems().includes(item._id)"
                           [class.ring-blue-500]="selectedItems().includes(item._id)">
                        <p class="font-semibold text-gray-900">{{ item.name }}</p>
                        <p class="text-sm text-gray-600">{{ item.category }}</p>
                        <p class="text-sm text-gray-700 mt-2">{{ item.description }}</p>
                        <p class="text-lg font-bold text-green-600 mt-2">₦{{ item.price.toLocaleString() }}</p>
                        @if (!item.available) {
                          <p class="text-xs text-red-600 font-semibold mt-2">Currently Unavailable</p>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-gray-500">Loading room service items...</p>
                }
              </div>

              <!-- Order Summary -->
              @if (selectedItems().length > 0) {
                <div class="mt-6 border-t pt-4">
                  <h4 class="font-semibold text-gray-900 mb-3">Order Summary:</h4>
                  <div class="space-y-2 mb-4">
                    @for (itemId of selectedItems(); track itemId) {
                      <p class="text-sm text-gray-700">{{ itemId }}: ₦500</p>
                    }
                  </div>
                  <div class="border-t pt-2">
                    <p class="text-lg font-bold text-gray-900">
                      Total: ₦{{ calculateOrderTotal() }}
                    </p>
                  </div>
                </div>
              }

              <!-- Action Buttons -->
              <div class="flex gap-3 mt-6">
                <button 
                  (click)="submitRoomServiceOrder()"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                  Place Order
                </button>
                <button 
                  (click)="showRoomServiceModal.set(false)"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-semibold transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerHotelBookingsComponent implements OnInit {
  bookings = signal<HotelBooking[]>([]);
  roomServiceItems = signal<RoomServiceItem[]>([]);
  selectedBooking = signal<HotelBooking | null>(null);
  selectedItems = signal<string[]>([]);
  showRoomServiceModal = signal(false);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.customerService.getMyHotelBookings().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.bookings.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading hotel bookings:', error);
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
      confirmed: '✓ Confirmed',
      pending: '⏳ Pending',
      'checked-in': '🔓 Checked In',
      'checked-out': '🔒 Checked Out',
      completed: '✓ Completed',
      cancelled: '✕ Cancelled'
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
    // TODO: Implement view details modal
  }

  orderRoomService(booking: HotelBooking): void {
    this.selectedBooking.set(booking);
    this.selectedItems.set([]);
    this.showRoomServiceModal.set(true);
    this.loadRoomServiceItems(booking._id);
  }

  loadRoomServiceItems(bookingId: string): void {
    // TODO: Load room service items from hotel associated with booking
    // For now, using mock data
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

  calculateOrderTotal(): number {
    const items = this.roomServiceItems();
    return this.selectedItems().reduce((total, itemId) => {
      const item = items.find(i => i._id === itemId);
      return total + (item?.price || 0);
    }, 0);
  }

  submitRoomServiceOrder(): void {
    if (!this.selectedBooking() || this.selectedItems().length === 0) {
      alert('Please select at least one item');
      return;
    }

    const orderData = {
      items: this.selectedItems(),
      totalPrice: this.calculateOrderTotal(),
      notes: ''
    };

    this.customerService.orderRoomService(
      this.selectedBooking()?._id || '',
      this.selectedBooking()?._id || '',
      orderData
    ).subscribe(
      (response: any) => {
        if (response.success) {
          alert('✓ Room service order placed successfully!');
          this.showRoomServiceModal.set(false);
          this.selectedItems.set([]);
        }
      },
      (error) => {
        console.error('Error placing room service order:', error);
        alert('Failed to place room service order');
      }
    );
  }
}
