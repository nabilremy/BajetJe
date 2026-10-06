import { fmt, type Plan } from "../engine";
import type { T } from "../i18n";

/**
 * The 20% savings target as a suggestion, never a silent deduction:
 * how much more to save to reach it (and what a day would then be), or a nod when it's already met.
 */
export function savingsTip(c: Plan, t: T): string {
  if (c.extra <= 0) return t("simple.tipHalf", { needs: fmt(c.needs) });
  const more = Math.max(0, c.savings - c.savC);
  if (more > 0) return t("simple.tipSave", { more: fmt(more), daily: fmt(Math.max(0, Math.floor((c.extra - more) / c.days))) });
  return t("simple.tipSaved", { saved: fmt(c.savC), pct: Math.round((c.savC / (c.net || 1)) * 100) });
}
