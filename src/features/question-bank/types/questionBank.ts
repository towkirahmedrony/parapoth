import type { Json } from '@/shared/types/supabase';

export type QuestionType = 'MCQ' | 'CQ' | 'SQ' | 'Creative' | string;
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | string;
export type SourceType =
  | 'board_exam'
  | 'admission'
  | 'model_test'
  | 'textbook'
  | 'guidebook'
  | 'worksheet'
  | 'unknown'
  | string;

export interface QuestionBody {
  text_bn?: string;
  text_en?: string;
  image_url?: string | null;
  [key: string]: Json | undefined;
}

export interface QuestionOption {
  id: string | number;
  text_bn?: string;
  text_en?: string;
  isCorrect?: boolean;
}

export interface QuestionBankQuestion {
  id: string;
  type: QuestionType;
  difficultyLevel: DifficultyLevel | null;
  sourceType: SourceType | null;
  explanation: string | null;
  tags: string[];
  examReferences: any[]; // Added for EIIN filtering
  body: QuestionBody;
  options: QuestionOption[];
  subjectId: string | null;
  subjectNameBn: string | null;
  subjectNameEn: string | null;
  chapterId: string | null;
  chapterNameBn: string | null;
  chapterNameEn: string | null;
  topicId: string | null;
  topicNameBn: string | null;
  topicNameEn: string | null;
  isPremium: boolean;
  isBookmarked: boolean;
  isWrongAnswered: boolean;
  totalAttempts: number;
  correctAttempts: number;
  createdAt: string | null;
}

export interface QuestionBankSubject {
  id: string;
  name_bn: string;
  name_en: string | null;
  slug: string;
  is_premium: boolean | null;
  sequence: number | null;
}

export interface QuestionBankChapter {
  id: string;
  subject_id: string | null;
  name_bn: string;
  name_en: string | null;
  slug: string;
  is_premium: boolean | null;
  sequence: number | null;
}

export interface QuestionBankTopic {
  id: string;
  chapter_id: string | null;
  name_bn: string;
  name_en: string | null;
  slug: string;
  is_premium: boolean | null;
  sequence: number | null;
  total_questions: number | null;
}

export interface QuestionBankInstitution {
  id: string;
  name_bn: string;
  name_en: string | null;
  type: string;
  eiin: string | null; // Added EIIN
}

export interface QuestionBankFiltersData {
  subjects: QuestionBankSubject[];
  chapters: QuestionBankChapter[];
  topics: QuestionBankTopic[];
  boards: QuestionBankInstitution[];
  colleges: QuestionBankInstitution[];
  admissions: QuestionBankInstitution[];
}

export interface QuestionBankFilterState {
  search: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  institutionType: string;
  institutionEiin: string; // Changed from institutionName to institutionEiin
  year: string;
  bookmarkedOnly: boolean;
  mistakesOnly: boolean;
  premiumOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'most_attempted' | 'least_attempted';
}

export interface QuestionBankStats {
  total: number;
  bookmarked: number;
  mistakes: number;
  mcq: number;
  board: number;
  premium: number;
}

export interface QuestionBankResponse {
  questions: QuestionBankQuestion[];
  stats: QuestionBankStats;
}

export const DEFAULT_QUESTION_BANK_FILTERS: QuestionBankFilterState = {
  search: '',
  subjectId: '',
  chapterId: '',
  topicId: '',
  institutionType: '',
  institutionEiin: '', // Changed to institutionEiin
  year: '',
  bookmarkedOnly: false,
  mistakesOnly: false,
  premiumOnly: false,
  sortBy: 'newest',
};

export function isQuestionBody(value: unknown): value is QuestionBody {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isQuestionOptions(value: unknown): value is QuestionOption[] {
  return Array.isArray(value);
}
