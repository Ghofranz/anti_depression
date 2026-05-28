export interface Notification {
  id: number;
  notification_type: 'match' | 'message' | 'reveal' | 'event' | 'system';
  title: string;
  content: string;
  sender_username: string | null;
  sender_name: string;
  related_id: number | null;
  is_read: boolean;
  created_at: string;
}
