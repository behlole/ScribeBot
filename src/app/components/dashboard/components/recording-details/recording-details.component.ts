import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {RecordingService} from "../../../../services/Recording.service";
import {Recording, RecordingDetails} from "../../../../types/interfaces";

@Component({
  selector: 'app-recording-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recording-details-panel">
      <div class="details-header">
        <h2 class="details-title">Recording Details</h2>
        <button class="close-button" (click)="onClose()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="details-loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <span>Loading details...</span>
      </div>

      <div class="details-content" *ngIf="!isLoading && recordingDetails">
        <div class="patient-section">
          <div class="patient-info">
            <h3 class="patient-header">
              {{ recordingDetails.patientInfo?.patientName || recording.patientName || 'Unknown Patient' }}
            </h3>
            <div class="patient-metadata">
              <div class="metadata-item" *ngIf="recordingDetails.patientInfo?.patientId || recording.patientId">
                <span class="metadata-label">Patient ID:</span>
                <span class="metadata-value">{{ recordingDetails.patientInfo?.patientId || recording.patientId }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Consultation Type:</span>
                <span class="metadata-value">{{ getTypeLabel(recordingDetails.patientInfo?.type || recording.type) }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Date:</span>
                <span class="metadata-value">{{ formatDate(recordingDetails.patientInfo?.recordingDate || recording.date) }}</span>
              </div>
              <div class="metadata-item" *ngIf="recordingDetails.duration">
                <span class="metadata-label">Duration:</span>
                <span class="metadata-value">{{ recordingDetails.duration }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Status:</span>
                <span class="metadata-value">{{ getStatusLabel(recording.status) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="audio-section" *ngIf="recordingDetails.audioFileId || recording.audioFileId">
          <h3 class="section-header">Audio Recording</h3>
          <div class="audio-player-container" *ngIf="audioBlob">
            <audio controls class="audio-player">
              <source [src]="audioBlob" type="audio/wav">
              Your browser does not support the audio element.
            </audio>
          </div>
          <div class="no-content" *ngIf="!audioBlob">
            <p>Loading audio file...</p>
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
          <button class="delete-button" (click)="onDelete()">
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
  `,
  styleUrl:'recording-details.css'
})
export class RecordingDetailsComponent implements OnChanges {
  @Input() recording!: Recording;
  @Input() recordingDetails!: RecordingDetails;
  @Input() isLoading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  audioBlob: SafeUrl | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private recordingService: RecordingService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recording'] || changes['recordingDetails']) {
      this.loadAudioFile();
    }
  }

  async loadAudioFile() {
    const audioFileId = this.recordingDetails?.audioFileId || this.recording?.audioFileId;
    if (!audioFileId) return;

    try {
      const blob = await this.recordingService.getAudioFile(audioFileId).toPromise();
      if (blob) {
        this.audioBlob = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  }

  onClose() {
    this.close.emit();
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      this.delete.emit(this.recording.id);
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
      return dateString;
    }
  }
}
