import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {AuthService} from "../../../services/AuthService.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

        @if (user$ | async; as user) {
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <img
                [src]="user.picture"
                alt="Profile"
                class="h-8 w-8 rounded-full"
              >
              <span class="text-sm text-gray-700">{{ user.name }}</span>
            </div>
            <button
              (click)="logout()"
              [disabled]="isLoggingOut"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </button>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  user$ = this.authService.currentUser$;
  isLoggingOut = false;

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
