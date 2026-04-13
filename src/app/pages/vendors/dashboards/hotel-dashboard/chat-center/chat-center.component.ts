import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { ChatRealtimeEvent, ChatRealtimeService } from '../../../../../services/chat-realtime.service';
import { BrowserNotificationService } from '../../../../../services/browser-notification.service';
import { HotelService } from '../../../../../services/hotel.service';

interface ChatMessage {
  _id: string;
  sender: 'customer' | 'vendor';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface BookingContext {
  bookingId?: string;
  guestName?: string;
  guestEmail?: string;
  roomNumber?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelName?: string;
  hotelPhone?: string;
}

interface VendorChat {
  _id: string;
  bookingId?: string;
  vendorId: string;
  vendorName: string;
  vendorType: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  unreadForVendor?: number;
  unreadForCustomer?: number;
  messages: ChatMessage[];
  updatedAt: string;
  createdAt: string;
  bookingContext?: BookingContext | null;
}

@Component({
  selector: 'app-hotel-chat-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-full bg-slate-100 p-6 md:p-8">
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.24em] text-sky-600">{{ panelEyebrow() }}</p>
          <h1 class="mt-2 text-3xl font-black text-slate-950">{{ panelTitle() }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600">
            {{ panelDescription() }}
          </p>
        </div>
        <button
          (click)="refreshChats()"
          class="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
        >
          Refresh Chats
        </button>
      </div>

      <div class="mb-6 grid gap-4 md:grid-cols-4">
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total Chats</p>
          <p class="mt-3 text-3xl font-black text-slate-950">{{ chats().length }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Open</p>
          <p class="mt-3 text-3xl font-black text-emerald-600">{{ openChatsCount() }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pending</p>
          <p class="mt-3 text-3xl font-black text-amber-600">{{ pendingChatsCount() }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Unread</p>
          <p class="mt-3 text-3xl font-black text-sky-600">{{ unreadChatsCount() }}</p>
        </div>
      </div>
      <div class="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-[1.5fr_0.8fr_0.8fr]">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">Search</label>
            <input
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event); currentPage.set(1)"
              placeholder="Search guest, room, booking, or hotel..."
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">Status</label>
            <select
              [ngModel]="selectedStatus()"
              (ngModelChange)="selectedStatus.set($event); currentPage.set(1)"
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">View</label>
            <div class="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600">
              {{ isStaffWorkspace() ? 'Front desk operational replies' : 'Full hotel conversation log' }}
            </div>
          </div>
        </div>
      </div>

      @if (errorMessage()) {
        <div class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      <div class="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <div class="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="border-b border-slate-200 px-5 py-4">
            <h2 class="text-lg font-black text-slate-950">Conversation Log</h2>
          </div>

          @if (isLoading()) {
            <div class="p-8 text-center text-slate-500">Loading chats...</div>
          } @else if (filteredChats().length === 0) {
            <div class="p-8 text-center text-slate-500">No chats found.</div>
          } @else {
            <div class="divide-y divide-slate-100">
              @for (chat of paginatedChats(); track chat._id) {
                <button
                  (click)="selectChat(chat)"
                  [class]="'w-full px-5 py-4 text-left transition hover:bg-slate-50 ' + (selectedChat()?._id === chat._id ? 'bg-sky-50' : '')"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-black text-slate-950">{{ chat.bookingContext?.guestName || 'Guest' }}</p>
                      <p class="mt-1 truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {{ chat.bookingContext?.roomNumber ? 'Room ' + chat.bookingContext?.roomNumber : 'Booking Chat' }}
                      </p>
                    </div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-700': chat.status === 'open',
                        'bg-amber-100 text-amber-700': chat.status === 'pending',
                        'bg-slate-100 text-slate-700': chat.status === 'closed'
                      }">
                      {{ chat.status }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm text-slate-600 line-clamp-2">{{ lastMessage(chat) }}</p>
                  <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>#{{ shortId(chat.bookingContext?.bookingId || chat.bookingId || chat._id) }}</span>
                    <div class="flex items-center gap-2">
                      @if ((chat.unreadForVendor || 0) > 0) {
                        <span class="rounded-full bg-sky-600 px-2 py-1 text-[11px] font-black text-white">{{ chat.unreadForVendor }}</span>
                      }
                      <span>{{ chat.updatedAt | date:'MMM d, HH:mm' }}</span>
                    </div>
                  </div>
                </button>
              }
            </div>
            @if (totalPages() > 1) {
              <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
                <p class="text-sm text-slate-500">
                  Showing {{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} of {{ filteredChats().length }} chats
                </p>
                <div class="flex items-center gap-2">
                  <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40">Previous</button>
                  <span class="text-sm font-semibold text-slate-700">Page {{ currentPage() }} of {{ totalPages() }}</span>
                  <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40">Next</button>
                </div>
              </div>
            }
          }
        </div>

        <div class="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          @if (selectedChat()) {
            <div class="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.22em] text-sky-300">Chat Detail</p>
                  <h2 class="mt-2 text-2xl font-black">{{ selectedChat()?.bookingContext?.guestName || 'Guest' }}</h2>
                  <p class="mt-1 text-sm text-slate-300">{{ selectedChat()?.subject }}</p>
                </div>
                <div class="grid gap-2 text-sm text-slate-300">
                  <p>{{ selectedChat()?.bookingContext?.roomNumber ? 'Room ' + selectedChat()?.bookingContext?.roomNumber : 'No room assigned' }}</p>
                  <p>{{ selectedChat()?.bookingContext?.guestEmail || selectedChat()?.vendorName }}</p>
                </div>
              </div>
            </div>

            <div class="grid gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 md:grid-cols-4">
              <div class="rounded-2xl bg-white p-4">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Guest</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ selectedChat()?.bookingContext?.guestName || 'Guest' }}</p>
              </div>
              <div class="rounded-2xl bg-white p-4">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Room</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ selectedChat()?.bookingContext?.roomNumber || 'TBA' }}</p>
              </div>
              <div class="rounded-2xl bg-white p-4">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Check In</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ selectedChat()?.bookingContext?.checkInDate ? (selectedChat()?.bookingContext?.checkInDate | date:'MMM d, y') : 'N/A' }}</p>
              </div>
              <div class="rounded-2xl bg-white p-4">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Check Out</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ selectedChat()?.bookingContext?.checkOutDate ? (selectedChat()?.bookingContext?.checkOutDate | date:'MMM d, y') : 'N/A' }}</p>
              </div>
            </div>

            <div class="max-h-[420px] min-h-[420px] overflow-y-auto bg-slate-50 px-6 py-5">
              @for (message of selectedChat()!.messages; track message._id) {
                <div [class]="'mb-4 flex ' + (message.sender === 'vendor' ? 'justify-end' : 'justify-start')">
                  <div [class]="'max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ' +
                    (message.sender === 'vendor'
                      ? 'bg-sky-600 text-white rounded-br-md'
                      : 'border border-slate-200 bg-white text-slate-900 rounded-bl-md')">
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">{{ message.senderName }}</p>
                    <p class="mt-1 text-sm leading-relaxed">{{ message.message }}</p>
                    <p class="mt-2 text-[11px] opacity-70">{{ message.timestamp | date:'MMM d, HH:mm' }}</p>
                  </div>
                </div>
              }
            </div>

            <div class="border-t border-slate-200 bg-white p-5">
              <div class="flex flex-col gap-3">
                <textarea
                  [ngModel]="replyDraft()"
                  (ngModelChange)="replyDraft.set($event)"
                  rows="3"
                  placeholder="Write a reply to the guest..."
                  class="min-h-[92px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm text-slate-500">Replies are added to the shared hotel transcript visible to customer, receptionist, and admin.</p>
                  <button
                    (click)="sendReply()"
                    [disabled]="!replyDraft().trim() || isSendingReply()"
                    class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {{ isSendingReply() ? 'Sending...' : 'Send Reply' }}
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <div class="flex min-h-[620px] items-center justify-center p-8 text-center text-slate-500">
              Select a conversation to view the full transcript.
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HotelChatCenterComponent implements OnInit, OnDestroy {
  readonly itemsPerPage = 10;
  chats = signal<VendorChat[]>([]);
  selectedChat = signal<VendorChat | null>(null);
  isLoading = signal(false);
  isSendingReply = signal(false);
  errorMessage = signal('');
  searchQuery = signal('');
  selectedStatus = signal('');
  replyDraft = signal('');
  currentPage = signal(1);
  private streamDisconnect: (() => void) | null = null;

  filteredChats = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.chats().filter((chat) => {
      if (status && chat.status !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        chat.vendorName,
        chat.subject,
        chat.bookingContext?.guestName,
        chat.bookingContext?.roomNumber,
        chat.bookingContext?.guestEmail,
        chat.bookingContext?.bookingId,
        this.lastMessage(chat)
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });
  });

  paginatedChats = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredChats().slice(start, start + this.itemsPerPage);
  });

  openChatsCount = computed(() => this.chats().filter((chat) => chat.status === 'open').length);
  pendingChatsCount = computed(() => this.chats().filter((chat) => chat.status === 'pending').length);
  unreadChatsCount = computed(() => this.chats().reduce((total, chat) => total + (chat.unreadForVendor || 0), 0));

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private chatRealtimeService: ChatRealtimeService,
    private browserNotificationService: BrowserNotificationService
  ) {}

  ngOnInit(): void {
    this.browserNotificationService.requestPermission();
    const hotelId = localStorage.getItem('hotelId');
    if (hotelId) {
      this.hotelService.setHotelId(hotelId);
      this.streamDisconnect = this.chatRealtimeService.connectVendor(hotelId, (event: ChatRealtimeEvent) => {
        if (event.vendorType && event.vendorType !== 'hotel') {
          return;
        }
        if (event.event === 'message-created') {
          const activeChatId = this.selectedChat()?._id;
          if (!this.browserNotificationService.isDocumentVisible() || (event.chatId && event.chatId !== activeChatId)) {
            this.browserNotificationService.show('New guest message', {
              body: 'A guest sent a new hotel chat message.',
              tag: event.chatId || 'hotel-chat'
            });
          }
        }
        this.refreshChats();
      });
    }
    this.refreshChats();
  }

  ngOnDestroy(): void {
    this.streamDisconnect?.();
  }

  isStaffWorkspace(): boolean {
    return this.authService.getCurrentUser()?.userType === 'staff';
  }

  panelEyebrow(): string {
    return this.isStaffWorkspace() ? 'Front Desk' : 'Hotel Admin';
  }

  panelTitle(): string {
    return this.isStaffWorkspace() ? 'Guest Chat Desk' : 'Hotel Chat Center';
  }

  panelDescription(): string {
    return this.isStaffWorkspace()
      ? 'Handle guest support messages from active hotel stays. Reception can read the full conversation and reply in real time.'
      : 'Monitor the full hotel guest conversation log. Admin can review every transcript and reply from the central chat center.';
  }

  refreshChats(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getHotelChats(1, 200).subscribe({
      next: (response: any) => {
        const chats = response.success || response.status === 'success' ? (response.data || []) : [];
        this.chats.set(Array.isArray(chats) ? chats : []);

        const selectedId = this.selectedChat()?._id;
        const nextSelected = this.chats().find((chat) => chat._id === selectedId) || this.chats()[0] || null;
        this.selectedChat.set(nextSelected);
        if (nextSelected?._id && (nextSelected.unreadForVendor || 0) > 0) {
          this.markChatAsRead(nextSelected._id);
        }
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error?.error?.message || 'Failed to load hotel chats.');
        this.isLoading.set(false);
      }
    });
  }

  selectChat(chat: VendorChat): void {
    this.selectedChat.set(chat);
    this.replyDraft.set('');
    if ((chat.unreadForVendor || 0) > 0) {
      this.markChatAsRead(chat._id);
    }
  }

  sendReply(): void {
    const chat = this.selectedChat();
    const message = this.replyDraft().trim();
    if (!chat?._id || !message) {
      return;
    }

    this.isSendingReply.set(true);
    this.errorMessage.set('');

    const senderName = this.authService.getCurrentUser()?.name || 'Hotel Team';
    this.hotelService.sendHotelChatReply(chat._id, message, senderName).subscribe({
      next: (response: any) => {
        if (response.success || response.status === 'success') {
          this.replyDraft.set('');
          this.refreshChats();
        } else {
          this.errorMessage.set('Reply was not saved.');
        }
        this.isSendingReply.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error?.error?.message || 'Failed to send reply.');
        this.isSendingReply.set(false);
      }
    });
  }

  lastMessage(chat: VendorChat): string {
    const last = chat.messages?.[chat.messages.length - 1];
    return last?.message || 'No messages yet';
  }

  shortId(value: string): string {
    return value.slice(-8).toUpperCase();
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredChats().length / this.itemsPerPage));
  }

  pageStartIndex(): number {
    return (this.currentPage() - 1) * this.itemsPerPage;
  }

  pageEndIndex(): number {
    return Math.min(this.pageStartIndex() + this.itemsPerPage, this.filteredChats().length);
  }

  private markChatAsRead(chatId: string): void {
    this.hotelService.markHotelChatRead(chatId).subscribe({
      next: () => {
        this.chats.update((chats) => chats.map((chat) => chat._id === chatId ? { ...chat, unreadForVendor: 0 } : chat));
        const selected = this.selectedChat();
        if (selected?._id === chatId) {
          this.selectedChat.set({ ...selected, unreadForVendor: 0 });
        }
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }
}
