import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The version people see comes from the Android build (android/app/build.gradle), so there is one place to bump it
const gradle = readFileSync(new URL("./android/app/build.gradle", import.meta.url), "utf8");
const appVersion = `${gradle.match(/versionName "([^"]+)"/)?.[1] ?? "dev"} (${gradle.match(/versionCode (\d+)/)?.[1] ?? "0"})`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  test: { include: ["src/**/*.test.ts"] },
});
