export interface AppEvent {
  event_id: number;
  match_id: number;
  title: string;
  type: 'date' | 'battle' | 'chat' | 'reconnect'; // Strong typing for your event types
  plan: string[];
  created_at: string;
  
  // Adding these in case you want to show the specific location later
  location?: string;
  description?: string;
}