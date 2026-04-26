import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live.html',
  styleUrl: './live.scss',
})
export class Live {

  private router = inject(Router);

  rooms = [
    {
      id: 'focus-hall',
      title: 'Focus Hall',
      subtitle: 'Quiet room for deep work and revision',
      status: 'OPEN',
      people: '18 students',
      vibe: 'Quiet • focused • warm light',
      lofi: 'Rain Study',
      gradient: 'linear-gradient(135deg, #0f172a, #1d4ed8)'
    },
    {
      id: 'night-library',
      title: 'Night Library',
      subtitle: 'Late-night study session with ambient lo-fi',
      status: 'LIVE',
      people: '42 students',
      vibe: 'Soft beats • shared pomodoro',
      lofi: 'Moonlight Beats',
      gradient: 'linear-gradient(135deg, #312e81, #7c3aed)'
    },
    {
      id: 'exam-rush',
      title: 'Exam Rush Room',
      subtitle: 'Fast revision room with a calm background soundtrack',
      status: 'OPEN',
      people: '26 students',
      vibe: 'Low pressure • checklist mode',
      lofi: 'Coffee & Loops',
      gradient: 'linear-gradient(135deg, #134e4a, #0f766e)'
    },
    {
      id: 'desk-setup',
      title: 'Desk Setup Corner',
      subtitle: 'Aesthetic co-working room for planning and note-taking',
      status: 'OPEN',
      people: '11 students',
      vibe: 'Calm desk cam • no chat',
      lofi: 'Velvet Focus',
      gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)'
    }
  ];

  joinRoom(roomId: string) {
    this.router.navigate(['/study', roomId]);
  }
}