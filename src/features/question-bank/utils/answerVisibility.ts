export interface AnswerVisibilityState {
  revealed: ReadonlySet<string>;
  collapsed: ReadonlySet<string>;
}

export const EMPTY_ANSWER_VISIBILITY: AnswerVisibilityState = {
  revealed: new Set(),
  collapsed: new Set(),
};

/**
 * Practice mode reveals only the questions the student explicitly opened.
 * Reading mode starts with every visible question expanded; the student can
 * still collapse individual cards without leaving the mode.
 */
export function isAnswerVisible(
  questionId: string,
  readingMode: boolean,
  state: AnswerVisibilityState
): boolean {
  return readingMode
    ? !state.collapsed.has(questionId)
    : state.revealed.has(questionId);
}

export function toggleAnswerVisibility(
  state: AnswerVisibilityState,
  questionId: string,
  readingMode: boolean
): AnswerVisibilityState {
  if (readingMode) {
    const collapsed = new Set(state.collapsed);
    if (collapsed.has(questionId)) collapsed.delete(questionId);
    else collapsed.add(questionId);
    return { ...state, collapsed };
  }

  const revealed = new Set(state.revealed);
  if (revealed.has(questionId)) revealed.delete(questionId);
  else revealed.add(questionId);
  return { ...state, revealed };
}

/** Entering reading mode re-expands cards collapsed in a previous session. */
export function expandAllAnswers(
  state: AnswerVisibilityState
): AnswerVisibilityState {
  return { ...state, collapsed: new Set() };
}
