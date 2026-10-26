/**
 * OTA build-time configuration.
 *
 * VITE_OTA_CHANNEL is baked into the web bundle used for OTA delivery and must
 * match the native build's POROKH_OTA_CHANNEL. The default is the production
 * Android channel; staging/native debug builds must override both.
 */
const env = (import.meta as { env?: Record<string, string | undefined> }).env;

export const OTA_CHANNEL =
  env?.VITE_OTA_CHANNEL?.trim() || 'production-android';

/**
 * Version of the local exam storage format (Phase 1 IndexedDB v1 + localStorage
 * bundle v1). A bundle may only activate against the exact schema it declares.
 */
export const OTA_LOCAL_SCHEMA_VERSION = 1;

/** Non-intrusive check cadence. */
export const OTA_INITIAL_CHECK_DELAY_MS = 4_000;
export const OTA_FOREGROUND_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Bounded retry/backoff for checks and downloads. */
export const OTA_RETRY_BASE_MS = 30_000;
export const OTA_RETRY_MAX_MS = 6 * 60 * 60 * 1000;
export const OTA_REJECT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const OTA_MAX_DOWNLOAD_ATTEMPTS = 3;

/**
 * Only activate automatically when the app returns to the foreground and the
 * gate has stayed open for this long after startup. This gives resumed exam
 * pages time to re-register their activity first.
 */
export const OTA_ACTIVATION_GRACE_MS = 30_000;

export const OTA_EXAM_ROUTE_PATTERNS: RegExp[] = [
  /^\/exam\/live(?:\/|$)/,
  /^\/exam\/attempt\/[^/]+(?:\/|$)/,
  /^\/exam\/challenge-play\/[^/]+(?:\/|$)/,
  /^\/admission\/exam\/[^/]+(?:\/|$)/,
];
