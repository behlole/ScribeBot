import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../services/AuthService.service";
import {RecordingComponent} from "./components/recording.component";
import {RecordingService} from "../../services/Recording.service";
import {Subscription} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {environment} from "../../../environments/environments";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

interface Recording {
  id: string;
  folderName: string;
  patientName?: string;
  patientId?: string;
  type?: string;
  date: string;
  status: string;
  audioFileId?: string;
  thumbnailLink?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RecordingComponent, FormsModule],
  template: `
    <div class="dashboard">
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
              <button (click)="logout()" class="logout-button">
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

      <div class="dashboard-layout">
        <!-- Side pane for recordings list -->
        <div class="side-pane">
          <div class="pane-header">
            <h2 class="pane-title">Recording History</h2>
            <div class="search-container">
              <input
                type="text"
                [(ngModel)]="patientNameFilter"
                placeholder="Search by patient"
                class="search-input"
                (keyup.enter)="applyFilters()"
              />
              <button class="search-button" (click)="applyFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="recordings-list">
            <div class="loading-indicator" *ngIf="isLoadingRecordings">
              <div class="spinner"></div>
              <span>Loading recordings...</span>
            </div>

            <div class="empty-list" *ngIf="!isLoadingRecordings && (!recordings || recordings.length === 0)">
              <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                <path d="M14.5 4 20 9.5 14.5 15"/>
                <path d="M14.5 20 20 14.5 14.5 9"/>
                <path d="M10 13l4-7"/>
                <path d="M6 8h6"/>
                <path d="M7 12h6"/>
                <path d="M7 16h6"/>
              </svg>
              <p>No recordings found</p>
            </div>

            <div
              *ngFor="let recording of recordings"
              class="recording-item"
              [class.selected]="selectedRecording?.id === recording.id"
              (click)="selectRecording(recording)"
            >
              <div class="recording-patient">
                <span class="patient-name">{{ recording.patientName || 'Unknown Patient' }}</span>
                <span class="recording-date">{{ formatDate(recording.date) }}</span>
              </div>
              <div class="recording-details">
                <span class="type-badge">{{ getTypeLabel(recording.type) }}</span>
                <span
                  class="status-badge"
                  [ngClass]="{
                    'status-completed': recording.status === 'completed',
                    'status-processing': recording.status === 'processing',
                    'status-error': recording.status === 'error',
                    'status-incomplete': recording.status === 'incomplete' || recording.status === 'unknown'
                  }"
                >
                  {{ getStatusLabel(recording.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main content area -->
        <main class="dashboard-content">
          @if (!selectedRecording) {
            <!-- Show recording component when no recording is selected -->
            <app-recording/>
          } @else {
            <!-- Show recording details when a recording is selected -->
            <div class="recording-details-panel">
              <div class="details-header">
                <h2 class="details-title">Recording Details</h2>
                <button class="close-button" (click)="closeRecordingDetails()">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="details-loading" *ngIf="isLoadingDetails">
                <div class="spinner"></div>
                <span>Loading details...</span>
              </div>

              <div class="details-content" *ngIf="!isLoadingDetails && recordingDetails">
                <div class="patient-section">
                  <div class="patient-info">
                    <h3 class="patient-header">
                      {{ recordingDetails.patientInfo?.patientName || selectedRecording.patientName || 'Unknown Patient' }}
                    </h3>
                    <div class="patient-metadata">
                      <div class="metadata-item" *ngIf="recordingDetails.patientInfo?.patientId">
                        <span class="metadata-label">Patient ID:</span>
                        <span class="metadata-value">{{ recordingDetails.patientInfo.patientId }}</span>
                      </div>
                      <div class="metadata-item">
                        <span class="metadata-label">Consultation Type:</span>
                        <span class="metadata-value">{{ getTypeLabel(recordingDetails.patientInfo?.type || selectedRecording.type) }}</span>
                      </div>
                      <div class="metadata-item">
                        <span class="metadata-label">Date:</span>
                        <span class="metadata-value">{{ formatDate(recordingDetails.patientInfo?.recordingDate || selectedRecording.date) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="audio-section" *ngIf="recordingDetails.audioFileId">
                  <h3 class="section-header">Audio Recording</h3>
                  <div class="audio-player-container" *ngIf="audioBlob">
                    <audio controls class="audio-player">
                      <source [src]="audioBlob" type="audio/wav">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>

                <div class="transcript-section">
                  <h3 class="section-header">Transcript</h3>
                  <div class="transcript-content" *ngIf="recordingDetails.transcript">
                    <p class="transcript-text">{{ recordingDetails.transcript }}</p>
                  </div>
                  <div class="no-content" *ngIf="!recordingDetails.transcript">
                    <p>No transcript available</p>
                  </div>
                </div>

                <div class="summary-section">
                  <h3 class="section-header">Summary</h3>
                  <div class="summary-content" *ngIf="recordingDetails.summary">
                    <p class="summary-text">{{ recordingDetails.summary }}</p>
                  </div>
                  <div class="no-content" *ngIf="!recordingDetails.summary">
                    <p>No summary available</p>
                  </div>
                </div>

                <div class="details-actions">
                  <button class="delete-button" (click)="deleteRecording(selectedRecording.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-icon">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete Recording
                  </button>
                </div>
              </div>
            </div>
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

    .dashboard-header {
      background: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .session-timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .timer-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .doctor-badge {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background-color: #f8fafc;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }

    .badge-icon {
      background-color: #0ea5e9;
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .profile-image {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      border: 2px solid #e2e8f0;
    }

    .doctor-info {
      display: flex;
      flex-direction: column;
    }

    .doctor-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .doctor-specialty {
      color: #64748b;
      font-size: 0.75rem;
    }

    .logout-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      background-color: #fee2e2;
      color: #ef4444;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-button:hover {
      background-color: #fecaca;
    }

    .logout-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .timers {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .recording-timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .recording-timer.paused {
      color: #f59e0b;
    }

    .recording-timer .timer-icon {
      animation: pulse 2s infinite;
    }

    .recording-timer.paused .timer-icon {
      animation: none;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }

    /* Dashboard layout */
    .dashboard-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Side pane styles */
    .side-pane {
      width: 300px;
      background-color: white;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .pane-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .pane-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.75rem 0;
    }

    .search-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .search-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background-color: #0ea5e9;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .search-icon {
      width: 1rem;
      height: 1rem;
    }

    .recordings-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .recording-item {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 0.375rem;
      background-color: #f8fafc;
      cursor: pointer;
      transition: all 0.2s;
    }

    .recording-item:hover {
      background-color: #f1f5f9;
    }

    .recording-item.selected {
      background-color: #e0f2fe;
      border-left: 3px solid #0ea5e9;
    }

    .recording-patient {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.5rem;
    }

    .patient-name {
      font-weight: 500;
      color: #0f172a;
      font-size: 0.875rem;
    }

    .recording-date {
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .recording-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .type-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      background-color: #e0f2fe;
      color: #0369a1;
      border-radius: 0.25rem;
    }

    .status-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }

    .status-completed {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-processing {
      background-color: #e0f2fe;
      color: #0c4a6e;
    }

    .status-error {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .status-incomplete {
      background-color: #fef3c7;
      color: #92400e;
    }

    .loading-indicator,
    .empty-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: #64748b;
      text-align: center;
    }

    .spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid #e2e8f0;
      border-top-color: #0ea5e9;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin-bottom: 0.75rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    /* Main content area */
    .dashboard-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }

    /* Recording details styling */
    .recording-details-panel {
      background-color: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .details-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
    }

    .close-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .details-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
    }

    .patient-section {
      margin-bottom: 1.5rem;
    }

    .patient-header {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.75rem 0;
    }

    .patient-metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .metadata-item {
      display: flex;
      gap: 0.5rem;
    }

    .metadata-label {
      color: #64748b;
      font-weight: 500;
    }

    .metadata-value {
      color: #0f172a;
    }

    .audio-section,
    .transcript-section,
    .summary-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 0.375rem;
    }

    .section-header {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.75rem 0;
    }

    .audio-player-container {
      padding: 0.5rem;
      background-color: white;
      border-radius: 0.375rem;
      border: 1px solid #e2e8f0;
    }

    .audio-player {
      width: 100%;
    }

    .transcript-content,
    .summary-content {
      max-height: 200px;
      overflow-y: auto;
      background-color: white;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #e2e8f0;
    }

    .transcript-text,
    .summary-text {
      margin: 0;
      line-height: 1.6;
      font-size: 0.875rem;
      white-space: pre-wrap;
    }

    .no-content {
      color: #64748b;
      font-style: italic;
      text-align: center;
      padding: 1rem;
    }

    .details-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .delete-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #fee2e2;
      color: #ef4444;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .delete-button:hover {
      background-color: #fecaca;
    }

    .delete-icon {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser$ = this.authService.currentUser$;
  private sessionTimer: any;
  sessionDuration: string = '00:00';
  private sessionSeconds = 0;
  audioBlob: SafeUrl | null = null;

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
  patientNameFilter = '';
  typeFilter = '';

  private recordingSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private recordingService: RecordingService,
    private sanitizer: DomSanitizer

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

  formatRecordingTime(ms: number): string {
    return RecordingService.formatElapsedTime(ms);
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
  async loadRecordings() {
    this.isLoadingRecordings = true;
    try {
      const filters = {
        patientName: this.patientNameFilter,
        type: this.typeFilter
      };

      this.recordings = await this.recordingService.getAllRecordings(filters).toPromise();
      return this.recordings
    } catch (error) {
      return 'Invalid date';
    }
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return 'Unknown';

    const types: Record<string, string> = {
      'initial': 'Initial',
      'followUp': 'Follow-up',
      'specialist': 'Specialist',
      'emergency': 'Emergency',
      'telehealth': 'Telehealth'
    };

    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      case 'incomplete':
      case 'unknown':
      default:
        return 'Incomplete';
    }
  }

  applyFilters() {
    this.loadRecordings();
  }

  async selectRecording(recording: Recording) {
    this.selectedRecording = recording;
    this.loadRecordingDetails(recording.id);
  }

  async loadAudioFile(fileId: string) {
    if (!fileId) return;

    try {
      const blob = await this.recordingService.getAudioFile(fileId).toPromise();
      this.audioBlob = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob!));
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  }

// Call this when loading recording details
  async loadRecordingDetails(recordingId: string) {
    this.isLoadingDetails = true;
    try {
      this.recordingDetails = await this.recordingService.getRecordingResults(recordingId).toPromise();

      // Load audio file if available
      if (this.recordingDetails?.audioFileId) {
        await this.loadAudioFile(this.recordingDetails.audioFileId);
      }
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
    if (confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      try {
        await this.recordingService.deleteRecording(recordingId).toPromise();
        // Refresh the recordings list after deletion
        this.loadRecordings();
        this.closeRecordingDetails();
      } catch (error) {
        console.error('Failed to delete recording:', error);
      }
    }
  }

  getAudioUrl(audioFileId: string): string {
    const audioUrl = `${environment.apiUrl}/recording/audio/${audioFileId}`;
    console.log('Audio URL:', audioUrl);
    return audioUrl;
  }



  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString
    }
  }
}
