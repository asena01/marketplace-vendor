import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Notification {
  _id?: string;
  type: 'sale' | 'low_stock' | 'review' | 'order' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-retail-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Notifications</h1>
          <p class="text-slate-600 mt-1">Stay updated with your store activities</p>
        </div>
        @if (unreadCount() > 0) {
          <button
            (click)="markAllAsRead()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <mat-icon class="text-lg">done_all</mat-icon>
            <span>Mark All Read</span>
          </button>
        }
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 border-b border-slate-200">
        <button
          (click)="filterType = ''"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': filterType === ''}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition"
        >
          All ({{ notifications().length }})
        </button>
        <button
          (click)="filterType = 'unread'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': filterType === 'unread'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition"
        >
          Unread ({{ unreadCount() }})
        </button>
        <button
          (click)="filterType = 'sale'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': filterType === 'sale'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition"
        >
          Sales
        </button>
        <button
          (click)="filterType = 'low_stock'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': filterType === 'low_stock'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition"
        >
          Low Stock
        </button>
        <button
          (click)="filterType = 'review'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': filterType === 'review'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition"
        >
          Reviews
        </button>
      </div>

      <!-- Notifications List -->
      <div class="space-y-3">
        @if (getFilteredNotifications().length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-slate-300 text-5xl">notifications_off</mat-icon>
            <p class="text-slate-600 mt-4">No notifications</p>
          </div>
        } @else {
          @for (notification of getFilteredNotifications(); track notification._id) {
            <div
              [ngClass]="{'bg-blue-50 border-l-4 border-blue-500': !notification.isRead}"
              class="bg-white rounded-lg p-4 shadow-sm border border-slate-200 transition hover:shadow-md"
            >
              <div class="flex gap-4">
                <!-- Icon -->
                <div
                  [ngClass]="{
                    'bg-green-100 text-green-600': notification.type === 'sale',
                    'bg-orange-100 text-orange-600': notification.type === 'low_stock',
                    'bg-purple-100 text-purple-600': notification.type === 'review',
                    'bg-blue-100 text-blue-600': notification.type === 'order',
                    'bg-slate-100 text-slate-600': notification.type === 'system'
                  }"
                  class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  @switch (notification.type) {
                    @case ('sale') {
                      <mat-icon>shopping_cart</mat-icon>
                    }
                    @case ('low_stock') {
                      <mat-icon>warning</mat-icon>
                    }
                    @case ('review') {
                      <mat-icon>star</mat-icon>
                    }
                    @case ('order') {
                      <mat-icon>assignment</mat-icon>
                    }
                    @default {
                      <mat-icon>info</mat-icon>
                    }
                  }
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-1">
                    <h3 class="font-semibold text-slate-900">{{ notification.title }}</h3>
                    @if (!notification.isRead) {
                      <span class="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                    }
                  </div>
                  <p class="text-slate-600 text-sm mb-2">{{ notification.message }}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">{{ getTimeAgo(notification.timestamp) }}</span>
                    @if (!notification.isRead) {
                      <button
                        (click)="markAsRead(notification._id)"
                        class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    }
                  </div>
                </div>

                <!-- Priority Badge -->
                @if (notification.priority === 'high') {
                  <div class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                    URGENT
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RetailNotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([
    {
      _id: '1',
      type: 'sale',
      title: 'New Sale!',
      message: 'Customer purchased 2x Wireless Headphones for $199.98',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      isRead: false,
      priority: 'high'
    },
    {
      _id: '2',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Wireless Headphones stock is below 10 units (Current: 5)',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      isRead: false,
      priority: 'high'
    },
    {
      _id: '3',
      type: 'review',
      title: 'New Review Received',
      message: 'Customer left a 5-star review: "Great quality product!"',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      isRead: true,
      priority: 'medium'
    },
    {
      _id: '4',
      type: 'sale',
      title: 'Sale Completed',
      message: 'Order #2024-003 has been delivered successfully',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      isRead: true,
      priority: 'medium'
    },
    {
      _id: '5',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'USB-C Cables stock is running low (Current: 8)',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      isRead: true,
      priority: 'medium'
    },
    {
      _id: '6',
      type: 'system',
      title: 'System Update',
      message: 'Your store analytics have been updated. Check the dashboard!',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      isRead: true,
      priority: 'low'
    }
  ]);

  filterType = '';

  ngOnInit(): void {}

  getFilteredNotifications(): Notification[] {
    if (this.filterType === 'unread') {
      return this.notifications().filter(n => !n.isRead);
    } else if (this.filterType && this.filterType !== '') {
      return this.notifications().filter(n => n.type === this.filterType);
    }
    return this.notifications();
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.isRead).length;
  }

  markAsRead(notificationId?: string): void {
    if (!notificationId) return;
    const updated = this.notifications().map(n =>
      n._id === notificationId ? { ...n, isRead: true } : n
    );
    this.notifications.set(updated);
  }

  markAllAsRead(): void {
    const updated = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated);
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const secondsAgo = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (secondsAgo < 60) {
      return 'Just now';
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else {
      const daysAgo = Math.floor(secondsAgo / 86400);
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    }
  }
}
