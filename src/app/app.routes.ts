import {Routes} from '@angular/router';
import {authGuard} from "./guard/auth.guard";
import {loginGuard} from "./guard/login.guard";

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./components/login/callback.component')
      .then(m => m.AuthCallbackComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
