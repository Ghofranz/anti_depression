import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class Chat implements OnInit {
  messages: Message[] = [];
  newMessage = '';

  matchId!: number;
  myConfessionId!: number;
  matchContext?: Match;

  loading = true;

  showRevealNudge = false;
  revealNudgeShown = false;

  showProfileSharingConfirm = false;
  activatingProfileSharing = false;

  profileSharingAvailable = false;
  profileSharingActivated = false;
  peerProfileSharingActivated = false;
  bothProfilesShared = false;

  readonly revealMessageThreshold = 4;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.matchId = Number(this.route.snapshot.paramMap.get('matchId'));
    this.myConfessionId = Number(localStorage.getItem('myConfessionId'));

    this.loadRevealStatus();

    if (this.myConfessionId) {
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

    this.loadMessages();
  }

  loadRevealStatus() {
    this.api.getRevealStatus(this.matchId).subscribe({
      next: (status: any) => {
        this.applyRevealStatus(status);
      },
      error: () => {
        console.error('Failed to load profile sharing status');
      }
    });
  }

  applyRevealStatus(status: any) {
    this.profileSharingActivated = !!status.my_profile_sharing_active;
    this.peerProfileSharingActivated = !!status.peer_profile_sharing_active;
    this.bothProfilesShared = !!status.both_active;

    this.updateProfileSharingAvailability();
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
        this.updateProfileSharingAvailability();
        this.checkRevealNudge();
        this.cdr.detectChanges();
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
        this.updateProfileSharingAvailability();
        this.checkRevealNudge();
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Failed to send message');
      }
    });
  }

  updateProfileSharingAvailability() {
    this.profileSharingAvailable =
      this.messages.length >= this.revealMessageThreshold ||
      this.profileSharingActivated ||
      this.peerProfileSharingActivated ||
      this.bothProfilesShared;
  }

  checkRevealNudge() {
    if (this.profileSharingActivated) return;
    if (this.revealNudgeShown) return;
    if (this.messages.length < this.revealMessageThreshold) return;

    this.showRevealNudge = true;
    this.revealNudgeShown = true;
    this.profileSharingAvailable = true;
  }

  dismissRevealNudge() {
    this.showRevealNudge = false;
    this.profileSharingAvailable = true;
    this.cdr.detectChanges();
  }

  askProfileSharingConfirmation() {
    if (this.profileSharingActivated) return;

    this.showRevealNudge = false;
    this.showProfileSharingConfirm = true;
    this.cdr.detectChanges();
  }

  cancelProfileSharingConfirmation() {
    this.showProfileSharingConfirm = false;
    this.cdr.detectChanges();
  }

  confirmProfileSharingActivation() {
    if (this.profileSharingActivated || this.activatingProfileSharing) return;

    this.activatingProfileSharing = true;

    this.api.activateProfileSharing(this.matchId).subscribe({
      next: (res: any) => {
        this.activatingProfileSharing = false;
        this.showProfileSharingConfirm = false;
        this.applyRevealStatus(res);
      },
      error: () => {
        this.activatingProfileSharing = false;
        this.showProfileSharingConfirm = false;
        console.error('Failed to activate profile sharing');
        this.cdr.detectChanges();
      }
    });
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