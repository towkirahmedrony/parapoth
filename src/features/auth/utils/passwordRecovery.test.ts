import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PASSWORD_RECOVERY_PUBLIC_MESSAGE,
  PASSWORD_RECOVERY_REDIRECT_PATH,
  requestPasswordRecovery,
} from './passwordRecovery';

test('recovery calls Supabase Auth directly and uses the public recovery route', async () => {
  const calls: Array<{ email: string; redirectTo: string }> = [];
  const auth = {
    resetPasswordForEmail: async (email: string, options: { redirectTo: string }) => {
      calls.push({ email, redirectTo: options.redirectTo });
      return { error: null };
    },
  };

  await requestPasswordRecovery('  User@Example.COM ', auth, 'https://porokhbd.vercel.app');

  assert.deepEqual(calls, [{
    email: 'user@example.com',
    redirectTo: `https://porokhbd.vercel.app${PASSWORD_RECOVERY_REDIRECT_PATH}`,
  }]);
  assert.equal(PASSWORD_RECOVERY_PUBLIC_MESSAGE.includes('account'), false);
});

test('recovery does not reject or expose Auth errors that could identify an account', async () => {
  const auth = {
    resetPasswordForEmail: async () => ({ error: { message: 'email address is registered' } }),
  };

  await assert.doesNotReject(() => requestPasswordRecovery('user@example.com', auth, 'https://example.com'));
});

test('recovery handles a rejected Auth request without exposing its details', async () => {
  const auth = {
    resetPasswordForEmail: async () => {
      throw new Error('private provider diagnostic with account details');
    },
  };

  await assert.doesNotReject(() => requestPasswordRecovery('user@example.com', auth, 'https://example.com'));
});
