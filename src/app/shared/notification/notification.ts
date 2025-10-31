import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,NgIf],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  isVisible = false;
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification: Notification | null) => {
        this.notification = notification;
        if (notification) {
          this.showNotification();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showNotification(): void {
    this.isVisible = true;
  }

  hideNotification(): void {
    this.isVisible = false;
    this.notificationService.clearNotification();
  }

  getNotificationClass(): string {
    if (!this.notification) {
      return '';
    }
    
    switch (this.notification.type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
        return 'notification-info';
      default:
        return 'notification-info';
    }
  }

  getNotificationIcon(): string {
    if (!this.notification) {
      return '';
    }
    
    switch (this.notification.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  }
}