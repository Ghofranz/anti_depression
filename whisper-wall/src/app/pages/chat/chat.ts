import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

export class Chat {

  messages: Message[] = [
    { from: 'them', text: 'I was nervous to write first…', time: '22:01' },
    { from: 'me', text: 'I’m glad you did 😊', time: '22:02' }
  ];

  newMessage = '';

  send() {
    if (!this.newMessage.trim()) return;

    this.messages.push({
      from: 'me',
      text: this.newMessage,
      time: new Date().toLocaleTimeString().slice(0,5)
    });

    this.newMessage = '';
  }
}
