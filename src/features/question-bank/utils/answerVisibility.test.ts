import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_ANSWER_VISIBILITY,
  expandAllAnswers,
  isAnswerVisible,
  toggleAnswerVisibility,
  type AnswerVisibilityState,
} from './answerVisibility';

const state = (overrides: Partial<AnswerVisibilityState> = {}): AnswerVisibilityState => ({
  revealed: overrides.revealed ?? new Set(),
  collapsed: overrides.collapsed ?? new Set(),
});

test('practice mode reveals only the questions the student opens', () => {
  let current = state();

  assert.equal(isAnswerVisible('q1', false, current), false);
  current = toggleAnswerVisibility(current, 'q1', false);
  assert.equal(isAnswerVisible('q1', false, current), true);
  assert.equal(isAnswerVisible('q2', false, current), false);

  current = toggleAnswerVisibility(current, 'q1', false);
  assert.equal(isAnswerVisible('q1', false, current), false);
});

test('reading mode reveals every question unless it is collapsed', () => {
  let current = state();

  assert.equal(isAnswerVisible('q1', true, current), true);
  current = toggleAnswerVisibility(current, 'q1', true);
  assert.equal(isAnswerVisible('q1', true, current), false);
  assert.equal(isAnswerVisible('q2', true, current), true);

  current = toggleAnswerVisibility(current, 'q1', true);
  assert.equal(isAnswerVisible('q1', true, current), true);
});

test('turning reading mode on expands cards collapsed earlier', () => {
  const collapsed = state({ collapsed: new Set(['q1', 'q2']) });
  const expanded = expandAllAnswers(collapsed);

  assert.equal(isAnswerVisible('q1', true, expanded), true);
  assert.equal(isAnswerVisible('q2', true, expanded), true);
  assert.equal(collapsed.collapsed.size, 2, 'the previous state is not mutated');
});

test('individual reveals survive a reading-mode session', () => {
  let current = toggleAnswerVisibility(EMPTY_ANSWER_VISIBILITY, 'q1', false);
  current = expandAllAnswers(current);

  assert.equal(isAnswerVisible('q1', true, current), true);
  assert.equal(isAnswerVisible('q2', true, current), true);
  assert.equal(isAnswerVisible('q1', false, current), true);
  assert.equal(isAnswerVisible('q2', false, current), false);

  assert.equal(EMPTY_ANSWER_VISIBILITY.revealed.size, 0, 'initial state is not mutated');
});
