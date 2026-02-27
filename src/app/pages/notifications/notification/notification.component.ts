// src/app/components/notification/notification.component.ts

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification/notification.service';
import { AppNotification } from '../../../services/notification/Notification.model';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit, OnDestroy {

  notifications: AppNotification[] = [];
  closingIds = new Set<number>();

  private sub!: Subscription;

  constructor(
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(id: number): void {
    this.closingIds.add(id);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.closingIds.delete(id);
      this.notifService.dismiss(id);
    }, 300);
  }

  trackById(_index: number, n: AppNotification): number {
    return n.id;
  }
}