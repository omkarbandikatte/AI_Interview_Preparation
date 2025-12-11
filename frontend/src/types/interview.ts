export type InterviewStage = 'upload' | 'ready' | 'interviewing' | 'feedback';

export interface InterviewMessage {
  from: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface ResumeData {
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  extractedSections: any;
}

export interface FeedbackData {
  overallScore: number;
  evaluation: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  duration: number;
}

export interface InterviewState {
  stage: InterviewStage;
  resume: ResumeData | null;
  isMicActive: boolean;
  isProcessing: boolean;
  feedback: FeedbackData | null;
  interviewStartTime: Date | null;
  // conversational state while interviewing
  conversation: InterviewMessage[];
  currentQuestion: string | null;
  lastError: string | null;
}
