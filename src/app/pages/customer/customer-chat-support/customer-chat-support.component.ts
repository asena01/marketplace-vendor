import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

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
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-customer-chat-support',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <mat-icon>chat</mat-icon>
          <span>Chat with Vendors</span>
        </h2>
        <p class="text-gray-600 text-sm mt-1">Chat directly with vendors about your bookings and orders</p>
      </div>

      <!-- Chat Container -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Conversations List -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-blue-600 text-white p-4 font-bold flex items-center gap-2">
            <mat-icon>chat_bubble</mat-icon>
            <span>Chats ({{ conversations().length }})</span>
          </div>
          <div class="divide-y max-h-[600px] overflow-y-auto">
            @if (conversations().length > 0) {
              @for (conv of conversations(); track conv._id) {
                <button
                  (click)="selectConversation(conv)"
                  [class]="'w-full text-left p-4 hover:bg-gray-50 transition ' +
                    (selectedChat()?._id === conv._id ? 'bg-blue-50 border-l-4 border-blue-600' : '')"
                >
                  <div class="flex items-start gap-2 mb-2">
                    <span class="text-xl">{{ conv.vendorIcon }}</span>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-800 text-sm truncate">{{ conv.vendorName }}</p>
                      <p class="text-xs text-gray-600 capitalize">{{ conv.vendorType }}</p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 line-clamp-2">{{ getLastMessage(conv) }}</p>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs font-semibold" [class]="getStatusBadgeClass(conv.status)">
                      {{ getStatusBadge(conv.status) }}
                    </span>
                    <span class="text-xs text-gray-500">{{ conv.updatedAt | date: 'MMM dd' }}</span>
                  </div>
                </button>
              }
            } @else {
              <div class="p-4 text-center text-gray-500 py-12">
                <p class="text-sm">No chats yet</p>
                <p class="text-xs mt-2 text-gray-400">Start a chat from your bookings or orders</p>
              </div>
            }
          </div>
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3 bg-white rounded-lg shadow-md flex flex-col">
          @if (selectedChat()) {
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 border-b">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ selectedChat()!.vendorIcon }}</span>
                <div>
                  <h3 class="font-bold text-lg">{{ selectedChat()!.vendorName }}</h3>
                  <p class="text-sm opacity-90">{{ selectedChat()!.subject }}</p>
                </div>
              </div>
              @if (selectedChat()!.status !== 'closed') {
                <div class="flex items-center gap-2 mt-3 text-xs opacity-75">
                  <mat-icon class="text-xs" style="width: 12px; height: 12px;">check_circle</mat-icon>
                  <span>Active chat</span>
                </div>
              }
            </div>

            <!-- Messages Container -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] bg-gray-50">
              @if (selectedChat()!.messages && selectedChat()!.messages.length > 0) {
                @for (msg of selectedChat()!.messages; track msg._id) {
                  <div [class]="'flex ' + (msg.sender === 'customer' ? 'justify-end' : 'justify-start')">
                    <div [class]="'max-w-xs px-4 py-3 rounded-lg ' +
                      (msg.sender === 'customer'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200')">
                      <p class="text-xs font-semibold opacity-75 mb-1">{{ msg.senderName }}</p>
                      <p class="text-sm">{{ msg.message }}</p>
                      <p class="text-xs opacity-70 mt-1">{{ msg.timestamp | date: 'HH:mm' }}</p>
                    </div>
                  </div>
                }
              } @else {
                <div class="text-center text-gray-500 py-12">
                  <p class="text-sm">No messages yet</p>
                  <p class="text-xs mt-2">Start the conversation by sending a message</p>
                </div>
              }
            </div>

            <!-- Input Area -->
            @if (selectedChat()!.status !== 'closed') {
              <div class="border-t p-4 bg-white">
                <div class="flex gap-3">
                  <input
                    type="text"
                    [(ngModel)]="newMessage"
                    (keyup.enter)="sendMessage()"
                    placeholder="Message {{ selectedChat()!.vendorName }}..."
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    (click)="sendMessage()"
                    [disabled]="!newMessage().trim() || isSending()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <mat-icon class="text-sm">{{ isSending() ? 'schedule' : 'send' }}</mat-icon>
                    <span>{{ isSending() ? 'Sending...' : 'Send' }}</span>
                  </button>
                </div>
                @if (error()) {
                  <div class="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm mt-2 flex items-center gap-2">
                    <mat-icon class="text-sm">error</mat-icon>
                    <span>{{ error() }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="border-t p-4 bg-gray-100 text-center text-gray-600 text-sm font-semibold flex items-center justify-center gap-2">
                <mat-icon class="text-sm">lock</mat-icon>
                <span>This chat is closed</span>
              </div>
            }
          } @else {
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center text-gray-500">
                <div class="flex justify-center mb-3">
                  <mat-icon class="text-5xl text-gray-400">chat_bubble_outline</mat-icon>
                </div>
                <p class="text-lg font-semibold">Select a chat to start messaging</p>
                <p class="text-sm mt-2 text-gray-400">Or make a booking/order to open vendor chat</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Bookings with Chat Option -->
      <div class="mt-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <mat-icon>phone</mat-icon>
          <span>Start Chat with Vendor</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Hotels -->
          @if (hotelBookings().length > 0) {
            @for (booking of hotelBookings(); track booking._id) {
              <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon>hotel</mat-icon>
                  <h4 class="font-bold text-gray-800">{{ booking.hotelName }}</h4>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ booking.roomType }} - {{ booking.nights }} nights</p>
                <button
                  (click)="startVendorChat('hotel', booking._id, booking.hotelName)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-sm">chat</mat-icon>
                  <span>Chat</span>
                </button>
              </div>
            }
          }

          <!-- Restaurants -->
          @if (foodOrders().length > 0) {
            @for (order of foodOrders(); track order._id) {
              <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon>restaurant</mat-icon>
                  <h4 class="font-bold text-gray-800">{{ order.restaurantName }}</h4>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ order.items.length }} items - ₦{{ order.totalPrice.toLocaleString() }}</p>
                <button
                  (click)="startVendorChat('restaurant', order._id, order.restaurantName)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-sm">chat</mat-icon>
                  <span>Chat</span>
                </button>
              </div>
            }
          }

          <!-- Tours -->
          @if (tourBookings().length > 0) {
            @for (tour of tourBookings(); track tour._id) {
              <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon>flight</mat-icon>
                  <h4 class="font-bold text-gray-800">{{ tour.agency }}</h4>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ tour.tourName }} - {{ tour.duration }} days</p>
                <button
                  (click)="startVendorChat('tour', tour._id, tour.agency)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-sm">chat</mat-icon>
                  <span>Chat</span>
                </button>
              </div>
            }
          }

          <!-- Deliveries -->
          @if (deliveryOrders().length > 0) {
            @for (delivery of deliveryOrders(); track delivery._id) {
              <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon>local_shipping</mat-icon>
                  <h4 class="font-bold text-gray-800">Delivery Service</h4>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ delivery.itemName }} - {{ delivery.status }}</p>
                <button
                  (click)="startVendorChat('delivery', delivery._id, 'Delivery Service')"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <mat-icon class="text-sm">chat</mat-icon>
                  <span>Chat</span>
                </button>
              </div>
            }
          }
        </div>

        @if (hotelBookings().length === 0 && foodOrders().length === 0 && tourBookings().length === 0 && deliveryOrders().length === 0) {
          <div class="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
            <p class="text-gray-700 font-semibold">No active bookings or orders</p>
            <p class="text-gray-600 text-sm mt-2">Make a booking or order to chat with vendors</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CustomerChatSupportComponent implements OnInit {
  conversations = signal<VendorChat[]>([]);
  selectedChat = signal<VendorChat | null>(null);
  newMessage = signal('');
  isSending = signal(false);
  error = signal('');

  // Active bookings/orders
  hotelBookings = signal<any[]>([]);
  foodOrders = signal<any[]>([]);
  tourBookings = signal<any[]>([]);
  deliveryOrders = signal<any[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadActiveBookings();
  }

  loadConversations(): void {
    this.customerService.getVendorChats().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.conversations.set(response.data);
          if (response.data.length > 0) {
            this.selectConversation(response.data[0]);
          }
        }
      },
      error: (error) => {
        console.error('❌ Error loading chats:', error);
      }
    });
  }

  loadActiveBookings(): void {
    // Load hotel bookings
    this.customerService.getMyHotelBookings().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.hotelBookings.set(response.data.filter((b: any) => b.status !== 'cancelled'));
        }
      },
      error: (err) => console.error('Error loading hotels:', err)
    });

    // Load food orders
    this.customerService.getFoodOrders().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.foodOrders.set(response.data.filter((o: any) => o.status !== 'cancelled'));
        }
      },
      error: (err) => console.error('Error loading food orders:', err)
    });

    // Load tour bookings
    this.customerService.getMyTourBookings().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.tourBookings.set(response.data.filter((t: any) => t.status !== 'cancelled'));
        }
      },
      error: (err) => console.error('Error loading tours:', err)
    });

    // Load delivery orders
    this.customerService.getDeliveryOrders().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.deliveryOrders.set(response.data.filter((d: any) => d.status !== 'cancelled'));
        }
      },
      error: (err) => console.error('Error loading deliveries:', err)
    });
  }

  selectConversation(chat: VendorChat): void {
    this.selectedChat.set(chat);
    this.error.set('');
    this.newMessage.set('');
  }

  sendMessage(): void {
    if (!this.newMessage().trim() || !this.selectedChat()) return;

    this.isSending.set(true);
    this.error.set('');

    this.customerService.sendVendorChatMessage(
      this.selectedChat()!._id,
      this.newMessage()
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          const updated = this.selectedChat();
          if (updated && response.data) {
            updated.messages.push(response.data);
            this.selectedChat.set({ ...updated });
          }
          this.newMessage.set('');
        }
        this.isSending.set(false);
      },
      error: (error) => {
        console.error('❌ Error sending message:', error);
        this.error.set(error.error?.message || 'Failed to send message');
        this.isSending.set(false);
      }
    });
  }

  startVendorChat(vendorType: string, bookingId: string, vendorName: string): void {
    const vendorIcons: { [key: string]: string } = {
      hotel: '🏨',
      restaurant: '🍕',
      tour: '✈️',
      delivery: '🚚',
      retail: '🛍️',
      service: '💇'
    };

    this.customerService.startVendorChat(vendorType, bookingId, vendorName).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const newChat = response.data;
          newChat.vendorIcon = vendorIcons[vendorType] || '💬';
          
          // Check if chat already exists
          const existing = this.conversations().find(c => c.bookingId === bookingId);
          if (!existing) {
            this.conversations.update(convs => [newChat, ...convs]);
          }
          
          this.selectConversation(newChat);
        }
      },
      error: (error) => {
        console.error('❌ Error starting chat:', error);
        this.error.set(error.error?.message || 'Failed to start chat');
      }
    });
  }

  getLastMessage(chat: VendorChat): string {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return lastMsg.message.substring(0, 40) + (lastMsg.message.length > 40 ? '...' : '');
    }
    return 'No messages yet';
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      open: 'Open',
      pending: 'Pending',
      closed: 'Closed'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      open: 'text-green-600',
      pending: 'text-yellow-600',
      closed: 'text-gray-600'
    };
    return classes[status] || 'text-gray-600';
  }
}
