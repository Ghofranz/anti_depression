import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vedio-player',
   imports: [CommonModule, FormsModule],
  templateUrl: './vedio-player.html',
  styleUrl: './vedio-player.scss',
})
export class VedioPlayer implements OnInit {
  event: any;

  constructor() {}

  ngOnInit() {
    // In a real app, fetch by ID. Here is static data for your test.
    this.event = {
      title: 'Heavyweight Cage Fight: The Final Reckoning',
      type: 'Cage Fight',
      views: '1.2K',
      description: 'Two anonymous students settle the score in the basement arena.',
      host: 'Whisper Radar Official',
      color: '#450a0a'
    };
  }
}