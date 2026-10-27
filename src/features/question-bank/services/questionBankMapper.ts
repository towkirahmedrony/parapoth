import type {
  QuestionBankFilterState,
  QuestionBankQuestion,
  QuestionBankRpcRow,
  QuestionBankStats,
  QuestionBody,
  QuestionOption,
} from '../types/questionBank';
import {
  isQuestionBody,
  isQuestionOptions,
} from '../types/questionBank';

/**
 * Pure mapping/filtering helpers for the question bank.
 *
 * Kept out of the network service so the rules that decide what a student sees
 * (which text, which option, which rows survive a filter) can be unit tested
 * without a browser or a database.
 */

export type QuestionLanguage = 'bn' | 'en';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const asNumberOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const isRpcRow = (value: unknown): value is QuestionBankRpcRow => {
  const row = asRecord(value);
  return Boolean(row) && typeof row?.id === 'string';
};

/**
 * Fields a student UI may process. Everything else — an answer key, scoring
 * weights, authoring metadata — is dropped here even if the transport carried
 * it, so a wider database response cannot leak into the rendered model.
 */
const BODY_FIELDS = ['text_bn', 'text_en', 'image_url'] as const;

const pickBody = (body: QuestionBody): QuestionBody => {
  const picked: QuestionBody = {};
  for (const field of BODY_FIELDS) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) picked[field] = value;
  }
  return picked;
};

const pickOptions = (options: unknown[]): QuestionOption[] =>
  options.reduce<QuestionOption[]>((acc, raw) => {
    const option = asRecord(raw);
    if (!option) return acc;

    const id = option.id;
    if (typeof id !== 'string' && typeof id !== 'number') return acc;

    const textBn = asStringOrNull(option.text_bn);
    const textEn = asStringOrNull(option.text_en);

    acc.push({
      id,
      ...(textBn ? { text_bn: textBn } : {}),
      ...(textEn ? { text_en: textEn } : {}),
    });
    return acc;
  }, []);

/**
 * Picks the label in the active language and falls back to the other one.
 * Exam content is never translated — an English UI shows the English variant
 * when the question author provided it, otherwise the original Bangla text.
 */
export const localizedText = (
  bn: string | null | undefined,
  en: string | null | undefined,
  language: QuestionLanguage
): string => {
  const bangla = (bn ?? '').trim();
  const english = (en ?? '').trim();

  if (language === 'en') return english || bangla;
  return bangla || english;
};

export const getQuestionText = (
  question: QuestionBankQuestion,
  language: QuestionLanguage
): string =>
  localizedText(question.body.text_bn, question.body.text_en, language);

export const getOptionText = (
  option: QuestionBankQuestion['options'][number],
  language: QuestionLanguage
): string => localizedText(option.text_bn, option.text_en, language);

export const getSubjectName = (
  question: QuestionBankQuestion,
  language: QuestionLanguage
): string => localizedText(question.subjectNameBn, question.subjectNameEn, language);

export const getChapterName = (
  question: QuestionBankQuestion,
  language: QuestionLanguage
): string => localizedText(question.chapterNameBn, question.chapterNameEn, language);

export const getTopicName = (
  question: QuestionBankQuestion,
  language: QuestionLanguage
): string => localizedText(question.topicNameBn, question.topicNameEn, language);

export function mapQuestion(
  row: QuestionBankRpcRow,
  meta: { bookmarkedIds: Set<string>; wrongIds: Set<string> }
): QuestionBankQuestion {
  const body = pickBody(isQuestionBody(row.body) ? row.body : {});
  const options = pickOptions(isQuestionOptions(row.options) ? row.options : []);

  const subject = asRecord(row.subjects);
  const chapter = asRecord(row.chapters);
  const topic = asRecord(row.topics);

  const isPremium =
    subject?.is_premium === true ||
    chapter?.is_premium === true ||
    topic?.is_premium === true;

  // The RPC redacts premium rows the caller cannot read: empty body, no options
  // and no explanation. Such a row is a locked question, not a broken one.
  const hasVisibleContent =
    Boolean(body.text_bn || body.text_en || body.image_url) || options.length > 0;

  return {
    id: row.id,
    type: row.type ?? 'MCQ',
    difficultyLevel: row.difficulty_level,
    sourceType: row.source_type,
    explanation: asStringOrNull(row.explanation),
    tags: asArray(row.tags).filter((tag): tag is string => typeof tag === 'string'),
    examReferences: asArray(row.exam_references).filter(
      (reference): reference is Record<string, unknown> => Boolean(asRecord(reference))
    ),
    body,
    options,
    subjectId: row.subject_id,
    subjectNameBn: asStringOrNull(subject?.name_bn),
    subjectNameEn: asStringOrNull(subject?.name_en),
    chapterId: row.chapter_id,
    chapterNameBn: asStringOrNull(chapter?.name_bn),
    chapterNameEn: asStringOrNull(chapter?.name_en),
    topicId: row.topic_id,
    topicNameBn: asStringOrNull(topic?.name_bn),
    topicNameEn: asStringOrNull(topic?.name_en),
    isPremium,
    isLocked: isPremium && !hasVisibleContent,
    isBookmarked: meta.bookmarkedIds.has(row.id),
    isWrongAnswered: meta.wrongIds.has(row.id),
    totalAttempts: asNumberOr(row.total_attempts, 0),
    correctAttempts: asNumberOr(row.correct_attempts, 0),
    createdAt: row.created_at,
  };
}

/**
 * Page bookkeeping for the paginated RPC.
 *
 * `total` comes from the server (`count(*) over ()`). `nextOffset` is only set
 * when another page is expected, so the UI cannot loop on an empty tail page.
 */
export function resolvePagination(input: {
  offset: number;
  limit: number;
  received: number;
  total: number;
}): { total: number; nextOffset: number | null } {
  const offset = Math.max(0, Math.floor(input.offset));
  const received = Math.max(0, Math.floor(input.received));
  const total = Math.max(Math.floor(input.total), offset + received);
  const consumed = offset + received;

  const hasMore = received > 0 && consumed < total;
  return { total, nextOffset: hasMore ? consumed : null };
}

export function buildStats(questions: QuestionBankQuestion[]): QuestionBankStats {
  return {
    total: questions.length,
    bookmarked: questions.filter((item) => item.isBookmarked).length,
    mistakes: questions.filter((item) => item.isWrongAnswered).length,
    mcq: questions.filter((item) => item.type?.toUpperCase() === 'MCQ').length,
    board: questions.filter((item) => item.sourceType === 'board_exam').length,
    premium: questions.filter((item) => item.isPremium).length,
  };
}

/** Removes rows repeated by an unstable page boundary without reordering. */
export function dedupeQuestions(
  questions: QuestionBankQuestion[]
): QuestionBankQuestion[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}

export function applySearch(
  questions: QuestionBankQuestion[],
  search: string
): QuestionBankQuestion[] {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return questions;

  return questions.filter((question) => {
    const haystacks = [
      question.body.text_bn,
      question.body.text_en,
      question.explanation,
      question.subjectNameBn,
      question.subjectNameEn,
      question.chapterNameBn,
      question.chapterNameEn,
      question.topicNameBn,
      question.topicNameEn,
      ...question.tags,
      ...question.options.map((option) => option.text_bn ?? ''),
      ...question.options.map((option) => option.text_en ?? ''),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystacks.includes(normalized);
  });
}

/**
 * Client-side filter/sort pass.
 *
 * Used as the whole pipeline in "legacy" mode (the v1 RPC has no server-side
 * filters) and only for presentation-order guarantees in "paged" mode, where
 * the server already applied every filter.
 */
export function applyClientSideFilters(
  questions: QuestionBankQuestion[],
  filters: QuestionBankFilterState
): QuestionBankQuestion[] {
  let result = [...questions];

  if (filters.bookmarkedOnly) result = result.filter((item) => item.isBookmarked);
  if (filters.mistakesOnly) result = result.filter((item) => item.isWrongAnswered);
  if (filters.premiumOnly) result = result.filter((item) => item.isPremium);

  if (filters.institutionType) {
    const expectedSource =
      filters.institutionType === 'board'
        ? 'board_exam'
        : filters.institutionType === 'college'
          ? 'college_test'
          : filters.institutionType;
    result = result.filter((item) => item.sourceType === expectedSource);
  }

  if (filters.institutionEiin) {
    result = result.filter((question) =>
      question.examReferences.some(
        (ref) =>
          ref.eiin === filters.institutionEiin ||
          ref.code === filters.institutionEiin
      )
    );
  }

  if (filters.year) {
    result = result.filter((question) => {
      const inTags = question.tags.includes(filters.year);
      const inRef = question.examReferences.some(
        (ref) => String(ref.year) === filters.year
      );
      return inTags || inRef;
    });
  }

  if (filters.search.trim()) {
    result = applySearch(result, filters.search);
  }

  return sortQuestions(result, filters.sortBy);
}

export function sortQuestions(
  questions: QuestionBankQuestion[],
  sortBy: QuestionBankFilterState['sortBy']
): QuestionBankQuestion[] {
  const byCreatedAt = (a: QuestionBankQuestion, b: QuestionBankQuestion) =>
    (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
    (b.createdAt ? new Date(b.createdAt).getTime() : 0);

  /** Stable tiebreaker so equal keys keep the server's page order. */
  const tiebreak = (a: QuestionBankQuestion, b: QuestionBankQuestion) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

  const sorted = [...questions];

  switch (sortBy) {
    case 'oldest':
      sorted.sort((a, b) => byCreatedAt(a, b) || tiebreak(a, b));
      break;
    case 'most_attempted':
      sorted.sort((a, b) => b.totalAttempts - a.totalAttempts || tiebreak(a, b));
      break;
    case 'least_attempted':
      sorted.sort((a, b) => a.totalAttempts - b.totalAttempts || tiebreak(a, b));
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => byCreatedAt(b, a) || tiebreak(a, b));
      break;
  }

  return sorted;
}
