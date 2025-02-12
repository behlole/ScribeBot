// src/app/components/recording/recording.component.ts
import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecordingResult, RecordingService} from "../../../services/Recording.service";

@Component({
  selector: 'app-recording',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recording-container">
      <div class="status-indicator">
        @switch (recordingStatus$ | async) {
          @case ('inactive') {
            <button (click)="startNewRecording()" class="start-button">
              Start Recording
            </button>
          }
          @case ('recording') {
            <button (click)="stopCurrentRecording()" class="stop-button">
              Stop Recording
            </button>
          }
          @case ('processing') {
            <div class="processing">Processing recording...</div>
          }
        }
      </div>

      @if (result) {
        <div class="results">
          <h3>Transcript</h3>
          <p>{{ result.transcript }}</p>

          <h3>Summary</h3>
          <p>{{ result.summary }}</p>

          <button (click)="deleteRecording()" class="delete-button">
            Delete Recording
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .recording-container {
      padding: 20px;
    }

    .status-indicator {
      margin-bottom: 20px;
    }

    button {
      padding: 10px 20px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
    }

    .start-button {
      background-color: #4CAF50;
      color: white;
    }

    .stop-button {
      background-color: #f44336;
      color: white;
    }

    .processing {
      color: #666;
    }

    .results {
      margin-top: 20px;
    }
  `]
})
export class RecordingComponent implements OnDestroy {
  recordingStatus$ = this.recordingService.recordingStatus$;
  currentRecordingId: string | null = null;
  result: RecordingResult | null = null;

  constructor(private recordingService: RecordingService) {
  }

  async startNewRecording() {
    try {
      this.currentRecordingId = await this.recordingService.startRecording();
      await this.recordingService.initializeRecording(this.currentRecordingId);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopCurrentRecording() {
    if (!this.currentRecordingId) return;

    try {
      this.result = await this.recordingService.stopRecording(this.currentRecordingId);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  async deleteRecording() {
    if (!this.currentRecordingId) return;

    try {
      await this.recordingService.deleteRecording(this.currentRecordingId).toPromise();
      this.result = null;
      this.currentRecordingId = null;
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  }

  ngOnDestroy() {
    if (this.currentRecordingId) {
      this.stopCurrentRecording();
    }
  }
}
