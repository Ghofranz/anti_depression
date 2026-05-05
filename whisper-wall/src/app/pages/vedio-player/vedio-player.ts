import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

interface LoFiTrack {
  label: string;
  url: string;
}

@Component({
  selector: 'app-vedio-player',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vedio-player.html',
  styleUrl: './vedio-player.scss',
})
export class VedioPlayer implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('audioPlayer') audioPlayer?: ElementRef<HTMLAudioElement>;
  @ViewChild('roomMessagesContainer') roomMessagesContainer?: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);

  room: any;
  participants: Array<{ username: string; name: string; focus: string; avatar?: string; is_active?: boolean }> = [];
  loFiTracks: LoFiTrack[] = [];
  selectedTrack: LoFiTrack | null = null;
  isPlaying = false;

  roomId = '';
  loading = false;
  error = '';
  messages: any[] = [];
  newMessage = '';
  focus = '';
  remainingLabel = '--:--';
  private refreshHandle?: number;
  private timerHandle?: number;
  private lastMessageCount = 0;
  private shouldScrollRoomChat = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  get currentTrackSrc() {
    return this.selectedTrack?.url || '';
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
      || '';

    if (!this.roomId) {
      this.router.navigate(['/live']);
      return;
    }

    this.loading = true;
    this.api.joinStudyRoom(this.roomId, {}).subscribe({
      next: () => {
        this.loadRoom();
        this.loadMessages();
        this.startRefresh();
      },
      error: () => {
        this.error = 'Failed to join the study room.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewInit() {
    this.syncAudioState();
  }

  ngAfterViewChecked() {
    if (!this.shouldScrollRoomChat) {
      return;
    }

    this.shouldScrollRoomChat = false;
    this.scrollRoomChatToBottom();
  }

  ngOnDestroy() {
    if (this.refreshHandle) window.clearInterval(this.refreshHandle);
    if (this.timerHandle) window.clearInterval(this.timerHandle);
    if (this.roomId) {
      this.api.leaveStudyRoom(this.roomId).subscribe({ error: () => {} });
    }
  }

  loadRoom() {
    this.api.getStudyRoom(this.roomId).subscribe({
      next: (room: any) => {
        this.room = room;
        this.participants = (room?.participants || [])
          .filter((p: any) => p.is_active)
          .map((p: any) => ({
            ...p,
            avatar: (p.name || p.username || '?').charAt(0).toUpperCase(),
          }));
        this.loadLofiTracks();
        this.loading = false;
        this.updateTimer();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        if (err?.status === 401 || err?.status === 403) {
          this.error = 'Your session is missing or expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load the study room.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadMessages() {
    this.api.getStudyRoomMessages(this.roomId).subscribe({
      next: (payload: any) => {
        const nextMessages = payload?.messages || [];
        const shouldScroll = nextMessages.length !== this.lastMessageCount;
        this.messages = nextMessages;
        this.lastMessageCount = nextMessages.length;
        this.shouldScrollRoomChat = shouldScroll;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  private loadLofiTracks() {
    this.api.getLofiTracks().subscribe({
      next: (payload: any) => {
        const tracks = Array.isArray(payload) ? payload : payload?.tracks || [];
        this.loFiTracks = tracks.map((track: any) => ({
          label: track.title || 'Lo-fi track',
          url: track.file_url || '',
        })).filter((track: LoFiTrack) => !!track.url);

        if (!this.selectedTrack) {
          this.selectedTrack = this.loFiTracks[0] || null;
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  sendRoomMessage() {
    const message = this.newMessage.trim();
    if (!message) return;

    this.api.sendStudyRoomMessage(this.roomId, { message }).subscribe({
      next: (created: any) => {
        this.messages = [...this.messages, created];
        this.lastMessageCount = this.messages.length;
        this.newMessage = '';
        this.cdr.detectChanges();
        this.scrollRoomChatToBottom();
        setTimeout(() => this.scrollRoomChatToBottom(), 100);
      },
      error: () => {}
    });
  }

  updateFocus() {
    this.api.joinStudyRoom(this.roomId, { focus: this.focus.trim() }).subscribe({
      next: (room: any) => {
        this.room = room;
        this.loadRoom();
      },
      error: () => {}
    });
  }

  private startRefresh() {
    this.refreshHandle = window.setInterval(() => {
      this.loadRoom();
      this.loadMessages();
    }, 3000);
    this.timerHandle = window.setInterval(() => this.updateTimer(), 1000);
  }

  private updateTimer() {
    if (!this.room?.started_at || !this.room?.duration_minutes) {
      this.remainingLabel = '--:--';
      return;
    }

    const started = new Date(this.room.started_at).getTime();
    const end = started + Number(this.room.duration_minutes) * 60 * 1000;
    const remaining = Math.max(0, end - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    this.remainingLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private scrollRoomChatToBottom() {
    const doScroll = () => {
      const el = this.roomMessagesContainer?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 0);
    setTimeout(doScroll, 75);
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    this.syncAudioState();
  }

  selectTrack(track: LoFiTrack) {
    this.selectedTrack = track;
    const audio = this.audioPlayer?.nativeElement;
    if (audio) {
      audio.load(); // reload src binding before playing
    }
    if (this.isPlaying) {
      this.syncAudioState();
    }
  }

  private syncAudioState() {
    const audio = this.audioPlayer?.nativeElement;
    if (!audio) {
      return;
    }

    if (this.isPlaying) {
      audio.play().catch(() => {
        this.isPlaying = false;
        this.cdr.markForCheck();
      });
    } else {
      audio.pause();
    }
  }
}
