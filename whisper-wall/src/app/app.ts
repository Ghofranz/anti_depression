import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('whisper-wall');
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return !!localStorage.getItem('token');
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('myConfessionId');
    localStorage.removeItem('profileId');
    this.router.navigate(['/login']);
  }
}