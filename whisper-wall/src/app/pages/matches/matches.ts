import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Api } from '../../services/api';
import { Match } from '../../entity/match';

interface GroupedMatches {
  confession: any;
  matches: Match[];
}

@Component({
  selector: 'app-matches',
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.html',
  styleUrl: './matches.scss',
})
export class Matches implements OnInit {
  groupedMatches: GroupedMatches[] = [];
  loading = false;
  error = '';

  constructor(
    private api: Api,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllMatches();
  }

  openChat(matchId: number, confessionId: number) {
    localStorage.setItem('myConfessionId', String(confessionId));
    this.router.navigate(['/chat', matchId]);
  }

  loadAllMatches() {
    this.loading = true;
    this.error = '';

    this.api.get_all_confess().subscribe({
      next: (confesRes: any) => {
        const confessions = Array.isArray(confesRes) ? confesRes : confesRes?.results || [];
        
        if (confessions.length === 0) {
          this.error = 'Please share a situation first.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const matchRequests = confessions.map((c: any) => this.api.getMatches(c.id));

        forkJoin(matchRequests).subscribe({
          next: (results: any) => {
            this.groupedMatches = confessions.map((c: any, index: number) => {
              const res = results[index];
              const matchesArray = Array.isArray(res) ? res : res?.results || [];
              return {
                confession: c,
                matches: matchesArray
              };
            });
            // Reverse to show latest confession at the top visually
            this.groupedMatches = this.groupedMatches.reverse();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
             this.error = 'Failed to load matches.';
             this.loading = false;
             this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.error = 'Failed to load situations.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMyConfession(match: Match, myConfessionId: number) {
    return match.confession_a.id === myConfessionId ? match.confession_a : match.confession_b;
  }

  getOtherConfession(match: Match, myConfessionId: number) {
    return match.confession_a.id === myConfessionId ? match.confession_b : match.confession_a;
  }
}