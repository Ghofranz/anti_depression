export interface Confess {
  id: number;
  message: string;
  emotion: 'love' | 'crush' | 'heartbreak' | 'regret' | 'fight';
  location_hint: string;
  created_at: string;   // Django DateTime → string
  likes: number;
  is_revealed: boolean;
}