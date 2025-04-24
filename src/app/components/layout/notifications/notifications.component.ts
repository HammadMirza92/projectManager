import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Notification, NotificationType } from '../../../models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.notificationService.getNotifications(currentUser.id)
        .subscribe(notifications => {
          this.notifications = notifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .subscribe(updatedNotification => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.notifications[index] = updatedNotification;
          }
        });
    }
  }

  markAllAsRead() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.notificationService.markAllAsRead(currentUser.id)
        .subscribe(success => {
          if (success) {
            this.notifications.forEach(notification => {
              notification.isRead = true;
            });
            this.snackBar.open('All notifications marked as read', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id)
      .subscribe(success => {
        if (success) {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.snackBar.open('Notification deleted', 'Close', {
            duration: 3000
          });
        }
      });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.isRead);
  }

  getNotificationIcon(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.Deadline:
        return 'event';
      case NotificationType.Payment:
        return 'payment';
      case NotificationType.Status:
        return 'sync';
      case NotificationType.General:
      default:
        return 'notifications';
    }
  }

  getNotificationIconClass(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.Deadline:
        return 'notification-icon deadline';
      case NotificationType.Payment:
        return 'notification-icon payment';
      case NotificationType.Status:
        return 'notification-icon status';
      case NotificationType.General:
      default:
        return 'notification-icon general';
    }
  }
}
