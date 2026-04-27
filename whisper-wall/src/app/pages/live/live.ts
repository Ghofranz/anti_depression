import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live.html',
  styleUrl: './live.scss',
})
export class Live implements OnInit {

  private readonly platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);

  rooms: any[] = [];
  loading = false;
  error = '';

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
    this.api.getStudyRooms().subscribe({
      next: (payload: any) => {
        console.log('Raw study rooms payload from API:', payload);
        // Map backend fields to frontend expectations
        this.rooms = (payload?.rooms || []).map((room: any, index: number) => ({
          ...room,
          id: room.room_id ?? room.id ?? index,
          status: room.status || 'OPEN',
          title: room.title || 'Untitled Room',
          subtitle: room.subtitle || '',
          vibe: room.vibe || '',
          gradient: room.gradient || '',
          people: room.people || '',
          track: room.track || '',
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        if (err?.status === 401 || err?.status === 403) {
          this.error = 'Your session is missing or expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load study rooms.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByRoomId(index: number, room: any): string | number {
    return room.id ?? index;
  }

  joinRoom(roomId: string) {
    this.router.navigate(['/study', roomId]);
  }
}