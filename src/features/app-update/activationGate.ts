import type { OfflineExamStorage } from '../exam/offline/storage';
import { OTA_EXAM_ROUTE_PATTERNS } from './config';
import { isExamRoute } from './examActivity';
import type {
  ActivationDecision,
  AuthSnapshot,
  ExamActivity,
  OtaBlockReason,
} from './types';

export type ActivationStorage = Pick<
  OfflineExamStorage,
  'init' | 'listAttemptsForUser' | 'getSubmission' | 'getAnswers'
>;

export type ActivationGateContext = {
  auth: AuthSnapshot;
  storage: ActivationStorage;
  activities: ExamActivity[];
  /** Extra defence-in-depth: exam pages register activity too, but a cold start
   * into an exam route must never be reloaded before that effect runs. */
  pathname?: string;
};

const runtimeReason = (activity: ExamActivity): OtaBlockReason => {
  switch (activity.kind) {
    case 'recovery':
      return 'recovery_in_progress';
    case 'submission_pending':
      return 'submission_pending';
    case 'pending_answers':
      return 'pending_answers';
    default:
      return 'exam_active';
  }
};

/**
 * Decide whether an update may reload the WebView right now.
 *
 * This combines two independent signals:
 *  - runtime activity registered by mounted exam pages, and
 *  - the persisted Phase 1 attempt/submission/answer state, so a kill and
 *    relaunch cannot lose track of an unfinished attempt.
 *
 * The route is only a last-resort guard, never the sole signal.
 */
export const evaluateActivationGate = async (
  context: ActivationGateContext
): Promise<ActivationDecision> => {
  const reasons = new Set<OtaBlockReason>();

  if (context.activities.length > 0) {
    for (const activity of context.activities) {
      reasons.add(runtimeReason(activity));
    }
  }

  if (
    context.pathname &&
    isExamRoute(context.pathname, OTA_EXAM_ROUTE_PATTERNS)
  ) {
    reasons.add('exam_route');
  }

  if (context.auth.state === 'unknown') {
    reasons.add('auth_unknown');
  } else if (
    context.auth.state === 'authenticated' &&
    !context.auth.userId
  ) {
    reasons.add('auth_unknown');
  } else if (context.auth.state === 'authenticated' && context.auth.userId) {
    const userId = context.auth.userId;

    try {
      await context.storage.init();
      const attempts = await context.storage.listAttemptsForUser(userId);

      for (const attempt of attempts) {
        if (attempt.status === 'in_progress') {
          reasons.add('attempt_unresolved');
        }

        const submission = await context.storage.getSubmission(attempt.attemptId);
        if (submission && submission.status !== 'confirmed') {
          reasons.add('submission_pending');
        }

        const answers = await context.storage.getAnswers(attempt.attemptId);
        if (answers.some((answer) => answer.status !== 'synced')) {
          reasons.add('pending_answers');
        }
      }
    } catch {
      reasons.add('storage_unavailable');
    }
  }

  return {
    allowed: reasons.size === 0,
    reasons: [...reasons],
  };
};

export const isExamBusy = (
  activities: ExamActivity[],
  pathname?: string
): boolean =>
  activities.length > 0 ||
  Boolean(pathname && isExamRoute(pathname, OTA_EXAM_ROUTE_PATTERNS));
