import { Database } from '@/shared/types/supabase';

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
  exam_id: string; // 🌟 এটি যুক্ত করা হয়েছে
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
  score: number;
  total_marks: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  time_taken: number;
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
  [key: string]: unknown; 
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

export interface ProgressEntry {
  id: string;
  user_id: string;
  user_name?: string | null;
  current_question_index?: number | null;
  time_remaining?: number | null;
  last_updated_at?: string | null;
}

export interface ExamDetails {
  id: string;
  title: string;
  subject_id: string;
  category: string;
  exam_type: string;
  total_marks: number;
  pass_mark: number;
  default_negative_marks: number;
  duration_min: number;
  start_time: string | null;
  end_time: string | null;
  result_publish_time?: string | null;
  syllabus_details?: string | null;
  instructions?: string | null;
  show_leaderboard?: boolean;
  is_premium?: boolean;
  is_published?: boolean;
}
