import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  creating = false;

  activeMode: 'create' | 'join' | null = null;

  error = '';
  createError = '';

  roomForm = {
    title: '',
    topic: '',
    description: '',
    duration_minutes: 25,
    focus: '',
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Do not load rooms immediately.
    // Rooms load only when the user clicks "Join a room".
  }

  showCreateMode(): void {
    this.activeMode = this.activeMode === 'create' ? null : 'create';
    this.createError = '';
    this.error = '';
  }

  showJoinMode(): void {
    this.activeMode = this.activeMode === 'join' ? null : 'join';
    this.error = '';

    if (this.activeMode === 'join') {
      this.loadRooms();
    }
  }

  loadRooms(): void {
    this.loading = true;
    this.error = '';

    this.api.getStudyRooms().subscribe({
      next: (payload: any) => {
        this.rooms = (payload?.rooms || []).map((room: any, index: number) => {
          let roomStatus = room.is_active ? 'LIVE' : 'FINISHED';

          if (room.is_active && room.started_at && room.duration_minutes) {
            const startTime = new Date(room.started_at).getTime();
            const endTime = startTime + room.duration_minutes * 60000;

            if (Date.now() > endTime) {
              roomStatus = 'FINISHED';
            }
          }

          return {
            ...room,
            id: room.id ?? index,
            status: roomStatus,
            title: room.title || 'Untitled Room',
            subtitle: `${room.topic || 'General study'} · ${room.duration_minutes || 25} min`,
            vibe: room.description || 'Focused live study room with shared questions.',
            gradient: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
            people: `${room.active_participant_count || 0} studying`,
            track: room.topic || 'Study session',
          };
        });

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
      },
    });
  }

  createRoom(): void {
    if (!this.roomForm.title.trim() || !this.roomForm.topic.trim()) {
      this.createError = 'Title and topic are required.';
      return;
    }

    this.creating = true;
    this.createError = '';

    this.api.createStudyRoom({
      title: this.roomForm.title.trim(),
      topic: this.roomForm.topic.trim(),
      description: this.roomForm.description.trim(),
      duration_minutes: this.roomForm.duration_minutes || 25,
      focus: this.roomForm.focus.trim(),
    }).subscribe({
      next: (room: any) => {
        this.creating = false;
        this.router.navigate(['/study', room.id]);
      },

      error: () => {
        this.creating = false;
        this.createError = 'Failed to create room.';
        this.cdr.markForCheck();
      },
    });
  }

  trackByRoomId(index: number, room: any): string | number {
    return room.id ?? index;
  }

  joinRoom(roomId: string): void {
    this.router.navigate(['/study', roomId]);
  }
}