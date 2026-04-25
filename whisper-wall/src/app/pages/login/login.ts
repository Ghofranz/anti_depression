import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private api: Api, private router: Router) {}

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
        // Important: clear old account state before storing the new one
        localStorage.clear();

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
        this.error = err?.error?.error || 'Login failed. Invalid credentials.';
        this.loading = false;
      }
    });
  }
}