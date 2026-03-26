import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  return loginService.isLoggedIn$().pipe(
    tap((isLoggedIn) => {
      if (isLoggedIn) {
        void router.navigate(['/']);
      }
    }),
    map((isLoggedIn) => !isLoggedIn)
  );
};
