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
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-3xl font-bold flex items-center gap-2 mb-2">
              <mat-icon class="text-3xl">chat_bubble</mat-icon>
              <span>Chat Support</span>
            </h2>
            <p class="text-blue-100">Chat directly with vendors about your orders and get instant support</p>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold">{{ conversations().length }}</p>
            <p class="text-blue-100 text-sm">Active Chats</p>
          </div>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Conversations List -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 font-bold flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon>chat_bubble</mat-icon>
              <span>Conversations</span>
            </div>
            <span class="bg-blue-500 text-xs font-bold px-2 py-1 rounded-full">{{ conversations().length }}</span>
          </div>
          <div class="divide-y max-h-[600px] overflow-y-auto">
            @if (conversations().length > 0) {
              @for (conv of conversations(); track conv._id) {
                <button
                  (click)="selectConversation(conv)"
                  [class]="'w-full text-left p-4 hover:bg-gray-50 transition border-b ' +
                    (selectedChat()?._id === conv._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-gray-100')"
                >
                  <div class="flex items-start gap-3 mb-2">
                    <span class="text-2xl">{{ conv.vendorIcon }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900 text-sm truncate">{{ conv.vendorName }}</p>
                      <p class="text-xs text-gray-500 capitalize">{{ conv.vendorType }}</p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ getLastMessage(conv) }}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold px-2 py-1 rounded-full" [class]="'bg-' + (conv.status === 'open' ? 'green' : 'gray') + '-100 text-' + (conv.status === 'open' ? 'green' : 'gray') + '-700'">
                      {{ getStatusBadge(conv.status) }}
                    </span>
                    <span class="text-xs text-gray-500">{{ conv.updatedAt | date: 'MMM dd, HH:mm' }}</span>
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
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="newMessage"
                    (keyup.enter)="sendMessage()"
                    placeholder="Type your message..."
                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    (click)="sendMessage()"
                    [disabled]="!newMessage().trim() || isSending()"
                    class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <mat-icon class="text-base">{{ isSending() ? 'schedule' : 'send' }}</mat-icon>
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

      <!-- Quick Chat Section -->
      <div class="mt-8">
        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md mb-6">
          <h3 class="text-2xl font-bold flex items-center gap-2 mb-2">
            <mat-icon class="text-3xl">chat_bubble_outline</mat-icon>
            <span>Quick Chat with Your Vendors</span>
          </h3>
          <p class="text-green-100">Select an order below to chat directly with the vendor</p>
        </div>
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
                <p class="text-sm text-gray-600 mb-3">{{ order.items.length }} items - ₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</p>
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

          <!-- Shopping Orders -->
          @if (shoppingOrders().length > 0) {
            @for (order of shoppingOrders(); track order._id) {
              <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition border-l-4 border-blue-500">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-blue-600 text-2xl">shopping_bag</mat-icon>
                    <div>
                      <h4 class="font-bold text-gray-900">{{ order.storeName || 'Shopping Order' }}</h4>
                      <p class="text-xs text-gray-500 font-mono">{{ order.orderId || order._id.substring(0, 8) }}</p>
                    </div>
                  </div>
                  <span [class]="'px-3 py-1 rounded-full text-xs font-bold ' + (order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800')">
                    {{ order.status | titlecase }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">
                  <span class="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                    <mat-icon class="text-xs">shopping_cart</mat-icon>
                    {{ order.items.length || 0 }} item(s)
                  </span>
                  <span class="ml-2 font-bold text-gray-900">₦{{ (order.total || order.totalPrice || 0).toLocaleString() }}</span>
                </p>
                <button
                  (click)="startVendorChat('retail', order._id, order.storeName || 'Shopping Store')"
                  class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm">
                  <mat-icon class="text-base">chat</mat-icon>
                  <span>Chat with Vendor</span>
                </button>
              </div>
            }
          }
        </div>

        @if (hotelBookings().length === 0 && foodOrders().length === 0 && tourBookings().length === 0 && deliveryOrders().length === 0 && shoppingOrders().length === 0) {
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-12 text-center">
            <div class="flex justify-center mb-4">
              <mat-icon class="text-6xl text-blue-400">shopping_bag</mat-icon>
            </div>
            <p class="text-gray-800 font-bold text-lg mb-2">No active bookings or orders</p>
            <p class="text-gray-600 text-sm">Make a booking or place an order to start chatting with vendors and get support</p>
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
  shoppingOrders = signal<any[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadActiveBookings();

    // Check for pending chat with a small delay to ensure data is loaded
    setTimeout(() => {
      this.checkForPendingChat();
    }, 500);
  }

  /**
   * Check if there's a pending chat request from another tab or component
   */
  checkForPendingChat(): void {
    const pendingChatData = sessionStorage.getItem('pendingChat');
    if (!pendingChatData) {
      console.log('💬 No pending chat data found');
      return;
    }

    try {
      const chatData = JSON.parse(pendingChatData);
      console.log('💬 Found pending chat data:', chatData);

      // Validate the chat data has required fields
      if (!chatData.vendorType || !chatData.vendorName) {
        console.warn('⚠️ Invalid pending chat data - missing vendorType or vendorName');
        sessionStorage.removeItem('pendingChat');
        return;
      }

      const orderId = chatData.orderId || chatData.bookingId;
      if (!orderId) {
        console.warn('⚠️ Invalid pending chat data - missing orderId or bookingId');
        sessionStorage.removeItem('pendingChat');
        return;
      }

      // Clear the pending chat data BEFORE starting the chat (to prevent infinite loops)
      sessionStorage.removeItem('pendingChat');

      console.log(`💬 Starting ${chatData.vendorType} chat with ${chatData.vendorName} for order ${orderId}`);

      // Start the chat
      this.startVendorChat(
        chatData.vendorType,
        orderId,
        chatData.vendorName
      );
    } catch (e) {
      console.error('❌ Error parsing pending chat data:', e);
      sessionStorage.removeItem('pendingChat');
    }
  }

  loadConversations(): void {
    // Try to load vendor chats if the method exists
    if (this.customerService.getVendorChats) {
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
          console.warn('⚠️ Chat service not fully implemented yet');
          this.conversations.set([]);
        }
      });
    } else {
      console.log('💬 Chat service not available - showing empty state');
      this.conversations.set([]);
    }
  }

  loadActiveBookings(): void {
    // Load hotel bookings
    this.customerService.getMyHotelBookings().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const hotels = Array.isArray(response.data) ? response.data : [response.data];
          this.hotelBookings.set(hotels.filter((b: any) => b.status !== 'cancelled'));
          console.log('✅ Loaded', this.hotelBookings().length, 'hotel bookings for chat');
        }
      },
      error: (err) => {
        console.warn('⚠️ Error loading hotels for chat:', err?.message || err);
        this.hotelBookings.set([]);
      }
    });

    // Load food orders
    this.customerService.getFoodOrders().subscribe({
      next: (response: any) => {
        console.log('📥 Food orders response for chat:', response);
        if (response.success && response.data) {
          const foods = Array.isArray(response.data) ? response.data : [response.data];
          const filtered = foods.filter((o: any) => o.status !== 'cancelled');
          this.foodOrders.set(filtered);
          console.log('✅ Loaded', filtered.length, 'food orders for chat');
        } else {
          console.warn('⚠️ Food orders response missing data:', response);
          this.foodOrders.set([]);
        }
      },
      error: (err) => {
        console.warn('⚠️ Error loading food orders for chat:', err?.message || err);
        this.foodOrders.set([]);
      }
    });

    // Load tour bookings
    this.customerService.getMyTourBookings().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const tours = Array.isArray(response.data) ? response.data : [response.data];
          this.tourBookings.set(tours.filter((t: any) => t.status !== 'cancelled'));
          console.log('✅ Loaded', this.tourBookings().length, 'tour bookings for chat');
        }
      },
      error: (err) => {
        console.warn('⚠️ Error loading tours for chat:', err?.message || err);
        this.tourBookings.set([]);
      }
    });

    // Load delivery orders
    this.customerService.getDeliveryOrders().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const deliveries = Array.isArray(response.data) ? response.data : [response.data];
          this.deliveryOrders.set(deliveries.filter((d: any) => d.status !== 'cancelled'));
          console.log('✅ Loaded', this.deliveryOrders().length, 'delivery orders for chat');
        }
      },
      error: (err) => {
        console.warn('⚠️ Error loading deliveries for chat:', err?.message || err);
        this.deliveryOrders.set([]);
      }
    });

    // Load shopping orders
    this.customerService.getShoppingOrders().subscribe({
      next: (response: any) => {
        console.log('📥 Shopping orders response for chat:', response);
        if (response.success && response.data) {
          const orders = Array.isArray(response.data) ? response.data : [response.data];
          const filtered = orders.filter((o: any) => o.status !== 'cancelled');
          this.shoppingOrders.set(filtered);
          console.log('✅ Loaded', filtered.length, 'shopping orders for chat');
        } else {
          console.warn('⚠️ Shopping orders response missing data:', response);
          this.shoppingOrders.set([]);
        }
      },
      error: (err) => {
        console.warn('⚠️ Error loading shopping orders for chat:', err?.message || err);
        this.shoppingOrders.set([]);
      }
    });
  }

  selectConversation(chat: VendorChat): void {
    this.selectedChat.set(chat);
    this.error.set('');
    this.newMessage.set('');
  }

  sendMessage(): void {
    const messageText = this.newMessage().trim();
    if (!messageText || !this.selectedChat()) {
      console.warn('⚠️ Cannot send empty message or no chat selected');
      return;
    }

    this.isSending.set(true);
    this.error.set('');

    const chatId = this.selectedChat()!._id;
    const vendorType = this.selectedChat()!.vendorType;

    console.log(`📤 Sending message to ${vendorType} chat (${chatId})...`);

    // Check if sendVendorChatMessage method exists
    if (this.customerService.sendVendorChatMessage) {
      this.customerService.sendVendorChatMessage(chatId, messageText).subscribe({
        next: (response: any) => {
          console.log('✅ Message sent successfully:', response);
          if (response.success) {
            const updated = this.selectedChat();
            if (updated && response.data) {
              // Add the message to the chat
              updated.messages.push(response.data);
              this.selectedChat.set({ ...updated });
              console.log('💬 Message added to chat, count:', updated.messages.length);
            }
            this.newMessage.set('');
            this.error.set('');
          } else {
            console.warn('⚠️ Message sent but response missing data:', response);
            this.error.set('Message sent but unable to update conversation');
          }
          this.isSending.set(false);
        },
        error: (error) => {
          console.error('❌ Error sending message:', error);
          const errorMsg = error?.error?.message || error?.message || 'Failed to send message. Please try again.';
          this.error.set(errorMsg);
          this.isSending.set(false);

          // Fallback: add message locally for demo purposes if backend fails
          console.log('💡 Adding message locally as fallback...');
          const updated = this.selectedChat();
          if (updated) {
            const localMessage: ChatMessage = {
              _id: `msg-${Date.now()}`,
              sender: 'customer',
              senderName: 'You',
              message: messageText,
              timestamp: new Date().toISOString(),
              read: false
            };
            updated.messages.push(localMessage);
            this.selectedChat.set({ ...updated });
            this.newMessage.set('');
            console.log('✅ Message added locally');
          }
        }
      });
    } else {
      console.warn('⚠️ sendVendorChatMessage not available - adding message locally');
      // Fallback: add message locally for demo purposes
      const updated = this.selectedChat();
      if (updated) {
        const localMessage: ChatMessage = {
          _id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: 'You',
          message: messageText,
          timestamp: new Date().toISOString(),
          read: false
        };
        updated.messages.push(localMessage);
        this.selectedChat.set({ ...updated });
        this.newMessage.set('');
        this.error.set('');
        console.log('✅ Message added locally');
      }
      this.isSending.set(false);
    }
  }

  startVendorChat(vendorType: string, bookingId: string, vendorName: string): void {
    console.log(`🚀 startVendorChat called: type=${vendorType}, orderId=${bookingId}, vendor=${vendorName}`);

    const vendorIcons: { [key: string]: string } = {
      hotel: '🏨',
      restaurant: '🍕',
      tour: '✈️',
      delivery: '🚚',
      retail: '🛍️',
      service: '💇'
    };

    const vendorIcon = vendorIcons[vendorType] || '💬';

    // Check if chat already exists for this order
    const existingChat = this.conversations().find(c => c.bookingId === bookingId);
    if (existingChat) {
      console.log('💬 Chat already exists for this order, selecting it');
      this.selectConversation(existingChat);
      return;
    }

    // Check if startVendorChat method exists in customer service
    if (this.customerService.startVendorChat) {
      console.log('📡 Calling backend startVendorChat...');
      this.customerService.startVendorChat(vendorType, bookingId, vendorName).subscribe({
        next: (response: any) => {
          console.log('✅ Backend response received:', response);
          if (response.success && response.data) {
            const newChat = response.data as VendorChat;
            newChat.vendorIcon = vendorIcon;

            console.log('📝 Chat created successfully:', newChat._id);
            this.conversations.update(convs => [newChat, ...convs]);
            this.selectConversation(newChat);
            this.error.set(''); // Clear any previous errors
          } else {
            console.warn('⚠️ Backend response missing success or data:', response);
            this.createDemoChat(vendorType, bookingId, vendorName, vendorIcon);
          }
        },
        error: (error) => {
          console.error('❌ Error starting chat with backend:', error);
          console.log('💡 Falling back to demo chat for testing');
          this.error.set('');
          this.createDemoChat(vendorType, bookingId, vendorName, vendorIcon);
        }
      });
    } else {
      console.log('⚠️ Backend startVendorChat method not available - using demo chat');
      this.createDemoChat(vendorType, bookingId, vendorName, vendorIcon);
    }
  }

  /**
   * Create a demo chat for testing when backend is not available
   */
  private createDemoChat(vendorType: string, bookingId: string, vendorName: string, vendorIcon: string): void {
    console.log('🎭 Creating demo chat...');
    const demoChat: VendorChat = {
      _id: `chat-${Date.now()}`,
      bookingId: bookingId,
      vendorId: bookingId,
      vendorName: vendorName,
      vendorType: vendorType as any,
      vendorIcon: vendorIcon,
      subject: `Chat with ${vendorName}`,
      status: 'open',
      messages: [
        {
          _id: '1',
          sender: 'vendor',
          senderName: vendorName,
          message: `Hello! How can I help you with your ${vendorType} order?`,
          timestamp: new Date().toISOString(),
          read: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversations.update(convs => [demoChat, ...convs]);
    this.selectConversation(demoChat);
    console.log('✅ Demo chat created and selected');
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
