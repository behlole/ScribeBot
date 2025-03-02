import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {environment} from "../../environments/environments";

export interface RecordingResult {
  transcript: string;
  summary: string;
  confidence: number;
  recordingStartTime?: string;
  duration?: string;
  metadata?: any;
  patientInfo?: PatientInfo;
  words: { word: string; startTime: number; endTime: number; }[];
}

export interface RecordingState {
  status: 'inactive' | 'recording' | 'paused' | 'processing';
  elapsedTime: number; // in milliseconds
}

export interface PatientInfo {
  name: string;
  id?: string;
}

export interface RecordingResponse {
  recordingId: string;
  message: string;
  folderPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingState = new BehaviorSubject<RecordingState>({
    status: 'inactive',
    elapsedTime: 0
  });

  public recordingState$ = this.recordingState.asObservable();

  private startTime: number = 0;
  private pausedTime: number = 0;
  private timerInterval: any;
  private isPaused: boolean = false;
  private currentPatientInfo: PatientInfo | null = null;

  constructor(private http: HttpClient) {
  }

  /**
   * Starts a new recording session with optional patient information
   * @param patientInfo Optional patient information to include with the recording
   * @returns Promise containing the recording ID
   */
  async startRecording(patientInfo?: PatientInfo): Promise<string> {
    // Store patient info for later use
    this.currentPatientInfo = patientInfo || null;

    // Send request to create recording with patient info
    const response = await this.http.post<RecordingResponse>(
      `${environment.apiUrl}/recording/start`,
      { patientInfo }
    ).toPromise();

    this.startTime = Date.now();
    this.pausedTime = 0;
    this.startTimer();

    return response!.recordingId;
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime - this.pausedTime;

        this.recordingState.next({
          status: this.recordingState.value.status,
          elapsedTime: elapsedTime
        });
      }
    }, 100); // Update every 100ms for smooth timer
  }

  async initializeRecording(recordingId: string): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(stream);
      this.isPaused = false;

      this.recordingState.next({
        status: 'recording',
        elapsedTime: 0
      });

      let chunkNumber = 0;
      let pauseStartTime: number | null = null;

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && !this.isPaused) {
          await this.uploadChunk(recordingId, event.data, chunkNumber++);
        }
      };

      this.mediaRecorder.start(1000); // Capture in 1-second chunks
    } catch (error) {
      console.error('Failed to initialize recording:', error);
      throw error;
    }
  }

  async pauseRecording(): Promise<void> {
    if (!this.mediaRecorder || this.isPaused) return;

    this.isPaused = true;
    const pauseStartTime = Date.now();

    this.recordingState.next({
      status: 'paused',
      elapsedTime: this.recordingState.value.elapsedTime
    });
  }

  async resumeRecording(): Promise<void> {
    if (!this.mediaRecorder || !this.isPaused) return;

    this.isPaused = false;
    this.pausedTime += Date.now() - (this.startTime + this.recordingState.value.elapsedTime);

    this.recordingState.next({
      status: 'recording',
      elapsedTime: this.recordingState.value.elapsedTime
    });
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

    clearInterval(this.timerInterval);
    this.recordingState.next({
      status: 'processing',
      elapsedTime: this.recordingState.value.elapsedTime
    });

    this.mediaRecorder.stop();
    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    this.mediaRecorder = null;
    this.isPaused = false;

    // Include session duration and patient info in stop request
    const sessionInfo = {
      duration: RecordingService.formatElapsedTime(this.recordingState.value.elapsedTime),
      patientInfo: this.currentPatientInfo
    };

    const result = await this.http.post<RecordingResult>(
      `${environment.apiUrl}/recording/stop/${recordingId}`,
      sessionInfo
    ).toPromise();

    // Add patient info to the result
    if (result && this.currentPatientInfo) {
      result.patientInfo = this.currentPatientInfo;
    }

    this.recordingState.next({
      status: 'inactive',
      elapsedTime: 0
    });

    // Reset current patient info
    this.currentPatientInfo = null;

    return result!;
  }

  getRecordingResults(recordingId: string): Observable<RecordingResult> {
    return this.http.get<RecordingResult>(`${environment.apiUrl}/recording/${recordingId}`);
  }

  deleteRecording(recordingId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/recording/${recordingId}`);
  }

  /**
   * Get a list of all recordings, optionally filtered by patient name
   * @param patientName Optional patient name to filter by
   */
  getRecordings(patientName?: string): Observable<any[]> {
    let url = `${environment.apiUrl}/recordings`;
    if (patientName) {
      url += `?patientName=${encodeURIComponent(patientName)}`;
    }
    return this.http.get<any[]>(url);
  }

  static formatElapsedTime(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);

    return hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getAllRecordings(filters?: { patientName?: string; type?: string }): Observable<any[]> {
    // Build query parameters for filtering
    let params = new HttpParams();

    if (filters?.patientName) {
      params = params.set('patientName', filters.patientName);
    }

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    // Make HTTP request to the backend API endpoint
    return this.http.get<any[]>(`${environment.apiUrl}/recording/list`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching recordings:', error);
          // Return empty array on error
          return of([]);
        })
      );
  }


  getAudioFile(fileId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/recording/audio/${fileId}`, {
      responseType: 'blob'
    });
  }
}
