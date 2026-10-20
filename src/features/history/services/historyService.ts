import apiClient from '@/shared/lib/apiClient';
import { supabase } from '@/shared/lib/supabase';
import type { HistoryItem } from '../types/history';

interface ExamMetadata {
  id: string;
  title: string;
  subject_id: string | null;
}

interface SubjectMetadata {
  id: string;
  name_en: string;
  name_bn: string;
}

/**
 * The history API intentionally returns attempt summaries, not details_json.
 * Resolve presentation metadata from the existing exam -> subject relation,
 * preserving each summary row and all of its result fields unchanged.
 */
export const getExamHistory = async (): Promise<HistoryItem[]> => {
  const { data: response } = await apiClient.get<{ data: HistoryItem[] }>(
    '/history/exams',
  );
  const history = Array.isArray(response.data) ? response.data : [];
  const examIds = [...new Set(history.map((item) => item.exam_id).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  ))];
  if (examIds.length === 0) return history;

  const { data: exams, error: examsError } = await supabase
    .from('exam_papers')
    .select('id, title, subject_id')
    .in('id', examIds);
  if (examsError) return history;

  const examRows: ExamMetadata[] = exams ?? [];
  const subjectIds = [...new Set(examRows
    .map((exam) => exam.subject_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0))];
  const subjectsById = new Map<string, SubjectMetadata>();
  if (subjectIds.length > 0) {
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name_en, name_bn')
      .in('id', subjectIds);
    if (!subjectsError) {
      for (const subject of subjects ?? []) subjectsById.set(subject.id, subject);
    }
  }

  const examsById = new Map(examRows.map((exam) => [exam.id, exam]));
  return history.map((item) => {
    const exam = item.exam_id ? examsById.get(item.exam_id) : undefined;
    const subject = exam?.subject_id
      ? subjectsById.get(exam.subject_id)
      : undefined;
    return {
      ...item,
      exam_title: exam?.title || item.details_json?.exam_title || null,
      subject_name_en: subject?.name_en ?? null,
      subject_name_bn: subject?.name_bn ?? null,
    };
  });
};
