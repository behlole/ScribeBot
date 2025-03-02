import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../../services/AuthService.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Medical Consultation</h1>
            <div class="flex items-center space-x-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="text-sm">Session Time: {{ sessionTime }}</span>
            </div>
          </div>

          @if (currentUser$ | async; as user) {
          <div class="flex items-center space-x-4">
            <img [src]="user.picture" [alt]="user.name"
                 class="h-8 w-8 rounded-full border border-gray-200">
            <span class="text-sm font-medium text-gray-700">Dr. {{user.name}}</span>
              <button (click)="logout()"
                      [disabled]="isLoggingOut"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200
                             rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
          {{isLoggingOut ? 'Logging out...' : 'Logout'}}
          </button>
        </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;
  isLoggingOut = false;
  sessionTime = '00:00';

  async logout() {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    try {
      await this.authService.logout();
    } finally {
      this.isLoggingOut = false;
    }
  }
}
