import type { ReleaseMetadata } from './types';

/**
 * Bundle version scheme (valid semver, encoded in the prerelease field):
 *
 *   1.4.0-ota.production-android.nv1.2.0.db1
 *   │     │   │                 │       └ local storage schema required
 *   │     │   │                 └ minimum installed native version
 *   │     │   └ Capgo release channel
 *   │     └ OTA marker
 *   └ web base version
 *
 * Capgo stores this string verbatim, so the client can reject bundles meant for
 * another channel, another native runtime, or another local schema *before* it
 * downloads or activates them.
 */
const RELEASE_VERSION_PATTERN =
  /^(\d+\.\d+\.\d+)-ota\.([a-z0-9][a-z0-9-]*)\.nv(\d+(?:\.\d+){0,2})\.db(\d+)$/;

const PLAIN_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export const buildReleaseVersion = (
  baseVersion: string,
  channel: string,
  minNativeVersion: string,
  requiredSchemaVersion: number
): string => {
  if (!PLAIN_VERSION_PATTERN.test(baseVersion)) {
    throw new Error(`Invalid base version: ${baseVersion}`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(channel)) {
    throw new Error(`Invalid OTA channel: ${channel}`);
  }
  if (!/^\d+(?:\.\d+){0,2}$/.test(minNativeVersion)) {
    throw new Error(`Invalid native version: ${minNativeVersion}`);
  }
  if (!Number.isInteger(requiredSchemaVersion) || requiredSchemaVersion < 1) {
    throw new Error(`Invalid schema version: ${requiredSchemaVersion}`);
  }

  return `${baseVersion}-ota.${channel}.nv${minNativeVersion}.db${requiredSchemaVersion}`;
};

export const parseReleaseVersion = (
  version: string
): ReleaseMetadata | null => {
  const match = RELEASE_VERSION_PATTERN.exec(version.trim());

  if (!match) return null;

  return {
    baseVersion: match[1],
    channel: match[2],
    minNativeVersion: match[3],
    requiredSchemaVersion: Number(match[4]),
  };
};

/** Plain (non-OTA) semver base, or the base of an OTA release version. */
export const baseVersionOf = (version: string | null | undefined): string | null => {
  if (!version) return null;
  const trimmed = version.trim();
  if (PLAIN_VERSION_PATTERN.test(trimmed)) return trimmed;
  return parseReleaseVersion(trimmed)?.baseVersion ?? null;
};

const toParts = (version: string): [number, number, number] | null => {
  const match = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(version.trim());
  if (!match) return null;

  return [
    Number(match[1]),
    Number(match[2] ?? 0),
    Number(match[3] ?? 0),
  ];
};

/** -1 when a < b, 0 when equal, 1 when a > b. */
export const compareNumericVersions = (
  a: string,
  b: string
): number | null => {
  const left = toParts(a);
  const right = toParts(b);

  if (!left || !right) return null;

  for (let index = 0; index < 3; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }

  return 0;
};

/**
 * A bundle may only run on a native binary at least as new as the bundle
 * requires. Unknown/invalid installed versions are treated as incompatible so
 * an update can never be activated on an unidentified runtime.
 */
export const isNativeVersionCompatible = (
  installed: string | null,
  minimum: string
): boolean => {
  if (!installed) return false;
  const comparison = compareNumericVersions(installed, minimum);
  return comparison !== null && comparison >= 0;
};

export const isSchemaVersionCompatible = (
  required: number,
  supported: number
): boolean => Number.isInteger(required) && required === supported;

export const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const sameChecksum = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();
