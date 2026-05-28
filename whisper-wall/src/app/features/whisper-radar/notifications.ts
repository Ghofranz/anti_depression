import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Notification } from '../../entity/notification';
import { Subject } from 'rxjs';
import { takeUntil, interval } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsWidgetComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  error = '';
  unreadCount = 0;
  showPanel = false;
  private destroy$ = new Subject<void>();

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();

    // Refresh notifications every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
        this.loadUnreadCount();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.api.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications = response.notifications || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.error = 'Failed to load notifications';
          this.loading = false;
        }
      });
  }

  loadUnreadCount() {
    this.api.getUnreadNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.unreadCount = response.count || 0;
        },
        error: (err) => console.error('Failed to load unread count', err)
      });
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
    if (this.showPanel && this.notifications.length === 0 && !this.loading) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification) {
    if (notification.is_read) return;

    this.api.markNotificationAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          notification.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (err) => console.error('Failed to mark notification as read', err)
      });
  }

  markAllAsRead() {
    if (this.unreadCount === 0) return;

    this.api.markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.is_read = true);
          this.unreadCount = 0;
        },
        error: (err) => console.error('Failed to mark all as read', err)
      });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'match':
        return '🤝';
      case 'message':
        return '💬';
      case 'reveal':
        return '👤';
      case 'event':
        return '📅';
      case 'system':
        return 'ℹ️';
      default:
        return '📬';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'match':
        return 'bg-blue-50 border-blue-300';
      case 'message':
        return 'bg-purple-50 border-purple-300';
      case 'reveal':
        return 'bg-pink-50 border-pink-300';
      case 'event':
        return 'bg-green-50 border-green-300';
      case 'system':
        return 'bg-gray-50 border-gray-300';
      default:
        return 'bg-white border-gray-300';
    }
  }

  truncateContent(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
