import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "../services/AuthService.service";

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // If user is already authenticated, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // Allow access to login page only if user is not authenticated
  return true;
};
