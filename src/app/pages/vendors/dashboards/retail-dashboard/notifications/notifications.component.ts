import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../../../services/notification.service';

interface Notification {
  _id?: string;
  type: 'sale' | 'low_stock' | 'review' | 'order' | 'delivery' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  businessId?: string;
  businessType?: string;
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

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading notifications...
          </p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <mat-icon class="text-lg">error</mat-icon>
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

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
                    <span class="text-xs text-slate-500">{{ getTimeAgo(notification.createdAt) }}</span>
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
export class RetailNotificationsComponent implements OnInit, OnDestroy {
  notifications = signal<Notification[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  filterType = '';
  unreadCount = computed(() =>
    this.notifications().filter(n => !n.isRead).length
  );
  private storeId: string = '';
  private businessType: string = 'retail';
  private autoRefreshInterval: any;

  constructor(private notificationService: NotificationService) {
    this.storeId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (!this.storeId) {
      this.errorMessage.set('Store ID not found');
      return;
    }
    this.loadNotifications();
    // Auto-refresh notifications every 30 seconds
    this.autoRefreshInterval = setInterval(() => this.loadNotifications(), 30000);
  }

  ngOnDestroy(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getBusinessNotifications(this.storeId, this.businessType, 1, 50).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.notifications.set(response.data);
        } else {
          this.notifications.set([]);
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
    this.notificationService.markAsRead(notificationId).subscribe({
      next: (response: any) => {
        const updated = this.notifications().map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
      },
      error: (error: any) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updated = this.notifications().map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
      },
      error: (error: any) => {
        console.error('Error marking all as read:', error);
      }
    });
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
