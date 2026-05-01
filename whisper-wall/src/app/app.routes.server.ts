import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'chat/:matchId',
    renderMode: RenderMode.Server
  },
  {
    path: 'reveal/:matchId',
    renderMode: RenderMode.Server
  },
  {
    path: 'study/:roomId',
    renderMode: RenderMode.Server
  },
  {
    path: 'watch/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
