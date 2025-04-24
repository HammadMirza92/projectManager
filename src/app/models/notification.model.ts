export enum NotificationType {
  General = 'General',
  Deadline = 'Deadline',
  Payment = 'Payment',
  Status = 'Status'
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  projectId?: number;
  projectTitle?: string;
  isRead: boolean;
  createdAt: Date;
  type: NotificationType;
}

export interface NotificationCreate {
  userId: number;
  title: string;
  message: string;
  projectId?: number;
  type: NotificationType;
}

export interface NotificationUpdate {
  isRead?: boolean;
}
