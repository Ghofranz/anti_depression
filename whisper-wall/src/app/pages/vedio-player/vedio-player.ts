import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

interface LoFiTrack {
  label: string;
  file: string;
}

@Component({
  selector: 'app-vedio-player',
  imports: [CommonModule, RouterModule],
  templateUrl: './vedio-player.html',
  styleUrl: './vedio-player.scss',
})
export class VedioPlayer implements OnInit {
  @ViewChild('audioPlayer') audioPlayer?: ElementRef<HTMLAudioElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private api = inject(Api);

  room: any;
  participants: Array<{ name: string; focus: string; avatar: string }> = [];
  loFiTracks: LoFiTrack[] = [];
  selectedTrack: LoFiTrack | null = null;
  isPlaying = false;

  roomId = 'focus-hall';
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  get currentTrack() {
    return this.selectedTrack;
  }

  get currentTrackSrc() {
    return this.selectedTrack ? `/lofi/${encodeURIComponent(this.selectedTrack.file)}` : '';
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.roomId = this.route.snapshot.paramMap.get('roomId')
      || this.route.snapshot.paramMap.get('id')
      || 'focus-hall';

    this.loading = true;
    this.api.getStudyRoom(this.roomId).subscribe({
      next: (room: any) => {
        this.room = room;
        this.participants = room?.participants || [];
        this.loFiTracks = Array.isArray(room?.tracks) ? room.tracks : [];
        this.selectedTrack = this.loFiTracks[0] || null;
        this.isPlaying = false;
        this.loading = false;
        this.syncAudioState();
      },
      error: (err: any) => {
        if (err?.status === 401 || err?.status === 403) {
          this.error = 'Your session is missing or expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load the study room.';
        }
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.syncAudioState();
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    this.syncAudioState();
  }

  selectTrack(track: LoFiTrack) {
    this.selectedTrack = track;
    this.syncAudioState();
  }

  private syncAudioState() {
    const audio = this.audioPlayer?.nativeElement;

    if (!audio) {
      return;
    }

    if (this.isPlaying) {
      audio.play().catch(() => {
        this.isPlaying = false;
      });
    } else {
      audio.pause();
    }
  }
}