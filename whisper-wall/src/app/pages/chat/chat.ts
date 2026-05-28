import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Match } from '../../entity/match';

interface Message {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  private readonly platformId = inject(PLATFORM_ID);

  messages: Message[] = [];
  newMessage = '';

  matchId!: number;
  myConfessionId!: number;
  matchContext?: Match;

  loading = true;

  showContactNudge = false;
  contactNudgeShown = false;

  showContactConfirm = false;
  activatingContactExchange = false;

  contactExchangeAvailable = false;
  contactExchangeActivated = false;
  peerContactExchangeActivated = false;
  bothContactsExchanged = false;

  showInfoModal = false;

  showProfileForm = false;
  savingProfile = false;

  private refreshTimer?: number;

  profileForm = {
    display_name: '',
    academic_email: '',
    programme: '',
    bio: ''
  };

  myProfile: any = null;
  peerProfile: any = null;

  readonly contactMessageThreshold = 4;

constructor(
  private route: ActivatedRoute,
  private router: Router,
  private api: Api,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit() {
    this.matchId = Number(this.route.snapshot.paramMap.get('matchId'));
    this.myConfessionId = Number(localStorage.getItem('myConfessionId'));

    this.contactNudgeShown =
      localStorage.getItem(`contactNudgeShown_${this.matchId}`) === 'true';

    this.loadContactStatus();
    this.loadMatchContext();
    this.loadMessages();

    if (isPlatformBrowser(this.platformId)) {
      this.startPolling();
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.refreshTimer && isPlatformBrowser(this.platformId)) {
      window.clearInterval(this.refreshTimer);
    }
  }
goBackToMatches() {
  this.router.navigate(['/matches']);
}

  startPolling() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
    }

    this.refreshTimer = window.setInterval(() => {
      this.refreshMessages(false);
      this.loadContactStatus();
    }, 3000);
  }
  loadMatchContext() {
    if (!this.myConfessionId) return;

    this.api.getMatches(this.myConfessionId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.results || [];
        this.matchContext = data.find((m: any) => m.id === this.matchId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Failed to load match context');
      }
    });
  }

  loadContactStatus() {
    this.api.getContactExchangeStatus(this.matchId).subscribe({
      next: (status: any) => {
        this.applyContactStatus(status);
      },
      error: () => {
        console.error('Failed to load contact exchange status');
      }
    });
  }

  applyContactStatus(status: any) {
    this.contactExchangeActivated = !!status.my_contact_exchange_active;
    this.peerContactExchangeActivated = !!status.peer_contact_exchange_active;
    this.bothContactsExchanged = !!status.both_active;

    this.myProfile = status.my_profile || null;
    this.peerProfile = status.peer_profile || null;

    if (this.contactExchangeActivated || this.bothContactsExchanged) {
      this.showContactNudge = false;
      this.contactNudgeShown = true;
      localStorage.setItem(`contactNudgeShown_${this.matchId}`, 'true');
    }

    if (this.bothContactsExchanged) {
      this.showContactConfirm = false;
      this.showProfileForm = false;
    }

    this.updateContactAvailability();
    this.cdr.detectChanges();
  }

  loadMessages() {
    this.refreshMessages(true);
  }

  refreshMessages(scrollAfterUpdate = false) {
    const shouldStickToBottom = scrollAfterUpdate || this.isNearBottom();

    this.api.getChat(this.matchId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.results || [];

        const nextMessages = data
          .map((msg: any) => ({
            id: Number(msg.id),
            from: (msg.sender?.id ?? msg.sender) === this.myConfessionId ? 'me' : 'them',
            text: msg.message,
            time: new Date(msg.timestamp || new Date()).toLocaleTimeString().slice(0, 5)
          }))
          .filter((msg: Message) => !Number.isNaN(msg.id));

        this.messages = nextMessages;

        this.loading = false;
        this.updateContactAvailability();
        this.checkContactNudge();
        this.cdr.detectChanges();
        if (shouldStickToBottom) {
          this.scrollToBottom();
        }
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  send() {
    if (!this.newMessage.trim()) return;

    const messageToSend = this.newMessage.trim();

    this.api.sendMessage({
      match: this.matchId,
      sender: this.myConfessionId,
      message: messageToSend
    }).subscribe({
      next: (msg: any) => {
        const sentMessage: Message = {
          id: Number(msg.id || Date.now()),
          from: 'me',
          text: msg.message || messageToSend,
          time: new Date(msg.timestamp || new Date()).toLocaleTimeString().slice(0, 5)
        };

        this.messages = [...this.messages.filter((item) => item.id !== sentMessage.id), sentMessage];

        this.newMessage = '';
        this.updateContactAvailability();
        this.checkContactNudge();
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        console.error('Failed to send message');
      }
    });
  }

  isNearBottom(): boolean {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

scrollToBottom() {
  setTimeout(() => {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'auto'
    });
  }, 80);
}

  updateContactAvailability() {
    this.contactExchangeAvailable =
      this.messages.length >= this.contactMessageThreshold ||
      this.contactExchangeActivated ||
      this.peerContactExchangeActivated ||
      this.bothContactsExchanged;
  }

  checkContactNudge() {
    if (this.contactExchangeActivated) return;
    if (this.bothContactsExchanged) return;
    if (this.contactNudgeShown) return;
    if (this.messages.length < this.contactMessageThreshold) return;

    this.showContactNudge = true;
    this.contactExchangeAvailable = true;
  }

  dismissContactNudge() {
    this.showContactNudge = false;
    this.contactNudgeShown = true;
    this.contactExchangeAvailable = true;
    localStorage.setItem(`contactNudgeShown_${this.matchId}`, 'true');
    this.cdr.detectChanges();
  }

  askContactExchangeConfirmation() {
    if (this.contactExchangeActivated || this.bothContactsExchanged) return;

    this.showContactNudge = false;

    if (!this.myProfile) {
      this.showProfileForm = true;
      this.cdr.detectChanges();
      return;
    }

    this.showContactConfirm = true;
    this.cdr.detectChanges();
  }

  submitProfileForm() {
    if (
      !this.profileForm.display_name.trim() ||
      !this.profileForm.academic_email.trim() ||
      !this.profileForm.programme.trim()
    ) {
      return;
    }

    this.savingProfile = true;

    this.api.saveAcademicProfile({
      display_name: this.profileForm.display_name.trim(),
      academic_email: this.profileForm.academic_email.trim(),
      programme: this.profileForm.programme.trim(),
      bio: this.profileForm.bio.trim()
    }).subscribe({
      next: (res: any) => {
        this.myProfile = res;
        this.savingProfile = false;
        this.showProfileForm = false;
        this.showContactConfirm = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.savingProfile = false;
        console.error('Failed to save academic profile');
        this.cdr.detectChanges();
      }
    });
  }

  cancelProfileForm() {
    this.showProfileForm = false;
    this.cdr.detectChanges();
  }

  cancelContactExchangeConfirmation() {
    this.showContactConfirm = false;
    this.cdr.detectChanges();
  }

  confirmContactExchangeActivation() {
    if (this.contactExchangeActivated || this.activatingContactExchange) return;

    this.activatingContactExchange = true;

    this.api.activateContactExchange(this.matchId).subscribe({
      next: (res: any) => {
        this.activatingContactExchange = false;
        this.showContactConfirm = false;
        this.applyContactStatus(res);
      },
      error: () => {
        this.activatingContactExchange = false;
        this.showContactConfirm = false;
        console.error('Failed to activate contact exchange');
        this.cdr.detectChanges();
      }
    });
  }

  openInfoModal() {
    this.showInfoModal = true;
    this.cdr.detectChanges();
  }

  closeInfoModal() {
    this.showInfoModal = false;
    this.cdr.detectChanges();
  }

  getMyConfession() {
    if (!this.matchContext) return null;

    return this.matchContext.confession_a.id === this.myConfessionId
      ? this.matchContext.confession_a
      : this.matchContext.confession_b;
  }

  getOtherConfession() {
    if (!this.matchContext) return null;

    return this.matchContext.confession_a.id === this.myConfessionId
      ? this.matchContext.confession_b
      : this.matchContext.confession_a;
  }
}