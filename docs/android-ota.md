# Android + OTA updates

Porokh ships as a Capacitor 8 Android shell. The web app is bundled inside the
APK for first-run/offline use, and Capgo delivers web-only updates afterwards.
Native code, plugins and permissions only change through a new APK/AAB.

## Update flow

1. **Check** – `getLatest()` runs 4 s after boot, when the app returns to the
   foreground after 6 h, and on reconnect. Checks are skipped while a mounted
   exam page is active or the retry backoff is active. Persisted attempts,
   pending submissions and unsynced answers block activation instead of
   blocking the download.
2. **Verify metadata** – the release version encodes channel, minimum native
   version and local DB schema (`version.ts`). Mismatches are rejected before
   any download.
3. **Download + verify** – the bundle is downloaded through Capgo, the returned
   version/checksum/state are checked against the channel metadata, and the
   installed bundle list is checked again.
4. **Stage** – the verified bundle is persisted as staged. Nothing reloads.
5. **Gate** – before activation, the staged bundle is checked against
   `list()` again and independent checks run:
   - runtime exam activity registered by exam pages (`examActivity.ts`),
   - persisted Phase 1 attempts/submissions/answers (`activationGate.ts`),
   - local schema health (`schema.ts`),
   - the current route as a last-resort guard.
6. **Activate** – only when every check passes, `set({ id })` is called and a
   pending marker is written first. If `set()` fails, the bundle stays staged.
7. **Confirm next boot** – `notifyAppReady()` runs only after the new bundle
   starts: pending marker matches the running version and local storage opens
   against the expected schema. A bundle that breaks storage is rolled back via
   `reset({ toLastSuccessful: true }) + reload()` and is not confirmed.
8. **Rollback visibility** – an update that never became current is reported as
   `activation_failed`; its version is cooled down for 24 h.

No OTA code runs on the website/PWA: `Capacitor.isNativePlatform()` is required.

## Version scheme

```
1.4.0-ota.production-android.nv1.2.0.db1
│     │   │                 │       └ local exam storage schema (exact match)
│     │   │                 └ minimum installed native version
│     │   └ Capgo channel
│     └ OTA marker
└ web base version
```

- Native `versionName`: plain `1.4.0`; `versionCode` is `major*10000 + minor*100 + patch`
  (override with `ANDROID_VERSION_CODE`).
- A bundle with `db2` never activates against local schema `1`.
- A bundle requiring `nv1.2.0` is rejected on a `1.1.x` APK.
- Automatic database migration is intentionally not performed by an OTA bundle.
  Changing the local schema requires a native release with an explicit migration.

## Local commands

All CLIs are invoked through `node` because Termux's `/usr/bin/env` cannot run
the `node_modules/.bin` shims.

```bash
node node_modules/typescript/bin/tsc --noEmit
node node_modules/tsx/dist/cli.mjs --test <files from package.json>
node node_modules/typescript/bin/tsc && node node_modules/vite/bin/vite.js build

node scripts/sync-native-version.mjs   # sync package.json version into build.gradle
node node_modules/@capacitor/cli/bin/capacitor sync android
node node_modules/@capacitor/cli/bin/capacitor open android
```

In a normal shell/CI the equivalent npm scripts (`typecheck`, `test`, `build`,
`native:version`, `native:sync`, `native:open`) work as usual.

A local Android build needs **Java 21** and the Android SDK (Capacitor 8).
Neither is available in this workspace, so APK/AAB builds are CI-only here.

## Channels and keys

- Channels: `production-android` (default) and `staging-android`.
- Set both `POROKH_OTA_CHANNEL` (native/cap sync) and `VITE_OTA_CHANNEL` (web
  bundle) to the same channel for staging builds.
- `CAPGO_PUBLIC_KEY` is a public key, not a secret; the matching private key
  stays offline or in CI and is never committed.
- Capgo CLI upload checks that `notifyAppReady()` exists in the source and that
  an entry `index.html` is at the bundle root.
- Encryption/signing (Capgo key v2) is optional but recommended. Add
  `--key-v2 <path>` to the upload and keep the key outside the repository.

## GitHub Actions

`.github/workflows/android.yml` builds a debug APK with Java 21 + the Android
SDK and uploads it as an artifact. It does **not** sign a release build.

`.github/workflows/ota-release.yml` is manual and publish-disabled by default:

1. run it on `main`,
2. pass `base_version` (must produce a version never used before),
3. optionally set `min_native_version` and `rollout`,
4. tick `publish` only after reviewing the build.

Required repository configuration:

- secret `CAPGO_API_KEY`
- variable `CAPGO_PUBLIC_KEY` (optional; enables encrypted updates)
- the `production-android` GitHub environment (used for protection rules)

The workflow computes the bundle version with `npm run ota:version` and refuses
to upload without the API key. `--fail-on-incompatible` stops releases whose
native plugin set does not match the channel.

## Operational checks

- Verify a release on a **test Supabase project** and a staging channel first.
- Keep the native APK installable: if OTA activation fails, the previous bundle
  must still boot and local exam data must remain readable.
- Capgo dashboard can roll a channel back; the client still re-checks channel,
  native version and schema before activating.
- Never bump the local schema or add Android permissions as part of an OTA-only
  release.
