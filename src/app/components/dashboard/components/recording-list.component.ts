import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {RecordingService} from "../../../services/Recording.service";

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
  selector: 'app-recordings-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="recordings-container">
      <div class="recordings-header">
        <h2 class="section-title">Medical Recordings</h2>
        <div class="filters">
          <div class="filter-item">
            <input
              type="text"
              [(ngModel)]="patientNameFilter"
              placeholder="Search by patient name"
              class="search-input"
              (keyup.enter)="applyFilters()"
            />
          </div>
          <div class="filter-item">
            <select [(ngModel)]="typeFilter" class="type-select" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="initial">Initial Consultation</option>
              <option value="followUp">Follow-up</option>
              <option value="specialist">Specialist Referral</option>
              <option value="emergency">Emergency</option>
              <option value="telehealth">Telehealth</option>
            </select>
          </div>
          <button class="search-button" (click)="applyFilters()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>
      </div>

      <div class="recordings-content">
        <div class="recordings-list">
          <ng-container *ngIf="isLoading">
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Loading recordings...</span>
            </div>
          </ng-container>

          <ng-container *ngIf="!isLoading && recordings.length === 0">
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <p>No recordings found. Start a new recording to see it here.</p>
            </div>
          </ng-container>

          <ng-container *ngIf="!isLoading && recordings.length > 0">
            <div class="recording-list-header">
              <div class="recording-header-patient">Patient</div>
              <div class="recording-header-date">Date</div>
              <div class="recording-header-type">Type</div>
              <div class="recording-header-status">Status</div>
            </div>

            <div
              *ngFor="let recording of recordings"
              class="recording-item"
              [class.selected]="selectedRecording?.id === recording.id"
              (click)="selectRecording(recording)"
            >
              <div class="recording-patient">
                <div class="patient-name">{{ recording.patientName || 'Unknown Patient' }}</div>
                <div class="patient-id" *ngIf="recording.patientId">ID: {{ recording.patientId }}</div>
              </div>
              <div class="recording-date">
                {{ formatDate(recording.date) }}
              </div>
              <div class="recording-type">
                {{ getTypeLabel(recording.type) }}
              </div>
              <div class="recording-status">
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
          </ng-container>
        </div>

        <div class="recording-details" *ngIf="selectedRecording">
          <div class="details-header">
            <h3 class="details-title">Recording Details</h3>
            <button class="details-close" (click)="closeDetails()">×</button>
          </div>

          <div class="details-loading" *ngIf="isLoadingDetails">
            <div class="spinner"></div>
            <span>Loading details...</span>
          </div>

          <div class="details-content" *ngIf="!isLoadingDetails && recordingDetails">
            <div class="details-section">
              <div class="details-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-icon">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h4>Patient Information</h4>
              </div>
              <div class="details-info">
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">{{ recordingDetails.patientInfo?.patientName || selectedRecording.patientName || 'Unknown' }}</span>
                </div>
                <div class="info-row" *ngIf="recordingDetails.patientInfo?.patientId">
                  <span class="info-label">Patient ID:</span>
                  <span class="info-value">{{ recordingDetails.patientInfo.patientId }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Consultation Type:</span>
                  <span class="info-value">{{ getTypeLabel(recordingDetails.patientInfo?.type || selectedRecording.type) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">{{ formatDate(recordingDetails.patientInfo?.recordingDate || selectedRecording.date) }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <div class="details-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-icon">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <h4>Audio Recording</h4>
              </div>
              <div class="details-audio" *ngIf="recordingDetails.audioFileId">
                <audio controls class="audio-player">
                  <source [src]="getAudioUrl(recordingDetails.audioFileId)" type="audio/wav">
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div class="details-no-audio" *ngIf="!recordingDetails.audioFileId">
                <p>No audio recording available</p>
              </div>
            </div>

            <div class="details-section">
              <div class="details-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h4>Transcript</h4>
              </div>
              <div class="transcript-content" *ngIf="recordingDetails.transcript">
                <div class="transcript-text">{{ recordingDetails.transcript }}</div>
              </div>
              <div class="details-no-transcript" *ngIf="!recordingDetails.transcript">
                <p>No transcript available</p>
              </div>
            </div>

            <div class="details-section">
              <div class="details-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-icon">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h4>Summary</h4>
              </div>
              <div class="summary-content" *ngIf="recordingDetails.summary">
                <div class="summary-text">{{ recordingDetails.summary }}</div>
              </div>
              <div class="details-no-summary" *ngIf="!recordingDetails.summary">
                <p>No summary available</p>
              </div>
            </div>

            <div class="details-actions">
              <button class="delete-button" (click)="deleteRecording()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-icon">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Recording
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recordings-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #f8fafc;
    }

    .recordings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background-color: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filter-item {
      display: flex;
      flex-direction: column;
    }

    .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #334155;
      min-width: 240px;
    }

    .type-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #334155;
      background-color: white;
    }

    .search-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #0ea5e9;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    }

    .button-icon {
      width: 1rem;
      height: 1rem;
    }

    .recordings-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .recordings-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      border-right: 1px solid #e2e8f0;
      max-width: 60%;
    }

    .recording-list-header {
      display: flex;
      padding: 0.5rem 1rem;
      font-weight: 600;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.875rem;
    }

    .recording-header-patient {
      flex: 2;
    }

    .recording-header-date,
    .recording-header-type,
    .recording-header-status {
      flex: 1;
    }

    .recording-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .recording-item:hover {
      background-color: #f1f5f9;
    }

    .recording-item.selected {
      background-color: #e0f2fe;
      border-left: 3px solid #0ea5e9;
    }

    .recording-patient {
      flex: 2;
    }

    .recording-date,
    .recording-type,
    .recording-status {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .patient-name {
      font-weight: 500;
      color: #0f172a;
    }

    .patient-id {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-weight: 500;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #94a3b8;
      text-align: center;
    }

    .empty-icon {
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      color: #64748b;
    }

    .spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid #e2e8f0;
      border-top-color: #0ea5e9;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .recording-details {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background-color: white;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .details-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .details-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
    }

    .details-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem;
      color: #64748b;
    }

    .details-section {
      margin-bottom: 2rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .details-section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .details-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #0ea5e9;
    }

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
    }

    .details-info {
      padding: 1rem;
    }

    .info-row {
      display: flex;
      margin-bottom: 0.5rem;
    }

    .info-label {
      width: 120px;
      font-weight: 500;
      color: #64748b;
    }

    .info-value {
      color: #334155;
    }

    .details-audio {
      padding: 1rem;
    }

    .audio-player {
      width: 100%;
    }

    .details-no-audio,
    .details-no-transcript,
    .details-no-summary {
      padding: 1rem;
      color: #94a3b8;
      font-style: italic;
    }

    .transcript-content,
    .summary-content {
      padding: 1rem;
      max-height: 250px;
      overflow-y: auto;
    }

    .transcript-text,
    .summary-text {
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 0.875rem;
      color: #334155;
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
      transition: background-color 0.2s;
    }

    .delete-button:hover {
      background-color: #fecaca;
    }

    .delete-icon {
      width: 1rem;
      height: 1rem;
    }
  `],
})
export class RecordingsListComponent implements OnInit {
  recordings: Recording[] = [];
  selectedRecording: Recording | null = null;
  recordingDetails: any = null;
  isLoading = true;
  isLoadingDetails = false;
  patientNameFilter = '';
  typeFilter = '';

  constructor(private recordingService: RecordingService) {}

  ngOnInit(): void {
    this.loadRecordings();
  }

  async loadRecordings(): Promise<void> {
    this.isLoading = true;
    try {
      // Call the service to get recordings list
      const filters = {
        patientName: this.patientNameFilter,
        type: this.typeFilter,
      };

      this.recordings = await this.recordingService.getAllRecordings(filters).toPromise();
    } catch (error) {
      console.error('Failed to load recordings:', error);
      // Show error message
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    this.loadRecordings();
  }

  async selectRecording(recording: Recording): Promise<void> {
    this.selectedRecording = recording;
    this.loadRecordingDetails(recording.id);
  }

  async loadRecordingDetails(recordingId: string): Promise<void> {
    this.isLoadingDetails = true;
    this.recordingDetails = null;

    try {
      // Call service to get recording details
      this.recordingDetails = await this.recordingService.getRecordingResults(recordingId).toPromise();
    } catch (error) {
      console.error('Failed to load recording details:', error);
      // Show error message
    } finally {
      this.isLoadingDetails = false;
    }
  }

  closeDetails(): void {
    this.selectedRecording = null;
    this.recordingDetails = null;
  }

  async deleteRecording(): Promise<void> {
    if (!this.selectedRecording) return;

    if (confirm(`Are you sure you want to delete this recording for ${this.selectedRecording.patientName}?`)) {
      try {
        await this.recordingService.deleteRecording(this.selectedRecording.id).toPromise();
        this.closeDetails();
        this.loadRecordings();
      } catch (error) {
        console.error('Failed to delete recording:', error);
        // Show error message
      }
    }
  }

  getAudioUrl(audioFileId: string): string {
    // This will depend on your implementation for serving audio files from Google Drive
    // For example, you might have an endpoint to proxy the audio file
    return `/api/audio/${audioFileId}`;
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
    } catch (error) {
      return 'Invalid date';
    }
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return 'Unknown';

    const types: Record<string, string> = {
      'initial': 'Initial Consultation',
      'followUp': 'Follow-up',
      'specialist': 'Specialist Referral',
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
}
