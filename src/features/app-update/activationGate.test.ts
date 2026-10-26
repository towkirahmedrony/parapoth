import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateActivationGate, type ActivationStorage } from './activationGate.ts';
import { MemoryOfflineExamStorage } from '../exam/offline/storage.ts';
import {
  beginExamActivity,
  getExamActivities,
  resetExamActivityForTests,
} from './examActivity.ts';
import type { AuthSnapshot, ExamActivity } from './types.ts';
import type {
  AnswerRecord,
  ExamAttemptRecord,
  SubmissionRecord,
} from '../exam/offline/types.ts';

const auth = (overrides: Partial<AuthSnapshot> = {}): AuthSnapshot => ({
  state: 'anonymous',
  userId: null,
  ...overrides,
});

const attempt = (
  overrides: Partial<ExamAttemptRecord> = {}
): ExamAttemptRecord => ({
  key: 'practice:e1',
  userId: 'u1',
  scope: 'practice',
  attemptId: 'a1',
  examId: 'e1',
  status: 'submitted',
  offlinePolicy: 'offline_allowed',
  startedAt: null,
  deadlineAt: null,
  serverTimeAtSync: null,
  clientTimeAtSync: null,
  wallHighWaterMs: null,
  secondsRemainingAtSync: null,
  durationSeconds: 600,
  questionIds: ['q1'],
  questionsVersion: null,
  prepared: true,
  currentIndex: 0,
  lastServerUpdatedAt: null,
  lastSyncedAt: null,
  lastSyncError: null,
  syncAttempts: 0,
  nextSyncAt: null,
  submissionId: 's1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const answer = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: 'a1:q1',
  attemptId: 'a1',
  userId: 'u1',
  questionId: 'q1',
  value: 'A',
  revision: 1,
  operationId: 'op-1',
  updatedAt: '2026-01-01T00:00:00.000Z',
  status: 'synced',
  lastError: null,
  ...overrides,
});

const submission = (
  overrides: Partial<SubmissionRecord> = {}
): SubmissionRecord => ({
  attemptId: 'a1',
  userId: 'u1',
  status: 'confirmed',
  idempotencyKey: 'key-1',
  payload: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  attempts: 1,
  lastAttemptAt: null,
  lastError: null,
  resultId: 'r1',
  result: null,
  ...overrides,
});

const activities = (...items: ExamActivity[]): ExamActivity[] => items;

test('anonymous user with no activity may activate', async () => {
  resetExamActivityForTests();
  const storage = new MemoryOfflineExamStorage();

  const decision = await evaluateActivationGate({
    auth: auth(),
    storage,
    activities: [],
    pathname: '/dashboard',
  });

  assert.deepEqual(decision, { allowed: true, reasons: [] });
});

test('unknown authentication blocks activation', async () => {
  const storage = new MemoryOfflineExamStorage();
  const decision = await evaluateActivationGate({
    auth: auth({ state: 'unknown' }),
    storage,
    activities: [],
  });

  assert.equal(decision.allowed, false);
  assert.deepEqual(decision.reasons, ['auth_unknown']);
});

test('runtime exam activity blocks activation', async () => {
  const storage = new MemoryOfflineExamStorage();
  const decision = await evaluateActivationGate({
    auth: auth(),
    storage,
    activities: activities({
      id: 'exam-1',
      kind: 'exam_active',
      startedAt: 1,
    }),
  });

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes('exam_active'));
});

test('an exam route blocks activation even before the page registers activity', async () => {
  const storage = new MemoryOfflineExamStorage();
  const decision = await evaluateActivationGate({
    auth: auth(),
    storage,
    activities: [],
    pathname: '/exam/attempt/abc123',
  });

  assert.equal(decision.allowed, false);
  assert.deepEqual(decision.reasons, ['exam_route']);

  const analysis = await evaluateActivationGate({
    auth: auth(),
    storage,
    activities: [],
    pathname: '/exam/analysis/r1',
  });
  assert.equal(analysis.allowed, true);
});

test('persisted in-progress attempt blocks activation after a relaunch', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt({ status: 'in_progress' }));

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage,
    activities: [],
  });

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes('attempt_unresolved'));
});

test('a closed expired attempt does not block activation forever', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt({ status: 'expired' }));
  await storage.putSubmission(submission({ status: 'confirmed' }));
  await storage.putAnswerIfNewer(answer({ status: 'synced' }));

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage,
    activities: [],
  });

  assert.deepEqual(decision, { allowed: true, reasons: [] });
});

test('an expired attempt with a pending submission still blocks activation', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt({ status: 'expired' }));
  await storage.putSubmission(submission({ status: 'submitting' }));

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage,
    activities: [],
  });

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes('submission_pending'));
});

test('unconfirmed submission and unsynced answers block activation', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt());
  await storage.putSubmission(submission({ status: 'pending' }));
  await storage.putAnswerIfNewer(answer({ status: 'pending' }));

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage,
    activities: [],
  });

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes('submission_pending'));
  assert.ok(decision.reasons.includes('pending_answers'));
});

test('confirmed submission with synced answers may activate', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt());
  await storage.putSubmission(submission());
  await storage.putAnswerIfNewer(answer());

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage,
    activities: [],
  });

  assert.deepEqual(decision, { allowed: true, reasons: [] });
});

test('anonymous sessions ignore persisted attempts owned by someone else', async () => {
  const storage = new MemoryOfflineExamStorage();
  await storage.putAttempt(attempt({ status: 'in_progress' }));

  const decision = await evaluateActivationGate({
    auth: auth(),
    storage,
    activities: [],
  });

  assert.equal(decision.allowed, true);
});

test('storage failures block activation instead of assuming it is safe', async () => {
  const broken: ActivationStorage = {
    init: async () => {
      throw new Error('IndexedDB blocked');
    },
    listAttemptsForUser: async () => [],
    getSubmission: async () => null,
    getAnswers: async () => [],
  };

  const decision = await evaluateActivationGate({
    auth: auth({ state: 'authenticated', userId: 'u1' }),
    storage: broken,
    activities: [],
  });

  assert.equal(decision.allowed, false);
  assert.deepEqual(decision.reasons, ['storage_unavailable']);
});

test('runtime tokens are release-once and StrictMode safe', () => {
  resetExamActivityForTests();
  const first = beginExamActivity('a1', 'exam_active');
  const duplicate = beginExamActivity('a1', 'exam_active');

  duplicate();
  assert.equal(getExamActivities().length, 1);

  first();
  assert.equal(getExamActivities().length, 0);
  first();
  assert.equal(getExamActivities().length, 0);
});
