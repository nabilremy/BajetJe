import { Capacitor } from "@capacitor/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadRates } from "./engine";
import { go } from "./state/router";
import { getState, hydrate, setState } from "./state/store";
import "./styles/index.css";

async function boot() {
  await hydrate();
  const s = getState();
  document.documentElement.lang = s.lang;
  go(s.raw && s.payday ? "plan" : s.welcomed ? "salary" : "welcome", "reset");
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // Newer rates come down from a static URL; nothing personal goes up.
  void loadRates(import.meta.env.VITE_RATES_URL).then(() => setState({}));
  // The installed app ships its own files, so only the web build needs the offline worker
  if ("serviceWorker" in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

void boot();
