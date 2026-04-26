import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  loading = false;
  error = '';

  totalSituations = 0;
  totalMatches = 0;
  activeDiscussions = 0;

  recentSituations: any[] = [];

  suggestedCategories = [
    'Course Help',
    'Project Team',
    'Exam Preparation',
    'Study Group',
    'Internship Advice',
    'Administrative Request',
    'Lost / Found'
  ];

constructor(
  private api: Api,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    if (!isPlatformBrowser(this.platformId) || !localStorage.getItem('token')) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.get_all_confess().pipe(
      catchError(() => {
        this.error = 'Failed to load situations. Please check your connection.';
        return of([]);
      })
    ).subscribe((res: any) => {
      let situations = Array.isArray(res) ? res : res?.results || [];

      situations = situations.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime() || a.id || 0;
        const dateB = new Date(b.created_at || 0).getTime() || b.id || 0;
        return dateB - dateA;
      });

      this.totalSituations = situations.length;
      this.recentSituations = situations.slice(0, 5);

      // Stop the main loading here so the dashboard appears immediately.
      this.loading = false;
this.cdr.detectChanges();
      // Then load match metrics separately.
      this.loadMatchMetrics(situations);
    });
  }

  loadMatchMetrics(situations: any[]) {
    if (!situations.length) {
  this.totalMatches = 0;
  this.activeDiscussions = 0;
  this.cdr.detectChanges();
  return;
}

    const matchRequests = situations.map((s: any) =>
      this.api.getMatches(s.id).pipe(catchError(() => of([])))
    );

    forkJoin(matchRequests).subscribe((results: any[]) => {
      const uniqueMatches = new Map();

      results.forEach((matchArray: any) => {
        const matches = Array.isArray(matchArray) ? matchArray : matchArray?.results || [];

        matches.forEach((m: any) => {
          const key = m.id || `${m.confession_a}-${m.confession_b}`;
          uniqueMatches.set(key, m);
        });
      });
this.totalMatches = uniqueMatches.size;
this.activeDiscussions = uniqueMatches.size;
this.cdr.detectChanges();
    });
  }

  getCategoryLabel(value: string): string {
    const labels: { [key: string]: string } = {
      crush: 'Study Group',
      love: 'Course Help',
      heartbreak: 'Exam Preparation',
      regret: 'Administrative Request',
      fight: 'Project Team',
      course_help: 'Course Help',
      project_team: 'Project Team',
      exam_preparation: 'Exam Preparation',
      study_group: 'Study Group',
      internship_advice: 'Internship Advice',
      administrative_request: 'Administrative Request',
      lost_found: 'Lost / Found'
    };

    return labels[value] || value || 'Academic Situation';
  }

  navigateToMatches() {
    this.router.navigate(['/matches']);
  }
}