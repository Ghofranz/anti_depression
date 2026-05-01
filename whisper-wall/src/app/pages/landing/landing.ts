import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  modalReason = '';

  form = {
    name: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private api: Api
  ) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  start() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/confess']);
      return;
    }

    this.modalReason = 'Create an account to share an academic situation and get matched with similar peers.';
    this.openSignup();
  }

  viewMatches() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/matches']);
      return;
    }

    this.modalReason = 'Log in or create an account to view your academic matches.';
    this.openSignup();
  }

  openSignup() {
    this.error = '';
    this.showSignup = true;
  }

  closeModal() {
    if (this.loading) return;
    this.showSignup = false;
    this.error = '';
  }

  goToLogin() {
    this.showSignup = false;
    this.router.navigate(['/login']);
  }

  submitSignup() {
    this.error = '';

    if (!this.form.name.trim() || !this.form.userName.trim() || !this.form.password || !this.form.confirmPassword) {
      this.error = 'Please fill all required fields.';
      return;
    }

    if (this.form.password.length < 6) {
      this.error = 'Password must contain at least 6 characters.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.api.signUp({
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      username: this.form.userName.trim(),
      password: this.form.password
    }).subscribe({
      next: (res: any) => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('myConfessionId');
        localStorage.removeItem('profileId');

        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', String(res.user.id));
        localStorage.setItem('userName', res.user.username || res.user.name || this.form.userName.trim());
        localStorage.setItem('showWelcomeAfterSignup', 'true');

        this.loading = false;
        this.showSignup = false;
        this.router.navigate(['/confess']);
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Account creation failed. Please try again.';
        this.loading = false;
      }
    });
  }
}