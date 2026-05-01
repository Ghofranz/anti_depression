export interface ChatMessage {
  id: number;
  match: number;   // match id
  sender: number;  // confession id
  message: string;
  timestamp: string;
}