import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecoveryParams, validatePasswordForm } from './changePasswordUtils';

const withLocationHash = async (hash: string, run: () => void) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { hash } },
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
};

test('recovery callback recognizes Supabase PKCE query codes on the change-password route', async () => {
  await withLocationHash('', () => {
    const recovery = getRecoveryParams(new URLSearchParams('mode=recovery&code=opaque-code'));
    assert.equal(recovery.isRecovery, true);
    assert.equal(recovery.code, 'opaque-code');
    assert.equal(recovery.accessToken, null);
  });
});

test('recovery callback recognizes Supabase access/refresh tokens in the URL fragment', async () => {
  await withLocationHash('#access_token=access&refresh_token=refresh&type=recovery', () => {
    const recovery = getRecoveryParams(new URLSearchParams());
    assert.equal(recovery.isRecovery, true);
    assert.equal(recovery.accessToken, 'access');
    assert.equal(recovery.refreshToken, 'refresh');
  });
});

test('password update requires the current password outside recovery mode', () => {
  assert.match(
    validatePasswordForm({
      isRecoveryMode: false,
      oldPassword: '',
      newPassword: 'new-password-123',
      confirmPassword: 'new-password-123',
    }) ?? '',
    /বর্তমান পাসওয়ার্ড/
  );
  assert.equal(
    validatePasswordForm({
      isRecoveryMode: true,
      oldPassword: '',
      newPassword: 'new-password-123',
      confirmPassword: 'new-password-123',
    }),
    null
  );
});
