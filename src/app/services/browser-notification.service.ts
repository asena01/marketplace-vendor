import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserNotificationService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return Promise.resolve('denied');
    }

    if (Notification.permission !== 'default') {
      return Promise.resolve(Notification.permission);
    }

    return Notification.requestPermission();
  }

  canNotify(): boolean {
    return this.isSupported() && Notification.permission === 'granted';
  }

  show(title: string, options?: NotificationOptions): void {
    if (!this.canNotify()) {
      return;
    }

    new Notification(title, options);
  }

  isDocumentVisible(): boolean {
    return typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  }
}
