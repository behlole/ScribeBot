import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from "../../services/AuthService.service";
import { RecordingService } from "../../services/Recording.service";
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {Recording} from "../../types/interfaces";
import {RecordingDetailsComponent} from "./components/recording-details/recording-details.component";
import {RecordingsListComponent} from "./components/recording-list/recording-list.component";
import {HeaderComponent} from "./components/header/header.component";
import {RecordingComponent} from "./components/recording/recording.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RecordingComponent,
    HeaderComponent,
    RecordingsListComponent,
    FormsModule,
    RecordingDetailsComponent
  ],
  template: `
    <div class="dashboard">
      <!-- Header Component -->
      <app-header
        [sessionDuration]="sessionDuration"
        [recordingState]="recordingState"
        (logoutEvent)="logout()"
      ></app-header>

      <div class="dashboard-layout">
        <!-- Recordings List Component -->
        <app-recordings-list
          [recordings]="recordings!"
          [isLoading]="isLoadingRecordings"
          [selectedRecordingId]="selectedRecording?.id"
          (selectRecording)="selectRecording($event)"
          (applyFilters)="applyFilters($event)"
        ></app-recordings-list>

        <!-- Main content area -->
        <main class="dashboard-content">
          @if (!selectedRecording) {
            <!-- Show recording component when no recording is selected -->
            <app-recording/>
          } @else {
            <!-- Show recording details when a recording is selected -->
            <app-recording-details
              [recording]="selectedRecording"
              [recordingDetails]="recordingDetails"
              [isLoading]="isLoadingDetails"
              (close)="closeRecordingDetails()"
              (delete)="deleteRecording($event)"
            ></app-recording-details>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    }

    .dashboard-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .dashboard-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser$ = this.authService.currentUser$;
  private sessionTimer: any;
  sessionDuration: string = '00:00';
  private sessionSeconds = 0;

  recordingState = {
    status: 'inactive' as 'inactive' | 'recording' | 'paused' | 'processing',
    elapsedTime: 0
  };

  // Recordings list
  recordings: any[] | undefined = [];
  selectedRecording: Recording | null = null;
  recordingDetails: any = null;
  isLoadingRecordings = false;
  isLoadingDetails = false;

  private recordingSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private recordingService: RecordingService
  ) {
    this.startSessionTimer();
  }

  ngOnInit() {
    this.recordingSubscription = this.recordingService.recordingState$.subscribe(state => {
      this.recordingState = state;
    });

    // Load recordings when component initializes
    this.loadRecordings();
  }

  private startSessionTimer() {
    this.sessionTimer = setInterval(() => {
      this.sessionSeconds++;
      this.sessionDuration = this.formatTime(this.sessionSeconds);
    }, 1000);
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async logout() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    await this.authService.logout();
  }

  ngOnDestroy() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    if (this.recordingSubscription) {
      this.recordingSubscription.unsubscribe();
    }
  }

  // Methods for recordings list functionality
  async loadRecordings(filters = {}) {
    this.isLoadingRecordings = true;
    try {
      this.recordings = await this.recordingService.getAllRecordings(filters).toPromise();
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      this.isLoadingRecordings = false;
    }
  }

  applyFilters(filters: any) {
    this.loadRecordings(filters);
  }

  async selectRecording(recording: Recording) {
    this.selectedRecording = recording;
    this.loadRecordingDetails(recording.id);
  }

  async loadRecordingDetails(recordingId: string) {
    this.isLoadingDetails = true;
    try {
      this.recordingDetails = await this.recordingService.getRecordingResults(recordingId).toPromise();
    } catch (error) {
      console.error('Failed to load recording details:', error);
    } finally {
      this.isLoadingDetails = false;
    }
  }

  closeRecordingDetails() {
    this.selectedRecording = null;
    this.recordingDetails = null;
  }

  async deleteRecording(recordingId: string) {
    try {
      await this.recordingService.deleteRecording(recordingId).toPromise();
      this.loadRecordings();
      this.closeRecordingDetails();
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  }
}
