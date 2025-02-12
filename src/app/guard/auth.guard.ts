import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../services/AuthService.service";

export const authGuard = () => {
  const googleAuthService = inject(AuthService);
  const router = inject(Router);

  if (googleAuthService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
