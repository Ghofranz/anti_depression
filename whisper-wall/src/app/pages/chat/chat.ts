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

  constructor(
    private route: ActivatedRoute, 
    private api: Api, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.matchId = Number(this.route.snapshot.paramMap.get('matchId'));
    this.myConfessionId = Number(localStorage.getItem('myConfessionId'));
    
    if (this.myConfessionId) {
       this.api.getMatches(this.myConfessionId).subscribe({
          next: (res: any) => {
             const data = Array.isArray(res) ? res : res?.results || [];
             this.matchContext = data.find((m: any) => m.id === this.matchId);
             this.cdr.detectChanges();
          }
       });
    }

    this.loadMessages();
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

    this.api.sendMessage({
      match: this.matchId,
      sender: this.myConfessionId,
      message: this.newMessage
    }).subscribe({
      next: (msg: any) => {
        this.messages.push({
          from: 'me',
          text: msg.message,
          time: new Date(msg.timestamp || new Date()).toLocaleTimeString().slice(0, 5)
        });
        this.newMessage = '';
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
