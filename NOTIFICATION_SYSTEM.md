# Notification System Documentation

## Overview

A complete notification system has been implemented for the Angular frontend with a fully redesigned UI. The system includes:

1. **Backend Notification Model** - Django model to store and manage notifications
2. **REST API Endpoints** - Full CRUD operations for notifications
3. **Angular UI Component** - Beautiful, responsive notification widget with real-time updates
4. **Mark as Read** - Track read/unread status with backend persistence

## Architecture

### Backend (Django)

#### Model: `Notification`

Located in `whisperwall/core/models.py`

```python
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('match', 'New Match Found'),
        ('message', 'New Message'),
        ('reveal', 'Reveal Request'),
        ('event', 'Event Scheduled'),
        ('system', 'System Notification'),
    ]

    recipient = ForeignKey(User)  # Who receives the notification
    sender = ForeignKey(User, null=True)  # Who sent it (null = system)
    notification_type = CharField(choices=NOTIFICATION_TYPES)
    title = CharField(max_length=255)
    content = TextField()
    related_id = IntegerField(null=True)  # Link to related object (match, message, etc)
    is_read = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

#### Serializer: `NotificationSerializer`

Located in `whisperwall/core/serializers.py`

Provides clean JSON representation with:

- `sender_username` - Direct username or null if system
- `sender_name` - Full name or 'System' if no sender
- All key fields for UI rendering

#### API Endpoints

Located in `whisperwall/core/urls.py`

```
GET    /api/notifications/              - Get all notifications (ordered by -created_at)
GET    /api/notifications/unread/       - Get unread count and list
PATCH  /api/notifications/<id>/read/    - Mark single notification as read
PATCH  /api/notifications/mark-all-read/ - Mark all as read
```

All endpoints require authentication (token).

#### Admin Integration

The `Notification` model is registered in Django admin for easy testing and management.

### Frontend (Angular)

#### Notification Interface

Located in `src/app/entity/notification.ts`

```typescript
interface Notification {
  id: number;
  notification_type: "match" | "message" | "reveal" | "event" | "system";
  title: string;
  content: string;
  sender_username: string | null;
  sender_name: string;
  related_id: number | null;
  is_read: boolean;
  created_at: string; // ISO 8601 timestamp
}
```

#### Notification API Service

Added to `src/app/services/api.ts`

```typescript
getNotifications()                      // Fetch all notifications
getUnreadNotifications()               // Get unread count + list
markNotificationAsRead(id: number)     // Mark single as read
markAllNotificationsAsRead()          // Mark all as read
```

#### Component: `NotificationsWidgetComponent`

Located in `src/app/features/whisper-radar/notifications.ts`

**Features:**

- Bell icon button with unread count badge (displays 9+ if over 9)
- Click to open/close notification panel
- Auto-refresh every 30 seconds
- Smooth animations and transitions
- Color-coded by notification type:
  - 🤝 Match: Blue
  - 💬 Message: Purple
  - 👤 Reveal: Pink
  - 📅 Event: Green
  - ℹ️ System: Gray

**Display Format:**
Each notification shows:

1. **Icon & Type** - Visual indicator (emoji) for notification type
2. **Title** - Main notification heading
3. **From Who** - Sender name (username or 'System')
4. **Content** - First ~100 chars with '...' truncation
5. **Date** - Relative time (e.g., "5m ago", "2h ago", "3d ago")
6. **Read Status** - Blue dot (unread) or ✓ (read)

**Interactions:**

- Click notification to mark as read
- "Mark all read" button to batch mark
- Auto-close panel by clicking overlay
- Empty state when no notifications

#### Component Template

Located in `src/app/features/whisper-radar/notifications.html`

Uses Tailwind CSS classes for styling:

- Responsive dropdown design
- Sticky header with gradient
- Scrollable notification list
- Status indicators
- Hover effects

#### Component Styles

Located in `src/app/features/whisper-radar/notifications.scss`

Custom styles for:

- Smooth animations
- Custom scrollbar
- Hover transitions
- Badge styling
- Color-coded borders

#### Integration

The component is imported and used in the main app:

- Added to `src/app/app.ts` imports
- Placed in navbar via `src/app/app.html`
- Replaces old event-based notification system
- Works alongside existing event system

## Usage

### Creating Notifications (Backend)

In Django views or signals, create notifications:

```python
from core.models import Notification
from django.contrib.auth.models import User

user = User.objects.get(id=1)
recipient = User.objects.get(id=2)

notification = Notification.objects.create(
    recipient=recipient,
    sender=user,
    notification_type='match',
    title='New Academic Match Found!',
    content='You matched with John Doe in Course Help category. Your similarity score is 87%.',
    related_id=42  # match_id
)
```

For system notifications (no sender):

```python
Notification.objects.create(
    recipient=user,
    sender=None,  # System notification
    notification_type='system',
    title='Maintenance Notice',
    content='The platform will undergo maintenance on Saturday at 2 AM.',
)
```

### Sending Notifications from Signals

Example: Auto-create notification when a match is found

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import Match, Notification

@receiver(post_save, sender=Match)
def notify_match_found(sender, instance, created, **kwargs):
    if created:
        # Notify confession_a author
        Notification.objects.create(
            recipient=instance.confession_a.author,
            sender=instance.confession_b.author,
            notification_type='match',
            title=f'Match found with {instance.confession_b.author.username}!',
            content=f'Score: {instance.score:.0%}. Click to view details.',
            related_id=instance.id
        )
        # Notify confession_b author
        Notification.objects.create(
            recipient=instance.confession_b.author,
            sender=instance.confession_a.author,
            notification_type='match',
            title=f'Match found with {instance.confession_a.author.username}!',
            content=f'Score: {instance.score:.0%}. Click to view details.',
            related_id=instance.id
        )
```

### Frontend Usage

The component automatically handles:

- Fetching notifications on init
- Polling for updates every 30 seconds
- Toggling panel visibility
- Marking as read
- Displaying relative dates

No additional setup needed - just ensure user is logged in.

## UI Design

### The Three Required Parts

✅ **1. From Who (Username or System)**

```
From: John Doe
(or "From: System" for system notifications)
```

✅ **2. Content (Truncated with '...')**

```
You matched with John Doe in Course Help category. Your similarity score is 87%...
```

✅ **3. Date**

```
just now / 5m ago / 2h ago / 3d ago / 2/15/2026
```

### Read Status

- **Unread**: Blue dot indicator
- **Read**: ✓ icon (slightly faded)

### Color Coding

Each notification type has its own color scheme for quick visual identification:

- Match (Blue) → New matches
- Message (Purple) → New messages
- Reveal (Pink) → Contact exchange requests
- Event (Green) → Events scheduled
- System (Gray) → System announcements

## API Response Format

```json
{
  "notifications": [
    {
      "id": 1,
      "notification_type": "match",
      "title": "New Academic Match Found!",
      "content": "You matched with Jane Smith. Score: 85%",
      "sender_username": "jane_smith",
      "sender_name": "Jane Smith",
      "related_id": 42,
      "is_read": false,
      "created_at": "2025-02-15T10:30:45.123456Z"
    },
    {
      "id": 2,
      "notification_type": "system",
      "title": "Welcome!",
      "content": "Welcome to CampusConnect",
      "sender_username": null,
      "sender_name": "System",
      "related_id": null,
      "is_read": true,
      "created_at": "2025-02-14T09:00:00.000000Z"
    }
  ]
}
```

## Migration

The `Notification` model is added via migration `0012_notification.py`.

To apply migrations:

```bash
cd whisperwall
python manage.py migrate
```

## Testing

### With Admin Panel

1. Go to `/admin/`
2. Navigate to "Notifications"
3. Click "Add Notification"
4. Fill in details and save
5. Check frontend for real-time update

### With API

```bash
# Create a notification
curl -X POST http://localhost:8000/api/notifications/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": 2,
    "sender": 1,
    "notification_type": "match",
    "title": "Test Match",
    "content": "This is a test notification",
    "related_id": 42
  }'

# Get all notifications
curl http://localhost:8000/api/notifications/ \
  -H "Authorization: Token YOUR_TOKEN"

# Get unread only
curl http://localhost:8000/api/notifications/unread/ \
  -H "Authorization: Token YOUR_TOKEN"

# Mark as read
curl -X PATCH http://localhost:8000/api/notifications/1/read/ \
  -H "Authorization: Token YOUR_TOKEN"
```

## Future Enhancements

Possible improvements:

- WebSocket integration for real-time notifications (no polling)
- Notification preferences (per user, per type)
- Email/SMS gateway for critical notifications
- Notification categories and filtering
- Archive/delete notifications
- Notification history/details page
- Sound/browser notification alerts
- Batch operations (select multiple, delete, etc)

## Troubleshooting

**No notifications appearing:**

- Check browser console for errors
- Verify user is logged in (check token in localStorage)
- Ensure backend migrations were applied
- Check Django admin for notification records

**Read status not updating:**

- Clear browser cache
- Check network tab for API errors
- Verify token is still valid

**Panel not opening:**

- Check component is imported in app.ts
- Verify component is used in app.html
- Check for TypeScript compilation errors in console

## Files Modified/Created

**Backend:**

- `whisperwall/core/models.py` - Added Notification model
- `whisperwall/core/serializers.py` - Added NotificationSerializer
- `whisperwall/core/views.py` - Added 4 notification API endpoints
- `whisperwall/core/urls.py` - Added 4 notification routes
- `whisperwall/core/admin.py` - Registered Notification in admin
- `whisperwall/core/migrations/0012_notification.py` - Migration file

**Frontend:**

- `src/app/entity/notification.ts` - Notification interface (new)
- `src/app/services/api.ts` - Added 4 notification API methods
- `src/app/features/whisper-radar/notifications.ts` - Component class (new)
- `src/app/features/whisper-radar/notifications.html` - Component template (new)
- `src/app/features/whisper-radar/notifications.scss` - Component styles (new)
- `src/app/app.ts` - Import NotificationsWidgetComponent
- `src/app/app.html` - Use NotificationsWidgetComponent in navbar
