import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reveal',
  imports: [CommonModule, FormsModule],
  templateUrl: './reveal.html',
  styleUrl: './reveal.scss',
})
export class Reveal {
  revealStage: 'none' | 'profile' | 'waiting' | 'accepted' = 'none';

profile = {
  name: '',
  photo: '',
  bio: ''
};
Math: any;

openReveal() {
  this.revealStage = 'profile';
}



showError = false;

submitProfile() {
  if (!this.profile.name?.trim()) {
    this.showError = true;
    return;
  }

  this.showError = false;
  this.revealStage = 'waiting';

  // simulate sending request to backend
  setTimeout(() => {
    // if success:
    this.revealStage = 'accepted';  // or 'revealed'
  }, 2000);
}


}
