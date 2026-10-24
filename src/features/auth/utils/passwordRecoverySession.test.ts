import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearPasswordRecoverySession,
  hasPasswordRecoverySession,
  rememberPasswordRecoverySession,
} from './passwordRecoverySession';

const installStorage = () => {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    },
  });
  return () => {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  };
};

const makeSession = (userId: string, sessionId: string, expiresAt = Math.floor(Date.now() / 1000) + 300) => {
  const payload = Buffer.from(JSON.stringify({ session_id: sessionId })).toString('base64url');
  return {
    user: { id: userId },
    access_token: `header.${payload}.signature`,
    expires_at: expiresAt,
  } as any;
};

test('recovery marker is bound to the validated user and Supabase session id', () => {
  const restore = installStorage();
  try {
    const session = makeSession('user-1', 'session-1');
    rememberPasswordRecoverySession(session);
    assert.equal(hasPasswordRecoverySession(session), true);
    assert.equal(hasPasswordRecoverySession(makeSession('user-2', 'session-1')), false);
    assert.equal(hasPasswordRecoverySession(makeSession('user-1', 'session-2')), false);
    clearPasswordRecoverySession();
    assert.equal(hasPasswordRecoverySession(session), false);
  } finally {
    restore();
  }
});

test('expired recovery markers are rejected', () => {
  const restore = installStorage();
  try {
    const session = makeSession('user-1', 'session-1', Math.floor(Date.now() / 1000) - 10);
    rememberPasswordRecoverySession(session);
    assert.equal(hasPasswordRecoverySession(session), false);
  } finally {
    restore();
  }
});
