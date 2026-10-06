import { useApp } from "../state/store";
import { format, type Params } from "./format";
import { CALLINGS, CATEGORIES_MS, ITEM_NAMES_MS, M, NOTES } from "./messages";

export type Lang = "en" | "ms";
export type MsgKey = keyof typeof M;
export type T = (key: MsgKey, params?: Params) => string;

export const translate = (lang: Lang, key: MsgKey, params?: Params) => format(M[key][lang === "ms" ? 1 : 0], params);

/** Translator for the current language (re-renders when the language changes). */
export function useT(): T {
  const { lang } = useApp();
  return (key, params) => translate(lang, key, params);
}

export function useLang(): Lang {
  return useApp().lang;
}

/** Preset names and categories translate; names the user typed stay as written. */
export const itemName = (lang: Lang, name: string, custom?: boolean) =>
  lang === "ms" && !custom ? (ITEM_NAMES_MS[name] ?? name) : name;
export const categoryName = (lang: Lang, cat: string) => (lang === "ms" ? (CATEGORIES_MS[cat] ?? cat) : cat);

const callingIndex = Math.floor(Math.random() * CALLINGS.length);
export const calling = (lang: Lang) => CALLINGS[callingIndex][lang === "ms" ? 1 : 0];

let lastNote = "";
/** Random line from the take-home tier pool, never the same twice in a row. */
export function noteFor(net: number, lang: Lang, rand = Math.random): string {
  const pool = NOTES[lang].find(([min]) => net >= min)![1].filter((x) => x !== lastNote);
  lastNote = pool[Math.floor(rand() * pool.length)];
  return lastNote;
}
