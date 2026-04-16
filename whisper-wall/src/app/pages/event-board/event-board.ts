import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppEvent } from '../../entity/event';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-event-board',
   imports: [CommonModule, FormsModule],
  templateUrl: './event-board.html',
  styleUrl: './event-board.scss',
})
export class EventBoard {
  events: AppEvent[] = [
  {
    event_id: 1,
    match_id: 101,
    title: 'Romantic Sunset Date',
    type: 'date',
    plan: ['Meet at a café', 'Walk at sunset', 'Play 5 icebreaker questions'],
    created_at: '2026-02-25 18:30'
  },
  {
    event_id: 2,
    match_id: 102,
    title: 'Close Cage',
    type: 'battle',
    plan:  ['No insults', '3 Rounds of debate', 'Loser buys the prize', 'No rematch'],
    created_at: '2026-02-25 20:00'
  },
  {
    event_id: 3,
    match_id: 103,
    title: 'Trust Building Date',
    type: 'chat',
    plan: ['Apology chat', 'Small game', 'Mutual promise to communicate'] ,
    created_at: '2026-02-24 14:15'
  }
];
  profileId = 1; 

  constructor(private http: HttpClient) {}

  /*ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.http.get<{events: AppEvent[]}>(`http://localhost:8000/api/events/profile/${this.profileId}/`)
      .subscribe(response => {
        this.events = response.events;
      });
  }*/

  // Dynamic card styling based on event type
  getCardStyle(type: string): string {
    switch (type) {
      case 'date': 
        return 'bg-pink-50 border-pink-400';
      case 'battle': 
        return 'bg-red-50 border-red-600';
      case 'chat': 
        return 'bg-blue-50 border-blue-400';
      default: 
        return 'bg-gray-50 border-gray-400';
    }
  }
}