export type TabType = 'history' | 'mistakes' | 'bookmarks';

// Type for localized text supporting multiple languages or plain string
export type LocalizedText = string | { bn?: string; text?: string; [key: string]: unknown } | null | undefined;

// Type for question options
export interface QuestionOption {
  id?: string | number;
  text?: string;
  bn?: string;
  // Multiple variations of the correctness flag based on possible backend/Supabase schemas
  isCorrect?: boolean;
  is_correct?: boolean;
  correct?: boolean;
  answer?: boolean;
  [key: string]: unknown; // Allow extra fields from backend safely
}

export interface HistoryItem {
  id: string;
  score: number;
  total_marks: number;
  // Date fields matching database schema variations
  taken_at?: string;
  submitted_at?: string;
  created_at?: string;
  details_json?: { 
    exam_title?: string; 
    [key: string]: unknown;
  } | null;
}

export interface MistakeItem {
  id: string;
  selected_option: string | null;
  question_id: string;
  questions: {
    id?: string;
    body: LocalizedText;
    options: QuestionOption[] | null;
    explanation?: string | null;
  };
}

export interface BookmarkItem {
  id: string;
  note?: string | null;
  questions: {
    id: string;
    body: LocalizedText;
  };
}
