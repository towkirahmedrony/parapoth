export const AI_EXPLANATION_THINK_MS = 600;

export type AiExplanationAction = 'hide' | 'start-thinking' | 'ignore';

interface AiExplanationState {
  isThinking: boolean;
  isAnswerVisible: boolean;
}

export function getAiExplanationAction({
  isThinking,
  isAnswerVisible,
}: AiExplanationState): AiExplanationAction {
  if (isThinking) return 'ignore';
  return isAnswerVisible ? 'hide' : 'start-thinking';
}
