import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('CampusConnect');
  private readonly platformId = inject(PLATFORM_ID);
  
  events: any[] = [];
  showNotifications = false;

  constructor(private router: Router, private api: Api) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadEvents();
    }
  }

  loadEvents() {
    this.api.getEvents().subscribe({
      next: (res: any) => {
        this.events = res.events || [];
      },
      error: () => {
        // silently ignore
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadEvents();
    }
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('myConfessionId');
    localStorage.removeItem('profileId');
    this.router.navigate(['/login']);
  }

  navigateToEvent(event: any) {
    this.showNotifications = false;
    // Navigate based on event type
    if (event.type === 'match' || event.match) {
      // Navigate to matches page
      this.router.navigate(['/matches']);
    } else if (event.type === 'chat') {
      this.router.navigate(['/chat']);
    } else if (event.type === 'reveal') {
      this.router.navigate(['/reveal']);
    } else {
      // Default to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
