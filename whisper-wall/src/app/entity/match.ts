import { Confess } from "./confess";

export interface Match {
  id: number;
  confession_a: Confess;
  confession_b: Confess;
  score: number;
  created_at: string;
  is_active: boolean;
}