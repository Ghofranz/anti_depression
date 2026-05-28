# Examples: Creating and Testing Notifications

## Quick Start Examples

### Example 1: Manual Notification via Admin Panel

1. Open Django admin: `https://your-domain.com/admin/`
2. Go to **Notifications**
3. Click **Add Notification**
4. Fill in:
   - **Recipient:** Select any user
   - **Sender:** Select another user (or leave blank for "System")
   - **Notification Type:** Choose match/message/reveal/event/system
   - **Title:** "Test Match Found"
   - **Content:** "You matched with John Doe in Course Help category!"
   - **Related ID:** Optional (leave blank or enter a match ID)
5. Click **Save**
6. Check the frontend notification bell - should light up with unread count

### Example 2: Create via Python Shell

```bash
cd whisperwall
python manage.py shell
```

```python
from django.contrib.auth.models import User
from core.models import Notification

# Get users
user1 = User.objects.first()  # Recipient
user2 = User.objects.all()[1]  # Sender (optional)

# Create notification
notification = Notification.objects.create(
    recipient=user1,
    sender=user2,
    notification_type='match',
    title='New Match Found!',
    content='You matched with Jane Smith in Study Group category. Compatibility score: 87%.',
    related_id=None  # Optional: could be match.id
)

print(f"Created notification {notification.id}")
```

### Example 3: System Notification (No Sender)

```python
from django.contrib.auth.models import User
from core.models import Notification

user = User.objects.get(username='john_doe')

Notification.objects.create(
    recipient=user,
    sender=None,  # System notification
    notification_type='system',
    title='Platform Maintenance',
    content='The platform will be down for maintenance on Saturday Feb 22 from 2-4 AM UTC.',
)
```

### Example 4: Bulk Create Multiple Notifications

```python
from django.contrib.auth.models import User
from core.models import Notification

# Send match notifications to all users
users = User.objects.all()[:5]
sender = User.objects.first()

notifications = [
    Notification(
        recipient=user,
        sender=sender,
        notification_type='match',
        title=f'Match with {sender.username}',
        content=f'You have a new match! Check it out now.',
        related_id=None
    )
    for user in users
]

Notification.objects.bulk_create(notifications)
```

## Integration Examples

### Example 5: Auto-Create Notifications When Match Found

Add to `whisperwall/core/models.py` or create a new signals file:

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q
from core.models import Match, Notification

@receiver(post_save, sender=Match)
def create_match_notifications(sender, instance, created, **kwargs):
    """Auto-create notifications when a match is found"""
    if not created:
        return

    # Notify both users
    users_to_notify = [
        instance.confession_a.author,
        instance.confession_b.author
    ]

    for user in users_to_notify:
        other_user = instance.confession_b.author if user == instance.confession_a.author else instance.confession_a.author

        if other_user and user:
            Notification.objects.create(
                recipient=user,
                sender=other_user,
                notification_type='match',
                title=f'New Match with {other_user.get_full_name() or other_user.username}',
                content=f'You have a new academic match! Compatibility: {instance.score:.0%}. Click to view.',
                related_id=instance.id
            )
```

Register the signal in `whisperwall/core/apps.py`:

```python
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals  # Import signal handlers
```

### Example 6: Notify on Reveal Request

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import RevealRequest, Notification

@receiver(post_save, sender=RevealRequest)
def notify_on_reveal_request(sender, instance, created, **kwargs):
    """Notify user when peer accepts contact exchange"""
    # Only notify if the OTHER user accepted
    if instance.revealed:
        # Both users have accepted, notify both
        for user, confession in [
            (instance.match.confession_a.author, instance.match.confession_a),
            (instance.match.confession_b.author, instance.match.confession_b)
        ]:
            other_user = instance.match.confession_b.author if user == instance.match.confession_a.author else instance.match.confession_a.author

            if user and other_user:
                Notification.objects.create(
                    recipient=user,
                    sender=other_user,
                    notification_type='reveal',
                    title='Contact Exchange Complete!',
                    content='Both of you have accepted. You can now view each other\'s profiles!',
                    related_id=instance.match.id
                )
```

### Example 7: Notify on New Message

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import ChatMessage, Notification

@receiver(post_save, sender=ChatMessage)
def notify_on_new_message(sender, instance, created, **kwargs):
    """Notify user when receiving a message"""
    if not created:
        return

    # Get the other user in the match
    match = instance.match
    sender_user = instance.sender.author

    # Determine who to notify
    if match.confession_a.author == sender_user:
        recipient = match.confession_b.author
    else:
        recipient = match.confession_a.author

    if recipient:
        # Get first 100 chars of message
        preview = instance.message[:100]
        if len(instance.message) > 100:
            preview += '...'

        Notification.objects.create(
            recipient=recipient,
            sender=sender_user,
            notification_type='message',
            title=f'New Message from {sender_user.get_full_name() or sender_user.username}',
            content=preview,
            related_id=match.id
        )
```

### Example 8: Clear Old Notifications (Maintenance Task)

Add to management command or periodic task:

```python
from datetime import timedelta
from django.utils import timezone
from core.models import Notification

def cleanup_old_notifications(days=30):
    """Delete read notifications older than 30 days"""
    cutoff_date = timezone.now() - timedelta(days=days)

    deleted_count, _ = Notification.objects.filter(
        is_read=True,
        created_at__lt=cutoff_date
    ).delete()

    return deleted_count
```

## Testing Examples

### Test via curl

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}' \
  | jq -r '.token')

# 2. Get all notifications
curl http://localhost:8000/api/notifications/ \
  -H "Authorization: Token $TOKEN" | jq

# 3. Get unread count
curl http://localhost:8000/api/notifications/unread/ \
  -H "Authorization: Token $TOKEN" | jq

# 4. Mark notification #1 as read
curl -X PATCH http://localhost:8000/api/notifications/1/read/ \
  -H "Authorization: Token $TOKEN" | jq

# 5. Mark all as read
curl -X PATCH http://localhost:8000/api/notifications/mark-all-read/ \
  -H "Authorization: Token $TOKEN" | jq
```

### Expected Responses

**GET /api/notifications/**

```json
{
  "notifications": [
    {
      "id": 1,
      "notification_type": "match",
      "title": "New Match Found!",
      "content": "You matched with Jane Smith...",
      "sender_username": "jane_smith",
      "sender_name": "Jane Smith",
      "related_id": 42,
      "is_read": false,
      "created_at": "2025-02-15T10:30:45.123Z"
    }
  ]
}
```

**GET /api/notifications/unread/**

```json
{
  "count": 3,
  "notifications": [
    // ... same format as above
  ]
}
```

**PATCH /api/notifications/1/read/**

```json
{
  "id": 1,
  "notification_type": "match",
  "title": "New Match Found!",
  "content": "You matched with Jane Smith...",
  "sender_username": "jane_smith",
  "sender_name": "Jane Smith",
  "related_id": 42,
  "is_read": true,
  "created_at": "2025-02-15T10:30:45.123Z"
}
```

## TypeScript/Angular Examples

### Example 9: Subscribe to Notifications in Component

```typescript
import { Component, OnInit } from "@angular/core";
import { Api } from "./services/api";
import { Notification } from "./entity/notification";

@Component({
  selector: "app-my-component",
  template: `
    <div *ngFor="let notif of notifications">
      <h4>{{ notif.title }}</h4>
      <p>From: {{ notif.sender_name }}</p>
      <p>{{ notif.content }}</p>
      <button (click)="markAsRead(notif)">Mark as Read</button>
    </div>
  `,
})
export class MyComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.api.getNotifications().subscribe({
      next: (response: any) => {
        this.notifications = response.notifications;
      },
    });
  }

  markAsRead(notification: Notification) {
    this.api.markNotificationAsRead(notification.id).subscribe({
      next: (updated) => {
        notification.is_read = true;
      },
    });
  }
}
```

### Example 10: Periodic Polling

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";
import { interval, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Api } from "./services/api";

@Component({
  selector: "app-notification-sync",
})
export class NotificationSyncComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private api: Api) {}

  ngOnInit() {
    // Poll every 10 seconds
    interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.api.getUnreadNotifications().subscribe({
          next: (response: any) => {
            console.log(`${response.count} unread notifications`);
          },
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Database Query Examples

### Get user's unread notification count

```python
from core.models import Notification

user_id = 1
unread_count = Notification.objects.filter(
    recipient_id=user_id,
    is_read=False
).count()

print(f"User {user_id} has {unread_count} unread notifications")
```

### Get notifications from specific user

```python
notifications = Notification.objects.filter(
    recipient_id=1,
    sender_id=2
).order_by('-created_at')
```

### Get notifications of specific type

```python
match_notifications = Notification.objects.filter(
    recipient_id=1,
    notification_type='match'
)
```

### Mark all notifications as read

```python
Notification.objects.filter(recipient_id=1).update(is_read=True)
```

### Delete old notifications

```python
from datetime import timedelta
from django.utils import timezone

cutoff = timezone.now() - timedelta(days=30)
Notification.objects.filter(
    created_at__lt=cutoff,
    is_read=True
).delete()
```
