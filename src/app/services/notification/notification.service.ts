// src/app/services/notification/notification.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppNotification, NotifType } from './Notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private counter = 0;
  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this._notifications.asObservable();

  private show(
    message: string,
    type: NotifType,
    title?: string,
    duration = 8000
  ): void {
    const id = ++this.counter;
    const notif: AppNotification = { id, type, message, title, duration };
    this._notifications.next([...this._notifications.value, notif]);

    // duration = 0 => notification permanente
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number): void {
    this._notifications.next(
      this._notifications.value.filter(n => n.id !== id)
    );
  }

  dismissAll(): void {
    this._notifications.next([]);
  }

  success(message: string, title = '', duration = 8000): void {
    this.show(message, 'success', title, duration);
  }

  error(message: string, title = '', duration = 9000): void {
    this.show(message, 'error', title, duration);
  }

  warning(message: string, title = '', duration = 8000): void {
    this.show(message, 'warning', title, duration);
  }

  info(message: string, title = '', duration = 8000): void {
    this.show(message, 'info', title, duration);
  }

  // Ne disparaît que si l'utilisateur clique sur X
  permanent(message: string, type: NotifType = 'info', title?: string): void {
    this.show(message, type, title, 0);
  }
}