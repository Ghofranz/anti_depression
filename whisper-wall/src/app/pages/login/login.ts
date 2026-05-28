import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.Default,
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
  errorType: 'error' | 'success' | 'info' = 'error';
  private dismissTimeout: any;

  constructor(
    private api: Api, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  switchMode(mode: 'login' | 'signup') {
    this.mode = mode;
    this.clearError();
  }

  clearError() {
    this.error = '';
    this.errorType = 'error';
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    this.cdr.markForCheck();
  }

  private setError(message: string, type: 'error' | 'success' | 'info' = 'error') {
    this.error = message;
    this.errorType = type;
    this.cdr.markForCheck();

    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }

    // Auto-dismiss after 6 seconds for errors, 3 seconds for success
    const delay = type === 'success' ? 3000 : 6000;
    this.dismissTimeout = setTimeout(() => {
      this.clearError();
    }, delay);
  }

  submit() {
    this.clearError();

    if (!this.username.trim() || !this.password) {
      this.setError('⚠️ Username and password are required.', 'error');
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

        this.setError('✅ Login successful! Redirecting...', 'success');
        this.loading = false;

        this.api.get_all_confess().subscribe({
          next: (confesRes: any) => {
            const arr = Array.isArray(confesRes) ? confesRes : confesRes?.results || [];

            if (arr.length > 0) {
              const latest = arr.sort((a: any, b: any) => b.id - a.id)[0];
              localStorage.setItem('myConfessionId', String(latest.id));
              this.router.navigate(['/matches']);
            } else {
              this.router.navigate(['/confess']);
            }
          },
          error: () => {
            this.router.navigate(['/confess']);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        
        const errorMsg = err?.error?.error || err?.error?.message || 'Login failed. Invalid credentials.';
        
        let displayMsg = '';
        if (errorMsg.includes('Invalid credentials') || errorMsg.includes('not found')) {
          displayMsg = '❌ Invalid username or password. Please try again.';
        } else if (errorMsg.includes('User not found')) {
          displayMsg = '❌ No account found with this username.';
        } else {
          displayMsg = `❌ ${errorMsg}`;
        }
        
        this.setError(displayMsg, 'error');
        console.error('Login error:', err);
      }
    });
  }

  submitSignup() {
    this.clearError();

    if (
      !this.signupForm.name.trim() ||
      !this.signupForm.userName.trim() ||
      !this.signupForm.password ||
      !this.signupForm.confirmPassword
    ) {
      this.setError('⚠️ Please fill all required fields.', 'error');
      return;
    }

    if (this.signupForm.password.length < 6) {
      this.setError('⚠️ Password must contain at least 6 characters.', 'error');
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.setError('⚠️ Passwords do not match.', 'error');
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

        this.setError('✅ Account created! Redirecting...', 'success');
        this.loading = false;
        setTimeout(() => this.router.navigate(['/confess']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        
        const errorMsg = err?.error?.error || err?.error?.message || 'Account creation failed. Please try again.';
        
        let displayMsg = '';
        if (errorMsg.includes('already')) {
          displayMsg = '❌ Username already exists. Choose another one.';
        } else {
          displayMsg = `❌ ${errorMsg}`;
        }
        
        this.setError(displayMsg, 'error');
        console.error('Signup error:', err);
      }
    });
  }
}