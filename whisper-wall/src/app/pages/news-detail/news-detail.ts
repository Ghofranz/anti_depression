import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

export interface NewsItem {
  id: number | string;
  title: string;
  body: string;
  author_name?: string;
  created_at?: string;
}

@Component({
  selector: 'app-news-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  news: NewsItem | null = null;
  loading = false;
  error = '';
  newsId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.newsId = this.route.snapshot.paramMap.get('id');
    if (!this.newsId) {
      this.error = 'News not found.';
      return;
    }

    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.api.getNews().subscribe({
      next: (payload: any) => {
        this.loading = false;
        const allNews = Array.isArray(payload) ? payload : payload?.news || [];
        const found = allNews.find(
          (item: any) => String(item.id) === String(this.newsId)
        );

        if (found) {
          this.news = {
            id: found.id,
            title: found.title || 'Untitled',
            body: found.body || '',
            author_name: found.author_name || 'Admin',
            created_at: found.created_at || '',
          };
        } else {
          this.error = 'News article not found.';
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load news.';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/news']);
  }
}
