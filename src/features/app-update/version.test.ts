import test from 'node:test';
import assert from 'node:assert/strict';

import {
  baseVersionOf,
  buildReleaseVersion,
  compareNumericVersions,
  isHttpsUrl,
  isNativeVersionCompatible,
  isSchemaVersionCompatible,
  parseReleaseVersion,
  sameChecksum,
} from './version.ts';

test('release version round-trips channel, native minimum and schema', () => {
  const version = buildReleaseVersion(
    '1.4.0',
    'production-android',
    '1.2.0',
    1
  );

  assert.equal(version, '1.4.0-ota.production-android.nv1.2.0.db1');
  assert.deepEqual(parseReleaseVersion(version), {
    baseVersion: '1.4.0',
    channel: 'production-android',
    minNativeVersion: '1.2.0',
    requiredSchemaVersion: 1,
  });
});

test('parse rejects legacy/plain and malformed OTA versions', () => {
  assert.equal(parseReleaseVersion('1.4.0'), null);
  assert.equal(parseReleaseVersion('1.4.0-ota.production-android.db1'), null);
  assert.equal(parseReleaseVersion('1.4.0-ota.staging.nv1.2.db2.extra'), null);
  assert.equal(parseReleaseVersion('1.4-ota.production-android.nv1.0.0.db1'), null);
  assert.equal(parseReleaseVersion('1.4.0-ota..nv1.0.0.db1'), null);
});

test('build rejects invalid inputs', () => {
  assert.throws(() => buildReleaseVersion('1.4', 'production-android', '1.0.0', 1));
  assert.throws(() => buildReleaseVersion('1.4.0', 'Production Android', '1.0.0', 1));
  assert.throws(() => buildReleaseVersion('1.4.0', 'production-android', 'v1', 1));
  assert.throws(() => buildReleaseVersion('1.4.0', 'production-android', '1.0.0', 0));
});

test('native versions compare numerically, not lexically', () => {
  assert.equal(compareNumericVersions('1.10.0', '1.9.9'), 1);
  assert.equal(compareNumericVersions('1.0', '1.0.0'), 0);
  assert.equal(compareNumericVersions('2', '1.99.99'), 1);
  assert.equal(compareNumericVersions('broken', '1.0.0'), null);
  assert.equal(isNativeVersionCompatible('1.2.0', '1.2.0'), true);
  assert.equal(isNativeVersionCompatible('1.3.0', '1.2.0'), true);
  assert.equal(isNativeVersionCompatible('1.1.9', '1.2.0'), false);
  assert.equal(isNativeVersionCompatible(null, '1.2.0'), false);
});

test('schema compatibility is exact, never a range', () => {
  assert.equal(isSchemaVersionCompatible(1, 1), true);
  assert.equal(isSchemaVersionCompatible(2, 1), false);
  assert.equal(isSchemaVersionCompatible(0, 1), false);
  assert.equal(isSchemaVersionCompatible(1.5, 1), false);
});

test('base version extraction works for plain and OTA versions', () => {
  assert.equal(baseVersionOf('1.0.0'), '1.0.0');
  assert.equal(
    baseVersionOf('1.4.0-ota.production-android.nv1.2.0.db1'),
    '1.4.0'
  );
  assert.equal(baseVersionOf('nonsense'), null);
  assert.equal(baseVersionOf(null), null);
});

test('download URLs must be https and checksums compare case-insensitively', () => {
  assert.equal(isHttpsUrl('https://example.com/bundle.zip'), true);
  assert.equal(isHttpsUrl('http://example.com/bundle.zip'), false);
  assert.equal(isHttpsUrl('/bundle.zip'), false);
  assert.equal(sameChecksum('ABCDEF', 'abcdef'), true);
  assert.equal(sameChecksum('abc', 'abd'), false);
});
