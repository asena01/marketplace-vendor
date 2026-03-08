import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  _id?: string;
  userId: string;
  businessId: string;
  businessType: string;
  type: 'sale' | 'low_stock' | 'review' | 'order' | 'delivery' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationResponse<T> {
  success: boolean;
  data?: T;
  unreadCount?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5001/notifications';
  private userId: string = '';
  private businessId: string = '';
  private businessType: string = '';

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('userId') || '';
    this.businessId = localStorage.getItem('restaurantId') ||
                     localStorage.getItem('storeId') ||
                     localStorage.getItem('hotelId') ||
                     localStorage.getItem('serviceId') ||
                     localStorage.getItem('agencyId') ||
                     localStorage.getItem('deliveryId') || '';
    this.businessType = localStorage.getItem('userType') || '';
  }

  // Get notifications for a user
  getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false): Observable<NotificationResponse<Notification[]>> {
    let url = `${this.apiUrl}/user/${this.userId}?page=${page}&limit=${limit}`;
    if (unreadOnly) url += '&unreadOnly=true';
    return this.http.get<NotificationResponse<Notification[]>>(url);
  }

  // Get business notifications
  getBusinessNotifications(businessId: string, businessType: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false): Observable<NotificationResponse<Notification[]>> {
    let url = `${this.apiUrl}/business/${businessId}?businessType=${businessType}&page=${page}&limit=${limit}`;
    if (unreadOnly) url += '&unreadOnly=true';
    return this.http.get<NotificationResponse<Notification[]>>(url);
  }

  // Get unread count for user
  getUnreadCount(): Observable<NotificationResponse<{ unreadCount: number }>> {
    return this.http.get<NotificationResponse<{ unreadCount: number }>>(
      `${this.apiUrl}/user/${this.userId}/unread-count`
    );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<NotificationResponse<Notification>> {
    return this.http.put<NotificationResponse<Notification>>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  // Mark all as read for user
  markAllAsRead(): Observable<NotificationResponse<any>> {
    return this.http.put<NotificationResponse<any>>(
      `${this.apiUrl}/user/${this.userId}/read-all`,
      {}
    );
  }

  // Create notification (for internal use)
  createNotification(notificationData: Partial<Notification>): Observable<NotificationResponse<Notification>> {
    return this.http.post<NotificationResponse<Notification>>(
      this.apiUrl,
      notificationData
    );
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<NotificationResponse<any>> {
    return this.http.delete<NotificationResponse<any>>(
      `${this.apiUrl}/${notificationId}`
    );
  }

  // Toast notification methods for UI feedback
  success(title: string, message: string): void {
    console.log(`✓ ${title}: ${message}`);
  }

  error(title: string, message: string): void {
    console.error(`✗ ${title}: ${message}`);
  }

  warning(title: string, message: string): void {
    console.warn(`⚠ ${title}: ${message}`);
  }

  info(title: string, message: string): void {
    console.info(`ℹ ${title}: ${message}`);
  }
}
