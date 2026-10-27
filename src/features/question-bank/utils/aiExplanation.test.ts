import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_EXPLANATION_THINK_MS,
  getAiExplanationAction,
} from './aiExplanation';

test('a hidden answer starts the simulated AI explanation', () => {
  assert.equal(
    getAiExplanationAction({ isThinking: false, isAnswerVisible: false }),
    'start-thinking'
  );
});

test('a visible answer is hidden without starting the animation', () => {
  assert.equal(
    getAiExplanationAction({ isThinking: false, isAnswerVisible: true }),
    'hide'
  );
});

test('repeated clicks are ignored while the AI explanation is thinking', () => {
  assert.equal(
    getAiExplanationAction({ isThinking: true, isAnswerVisible: false }),
    'ignore'
  );
  assert.equal(
    getAiExplanationAction({ isThinking: true, isAnswerVisible: true }),
    'ignore'
  );
});

test('the simulated thinking state stays visible long enough to read', () => {
  assert.ok(AI_EXPLANATION_THINK_MS >= 500);
  assert.ok(AI_EXPLANATION_THINK_MS <= 800);
});
