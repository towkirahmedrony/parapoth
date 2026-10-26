import apiClient from '@/shared/lib/apiClient';
import { supabase } from '@/shared/lib/supabase';
import type { HistoryItem } from '../types/history';

interface ExamMetadata {
  id: string;
  title: string | null;
  subjects?:
    | { name_en?: string | null; name_bn?: string | null }
    | { name_en?: string | null; name_bn?: string | null }[]
    | null;
}

/**
 * The history API now includes exam and subject labels. Older backend builds
 * may omit them, so resolve the missing labels with one batched query instead
 * of the previous two serial requests (papers, then subjects).
 */
export const getExamHistory = async (): Promise<HistoryItem[]> => {
  const { data: response } = await apiClient.get<{ data: HistoryItem[] }>(
    '/history/exams',
  );
  const history = Array.isArray(response.data)
    ? response.data.map((item) => ({
        ...item,
        retake_available_count: Math.max(0, Number(item.retake_available_count ?? 0)),
        wrong_available_count: Math.max(0, Number(item.wrong_available_count ?? 0)),
      }))
    : [];

  const missingMetadata = history.some(
    (item) => typeof item.exam_id === 'string' && !item.exam_title,
  );
  if (!missingMetadata) return history;

  const examIds = [...new Set(history.map((item) => item.exam_id).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  ))];
  if (examIds.length === 0) return history;

  const { data: exams, error } = await supabase
    .from('exam_papers')
    .select('id, title, subjects ( name_en, name_bn )')
    .in('id', examIds);
  if (error) return history;

  const examsById = new Map<string, ExamMetadata>(
    ((exams ?? []) as ExamMetadata[]).map((exam) => [exam.id, exam]),
  );

  return history.map((item) => {
    const exam = item.exam_id ? examsById.get(item.exam_id) : undefined;
    const subject = Array.isArray(exam?.subjects) ? exam.subjects[0] : exam?.subjects;

    return {
      ...item,
      exam_title: item.exam_title || exam?.title || item.details_json?.exam_title || null,
      subject_name_en: item.subject_name_en ?? subject?.name_en ?? null,
      subject_name_bn: item.subject_name_bn ?? subject?.name_bn ?? null,
    };
  });
};
