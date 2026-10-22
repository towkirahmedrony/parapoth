import { supabase } from '@/shared/lib/supabase';
import type {
  QuestionBankChapter,
  QuestionBankFilterState,
  QuestionBankFiltersData,
  QuestionBankInstitution,
  QuestionBankQuestion,
  QuestionBankResponse,
  QuestionBankStats,
  QuestionBankSubject,
  QuestionBankTopic,
} from '../types/questionBank';
import { isQuestionBody, isQuestionOptions } from '../types/questionBank';

/**
 * Minimal typed view of the Supabase client for the one RPC this feature needs.
 *
 * The generated `Database` type has no entry for `get_student_question_bank`,
 * so the response is described here and validated before use instead of being
 * cast to `any`.
 */
type QuestionBankRpcClient = {
  rpc(
    fn: 'get_student_question_bank',
    args: {
      p_subject_id: string | null;
      p_chapter_id: string | null;
      p_topic_id: string | null;
      p_sort: string;
    }
  ): Promise<{ data: unknown; error: Error | null }>;
};

type QuestionBankRpcRow = {
  id: string;
  type: string | null;
  difficulty_level: string | null;
  source_type: string | null;
  tags: unknown;
  exam_references: unknown;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  total_attempts: number | null;
  correct_attempts: number | null;
  created_at: string | null;
  body: unknown;
  options: unknown;
  explanation: unknown;
  subjects: unknown;
  chapters: unknown;
  topics: unknown;
};

const questionBankRpc = supabase as unknown as QuestionBankRpcClient;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const asNumberOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const isRpcRow = (value: unknown): value is QuestionBankRpcRow => {
  const row = asRecord(value);
  return Boolean(row) && typeof row?.id === 'string';
};

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

function mapQuestion(row: QuestionBankRpcRow, bookmarkedIds: Set<string>, wrongIds: Set<string>): QuestionBankQuestion {
  const body = isQuestionBody(row.body) ? row.body : {};
  const options = isQuestionOptions(row.options) ? row.options : [];

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
  const isLocked = isPremium && !hasVisibleContent;

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
    isLocked,
    isBookmarked: bookmarkedIds.has(row.id),
    isWrongAnswered: wrongIds.has(row.id),
    totalAttempts: asNumberOr(row.total_attempts, 0),
    correctAttempts: asNumberOr(row.correct_attempts, 0),
    createdAt: row.created_at,
  };
}

function buildStats(questions: QuestionBankQuestion[]): QuestionBankStats {
  return {
    total: questions.length,
    bookmarked: questions.filter((item) => item.isBookmarked).length,
    mistakes: questions.filter((item) => item.isWrongAnswered).length,
    mcq: questions.filter((item) => item.type?.toUpperCase() === 'MCQ').length,
    board: questions.filter((item) => item.sourceType === 'board_exam').length,
    premium: questions.filter((item) => item.isPremium).length,
  };
}

async function getUserMeta(questionIds: string[]) {
  const userId = await getCurrentUserId();
  if (!userId || questionIds.length === 0) {
    return { bookmarkedIds: new Set<string>(), wrongIds: new Set<string>() };
  }

  const [{ data: bookmarks, error: bookmarksError }, { data: wrongAnswers, error: wrongAnswersError }] =
    await Promise.all([
      supabase.from('bookmarks').select('question_id').eq('user_id', userId).in('question_id', questionIds),
      supabase.from('wrong_answers').select('question_id').eq('user_id', userId).in('question_id', questionIds),
    ]);

  if (bookmarksError) throw bookmarksError;
  if (wrongAnswersError) throw wrongAnswersError;

  return {
    bookmarkedIds: new Set((bookmarks ?? []).map((item) => item.question_id).filter((value): value is string => Boolean(value))),
    wrongIds: new Set((wrongAnswers ?? []).map((item) => item.question_id).filter((value): value is string => Boolean(value))),
  };
}

function applySearch(questions: QuestionBankQuestion[], search: string): QuestionBankQuestion[] {
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
    ].filter(Boolean).join(' ').toLowerCase();

    return haystacks.includes(normalized);
  });
}

function applyClientSideFilters(questions: QuestionBankQuestion[], filters: QuestionBankFilterState): QuestionBankQuestion[] {
  let result = [...questions];

  if (filters.bookmarkedOnly) result = result.filter((item) => item.isBookmarked);
  if (filters.mistakesOnly) result = result.filter((item) => item.isWrongAnswered);
  if (filters.premiumOnly) result = result.filter((item) => item.isPremium);
  
  // Filter by Source Type (Board/College/Admission)
  if (filters.institutionType) {
    const expectedSource = filters.institutionType === 'board' ? 'board_exam' : filters.institutionType;
    result = result.filter((item) => item.sourceType === expectedSource);
  }

  // Exact Match by EIIN from examReferences
  if (filters.institutionEiin) {
    result = result.filter(q => 
      q.examReferences.some(ref => ref.eiin === filters.institutionEiin)
    );
  }
  
  // Year match (Checks both tags and examReferences for better coverage)
  if (filters.year) {
    result = result.filter(q => {
      const inTags = JSON.stringify(q.tags || []).includes(filters.year);
      const inRef = q.examReferences.some(ref => String(ref.year) === filters.year);
      return inTags || inRef;
    });
  }

  if (filters.search.trim()) {
    result = applySearch(result, filters.search);
  }

  switch (filters.sortBy) {
    case 'oldest':
      result.sort((a, b) => (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0));
      break;
    case 'most_attempted':
      result.sort((a, b) => b.totalAttempts - a.totalAttempts);
      break;
    case 'least_attempted':
      result.sort((a, b) => a.totalAttempts - b.totalAttempts);
      break;
    case 'newest':
    default:
      result.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      break;
  }

  return result;
}

export async function getQuestionBankFilters(): Promise<QuestionBankFiltersData> {
  const [
    { data: subjects, error: subjectsError },
    { data: chapters, error: chaptersError },
    { data: topics, error: topicsError },
    { data: institutions, error: institutionsError }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name_bn, name_en, slug, is_premium, sequence').eq('is_active', true).order('sequence', { ascending: true }),
    supabase.from('chapters').select('id, subject_id, name_bn, name_en, slug, is_premium, sequence').eq('is_active', true).order('sequence', { ascending: true }),
    supabase.from('topics').select('id, chapter_id, name_bn, name_en, slug, is_premium, sequence, total_questions').eq('is_active', true).order('sequence', { ascending: true }),
    // Selected eiin column here
    supabase.from('institutions').select('id, name_bn, name_en, type, eiin').in('type', ['board', 'college', 'admission']).eq('is_active', true).order('name_bn', { ascending: true }),
  ]);

  if (subjectsError) throw subjectsError;
  if (chaptersError) throw chaptersError;
  if (topicsError) throw topicsError;
  if (institutionsError) throw institutionsError;

  const allInstitutions = (institutions ?? []) as QuestionBankInstitution[];
  
  return {
    subjects: (subjects ?? []) as QuestionBankSubject[],
    chapters: (chapters ?? []) as QuestionBankChapter[],
    topics: (topics ?? []) as QuestionBankTopic[],
    boards: allInstitutions.filter(inst => inst.type === 'board'),
    colleges: allInstitutions.filter(inst => inst.type === 'college'),
    admissions: allInstitutions.filter(inst => inst.type === 'admission'),
  };
}

export async function getQuestionBankQuestions(filters: QuestionBankFilterState): Promise<QuestionBankResponse> {
  // `questions` has an admin-only RLS policy, so students read it through the
  // approved RPC. Empty filter strings become null, which the function treats
  // as "no filter", and the RPC never returns answer-key fields.
  const { data, error } = await questionBankRpc.rpc('get_student_question_bank', {
    p_subject_id: filters.subjectId || null,
    p_chapter_id: filters.chapterId || null,
    p_topic_id: filters.topicId || null,
    p_sort: filters.sortBy,
  });

  if (error) throw error;

  const rows = asArray(data).filter(isRpcRow);
  const questionIds = rows.map((item) => item.id);
  const { bookmarkedIds, wrongIds } = await getUserMeta(questionIds);

  const mapped = rows.map((row) => mapQuestion(row, bookmarkedIds, wrongIds));
  const filtered = applyClientSideFilters(mapped, filters);

  return { questions: filtered, stats: buildStats(filtered) };
}

export async function toggleBookmark(questionId: string, isBookmarked: boolean): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be logged in to manage bookmarks.');

  if (isBookmarked) {
    const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', questionId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId });
  if (error) throw error;
}
