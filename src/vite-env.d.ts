/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional static URL serving a newer rates.json */
  readonly VITE_RATES_URL?: string;
}
