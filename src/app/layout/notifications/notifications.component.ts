import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <!-- Notification Bell Icon with Unread Count -->
      <div class="flex justify-end mb-4">
        <button 
          (click)="toggleDropdown()"
          class="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <mat-icon class="text-2xl">notifications</mat-icon>
          @if (unreadCount() > 0) {
            <span class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {{ unreadCount() }}
            </span>
          }
        </button>
      </div>

      <!-- Notifications Dropdown -->
      @if (showDropdown()) {
        <div class="bg-white rounded-lg shadow-lg border border-slate-200 w-96">
          <!-- Header -->
          <div class="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="font-bold text-slate-900">Notifications</h3>
            @if (notifications().length > 0) {
              <button 
                (click)="clearAll()"
                class="text-xs text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear All
              </button>
            }
          </div>

          <!-- Notifications List -->
          <div class="max-h-96 overflow-y-auto">
            @if (notifications().length === 0) {
              <div class="p-8 text-center text-slate-600">
                <p>No notifications yet</p>
              </div>
            }
            @for (notification of notifications(); track notification.id) {
              <div 
                [ngClass]="{
                  'bg-blue-50': notification.type === 'order',
                  'bg-purple-50': notification.type === 'delivery',
                  'bg-green-50': notification.type === 'success',
                  'bg-red-50': notification.type === 'error',
                  'bg-yellow-50': notification.type === 'warning',
                  'bg-slate-50': notification.type === 'info',
                  'opacity-50': notification.read
                }"
                class="p-4 border-b border-slate-200 hover:bg-opacity-75 transition-colors cursor-pointer"
                (click)="markAsRead(notification.id!)"
              >
                <div class="flex items-start gap-3">
                  <!-- Icon based on type -->
                  <div [ngClass]="{
                    'text-blue-600': notification.type === 'order',
                    'text-purple-600': notification.type === 'delivery',
                    'text-green-600': notification.type === 'success',
                    'text-red-600': notification.type === 'error',
                    'text-yellow-600': notification.type === 'warning',
                    'text-slate-600': notification.type === 'info'
                  }" class="flex-shrink-0 text-2xl">
                    @switch (notification.type) {
                      @case ('order') {
                        <mat-icon>shopping_cart</mat-icon>
                      }
                      @case ('delivery') {
                        <mat-icon>local_shipping</mat-icon>
                      }
                      @case ('success') {
                        <mat-icon>check_circle</mat-icon>
                      }
                      @case ('error') {
                        <mat-icon>error</mat-icon>
                      }
                      @case ('warning') {
                        <mat-icon>warning</mat-icon>
                      }
                      @default {
                        <mat-icon>info</mat-icon>
                      }
                    }
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-slate-900">{{ notification.title }}</p>
                    <p class="text-sm text-slate-600">{{ notification.message }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ formatTime(notification.timestamp) }}</p>
                  </div>

                  <!-- Close button -->
                  <button 
                    (click)="$event.stopPropagation(); removeNotification(notification.id!)"
                    class="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <mat-icon class="text-lg">close</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Floating Toast Notifications (for new alerts) -->
      @for (notification of toastNotifications; track notification.id) {
        <div 
          [ngClass]="{
            'bg-blue-600': notification.type === 'order',
            'bg-purple-600': notification.type === 'delivery',
            'bg-emerald-600': notification.type === 'success',
            'bg-red-600': notification.type === 'error',
            'bg-yellow-600': notification.type === 'warning',
            'bg-slate-600': notification.type === 'info'
          }"
          class="text-white rounded-lg p-4 shadow-lg flex items-start gap-3 animate-pulse"
        >
          <div class="flex-1">
            <p class="font-bold">{{ notification.title }}</p>
            <p class="text-sm opacity-90">{{ notification.message }}</p>
          </div>
          <button 
            (click)="removeToastNotification(notification.id!)"
            class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <mat-icon class="text-lg">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  toastNotifications: Notification[] = [];
  showDropdown = signal(false);

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notification service
    this.notifications = this.notificationService.notifications;
    this.unreadCount = this.notificationService.unreadCount;

    // Show toast notifications for important types
    setInterval(() => {
      const unshownNotifications = this.notificationService.notifications()
        .filter(n => n.type === 'order' || n.type === 'delivery' || n.type === 'error')
        .filter(n => !this.toastNotifications.find(t => t.id === n.id));
      
      unshownNotifications.forEach(n => {
        this.toastNotifications.push(n);
        // Auto-remove after 5 seconds
        setTimeout(() => {
          this.removeToastNotification(n.id!);
        }, 5000);
      });
    }, 500);
  }

  toggleDropdown(): void {
    this.showDropdown.update(val => !val);
    if (!this.showDropdown()) {
      this.markAllAsRead();
    }
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  removeToastNotification(id: string): void {
    this.toastNotifications = this.toastNotifications.filter(n => n.id !== id);
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  }
}
