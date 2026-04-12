import { Database } from '../../../shared/types/supabase';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

export interface Option {
  id: string;
  text: string;
  text_bn?: string; 
  isCorrect?: boolean; 
}

export interface MediaLibrary {
  file_url: string;
}

export interface Comprehension {
  id: string;
  body: string; 
  image_url?: string;
  media_library?: MediaLibrary; 
}

export interface Question extends Omit<QuestionRow, 'options' | 'body' | 'exam_references' | 'explanation'> {
  options: Option[]; 
  comprehension?: Comprehension; 
  image_url?: string; 
  media_library?: MediaLibrary; 
  marks?: number;     
  board_ref?: string | null;
  text?: string;
  text_bn?: string; 
  body?: { text?: string; text_bn?: string } | string | null; 
  exam_references?: unknown; 
  explanation?: string | null; 
}

export interface ExamState {
  answers: Record<string, string>; 
  timeRemaining: number;
  isSubmitted: boolean;
}

export interface ExamResultData {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpentSeconds: number;
  questions: Question[];
  userAnswers: Record<string, string>; 
  totalScore: number;
}

export interface QuestionPayload {
  id: string;
  [key: string]: unknown;
}

export interface ExamResultPayload {
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  score: number;
  total_marks: number;
  details_json: {
    questions: QuestionPayload[];
    userAnswers: Record<string, string>;
  };
}

export interface ExamConfig {
  questionCount: number;
  duration: number; 
  negativeMarking: boolean;
}

export interface QuestionOption {
  id: string;
  isCorrect: boolean;
  text?: string;
  text_bn?: string;
  [key: string]: unknown;
}

export interface ExamQuestion extends Omit<Question, 'options'> {
  options: QuestionOption[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; 
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  total_marks: number;
  time_taken: number;
  device_type: string;
}

// Updated ProgressEntry with safe types
export interface ProgressEntry {
  id: string;
  user_id: string;
  user_name?: string | null;
  current_question_index?: number | null;
  time_remaining?: number | null;
  last_updated_at?: string | null;
}
