/**
 * Print the Capgo bundle version for the current build.
 *
 *   OTA_BASE_VERSION         web base semver (default: package.json version)
 *   OTA_CHANNEL              Capgo channel (default: production-android)
 *   OTA_MIN_NATIVE_VERSION   minimum installed native version (default: base)
 *   OTA_SCHEMA_VERSION       local exam storage schema (default: 1)
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildReleaseVersion } from '../src/features/app-update/version.ts';

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
) as { version?: string };

const base =
  process.env.OTA_BASE_VERSION?.trim() ||
  String(pkg.version ?? '').split('-')[0] ||
  '';
const channel = process.env.OTA_CHANNEL?.trim() || 'production-android';
const minNative = process.env.OTA_MIN_NATIVE_VERSION?.trim() || base;
const schema = Number(process.env.OTA_SCHEMA_VERSION ?? 1);

try {
  process.stdout.write(
    `${buildReleaseVersion(base, channel, minNative, schema)}\n`
  );
} catch (error) {
  console.error(
    `[ota-version] ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
