import { Routes } from '@angular/router';
import { Chat } from './pages/chat/chat';
import { Reveal } from './pages/reveal/reveal';
import { Matches } from './pages/matches/matches';
import { Confess } from './pages/confess/confess';
import { Login } from './pages/login/login';
import { Landing } from './pages/landing/landing';
import { EventBoard } from './pages/event-board/event-board';
import { Live } from './pages/live/live';
import { VedioPlayer } from './pages/vedio-player/vedio-player';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'confess', component: Confess },
  { path: 'matches', component: Matches },
  { path: 'chat/:matchId', component: Chat },
  { path: 'reveal/:matchId', component: Reveal },
  { path: 'event', component: EventBoard },
  { path: 'live', component: Live },
  { path: 'watch/:id', component: VedioPlayer },
  { path: '**', redirectTo: '' }
];