import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-hotel-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Notifications</h1>
        <p class="text-blue-100">Manage all your hotel notifications</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading notifications...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Filter by Type</label>
          <select
            [(ngModel)]="filterType"
            (change)="filterNotifications()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Types</option>
            <option value="booking">Booking</option>
            <option value="room">Room Status</option>
            <option value="staff">Staff</option>
            <option value="maintenance">Maintenance</option>
            <option value="payment">Payment</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
          <select
            [(ngModel)]="filterStatus"
            (change)="filterNotifications()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            (click)="markAllAsRead()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="space-y-3">
        @if (filteredNotifications().length === 0) {
          <div class="bg-slate-50 border border-slate-300 text-slate-700 px-4 py-8 rounded-lg text-center">
            <p class="text-lg font-semibold">No notifications</p>
            <p class="text-sm text-slate-600 mt-1">You're all caught up!</p>
          </div>
        } @else {
          @for (notification of filteredNotifications(); track notification._id) {
            <div
              class="bg-white rounded-lg p-4 shadow-md border-l-4 transition-all"
              [ngClass]="{
                'border-l-yellow-500': !notification.read,
                'border-l-gray-300': notification.read,
                'bg-blue-50': !notification.read
              }"
            >
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div class="text-2xl mt-1">{{ getNotificationIcon(notification.type) }}</div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="font-bold text-slate-900">{{ notification.title }}</h3>
                      <p class="text-sm text-slate-600 mt-1">{{ notification.message }}</p>
                      <p class="text-xs text-slate-500 mt-2">
                        {{ formatDate(notification.createdAt) }}
                      </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                      @if (!notification.read) {
                        <button
                          (click)="markAsRead(notification._id)"
                          class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition"
                        >
                          Mark Read
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: []
})
export class HotelNotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  filteredNotifications = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  filterType = '';
  filterStatus = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.hotelService.getNotifications(1, 50).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.notifications.set(response.data);
          this.filterNotifications();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        this.errorMessage.set('Failed to load notifications');
        this.isLoading.set(false);
      }
    });
  }

  filterNotifications(): void {
    let result = [...this.notifications()];

    if (this.filterType) {
      result = result.filter(n => n.type === this.filterType);
    }

    if (this.filterStatus === 'unread') {
      result = result.filter(n => !n.read);
    } else if (this.filterStatus === 'read') {
      result = result.filter(n => n.read);
    }

    // Sort: unread first, then by date
    result.sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    this.filteredNotifications.set(result);
  }

  markAsRead(notificationId: string): void {
    this.hotelService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notifications = this.notifications();
        const notification = notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.read = true;
        }
        this.notifications.set([...notifications]);
        this.filterNotifications();
      },
      error: (error: any) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.hotelService.markAllNotificationsAsRead().subscribe({
      next: () => {
        const notifications = this.notifications().map(n => ({ ...n, read: true }));
        this.notifications.set(notifications);
        this.filterNotifications();
      },
      error: (error: any) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      booking: '📅',
      room: '🏨',
      staff: '👔',
      maintenance: '🔧',
      payment: '💳',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
