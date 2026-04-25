import { Component } from '@angular/core';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-confess',
  imports: [CommonModule, FormsModule],
  templateUrl: './confess.html',
  styleUrl: './confess.scss',
})

export class Confess {
  text = '';
  emotion = 'course_help';
  location = '';
  loading = false;
  error = '';
  bg1 = 'blue';
  bg2 = 'indigo';

  constructor(private api: Api, private router: Router) { }

  get gradientClass(): string {
    switch (this.emotion) {
      case 'course_help': return 'from-cyan-600 to-blue-800';
      case 'project_team': return 'from-indigo-600 to-blue-800';
      case 'exam_preparation': return 'from-teal-600 to-cyan-800';
      case 'study_group': return 'from-blue-600 to-indigo-800';
      case 'internship_advice': return 'from-sky-600 to-blue-800';
      case 'administrative_request': return 'from-slate-600 to-slate-800';
      case 'lost_found': return 'from-gray-600 to-gray-800';
      default: return 'from-blue-600 to-indigo-800';
    }
  }

  submit() {
  if (this.loading) return;

  console.log('Submitting confession:...');

  if (!this.text.trim() || !this.location.trim()) {
    this.error = 'Please fill all fields';
    return;
  }

  this.loading = true;
  this.error = '';

  this.api.post_confess({
    text: this.text.trim(),
    emotion: this.emotion,
    location_hint: this.location.trim()
  }).subscribe({
    next: (res: any) => {
      localStorage.setItem('myConfessionId', String(res.id));
      this.loading = false;
      this.router.navigate(['/matches']);
    },
    error: () => {
      this.error = 'Server error. Try again.';
      this.loading = false;
    }
  });
}
}
