import { useSyncExternalStore } from "react";
import { freshCommitments, type Commitment, type Elig, type Payday, type SalaryMode } from "../engine";
import { loadEncrypted, saveEncrypted, wipeStorage } from "./storage";

export type SplitView = "bars" | "jars" | "ledger";
export type Lang = "en" | "ms";

export type AppState = {
  schema: 1;
  mode: SalaryMode;
  raw: string;
  payday: Payday | null;
  variant: SplitView;
  commitments: Commitment[];
  carPrice: number;
  carSwap: boolean;
  carDown: number;
  home: "rent" | "buy";
  rate: number;
  homeDown: number;
  elig: Elig;
  eligOpen: boolean;
  lang: Lang;
  /** saw the Welcome screen (first launch only) */
  welcomed: boolean;
};

export const fresh = (): AppState => ({
  schema: 1,
  mode: "gross",
  raw: "",
  payday: null,
  variant: "bars",
  commitments: freshCommitments(),
  carPrice: 40000,
  carSwap: true,
  carDown: 0.1,
  home: "rent",
  rate: 4,
  homeDown: 0.1,
  elig: { first: null, citizen: null, age: null },
  eligOpen: false,
  lang: "en",
  welcomed: false,
});

/** Merge anything loaded (storage or a backup file) onto defaults, so older or partial data still works. */
export function normalise(x: unknown): AppState {
  const s = { ...fresh(), ...(x && typeof x === "object" ? (x as Partial<AppState>) : {}) };
  s.raw = String(s.raw ?? "").replace(/\D/g, "").slice(0, 7);
  if (!Array.isArray(s.commitments)) s.commitments = freshCommitments();
  s.commitments = s.commitments.map((c) => ({
    ...c,
    amt: Math.max(0, Math.floor(+c.amt || 0)),
    bucket: c.bucket ?? (c.name === "Streaming & apps" ? "wants" : c.cat === "Investment" ? "savings" : "needs"),
  }));
  s.elig = { ...fresh().elig, ...s.elig };
  if (s.lang !== "ms") s.lang = "en";
  return s;
}

let S: AppState = fresh();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

const emit = () => listeners.forEach((l) => l());
const persist = () => {
  clearTimeout(timer);
  timer = setTimeout(() => void saveEncrypted(S), 150);
};

export const getState = () => S;

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(S) : patch;
  S = { ...S, ...p };
  persist();
  emit();
}

export function replaceState(next: AppState) {
  S = next;
  persist();
  emit();
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => S,
  );
}

export async function hydrate() {
  const saved = await loadEncrypted<AppState>();
  if (saved) S = normalise(saved);
}

export async function wipeAll() {
  clearTimeout(timer);
  await wipeStorage();
  S = fresh();
  emit();
}

/* ---------- Export / import for changing phones ---------- */

const BACKUP_APP = "bajetje";

export function exportBackup() {
  const body = JSON.stringify({ app: BACKUP_APP, schema: 1, exportedAt: new Date().toISOString(), state: S }, null, 2);
  const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
  const a = document.createElement("a");
  const d = new Date();
  a.href = url;
  a.download = `bajetje-backup-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Returns the restored state, or throws a plain-language error. */
export async function importBackup(file: File): Promise<AppState> {
  let json: { app?: string; state?: unknown };
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't a BajetJe backup.");
  }
  if (json?.app !== BACKUP_APP || !json.state) throw new Error("That file isn't a BajetJe backup.");
  const next = normalise(json.state);
  replaceState(next);
  return next;
}
