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

## Offline exam data, PWA caching and OTA separation

Four storage systems exist and must not be confused:

1. **Offline exam store** (`src/features/exam/offline/`) — a versioned IndexedDB
   store (`porokh-offline-exam`, version `2`) holding attempts, submissions,
   answers and complete prepared-exam datasets. The OTA activation gate reads it
   (`listAttemptsForUser`, `getSubmission`, `getAnswers`) so a kill-and-relaunch
   cannot lose track of an unfinished attempt. `getOfflineExamStorage()` returns
   the IndexedDB store in the WebView and a memory fallback elsewhere; it never
   throws at construction.
2. **Server-owned exam state** — the authoritative attempt/submission state lives
   in the backend (`exam_attempts` etc., RLS + server-side ownership checks).
   The frontend `useExamResume` persists only a convenience snapshot in
   `localStorage` and always treats the backend attempt API as the source of
   truth.
3. **React Query cache** — a generic 24-hour `localStorage` query cache
   (`PersistQueryClientProvider`). It can rehydrate previously fetched data when
   connectivity drops, but it is not an offline submission queue.
4. **PWA service worker** — `public/firebase-messaging-sw.js` handles Firebase
   Cloud Messaging push only; it is not an app-shell cache and does not conflict
   with the exam store or OTA.
5. **OTA (Capgo)** — native-Android-only web bundle updates; unrelated to any
   PWA asset update.

**Wiring status (verified 2026-10-26):** the offline exam flow is now wired into
the admission exam path:

- **Prepare** — `AdmissionExamCard` offers "Download offline". Preparation starts
  (or resumes) the authoritative server attempt via `POST /exams/user/attempts/start`
  and caches its frozen question set + deadline + metadata in
  `PreparedExamRecord`; an incomplete download is rejected before being marked
  ready (`prepareExamForOffline`).
- **Start/resume offline** — `useAdmissionExamSession` falls back to the prepared
  dataset when the attempt API is unreachable and the device is offline, reusing
  the same `QuestionCard` renderer and server-issued deadline (no timer reset).
- **Durable answers** — every answer change is written to `OfflineExamStorage`
  (revision-guarded, last-write-wins) so a reload/restart never loses it.
- **Submission queue** — offline (or network-failed) submissions are queued in
  `SubmissionRecord(status: 'pending')` and retried with bounded backoff by
  `syncPendingSubmissions`, which is idempotent because the backend atomically
  claims the server attempt and returns the existing result on a duplicate.
- **OTA protection** — the same persisted state (`in_progress` attempt,
  non-`confirmed` submission, non-`synced` answers) blocks activation via
  `activationGate.ts`; this is exercised end-to-end in `offlineExamService.test.ts`.

The attempt id is always server-issued, so offline work is never an invented
client attempt: the server has already authorized it and its deadline at prepare
time, and offline cannot extend that deadline.

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
Java 21 is available in this workspace; the Android SDK (`sdkmanager`, `adb`)
and the Gradle wrapper toolchain are not, so APK/AAB builds are CI-only until
the SDK is installed.

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
