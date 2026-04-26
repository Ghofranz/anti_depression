import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login {
  mode: 'login' | 'signup' = 'login';

  username = '';
  password = '';

  signupForm = {
    name: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: ''
  };

  loading = false;
  error = '';

  constructor(private api: Api, private router: Router) {}

  switchMode(mode: 'login' | 'signup') {
    this.mode = mode;
    this.error = '';
  }

  submit() {
    this.error = '';

    if (!this.username.trim() || !this.password) {
      this.error = 'Username and password are required.';
      return;
    }

    this.loading = true;

    this.api.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('myConfessionId');
        localStorage.removeItem('profileId');

        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', String(res.user.id));
        localStorage.setItem('userName', res.user.username || res.user.name || this.username.trim());

        this.api.get_all_confess().subscribe({
          next: (confesRes: any) => {
            const arr = Array.isArray(confesRes) ? confesRes : confesRes?.results || [];

            if (arr.length > 0) {
              const latest = arr.sort((a: any, b: any) => b.id - a.id)[0];
              localStorage.setItem('myConfessionId', String(latest.id));
              this.loading = false;
              this.router.navigate(['/matches']);
            } else {
              this.loading = false;
              this.router.navigate(['/confess']);
            }
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/confess']);
          }
        });
      },
      error: (err: any) => {
        if (err?.status === 401) {
          this.error = 'Invalid username or password.';
        } else if (err?.status === 409) {
          this.error = 'Account already exists. Please log in instead.';
        } else {
          this.error = err?.error?.error || 'Login failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  submitSignup() {
    this.error = '';

    if (
      !this.signupForm.name.trim() ||
      !this.signupForm.userName.trim() ||
      !this.signupForm.password ||
      !this.signupForm.confirmPassword
    ) {
      this.error = 'Please fill all required fields.';
      return;
    }

    if (this.signupForm.password.length < 6) {
      this.error = 'Password must contain at least 6 characters.';
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.api.signUp({
      name: this.signupForm.name.trim(),
      email: this.signupForm.email.trim(),
      username: this.signupForm.userName.trim(),
      password: this.signupForm.password
    }).subscribe({
      next: (res: any) => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('myConfessionId');
        localStorage.removeItem('profileId');

        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', String(res.user.id));
        localStorage.setItem('userName', res.user.username || res.user.name || this.signupForm.userName.trim());
        localStorage.setItem('showWelcomeAfterSignup', 'true');

        this.loading = false;
        this.router.navigate(['/confess']);
      },
      error: (err: any) => {
        if (err?.status === 409) {
          this.error = err?.error?.error || 'This account already exists. Please switch to Login.';
        } else {
          this.error = err?.error?.error || 'Account creation failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }
}