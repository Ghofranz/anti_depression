import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('whisper-wall');

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('profileId');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profileId');
    localStorage.removeItem('userName');
    localStorage.removeItem('myConfessionId');
    this.router.navigate(['/login']);
  }
}
