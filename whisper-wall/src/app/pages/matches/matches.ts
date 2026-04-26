import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private readonly platformId = inject(PLATFORM_ID);
  groupedMatches: GroupedMatches[] = [];
  contactStatuses: { [matchId: number]: any } = {};

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
    if (!isPlatformBrowser(this.platformId) || !localStorage.getItem('token')) {
      return;
    }

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
            }).reverse();

            const allMatches = this.groupedMatches.flatMap(group => group.matches);
            this.loadContactStatuses(allMatches);

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

  loadContactStatuses(matches: Match[]) {
    const uniqueMatches = Array.from(
      new Map(matches.map((match: any) => [match.id, match])).values()
    );

    if (uniqueMatches.length === 0) return;

    const requests = uniqueMatches.map((match: any) =>
      this.api.getContactExchangeStatus(match.id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe({
      next: (statuses: any[]) => {
        statuses.forEach((statusData: any, index: number) => {
          if (statusData) {
            const match: any = uniqueMatches[index];
            this.contactStatuses[match.id] = statusData;
          }
        });

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

  getContactStatus(match: any) {
    return this.contactStatuses[match.id];
  }

  getPeerProfile(match: any) {
    const statusData = this.getContactStatus(match);
    return statusData?.both_active ? statusData.peer_profile : null;
  }

  getContactMessage(match: any): string {
    const statusData = this.getContactStatus(match);

    if (!statusData) {
      return 'Loading contact exchange status...';
    }

    if (statusData.both_active) {
      return 'Academic contacts exchanged.';
    }

    if (statusData.peer_contact_exchange_active && !statusData.my_contact_exchange_active) {
      return 'Your peer is ready to exchange academic contact details.';
    }

    if (statusData.my_contact_exchange_active && !statusData.peer_contact_exchange_active) {
      return 'You agreed to exchange contact details. Waiting for your peer.';
    }

    return 'Contact details are private until both students agree to exchange them.';
  }
}