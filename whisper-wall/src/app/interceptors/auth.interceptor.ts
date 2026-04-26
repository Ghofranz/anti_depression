import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Public auth endpoints must never carry an existing token.
  if (req.url.includes('/api/login/') || req.url.includes('/api/sign_up/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Token ${token}`
    }
  });

  return next(authReq);
};
