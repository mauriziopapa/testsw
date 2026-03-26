import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

export const appGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  return loginService.isLoggedIn$().pipe(
    tap((isLoggedIn) => {
      if (!isLoggedIn) {
        void router.navigate(['/login']);
      }
    })
  );
};

export const appGuardChild: CanActivateChildFn = appGuard;
