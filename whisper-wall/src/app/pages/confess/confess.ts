import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confess',
  imports: [CommonModule, FormsModule],
  templateUrl: './confess.html',
  styleUrl: './confess.scss',
})
export class Confess implements OnInit {
  text = '';
  emotion = 'course_help';
  location = '';
  loading = false;
  error = '';

  showHelpPopup = false;
  currentHelpIndex = 0;
  neverShowHelpAgain = false;
  showWelcomePopup = false;

  helpPopups = [
    {
      title: 'Describe your academic situation',
      icon: '📝',
      message:
        'Write clearly what you need help with, what you are looking for, or what academic challenge you are facing. For example: “I need help understanding Angular services” or “I am looking for a teammate for a project”.'
    },
    {
      title: 'Choose the right category',
      icon: '🎓',
      message:
        'Select the category that best describes your situation. This helps the system find students with similar academic needs, such as course help, study groups, exam preparation, or project teams.'
    },
    {
      title: 'Add a useful context',
      icon: '📍',
      message:
        'Add where or in what context this situation happens. This can be a course name, classroom, campus place, project context, or subject area. For example: “Angular course”, “database class”, or “library study group”.'
    }
  ];

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    const showWelcome = localStorage.getItem('showWelcomeAfterSignup') === 'true';

    if (showWelcome) {
      this.showWelcomePopup = true;
      localStorage.removeItem('showWelcomeAfterSignup');
    } else {
      const hideHelp = localStorage.getItem('hideSubmitSituationHelp') === 'true';

      if (!hideHelp) {
        this.currentHelpIndex = 0;
        this.showHelpPopup = true;
      }
    }
  }

  startJourney() {
    this.showWelcomePopup = false;
    const hideHelp = localStorage.getItem('hideSubmitSituationHelp') === 'true';
    if (!hideHelp) {
      this.currentHelpIndex = 0;
      this.showHelpPopup = true;
    }
  }

  get gradientClass(): string {
    switch (this.emotion) {
      case 'course_help': return 'from-blue-500 to-indigo-800';
      case 'project_team': return 'from-cyan-500 to-blue-800';
      case 'exam_preparation': return 'from-indigo-500 to-purple-800';
      case 'study_group': return 'from-teal-500 to-blue-800';
      case 'internship_advice': return 'from-slate-500 to-indigo-800';
      case 'administrative_request': return 'from-amber-500 to-orange-800';
      case 'lost_found': return 'from-gray-500 to-slate-800';
      default: return 'from-blue-500 to-indigo-800';
    }
  }

  get currentHelp() {
    return this.helpPopups[this.currentHelpIndex];
  }

  nextHelpPopup() {
    if (this.neverShowHelpAgain) {
      localStorage.setItem('hideSubmitSituationHelp', 'true');
    }

    if (this.currentHelpIndex < this.helpPopups.length - 1) {
      this.currentHelpIndex++;
    } else {
      this.closeHelpPopup();
    }
  }

  closeHelpPopup() {
    if (this.neverShowHelpAgain) {
      localStorage.setItem('hideSubmitSituationHelp', 'true');
    }

    this.showHelpPopup = false;
  }

  openHelpPopup(index: number) {
    this.currentHelpIndex = index;
    this.showHelpPopup = true;
  }

  submit() {
    if (this.loading) return;

    if (!this.text.trim() || !this.location.trim()) {
      this.error = 'Please describe your situation and add a context.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.post_confess({
      text: this.text.trim(),
      emotion: this.emotion,
      location_hint: this.location.trim()
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('myConfessionId', String(res.id));
        this.loading = false;
        this.router.navigate(['/matches']);
      },
      error: () => {
        this.error = 'Server error. Try again.';
        this.loading = false;
      }
    });
  }
}