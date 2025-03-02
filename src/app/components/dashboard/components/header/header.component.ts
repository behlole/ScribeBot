import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from "../../../../services/AuthService.service";
import {RecordingService} from "../../../../services/Recording.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="header-title">Medical Consultation Dashboard</h1>
          <div class="timers">
            <div class="session-timer">
              <svg xmlns="http://www.w3.org/2000/svg" class="timer-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Session: {{ sessionDuration }}</span>
            </div>

            @if (recordingState.status !== 'inactive') {
              <div class="recording-timer" [class.paused]="recordingState.status === 'paused'">
                <svg xmlns="http://www.w3.org/2000/svg" class="timer-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" [attr.stroke]="recordingState.status === 'paused' ? '#f59e0b' : '#ef4444'"/>
                  <circle cx="12" cy="12" r="3" [attr.fill]="recordingState.status === 'paused' ? '#f59e0b' : '#ef4444'"/>
                </svg>
                <span>Recording: {{formatRecordingTime(recordingState.elapsedTime)}}</span>
              </div>
            }
          </div>
        </div>
        <div class="user-info">
          @if (currentUser$ | async; as user) {
            <div class="doctor-badge">
              <div class="badge-icon">MD</div>
              <img [src]="user.picture" alt="Profile" class="profile-image">
              <div class="doctor-info">
                <span class="doctor-name">Dr. {{ user.name }}</span>
                <span class="doctor-specialty">General Practice</span>
              </div>
            </div>
            <button (click)="onLogout()" class="logout-button">
              <svg xmlns="http://www.w3.org/2000/svg" class="logout-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          }
        </div>
      </div>
    </header>
  `,
  styleUrl:'header.css'
})
export class HeaderComponent {
  @Input() sessionDuration: string = '00:00';
  @Input() recordingState: { status: string; elapsedTime: number } = { status: 'inactive', elapsedTime: 0 };
  @Output() logoutEvent = new EventEmitter<void>();

  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  formatRecordingTime(ms: number): string {
    return RecordingService.formatElapsedTime(ms);
  }

  onLogout() {
    this.logoutEvent.emit();
  }
}
