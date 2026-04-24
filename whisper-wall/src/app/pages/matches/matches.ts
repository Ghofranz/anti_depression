import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Match } from '../../entity/match';


@Component({
  selector: 'app-matches',
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.html',
  styleUrl: './matches.scss',
})

export class Matches implements OnInit {
  matches: Match[] = [];
  loading = false;
  error = '';

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getMatches();
  }

  getMatches() {
    const confessionIdStr = localStorage.getItem('myConfessionId');
    if (!confessionIdStr) {
      this.error = "Please submit a situation first.";
      return;
    }

    const confessionId = Number(confessionIdStr);
    this.loading = true;
    this.api.getMatches(confessionId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.results || []);
        this.matches = data.map((m:any) => ({
          id: m.id,
          confession_a: m.confession_a,
          confession_b: m.confession_b,
          score: m.score,
          created_at: m.created_at,
          is_active: m.is_active
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = "Failed to load matches.";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
