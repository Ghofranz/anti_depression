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
  emotion = 'crush';
  location = '';
  loading = false;
  error = '';
  bg1 = 'pink';
  bg2 = 'purple';

  constructor(private api: Api, private router: Router) { }

  get gradientClass(): string {
    switch (this.emotion) {
      case 'love': return 'from-pink-500 to-purple-700';
      case 'crush': return 'from-blue-500 to-cyan-700';
      case 'heartbreak': return 'from-gray-500 to-gray-900';
      case 'regret': return 'from-yellow-500 to-orange-700';
      case 'fight': return 'from-red-500 to-red-900';
      default: return 'from-pink-500 to-purple-700';
    }
  }

  submit() {
    console.log('Submitting confession:...');

    if (!this.text || !this.location) {
      this.error = 'Please fill all fields';
      return;
    }

    this.loading = true;
    this.api.post_confess({
      text: this.text,
      emotion: this.emotion,
      location_hint: this.location
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
