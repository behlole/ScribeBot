// src/app/components/dashboard/dashboard.component.ts
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecordingComponent} from "./components/recording.component";
import {AuthService} from "../../services/AuthService.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RecordingComponent],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="user-info">
          @if (currentUser$ | async; as user) {
            <img [src]="user.picture" alt="Profile" class="profile-image">
            <span class="user-name">{{ user.name }}</span>
          }
        </div>
        <button (click)="logout()" class="logout-button">Logout</button>
      </header>

      <main class="dashboard-content">
        <app-recording/>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      background: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .profile-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .user-name {
      font-weight: 500;
    }

    .logout-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #f44336;
      color: white;
      cursor: pointer;
    }

    .dashboard-content {
      padding: 2rem;
    }
  `]
})
export class DashboardComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }
}
