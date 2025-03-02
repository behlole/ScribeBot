import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Recording} from "../../../../types/interfaces";

@Component({
  selector: 'app-recordings-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="side-pane">
      <div class="pane-header">
        <h2 class="pane-title">Recording History</h2>
        <div class="search-container">
          <input
            type="text"
            [(ngModel)]="patientNameFilter"
            placeholder="Search by patient"
            class="search-input"
            (keyup.enter)="onApplyFilters()"
          />
          <button class="search-button" (click)="onApplyFilters()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="recordings-list">
        <div class="loading-indicator" *ngIf="isLoading">
          <div class="spinner"></div>
          <span>Loading recordings...</span>
        </div>

        <div class="empty-list" *ngIf="!isLoading && (!recordings || recordings.length === 0)">
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
          [class.selected]="selectedRecordingId === recording.id"
          (click)="onSelectRecording(recording)"
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
  `,
  styleUrl:'recording-list.css'
})
export class RecordingsListComponent {
  @Input() recordings: Recording[] = [];
  @Input() isLoading: boolean = false;
  @Input() selectedRecordingId: string | undefined;
  @Output() selectRecording = new EventEmitter<Recording>();
  @Output() applyFilters = new EventEmitter<{ patientName?: string, type?: string }>();

  patientNameFilter: string = '';
  typeFilter: string = '';

  onSelectRecording(recording: Recording) {
    this.selectRecording.emit(recording);
  }

  onApplyFilters() {
    this.applyFilters.emit({
      patientName: this.patientNameFilter,
      type: this.typeFilter
    });
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
