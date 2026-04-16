// live.ts
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-live',
  standalone: true,
   imports: [CommonModule, FormsModule],
  templateUrl: './live.html',
  styleUrl: './live.scss',
})
export class Live implements OnInit {

  private router = inject(Router);

  // Your specific event types
  events = [
    { 
      id: 1, 
      title: 'Romantic Blind Date', 
      type: 'Blind Date', 
      status: 'LIVE', 
      location: 'The Secret Garden',
      participants: '2/2',
      thumbnail_color: 'linear-gradient(135deg, #ff4fd8, #8b5cf6)'
    },
    { 
      id: 2, 
      title: 'Heavyweight Cage Fight', 
      type: 'Cage Fight', 
      status: 'UPCOMING', 
      location: 'The Basement Arena',
      participants: '1/2',
      thumbnail_color: 'linear-gradient(135deg, #450a0a, #0f172a)'
    },
    { 
      id: 3, 
      title: 'Anonymous Trust Chat', 
      type: 'Chat', 
      status: 'LIVE', 
      location: 'Private Room #09',
      participants: '2/2',
      thumbnail_color: 'linear-gradient(135deg, #0ea5e9, #2563eb)'
    },
    { 
      id: 4, 
      title: 'Apology Meetup', 
      type: 'Blind Date', 
      status: 'ENDED', 
      location: 'Campus Fountain',
      participants: '2/2',
      thumbnail_color: 'linear-gradient(135deg, #64748b, #334155)'
    }
  ];

  ngOnInit() {}

  watchEvent(eventId: number) {
    this.router.navigate(['/watch', eventId]);
    console.log(`Navigating to watch event with ID: ${eventId} with link: /watch/${eventId}`);
  }
}