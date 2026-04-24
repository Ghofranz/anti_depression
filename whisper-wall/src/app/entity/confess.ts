export interface Confess {
  id: number;
  text: string;
  emotion: 'love' | 'crush' | 'heartbreak' | 'regret' | 'fight' | 'miss' | 'apology'; location_hint: string;
  created_at: string;   // Django DateTime → string
  likes: number;
  is_revealed: boolean;
  author?: any;
}