// src/app/services/recording.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from "../../environments/environments";

export interface RecordingResult {
  transcript: string;
  summary: string;
  confidence: number;
  words: { word: string; startTime: number; endTime: number; }[];
}

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingStatus = new BehaviorSubject<'inactive' | 'recording' | 'processing'>('inactive');
  recordingStatus$ = this.recordingStatus.asObservable();

  constructor(private http: HttpClient) {
  }

  async startRecording(): Promise<string> {
    const response = await this.http.post<{ recordingId: string }>(
      `${environment.apiUrl}/recording/start`,
      {}
    ).toPromise();

    return response!.recordingId;
  }

  async initializeRecording(recordingId: string): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordingStatus.next('recording');

      let chunkNumber = 0;
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await this.uploadChunk(recordingId, event.data, chunkNumber++);
        }
      };

      this.mediaRecorder.start(10000); // Capture in 1-second chunks
    } catch (error) {
      console.error('Failed to initialize recording:', error);
      throw error;
    }
  }

  private async uploadChunk(recordingId: string, chunk: Blob, chunkNumber: number): Promise<void> {
    const formData = new FormData();
    formData.append('audio', chunk);

    await this.http.post(
      `${environment.apiUrl}/recording/chunk/${recordingId}/${chunkNumber}`,
      formData
    ).toPromise();
  }

  async stopRecording(recordingId: string): Promise<RecordingResult> {
    if (!this.mediaRecorder) {
      throw new Error('No active recording');
    }

    this.recordingStatus.next('processing');
    this.mediaRecorder.stop();
    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    this.mediaRecorder = null;

    const result = await this.http.post<RecordingResult>(
      `${environment.apiUrl}/recording/stop/${recordingId}`,
      {}
    ).toPromise();

    this.recordingStatus.next('inactive');
    return result!;
  }

  getRecordingResults(recordingId: string): Observable<RecordingResult> {
    return this.http.get<RecordingResult>(`${environment.apiUrl}/recording/${recordingId}`);
  }

  deleteRecording(recordingId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/recording/${recordingId}`);
  }
}
