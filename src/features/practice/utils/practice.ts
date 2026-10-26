export const MAX_PRACTICE_QUESTIONS = 100;

export const PRACTICE_COUNT_PRESETS = [5, 10, 20, 30] as const;

export const parsePracticeCount = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;

  const count = Number(value);

  if (!Number.isInteger(count) || count < 1 || count > MAX_PRACTICE_QUESTIONS) {
    return null;
  }

  return count;
};

export const sanitizeCountInput = (value: string): string =>
  String(value ?? '').replace(/[^0-9]/g, '').slice(0, 3);

export const normalizeAttemptAnswers = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const answers: Record<string, string> = {};

  for (const [questionId, optionId] of Object.entries(value)) {
    if (optionId === null || optionId === undefined) continue;

    const normalized = String(optionId).trim();
    if (!questionId || !normalized) continue;

    answers[questionId] = normalized;
  }

  return answers;
};
