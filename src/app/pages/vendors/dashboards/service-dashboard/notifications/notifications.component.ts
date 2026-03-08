import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceProviderService } from '../../../../../services/service-provider.service';

@Component({
  selector: 'app-service-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">🔔 Notifications</h1>
          <p class="text-gray-600 text-sm mt-1">{{ unreadCount() }} unread notification{{ unreadCount() !== 1 ? 's' : '' }}</p>
        </div>
        @if (unreadCount() > 0) {
          <button 
            (click)="markAllAsRead()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Mark All as Read
          </button>
        }
      </div>

      <!-- Filter -->
      <div class="mb-6 flex gap-4">
        <select 
          [(ngModel)]="filterType"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Types</option>
          <option value="appointment">Appointments</option>
          <option value="review">Reviews</option>
          <option value="staff">Staff</option>
          <option value="payment">Payment</option>
          <option value="system">System</option>
        </select>

        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading notifications...</p>
        </div>
      } @else if (filteredNotifications().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">No notifications found</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (notification of filteredNotifications(); track notification._id) {
            <div 
              [class]="'p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 ' + 
                (notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500')"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">{{ getNotificationIcon(notification.type) }}</span>
                    <h3 class="text-lg font-bold text-gray-900">{{ notification.title }}</h3>
                    @if (!notification.read) {
                      <span class="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    }
                  </div>
                  <p class="text-gray-700 mb-2">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500">{{ notification.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                </div>

                <div class="flex gap-2 ml-4">
                  @if (!notification.read) {
                    <button 
                      (click)="markAsRead(notification._id)"
                      class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition"
                    >
                      Mark Read
                    </button>
                  }
                  @if (notification.actionUrl) {
                    <button 
                      (click)="navigateTo(notification.actionUrl)"
                      class="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg transition font-medium"
                    >
                      View
                    </button>
                  }
                </div>
              </div>

              @if (notification.details) {
                <div class="mt-3 p-3 bg-white/50 rounded text-sm text-gray-600">
                  {{ notification.details }}
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ServiceNotificationsComponent implements OnInit {
  isLoading = signal(false);
  notifications = signal<any[]>([]);
  unreadCount = signal(0);
  
  filterType = '';
  filterStatus = '';

  filteredNotifications = computed(() => {
    let result = this.notifications();
    
    if (this.filterType) {
      result = result.filter(n => n.type === this.filterType);
    }
    
    if (this.filterStatus === 'unread') {
      result = result.filter(n => !n.read);
    } else if (this.filterStatus === 'read') {
      result = result.filter(n => n.read);
    }
    
    return result.sort((a, b) => {
      // Show unread first, then by date
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  providerId: string = '';

  constructor(private serviceProviderService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.serviceProviderService.getNotifications(this.providerId, 1, 100).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.notifications.set(response.data);
          this.updateUnreadCount();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(notificationId: string): void {
    this.serviceProviderService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        // Update local state
        const notification = this.notifications().find(n => n._id === notificationId);
        if (notification) {
          notification.read = true;
        }
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.serviceProviderService.markAllNotificationsAsRead(this.providerId).subscribe({
      next: () => {
        this.notifications().forEach(n => {
          n.read = true;
        });
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  navigateTo(url: string): void {
    window.location.href = url;
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'appointment': '📅',
      'review': '⭐',
      'staff': '👔',
      'payment': '💳',
      'system': '⚙️',
      'default': '🔔'
    };
    return icons[type] || icons['default'];
  }

  private updateUnreadCount(): void {
    const unread = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(unread);
  }
}
