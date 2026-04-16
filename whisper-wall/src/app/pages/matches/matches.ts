import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Match } from '../../entity/match';


@Component({
  selector: 'app-matches',
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.html',
  styleUrl: './matches.scss',
})

export class Matches {
  myId = 1; // Simulated user ID

  constructor(private api: Api) {}

  ngOnInit() {
    this.getMatches();
  }

  matches: Match[] = [
  ];

  getMatches() {
  this.api.getMatches(1).subscribe((res: any) => {

    this.matches = res.map((m:any) => ({
      id: m.id,
      confession_a: m.confession_a,
      confession_b: m.confession_b,
      score: m.score,
      created_at: m.created_at,
      is_active: m.is_active
    }));

  });
}
}
