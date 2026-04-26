import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

export type EventType = 'date' | 'battle' | 'chat';

export interface EventStep {
  id: string;
  label: string;
}

export interface WhisperEvent {
  event_id: number | string;
  type: EventType;
  title: string;
  subtitle?: string;
  vibe?: string;
  plan: EventStep[] | { steps?: string[] };
  gradient?: string;
  status?: 'LIVE' | 'SOON' | 'ENDED';
  participants?: number;
  room_id?: string;
}

@Component({
  selector: 'app-event-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-board.html',
  styleUrl: './event-board.scss',
})
export class EventBoard implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  events: WhisperEvent[] = [];
  loading = false;
  error = '';

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.api.getEvents().subscribe({
      next: (payload: any) => {
        this.events = Array.isArray(payload) ? payload : payload?.events || [];
        this.loading = false;
      },
      error: (err: any) => {
        if (err?.status === 401 || err?.status === 403) {
          this.error = 'Your session is missing or expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load events.';
        }
        this.loading = false;
      }
    });
  }

  joinEvent(roomId: string | undefined): void {
    if (!roomId) {
      return;
    }

    this.router.navigate(['/study', roomId]);
  }

  getPlanCount(event: WhisperEvent): number {
    if (Array.isArray(event.plan)) {
      return event.plan.length;
    }

    return event.plan?.steps?.length || 0;
  }
}