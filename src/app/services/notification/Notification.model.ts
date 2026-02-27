// src/app/services/notification/notification.model.ts

export type NotifType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: number;
  type: NotifType;
  message: string;
  title?: string;
  duration?: number;
}