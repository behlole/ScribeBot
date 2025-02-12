// src/app/components/auth/auth-callback.component.ts
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../services/AuthService.service";

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p>Completing authentication...</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      try {
        // Store auth data
        this.authService.handleAuthCallback(token);

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      } catch (error) {
        console.error('Error processing auth callback:', error);
        this.router.navigate(['/login'], {
          queryParams: { error: 'auth_failed' }
        });
      }
    } else {
      this.router.navigate(['/login'], {
        queryParams: { error: 'missing_token' }
      });
    }
  }
}
