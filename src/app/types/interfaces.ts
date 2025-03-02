export interface Recording {
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

export interface RecordingDetails {
  transcript: string;
  summary: string;
  patientInfo?: {
    patientName?: string;
    patientId?: string;
    type?: string;
    recordingDate?: string;
  };
  audioFileId?: string;
  duration?: string;
}
