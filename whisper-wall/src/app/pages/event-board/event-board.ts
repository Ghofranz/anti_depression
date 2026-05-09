import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

export interface NewsItem {
  id: number | string;
  title: string;
  body: string;
  author_name?: string;
  created_at?: string;
}

@Component({
  selector: 'app-event-board',
  imports: [CommonModule],
  templateUrl: './event-board.html',
  styleUrl: './event-board.scss',
})
export class EventBoard implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  news: NewsItem[] = [];
  loading = false;
  error = '';

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading = true;
    this.api.getNews().subscribe({
      next: (payload: any) => {
        this.loading = false;
        const news = Array.isArray(payload) ? payload : payload?.news || [];
        this.news = news.map((item: any, index: number) => ({
          id: item.id ?? index,
          title: item.title || 'Untitled',
          body: item.body || '',
          author_name: item.author_name || 'Admin',
          created_at: item.created_at || '',
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load news.';
        this.loading = false;
      }
    });
  }

  trackByNewsId(index: number, item: NewsItem): number | string {
    return item.id ?? index;
  }

  truncateBody(body: string, wordCount = 13): string {
    if (!body) {
      return '';
    }

    const words = body.trim().split(/\s+/);
    if (words.length <= wordCount) {
      return body.trim();
    }

    return `${words.slice(0, wordCount).join(' ')}..`;
  }

  navigateToNews(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}