import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_PRACTICE_QUESTIONS,
  parsePracticeCount,
  sanitizeCountInput,
  normalizeAttemptAnswers,
} from './practice.ts';

test('practice count accepts only whole numbers between 1 and 100', () => {
  assert.equal(parsePracticeCount(5), 5);
  assert.equal(parsePracticeCount('10'), 10);
  assert.equal(parsePracticeCount(1), 1);
  assert.equal(parsePracticeCount(MAX_PRACTICE_QUESTIONS), MAX_PRACTICE_QUESTIONS);

  assert.equal(parsePracticeCount(0), null);
  assert.equal(parsePracticeCount(-1), null);
  assert.equal(parsePracticeCount(101), null);
  assert.equal(parsePracticeCount(2.5), null);
  assert.equal(parsePracticeCount(''), null);
  assert.equal(parsePracticeCount('abc'), null);
  assert.equal(parsePracticeCount(Number.NaN), null);
});

test('custom count input keeps digits only and never exceeds three characters', () => {
  assert.equal(sanitizeCountInput('12a'), '12');
  assert.equal(sanitizeCountInput('0012'), '001');
  assert.equal(sanitizeCountInput('12345'), '123');
  assert.equal(sanitizeCountInput(''), '');
});

test('attempt drafts are normalized to string option ids and empty answers are dropped', () => {
  assert.deepEqual(
    normalizeAttemptAnswers({
      q1: 'option-1',
      q2: 2,
      q3: null,
      q4: undefined,
      q5: '',
    }),
    { q1: 'option-1', q2: '2' }
  );

  assert.deepEqual(normalizeAttemptAnswers(null), {});
  assert.deepEqual(normalizeAttemptAnswers([1, 2]), {});
  assert.deepEqual(normalizeAttemptAnswers('nope'), {});
});
