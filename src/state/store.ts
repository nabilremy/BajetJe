import { useSyncExternalStore } from "react";
import { freshCommitments, type Commitment, type Elig, type Payday, type SalaryMode } from "../engine";
import { loadEncrypted, saveEncrypted, wipeStorage } from "./storage";

export type SplitView = "bars" | "jars" | "ledger";
export type Lang = "en" | "ms";
export type Look = "simple" | "detailed";

/** A named copy of the commitment list, kept on the phone so it can be brought back later. */
export type SavedList = { id: string; name: string; items: Commitment[] };
export const MAX_SAVED_LISTS = 12;

export type AppState = {
  schema: 1;
  mode: SalaryMode;
  raw: string;
  payday: Payday | null;
  variant: SplitView;
  commitments: Commitment[];
  savedLists: SavedList[];
  carPrice: number;
  carSwap: boolean;
  carDown: number;
  home: "rent" | "buy";
  rate: number;
  homeDown: number;
  elig: Elig;
  eligOpen: boolean;
  lang: Lang;
  /** My Plan view: Simple (default) or Detailed */
  look: Look;
  /** Commitments total typed in Simple mode */
  simpleTotal: number;
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
  savedLists: [],
  carPrice: 40000,
  carSwap: true,
  carDown: 0.1,
  home: "rent",
  rate: 4,
  homeDown: 0.1,
  elig: { first: null, citizen: null, age: null },
  eligOpen: false,
  lang: "en",
  look: "simple",
  simpleTotal: 0,
  welcomed: false,
});

/** Merge anything loaded from storage onto defaults, so older or partial data still works. */
export function normalise(x: unknown): AppState {
  const s = { ...fresh(), ...(x && typeof x === "object" ? (x as Partial<AppState>) : {}) };
  s.raw = String(s.raw ?? "").replace(/\D/g, "").slice(0, 7);
  if (!Array.isArray(s.commitments)) s.commitments = freshCommitments();
  const tidy = (list: Commitment[]) =>
    list.map((c) => ({
      ...c,
      amt: Math.max(0, Math.floor(+c.amt || 0)),
      bucket: c.bucket ?? (c.name === "Streaming & apps" ? "wants" : c.cat === "Investment" ? "savings" : "needs"),
    }));
  s.commitments = tidy(s.commitments);
  s.savedLists = (Array.isArray(s.savedLists) ? s.savedLists : [])
    .filter((l) => l && typeof l.id === "string" && Array.isArray(l.items))
    .slice(0, MAX_SAVED_LISTS)
    .map((l) => ({ id: l.id, name: String(l.name ?? "").slice(0, 24), items: tidy(l.items) }));
  s.elig = { ...fresh().elig, ...s.elig };
  if (s.lang !== "ms") s.lang = "en";
  if (s.look !== "detailed") s.look = "simple";
  s.simpleTotal = Math.max(0, Math.floor(+s.simpleTotal || 0));
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

/** Wipes everything on this phone. With keepLists, the saved commitment lists survive (re-encrypted under a new key). */
export async function wipeAll(keepLists = false) {
  clearTimeout(timer);
  const lists = keepLists ? S.savedLists : [];
  await wipeStorage();
  S = { ...fresh(), savedLists: lists };
  if (lists.length) await saveEncrypted(S);
  emit();
}
