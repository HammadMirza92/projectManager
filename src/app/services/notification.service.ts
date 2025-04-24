import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Notification, NotificationUpdate } from '../models/notification.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch notifications');
        })
      );
  }

  getUnreadNotificationsCount(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/user/${userId}/unread-count`)
      .pipe(
        map(response => {
          if (response.success && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch unread count');
        })
      );
  }

  markAsRead(id: number): Observable<Notification> {
    const update: NotificationUpdate = { isRead: true };
    return this.http.put<ApiResponse<Notification>>(`${this.apiUrl}/${id}`, update)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to mark notification as read');
        })
      );
  }

  markAllAsRead(userId: number): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/user/${userId}/mark-all-read`, {})
      .pipe(
        map(response => {
          if (response.success && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to mark all as read');
        })
      );
  }

  deleteNotification(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to delete notification');
        })
      );
  }
}
