import { Injectable, signal } from '@angular/core';

export interface Notification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'order' | 'delivery';
  title: string;
  message: string;
  timestamp?: Date;
  read?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  constructor() {
    this.loadNotifications();
  }

  // Load notifications from localStorage
  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        this.notifications.set(JSON.parse(stored));
        this.updateUnreadCount();
      } catch (e) {
        console.error('Error loading notifications:', e);
      }
    }
  }

  // Save notifications to localStorage
  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications()));
  }

  // Add notification
  addNotification(notification: Notification) {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    this.notifications.update(notifs => [newNotification, ...notifs]);
    this.saveNotifications();
    this.updateUnreadCount();

    // Auto-remove after 5 seconds for certain types
    if (['success', 'info'].includes(notification.type)) {
      setTimeout(() => this.removeNotification(id), 5000);
    }

    // Play sound for important notifications
    if (['order', 'delivery', 'error', 'warning'].includes(notification.type)) {
      this.playNotificationSound();
    }
  }

  // Success notification
  success(title: string, message: string) {
    this.addNotification({ type: 'success', title, message });
  }

  // Error notification
  error(title: string, message: string) {
    this.addNotification({ type: 'error', title, message });
  }

  // Warning notification
  warning(title: string, message: string) {
    this.addNotification({ type: 'warning', title, message });
  }

  // Info notification
  info(title: string, message: string) {
    this.addNotification({ type: 'info', title, message });
  }

  // Order notification
  newOrder(customerName: string, itemCount: number) {
    this.addNotification({
      type: 'order',
      title: '🍽️ New Order!',
      message: `${customerName} ordered ${itemCount} item(s)`
    });
  }

  // Delivery notification
  deliveryAlert(message: string) {
    this.addNotification({
      type: 'delivery',
      title: '🚚 Delivery Update',
      message
    });
  }

  // Mark notification as read
  markAsRead(id: string) {
    this.notifications.update(notifs =>
      notifs.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // Remove notification
  removeNotification(id: string) {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // Clear all notifications
  clearAll() {
    this.notifications.set([]);
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // Get unread count
  private updateUnreadCount() {
    const count = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(count);
  }

  // Play notification sound
  private playNotificationSound() {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window as any).AudioContext || new (window as any).webkitAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // frequency
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Fallback: use console if Web Audio API not available
      console.log('📢 Notification');
    }
  }

  // Request browser notification permission
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Send browser notification
  sendBrowserNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}
