import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../pages/service/auth.service';
import { Router } from '@angular/router';
import { APP_CONFIG, AppConfig } from '../app-config';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const cfg = inject<AppConfig>(APP_CONFIG);           // ← seguro, ya cargado por APP_INITIALIZER
  const auth = inject(AuthService);
  const token = auth.getToken();
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401) {
        auth.logout();
        inject(Router).navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};