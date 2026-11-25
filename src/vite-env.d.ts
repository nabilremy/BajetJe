/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional static URL serving a newer rates.json */
  readonly VITE_RATES_URL?: string;
  /** Web3Forms access key for in-app feedback (in .env.local, not in git; see RELEASING.md) */
  readonly VITE_FEEDBACK_KEY?: string;
}

/** "1.0.0 (1)": versionName and versionCode from android/app/build.gradle */
declare const __APP_VERSION__: string;
