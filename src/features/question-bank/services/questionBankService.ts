import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/types/supabase';
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

type QuestionRow = Database['public']['Tables']['questions']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type TopicRow = Database['public']['Tables']['topics']['Row'];

type QuestionRowWithRelations = QuestionRow & {
  subjects: SubjectRow | null;
  chapters: ChapterRow | null;
  topics: TopicRow | null;
};

// Added exam_references to the select query
const QUESTION_SELECT = `
  id,
  type,
  body,
  options,
  explanation,
  difficulty_level,
  source_type,
  tags,
  exam_references,
  subject_id,
  chapter_id,
  topic_id,
  total_attempts,
  correct_attempts,
  created_at,
  subjects:subject_id (
    id,
    name_bn,
    name_en,
    slug,
    is_premium,
    sequence
  ),
  chapters:chapter_id (
    id,
    subject_id,
    name_bn,
    name_en,
    slug,
    is_premium,
    sequence
  ),
  topics:topic_id (
    id,
    chapter_id,
    name_bn,
    name_en,
    slug,
    is_premium,
    sequence,
    total_questions
  )
`;

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

function mapQuestion(row: QuestionRowWithRelations, bookmarkedIds: Set<string>, wrongIds: Set<string>): QuestionBankQuestion {
  const body = isQuestionBody(row.body) ? row.body : {};
  const options = isQuestionOptions(row.options) ? row.options : [];

  const isPremium =
    Boolean(row.subjects?.is_premium) ||
    Boolean(row.chapters?.is_premium) ||
    Boolean(row.topics?.is_premium);

  return {
    id: row.id,
    type: row.type,
    difficultyLevel: row.difficulty_level,
    sourceType: row.source_type,
    explanation: row.explanation,
    tags: Array.isArray(row.tags) ? row.tags : [],
    examReferences: Array.isArray(row.exam_references) ? row.exam_references : [], // Added
    body,
    options,
    subjectId: row.subject_id,
    subjectNameBn: row.subjects?.name_bn ?? null,
    subjectNameEn: row.subjects?.name_en ?? null,
    chapterId: row.chapter_id,
    chapterNameBn: row.chapters?.name_bn ?? null,
    chapterNameEn: row.chapters?.name_en ?? null,
    topicId: row.topic_id,
    topicNameBn: row.topics?.name_bn ?? null,
    topicNameEn: row.topics?.name_en ?? null,
    isPremium,
    isBookmarked: bookmarkedIds.has(row.id),
    isWrongAnswered: wrongIds.has(row.id),
    totalAttempts: row.total_attempts ?? 0,
    correctAttempts: row.correct_attempts ?? 0,
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
  let query = supabase.from('questions').select(QUESTION_SELECT).eq('is_active', true).eq('status', 'published').is('deleted_at', null);

  if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
  if (filters.chapterId) query = query.eq('chapter_id', filters.chapterId);
  if (filters.topicId) query = query.eq('topic_id', filters.topicId);

  if (filters.sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true }).limit(100);
  } else if (filters.sortBy === 'most_attempted') {
    query = query.order('total_attempts', { ascending: false }).limit(100);
  } else if (filters.sortBy === 'least_attempted') {
    query = query.order('total_attempts', { ascending: true }).limit(100);
  } else {
    query = query.order('created_at', { ascending: false }).limit(100);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as QuestionRowWithRelations[];
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
