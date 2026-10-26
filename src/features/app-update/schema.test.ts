import test from 'node:test';
import assert from 'node:assert/strict';

import { checkLocalDataHealth } from './schema.ts';
import {
  MemoryOtaKeyValue,
  OTA_STORAGE_KEYS,
  type OtaKeyValue,
} from './persistence.ts';
import { MemoryOfflineExamStorage } from '../exam/offline/storage.ts';

const storageWithInit = (init: () => Promise<void>) =>
  ({ init }) as unknown as Parameters<typeof checkLocalDataHealth>[0];

test('first boot creates the v1 schema marker after storage init', async () => {
  const kv = new MemoryOtaKeyValue();
  const health = await checkLocalDataHealth(
    new MemoryOfflineExamStorage(),
    kv
  );

  assert.deepEqual(health, { ok: true });
  const marker = JSON.parse(kv.getItem(OTA_STORAGE_KEYS.localSchema) ?? '{}');
  assert.equal(marker.schemaVersion, 1);
});

test('a different schema marker blocks the update even if storage opens', async () => {
  const kv = new MemoryOtaKeyValue();
  kv.setItem(
    OTA_STORAGE_KEYS.localSchema,
    JSON.stringify({ schemaVersion: 2, createdAt: '' })
  );

  const health = await checkLocalDataHealth(
    new MemoryOfflineExamStorage(),
    kv
  );

  assert.deepEqual(health, {
    ok: false,
    reason: 'storage_schema_incompatible',
  });
});

test('a corrupt marker is treated as incompatible, never recreated silently', async () => {
  const kv = new MemoryOtaKeyValue();
  kv.setItem(OTA_STORAGE_KEYS.localSchema, '{not-json');

  const health = await checkLocalDataHealth(
    new MemoryOfflineExamStorage(),
    kv
  );

  assert.deepEqual(health, {
    ok: false,
    reason: 'storage_schema_incompatible',
  });
});

test('IndexedDB version errors are reported as schema incompatibility', async () => {
  const kv = new MemoryOtaKeyValue();
  const health = await checkLocalDataHealth(
    storageWithInit(async () => {
      throw new Error('VersionError: requested version is lower');
    }),
    kv
  );

  assert.deepEqual(health, {
    ok: false,
    reason: 'storage_schema_incompatible',
  });
});

test('other storage failures are reported as unavailable', async () => {
  const kv = new MemoryOtaKeyValue();
  const health = await checkLocalDataHealth(
    storageWithInit(async () => {
      throw new Error('QuotaExceededError');
    }),
    kv
  );

  assert.deepEqual(health, { ok: false, reason: 'storage_unavailable' });
});

test('unreadable or unwritable marker storage fails closed', async () => {
  const unreadable: OtaKeyValue = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => undefined,
    removeItem: () => undefined,
  };

  assert.deepEqual(
    await checkLocalDataHealth(new MemoryOfflineExamStorage(), unreadable),
    { ok: false, reason: 'storage_unavailable' }
  );

  const unwritable: OtaKeyValue = {
    getItem: () => null,
    setItem: () => {
      throw new Error('quota');
    },
    removeItem: () => undefined,
  };

  assert.deepEqual(
    await checkLocalDataHealth(new MemoryOfflineExamStorage(), unwritable),
    { ok: false, reason: 'storage_unavailable' }
  );
});
