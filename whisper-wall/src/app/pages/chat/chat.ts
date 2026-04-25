import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Api } from '../../services/api';
import { Match } from '../../entity/match';

interface Message {
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
export class Chat implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

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
  }

  ngAfterViewInit() {
    this.scrollToBottom();
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
    this.api.getChat(this.matchId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.results || [];

        this.messages = data.map((msg: any) => ({
          from: (msg.sender?.id ?? msg.sender) === this.myConfessionId ? 'me' : 'them',
          text: msg.message,
          time: new Date(msg.timestamp || new Date()).toLocaleTimeString().slice(0, 5)
        }));

        this.loading = false;
        this.updateContactAvailability();
        this.checkContactNudge();
        this.cdr.detectChanges();
        this.scrollToBottom();
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
        this.messages.push({
          from: 'me',
          text: msg.message || messageToSend,
          time: new Date(msg.timestamp || new Date()).toLocaleTimeString().slice(0, 5)
        });

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

  scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 0);
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