import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
@Component({
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})


export class Landing {

  showSignup = false;
  loading = false;
  error = '';

  form = {
    name: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private router: Router, private api: Api) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('profileId');
  }

  get userName(): string {
    return localStorage.getItem('userName') || '';
  }

  start() {
    if (this.isLoggedIn) {
      this.router.navigate(['/confess']);
    } else {
      this.showSignup = true;
    }
  }

  closeModal() {
    this.showSignup = false;
    this.error = '';
    this.form = { name: '', email: '', userName: '', password: '', confirmPassword: '' };
  }

  submitSignup() {
    this.error = '';

    if (!this.form.name.trim()) {
      this.error = 'Name is required.'; return;
    }
    if (!this.form.password || this.form.password.length < 6) {
      this.error = 'Password must be at least 6 characters.'; return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Passwords do not match.'; return;
    }

    this.loading = true;
    this.api.signUp({
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      username: this.form.userName.trim(),
      password: this.form.password,
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('profileId', res.id);
        localStorage.setItem('userName', res.name);
        this.loading = false;
        this.closeModal();
        this.router.navigate(['/confess']);
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Signup failed. Try again.';
        this.loading = false;
      }
    });
  }

  viewMatches() {
    this.router.navigate(['/matches']);
  }

  logout() {
    localStorage.removeItem('profileId');
    localStorage.removeItem('userName');
    localStorage.removeItem('myConfessionId');
  }
}