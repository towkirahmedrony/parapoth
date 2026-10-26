import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Channel is baked into the native binary at build time. OTA bundles are only
 * accepted when their release metadata names the same channel.
 *
 * The public key is Capgo's code-signing/encryption public key (never the
 * private key). It is embedded in the APK so downloaded bundles can be
 * authenticated on-device. Set CAPGO_PUBLIC_KEY from CI before building the
 * native app; when it is absent the updater still verifies SHA-256 checksums
 * but cannot verify the provider signature.
 */
const otaChannel = process.env.POROKH_OTA_CHANNEL || 'production-android';
const capgoPublicKey = process.env.CAPGO_PUBLIC_KEY;

const config: CapacitorConfig = {
  appId: 'com.parapothexam.porokh',
  appName: 'Porokh',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    CapacitorUpdater: {
      // Activation is always decided by the app's exam-aware gate, never by the
      // plugin's background/instant modes.
      autoUpdate: 'off',
      // Give the startup health check time to call notifyAppReady().
      appReadyTimeout: 20_000,
      responseTimeout: 20_000,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
      directUpdate: false,
      defaultChannel: otaChannel,
      keepUrlPathAfterReload: true,
      ...(capgoPublicKey ? { publicKey: capgoPublicKey } : {}),
    },
  },
};

export default config;
