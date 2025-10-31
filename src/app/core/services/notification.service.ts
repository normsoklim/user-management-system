import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();
  
  showNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
    
    const duration = notification.duration || 3000;
    setTimeout(() => {
      this.clearNotification();
    }, duration);
  }
  
  showSuccess(message: string, duration?: number): void {
    this.showNotification({ message, type: 'success', duration });
  }
  
  showError(message: string, duration?: number): void {
    this.showNotification({ message, type: 'error', duration });
  }
  
  showWarning(message: string, duration?: number): void {
    this.showNotification({ message, type: 'warning', duration });
  }
  
  showInfo(message: string, duration?: number): void {
    this.showNotification({ message, type: 'info', duration });
  }
  
  clearNotification(): void {
    this.notificationSubject.next(null);
  }
}