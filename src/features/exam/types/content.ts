import { Database } from '@/shared/types/supabase';

// Supabase থেকে সরাসরি Row টাইপগুলো নেওয়া হচ্ছে
type TopicRow = Database['public']['Tables']['topics']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ExamPaperRow = Database['public']['Tables']['exam_papers']['Row'];

/**
 * Frontend-specific Topic Interface
 * Database Row-এর সাথে ফ্রন্টএন্ডের জয়েন করা ডাটাগুলো যুক্ত করা হচ্ছে।
 */
export interface Topic extends Omit<TopicRow, 'total_questions'> {
  total_questions?: number | null; 
}

export interface Chapter extends ChapterRow {
  children?: Topic[]; 
}

export interface Subject extends SubjectRow {
  children?: Chapter[]; 
}

// --- Frontend-specific Exam Types ---

export interface BoardExamMetaData {
  board?: string;
  year?: string;
  [key: string]: unknown; // Allow other JSON properties if present
}

export interface BoardExamPaper extends Omit<ExamPaperRow, 'meta_data'> {
  meta_data: BoardExamMetaData | null;
  // Frontend-specific UI states can be added here
}

// --- Challenge Types ---

export interface ChallengeOption {
  readonly id: string;
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface ChallengeQuestion {
  readonly id: string;
  readonly text: string;
  readonly options: readonly ChallengeOption[];
}

export interface OpponentData {
  readonly name: string;
  readonly score: number;
  readonly time_taken: number;
}

export interface ChallengeData {
  readonly questions: readonly ChallengeQuestion[];
  readonly opponent: OpponentData;
}

export interface ChallengeSubmitPayload {
  readonly challenger_score: number;
  readonly challenger_time_taken: number;
  readonly status: 'completed';
}
