import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecordingResult, RecordingService} from "../../../services/Recording.service";
import {MarkdownModule} from 'ngx-markdown';
import {FormsModule} from '@angular/forms';

interface RecordingMetadata {
  doctorName: string;
  patientName: string;
  patientId: string;
  consultationType: string;
  duration: string;
}

@Component({
  selector: 'app-recording',
  standalone: true,
  imports: [CommonModule, MarkdownModule, FormsModule],
  template: `
    <div class="recording-container">
      <div class="control-panel">
        <div class="panel-header">
          <svg xmlns="http://www.w3.org/2000/svg" class="panel-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <h2 class="panel-title">Consultation Recording</h2>
          @if (recordingDuration !== '00:00') {
            <span class="recording-time">{{ recordingDuration }}</span>
          }
        </div>

        <!-- Patient Info Form (only visible when not recording) -->
        @if ((recordingStatus$ | async)?.status === 'inactive') {
          <div class="patient-info-form">
            <h3 class="form-title">Patient Information</h3>
            <div class="form-fields">
              <div class="form-field">
                <label for="patientName">Patient Name</label>
                <input
                  type="text"
                  id="patientName"
                  [(ngModel)]="recordingMetadata.patientName"
                  placeholder="Enter patient name"
                  required
                >
              </div>
              <div class="form-field">
                <label for="patientId">Patient ID (optional)</label>
                <input
                  type="text"
                  id="patientId"
                  [(ngModel)]="recordingMetadata.patientId"
                  placeholder="Enter patient ID"
                >
              </div>
              <div class="form-field">
                <label for="consultationType">Consultation Type</label>
                <select id="consultationType" [(ngModel)]="recordingMetadata.consultationType">
                  <option value="initial">Initial Consultation</option>
                  <option value="followUp">Follow-up</option>
                  <option value="specialist">Specialist Referral</option>
                  <option value="emergency">Emergency</option>
                  <option value="telehealth">Telehealth</option>
                </select>
              </div>
            </div>
          </div>
        }

        <div class="recording-controls">
          @switch ((recordingStatus$ | async)?.status) {
            @case ('inactive') {
              <button
                (click)="startNewRecording()"
                class="start-button"
                [disabled]="!recordingMetadata.patientName"
                [class.disabled]="!recordingMetadata.patientName"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" class="button-icon-circle"/>
                  <circle cx="12" cy="12" r="3" class="button-icon-dot"/>
                </svg>
                Start Consultation
              </button>
              @if (!recordingMetadata.patientName) {
                <div class="info-message">
                  <svg xmlns="http://www.w3.org/2000/svg" class="info-icon" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Please enter patient name to start recording
                </div>
              }
            }
            @case ('recording') {
              <div class="recording-status">
                <div class="status-indicator">
                  <div class="pulse-dot" [class.paused]="isPaused"></div>
                  <span>Recording {{ isPaused ? 'Paused' : 'in Progress' }}</span>
                </div>
                <div class="patient-recording-info">
                  Recording for: <strong>{{ recordingMetadata.patientName }}</strong>
                  @if (recordingMetadata.patientId) {
                    (ID: {{ recordingMetadata.patientId }})
                  }
                </div>
                <div class="recording-buttons">
                  @if (!isPaused) {
                    <button (click)="pauseRecording()" class="pause-button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                      Pause
                    </button>
                  } @else {
                    <button (click)="resumeRecording()" class="resume-button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21"/>
                      </svg>
                      Resume
                    </button>
                  }
                  <button (click)="stopCurrentRecording()" class="stop-button">
                    <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                    End Consultation
                  </button>
                </div>
              </div>
            }
            @case ('paused') {
              <div class="recording-status">
                <div class="status-indicator">
                  <div class="pulse-dot" [class.paused]="isPaused"></div>
                  <span>Recording {{ isPaused ? 'Paused' : 'in Progress' }}</span>
                </div>
                <div class="patient-recording-info">
                  Recording for: <strong>{{ recordingMetadata.patientName }}</strong>
                  @if (recordingMetadata.patientId) {
                    (ID: {{ recordingMetadata.patientId }})
                  }
                </div>
                <div class="recording-buttons">
                  @if (!isPaused) {
                    <button (click)="pauseRecording()" class="pause-button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                      Pause
                    </button>
                  } @else {
                    <button (click)="resumeRecording()" class="resume-button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21"/>
                      </svg>
                      Resume
                    </button>
                  }
                  <button (click)="stopCurrentRecording()" class="stop-button">
                    <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                    End Consultation
                  </button>
                </div>
              </div>
            }
            @case ('processing') {
              <div class="processing-status">
                <div class="spinner"></div>
                <span>Processing consultation recording...</span>
              </div>
            }
          }
        </div>

        @if (errorMessage) {
          <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" class="error-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12" y2="16"/>
            </svg>
            {{ errorMessage }}
          </div>
        }
      </div>

      @if (result) {
        <div class="results-panel">
          <div class="result-header">
            <h2 class="result-title">Consultation Report</h2>
            <div class="patient-info-summary">
              <div class="patient-info-item">
                <span class="info-label">Patient:</span>
                <span class="info-value">{{ recordingMetadata.patientName }}</span>
              </div>
              @if (recordingMetadata.patientId) {
                <div class="patient-info-item">
                  <span class="info-label">ID:</span>
                  <span class="info-value">{{ recordingMetadata.patientId }}</span>
                </div>
              }
              <div class="patient-info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">{{ getConsultationTypeLabel(recordingMetadata.consultationType) }}</span>
              </div>
              <div class="patient-info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">{{ result.recordingStartTime | date:'medium' }}</span>
              </div>
            </div>
          </div>

          <div class="transcript-section">
            <div class="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" class="section-icon" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h3>Consultation Transcript</h3>
            </div>
            <div class="transcript-content">
              {{ result.transcript }}
            </div>
          </div>

          <div class="summary-section">
            <div class="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" class="section-icon" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <h3>Consultation Summary</h3>
            </div>
            <div class="summary-content">
              <markdown [data]="result.summary"></markdown>
            </div>
            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Duration:</span>
                <span class="metadata-value">{{ result.duration }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Start Time:</span>
                <span class="metadata-value">
                  {{ result.recordingStartTime | date:'medium' }}
                </span>
              </div>
            </div>

            <div class="actions">
              <button (click)="deleteRecording()" class="delete-button">
                <svg xmlns="http://www.w3.org/2000/svg" class="delete-icon" viewBox="0 0 24 24">
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
    </div>
  `,
  styles: [`
    .recording-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .control-panel {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .panel-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #0ea5e9;
    }

    .panel-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-right: auto;
    }

    .recording-time {
      color: #64748b;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Patient Info Form Styles */
    .patient-info-form {
      background-color: #f8fafc;
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }

    .form-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .form-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .form-field input, .form-field select {
      padding: 0.625rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #334155;
      background-color: white;
    }

    .form-field input:focus, .form-field select:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
    }

    .patient-recording-info {
      margin: 0.5rem 0;
      font-size: 0.875rem;
      color: #475569;
    }

    .info-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: #0ea5e9;
    }

    .info-icon {
      width: 1rem;
      height: 1rem;
    }

    .recording-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .button-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .button-icon-circle {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    .button-icon-dot {
      fill: currentColor;
    }

    .start-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #22c55e;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .start-button:hover:not(.disabled) {
      background-color: #16a34a;
    }

    .start-button.disabled {
      background-color: #a3e635;
      opacity: 0.6;
      cursor: not-allowed;
    }

    .recording-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      font-weight: 500;
    }

    .pulse-dot {
      width: 0.75rem;
      height: 0.75rem;
      background-color: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .pulse-dot.paused {
      animation-play-state: paused;
      opacity: 0.5;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        opacity: 0.5;
      }
      50% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(0.95);
        opacity: 0.5;
      }
    }

    .recording-buttons {
      display: flex;
      gap: 1rem;
    }

    .pause-button,
    .resume-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pause-button:hover,
    .resume-button:hover {
      background-color: #4f46e5;
    }

    .stop-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .stop-button:hover {
      background-color: #dc2626;
    }

    .processing-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #0ea5e9;
      font-weight: 500;
    }

    .spinner {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #fef2f2;
      color: #ef4444;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    /* Results panel styles */
    .results-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .result-header {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .result-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .patient-info-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      background-color: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
    }

    .patient-info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }

    .info-value {
      color: #0f172a;
      font-size: 0.875rem;
    }

    .transcript-section,
    .summary-section {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      color: #1e293b;
    }

    .section-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #0ea5e9;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .transcript-content,
    .summary-content {
      background-color: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      color: #334155;
      line-height: 1.6;
      font-size: 0.875rem;
    }

    .metadata {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .metadata-item {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .metadata-label {
      font-weight: 500;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
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
export class RecordingComponent {
  constructor(private recordingService: RecordingService) {
  }

  recordingStatus$ = this.recordingService.recordingState$;
  currentRecordingId: string | null = null;
  result: RecordingResult | null = null;

  // Timer related properties
  private timerInterval: any;
  recordingDuration: string = '00:00';
  private elapsedSeconds = 0;
  isPaused = false;

  // Error handling
  errorMessage: string | null = null;

  // Recording metadata
  recordingStartTime: Date | null = null;
  recordingMetadata: RecordingMetadata = {
    doctorName: '',
    patientName: '',
    patientId: '',
    consultationType: 'initial',
    duration: ''
  };

  // Helper method to get readable consultation type label
  getConsultationTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'initial': 'Initial Consultation',
      'followUp': 'Follow-up',
      'specialist': 'Specialist Referral',
      'emergency': 'Emergency',
      'telehealth': 'Telehealth'
    };
    return types[type] || type;
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

  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds++;
        this.recordingDuration = this.formatTime(this.elapsedSeconds);
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.recordingMetadata.duration = this.recordingDuration;
    }
  }

  private resetTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.recordingDuration = '00:00';
    this.isPaused = false;
  }

  private handleError(error: any, message: string) {
    console.error(message, error);
    this.errorMessage = `Error: ${message}. Please try again.`;
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  async startNewRecording() {
    // Validate required patient info
    if (!this.recordingMetadata.patientName) {
      this.errorMessage = 'Patient name is required to start recording';
      return;
    }

    try {
      this.resetTimer();
      this.errorMessage = null;
      this.result = null;
      this.isPaused = false;

      // Prepare patient info object
      const patientInfo = {
        name: this.recordingMetadata.patientName,
        id: this.recordingMetadata.patientId || undefined,
        type: this.getConsultationTypeLabel(this.recordingMetadata.consultationType)
      };

      // Start recording on the server with patient info
      this.currentRecordingId = await this.recordingService.startRecording(patientInfo);

      // Initialize media recording
      await this.recordingService.initializeRecording(this.currentRecordingId);

      this.recordingStartTime = new Date();
      this.startTimer();
    } catch (error) {
      this.handleError(error, 'Failed to start recording. Please check your microphone permissions.');
      this.currentRecordingId = null;
    }
  }

  async stopCurrentRecording() {
    if (!this.currentRecordingId) return;

    try {
      this.stopTimer();
      this.result = await this.recordingService.stopRecording(this.currentRecordingId);

      // Add metadata to the result
      if (this.result) {
        this.result = {
          ...this.result,
          recordingStartTime: this.recordingStartTime?.toISOString(),
          duration: this.recordingDuration,
          metadata: {
            ...this.recordingMetadata,
            // Add any additional metadata you want to include in the result
          }
        };
      }

    } catch (error) {
      this.handleError(error, 'Failed to stop recording');
    }
  }

  async pauseRecording() {
    if (!this.currentRecordingId) return;

    try {
      this.isPaused = true;
      await this.recordingService.pauseRecording();
    } catch (error) {
      this.handleError(error, 'Failed to pause recording');
    }
  }

  async resumeRecording() {
    if (!this.currentRecordingId) return;

    try {
      this.isPaused = false;
      await this.recordingService.resumeRecording();
    } catch (error) {
      this.handleError(error, 'Failed to resume recording');
    }
  }

  async deleteRecording() {
    if (!this.currentRecordingId && !this.result) return;

    try {
      if (this.currentRecordingId) {
        await this.recordingService.deleteRecording(this.currentRecordingId).toPromise();
      }

      this.result = null;
      this.currentRecordingId = null;
      this.resetTimer();
      this.recordingStartTime = null;
    } catch (error) {
      this.handleError(error, 'Failed to delete recording');
    }
  }
}
