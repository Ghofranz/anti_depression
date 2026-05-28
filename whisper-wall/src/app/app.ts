import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from './services/api';
import { NotificationsWidgetComponent } from './features/whisper-radar/notifications';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, NotificationsWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('CampusConnect');
  private readonly platformId = inject(PLATFORM_ID);
  
  events: any[] = [];
  showNotifications = false;

  constructor(private router: Router, private api: Api) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadEvents();
    }
  }

  loadEvents() {
    this.api.getEvents().subscribe({
      next: (res: any) => {
        this.events = res.events || [];
      },
      error: () => {
        // silently ignore
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadEvents();
    }
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('myConfessionId');
    localStorage.removeItem('profileId');
    this.router.navigate(['/login']);
  }

  navigateToEvent(event: any) {
    this.showNotifications = false;
    // Navigate based on event type
    if (event.type === 'match' || event.match) {
      // If event contains a match id, open matches or specific match
      // prefer navigating to matches list
      this.router.navigate(['/matches']);
    } else if (event.type === 'chat' || event.chat) {
      // Navigate to a specific chat if we have an id
      const matchId = this.extractMatchId(event);
      if (matchId) {
        this.router.navigate([`/chat/${matchId}`]);
      } else {
        // fallback to chat landing
        this.router.navigate(['/chat']);
      }
    } else if (event.type === 'reveal') {
      const matchId = this.extractMatchId(event);
      if (matchId) {
        this.router.navigate([`/reveal/${matchId}`]);
      } else {
        this.router.navigate(['/reveal']);
      }
    } else {
      // Default to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  extractMatchId(event: any): number | null {
    // common shapes: event.match.id, event.match_id, event.matchId, event.payload.match_id
    try {
      if (!event) return null;
      if (event.match && event.match.id) return Number(event.match.id);
      if (event.match_id) return Number(event.match_id);
      if (event.matchId) return Number(event.matchId);
      if (event.payload && (event.payload.match_id || event.payload.matchId)) {
        return Number(event.payload.match_id || event.payload.matchId);
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  notificationText(event: any): string {
    // Prefer explicit description or message fields, fall back to plan text or first string found
    if (!event) return '';
    if (typeof event.description === 'string' && event.description.trim()) return event.description;
    if (typeof event.message === 'string' && event.message.trim()) return event.message;
    if (event.plan && typeof event.plan === 'string' && event.plan.trim()) return event.plan;
    if (event.plan && typeof event.plan === 'object') {
      // if it's an object, try common keys
      if (event.plan.text) return String(event.plan.text);
      if (event.plan.message) return String(event.plan.message);
    }
    if (event.payload && typeof event.payload === 'string') return event.payload;
    if (event.payload && typeof event.payload === 'object') {
      if (event.payload.message) return String(event.payload.message);
    }
    // last resort: stringify small objects, else empty
    try {
      const s = JSON.stringify(event).slice(0, 300);
      return s.length ? s : '';
    } catch (e) {
      return '';
    }
  }

  notificationSender(event: any): string {
    console.log('Extracting sender from event:', event);
    if (!event) return 'unknown';

    const candidates = [
      event.username,
      event.user_name,
      event.userName,
      event.sender?.username,
      event.sender?.name,
      event.author?.username,
      event.author?.name,
      event.profile?.username,
      event.profile?.name,
      event.from_username,
      event.fromUserName,
      event.name,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return 'someone';
  }
}
