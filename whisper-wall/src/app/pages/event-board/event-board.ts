import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EventType = 'date' | 'battle' | 'chat';

export interface EventStep {
  id: string;
  label: string;
}

export interface WhisperEvent {
  event_id: string;
  type: EventType;
  title: string;
  subtitle: string;
  vibe: string;
  plan: EventStep[];
  gradient: string;
  status: 'LIVE' | 'SOON' | 'ENDED';
  participants: number;
}

@Component({
  selector: 'app-event-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-board.html',
  styleUrl: './event-board.scss',
})
export class EventBoard {
  // No constructor needed — data is static, no DI required

  events: WhisperEvent[] = [
    {
      event_id: '001',
      type: 'date',
      title: 'Slow Morning Coffee Date',
      subtitle: 'Relaxed · Casual · 1-on-1',
      vibe: 'Perfect for a low-pressure first connection',
      gradient: 'linear-gradient(135deg, #c9a96e 0%, #e8c99a 100%)',
      status: 'LIVE',
      participants: 4,
      plan: [
        { id: 's1', label: 'Intro & icebreaker' },
        { id: 's2', label: 'Share your morning routine' },
        { id: 's3', label: 'Favorite coffee spots' },
        { id: 's4', label: 'Wrap up & follow-up' },
      ],
    },
    {
      event_id: '002',
      type: 'battle',
      title: 'Debate Night: Hot Takes Only',
      subtitle: 'Competitive · High Energy · Group',
      vibe: 'Bring your worst opinions and defend them',
      gradient: 'linear-gradient(135deg, #6c4fd4 0%, #a07df0 100%)',
      status: 'LIVE',
      participants: 12,
      plan: [
        { id: 's1', label: 'Opening statement' },
        { id: 's2', label: 'Rebuttal round' },
        { id: 's3', label: 'Audience vote' },
        { id: 's4', label: 'Final argument' },
        { id: 's5', label: 'Winner crowned' },
      ],
    },
    {
      event_id: '003',
      type: 'chat',
      title: 'Founder Fireside: What Nobody Tells You',
      subtitle: 'Honest · Deep Dive · Open Floor',
      vibe: 'Real talk from people who have shipped things',
      gradient: 'linear-gradient(135deg, #2d8f6f 0%, #5dbfa0 100%)',
      status: 'SOON',
      participants: 0,
      plan: [
        { id: 's1', label: 'Guest intro' },
        { id: 's2', label: 'Origin story' },
        { id: 's3', label: 'Biggest mistake' },
        { id: 's4', label: 'Open Q&A' },
      ],
    },
    {
      event_id: '004',
      type: 'date',
      title: 'Book Club Blind Date',
      subtitle: 'Curious · Literary · 1-on-1',
      vibe: 'You both bring a rec — no spoilers until the end',
      gradient: 'linear-gradient(135deg, #d45f7a 0%, #f08fa2 100%)',
      status: 'SOON',
      participants: 0,
      plan: [
        { id: 's1', label: 'Introduce your pick' },
        { id: 's2', label: 'Genre swap challenge' },
        { id: 's3', label: 'Reading taste quiz' },
        { id: 's4', label: 'Exchange recommendations' },
      ],
    },
    {
      event_id: '005',
      type: 'battle',
      title: 'Design Roast: Tear It Apart',
      subtitle: 'Creative · Brutal · Portfolio',
      vibe: 'Submit your work and let strangers fix it live',
      gradient: 'linear-gradient(135deg, #e07b3a 0%, #f0b07a 100%)',
      status: 'ENDED',
      participants: 8,
      plan: [
        { id: 's1', label: 'Submit your design' },
        { id: 's2', label: 'Silent review period' },
        { id: 's3', label: 'Live critique round' },
        { id: 's4', label: 'Defend your choices' },
        { id: 's5', label: 'Revised version share' },
        { id: 's6', label: 'Vote for best glow-up' },
      ],
    },
    {
      event_id: '006',
      type: 'chat',
      title: 'Night Owl Rant Room',
      subtitle: 'Unfiltered · Late Night · Group',
      vibe: 'Say the thing you have been holding in all week',
      gradient: 'linear-gradient(135deg, #3a5a8f 0%, #6a8fc0 100%)',
      status: 'LIVE',
      participants: 7,
      plan: [
        { id: 's1', label: 'Set the vibe' },
        { id: 's2', label: 'Round-robin rants' },
        { id: 's3', label: 'Group therapy moment' },
      ],
    },
  ];

  joinEvent(eventId: string): void {
    console.log('Joining event:', eventId);
    // TODO: navigate or emit to parent
  }
}