import type { OfflineExamStorage } from '../exam/offline/storage';
import { OTA_LOCAL_SCHEMA_VERSION } from './config';
import { OTA_STORAGE_KEYS, type OtaKeyValue } from './persistence';
import type { OtaBlockReason } from './types';

/**
 * The local schema marker is the only durable proof that a bundle started
 * against data it understands. It is created on first successful storage
 * init and never migrated automatically: an OTA bundle that needs a different
 * schema must ship as a new native build (with a real migration) instead.
 */
type SchemaMarker = {
  schemaVersion: number;
  createdAt: string;
};

export type LocalDataHealth =
  | { ok: true }
  | { ok: false; reason: Extract<OtaBlockReason, 'storage_unavailable' | 'storage_schema_incompatible'> };

const versionErrorPattern = /version|upgrade|schema|downgrade/i;

const parseMarker = (raw: string | null): SchemaMarker | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SchemaMarker>;
    if (typeof parsed.schemaVersion !== 'number' || !Number.isInteger(parsed.schemaVersion)) {
      return null;
    }
    return {
      schemaVersion: parsed.schemaVersion,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
    };
  } catch {
    return null;
  }
};

export const checkLocalDataHealth = async (
  storage: Pick<OfflineExamStorage, 'init'>,
  kv: OtaKeyValue,
  supportedSchemaVersion = OTA_LOCAL_SCHEMA_VERSION
): Promise<LocalDataHealth> => {
  let rawMarker: string | null = null;

  try {
    rawMarker = kv.getItem(OTA_STORAGE_KEYS.localSchema);
  } catch {
    return { ok: false, reason: 'storage_unavailable' };
  }

  if (rawMarker !== null) {
    const marker = parseMarker(rawMarker);
    if (!marker || marker.schemaVersion !== supportedSchemaVersion) {
      return { ok: false, reason: 'storage_schema_incompatible' };
    }
  }

  try {
    await storage.init();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      reason: versionErrorPattern.test(message)
        ? 'storage_schema_incompatible'
        : 'storage_unavailable',
    };
  }

  if (rawMarker === null) {
    const marker: SchemaMarker = {
      schemaVersion: supportedSchemaVersion,
      createdAt: new Date().toISOString(),
    };
    try {
      kv.setItem(OTA_STORAGE_KEYS.localSchema, JSON.stringify(marker));
    } catch {
      return { ok: false, reason: 'storage_unavailable' };
    }
  }

  return { ok: true };
};
