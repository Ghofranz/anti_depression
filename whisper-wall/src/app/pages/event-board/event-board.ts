import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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

  constructor(private api: Api, private router: Router, private cdr: ChangeDetectorRef) {}

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
        console.log('Raw events payload from API:', payload);
        this.loading = false;
        const events = Array.isArray(payload) ? payload : payload?.events || [];
        // Map backend fields to frontend expectations
        this.events = events.map((event: any, index: number) => {
          const id = event.event_id ?? event.id ?? index;
          // Normalize plan to always be { steps: [...] }
          let plan = event.plan;
          if (!plan) {
            plan = { steps: [] };
          } else if (Array.isArray(plan)) {
            plan = { steps: plan };
          } else if (!plan.steps || !Array.isArray(plan.steps)) {
            plan = { steps: [] };
          }
          return {
            ...event,
            event_id: id,
            status: event.status || 'SOON',
            title: event.title || 'Untitled',
            subtitle: event.subtitle || '',
            vibe: event.vibe || '',
            gradient: event.gradient || '',
            participants: event.participants || 0,
            room_id: event.room_id || '',
            type: event.type || 'chat',
            plan,
          };
        });
        console.log('Mapped events:', this.events);
        this.cdr.markForCheck();
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

  trackByEventId(index: number, event: WhisperEvent): number | string {
    return event.event_id ?? index;
  }

  joinEvent(roomId: string | undefined): void {
    if (!roomId) {
      return;
    }

    this.router.navigate(['/study', roomId]);
  }

  getPlanCount(event: WhisperEvent): number {
    if (!event.plan) return 0;
    if (Array.isArray(event.plan)) {
      return event.plan.length;
    }
    if (Array.isArray(event.plan.steps)) {
      return event.plan.steps.length;
    }
    return 0;
  }
}