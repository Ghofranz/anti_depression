import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
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
        this.rooms = payload?.rooms || [];
        this.loading = false;
      },
      error: (err: any) => {
        if (err?.status === 401 || err?.status === 403) {
          this.error = 'Your session is missing or expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load study rooms.';
        }
        this.loading = false;
      }
    });
  }

  joinRoom(roomId: string) {
    this.router.navigate(['/study', roomId]);
  }
}