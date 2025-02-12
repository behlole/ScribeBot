import {Component, inject} from '@angular/core';
import {GoogleAuthService} from "../../../services/AuthService.service";

@Component({
  selector: 'app-profile-widget',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Profile</h2>

      @if (user()) {
        <div class="flex items-center space-x-4">
          <img
            [src]="user()?.picture"
            alt="Profile"
            class="h-16 w-16 rounded-full"
          >
          <div>
            <h3 class="font-medium">{{ user()?.name }}</h3>
            <p class="text-sm text-gray-500">{{ user()?.email }}</p>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileWidgetComponent {
  private authService = inject(GoogleAuthService);
  user = this.authService.currentUser;
}
