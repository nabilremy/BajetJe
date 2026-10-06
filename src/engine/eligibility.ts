import { rates, type Rates } from "./rates";
import type { Elig, SalaryMode } from "./types";

export type Eligibility =
  | { state: "pending" }
  | { state: "no"; why: string }
  | { state: "yes"; schemes: string[]; note: string };

export const ELIG_DISCLAIMER = "Indicative only. The bank and scheme make the final decision.";

/**
 * Indicative first-home 100% financing check.
 * Skim Rumah Pertamaku: gross <= RM 5k (single), aged 40 or below. SJKP: income <= RM 11k. Banks decide.
 */
export function eligibility(e: Elig, mode: SalaryMode, raw: string, r: Rates = rates()): Eligibility {
  const g = mode === "gross" ? +raw || 0 : null;
  if (e.first === null || e.citizen === null || e.age === null) return { state: "pending" };
  if (!e.first) return { state: "no", why: "100% financing is only for your first home." };
  if (!e.citizen) return { state: "no", why: "First-home schemes are for Malaysian citizens only." };
  const schemes: string[] = [];
  if (e.age && g !== null && g <= r.eligibility.srpMaxGross) schemes.push("Skim Rumah Pertamaku");
  if (g === null || g <= r.eligibility.sjkpMaxIncome) schemes.push("SJKP");
  if (!schemes.length)
    return { state: "no", why: `Your income is above the RM ${r.eligibility.sjkpMaxIncome.toLocaleString("en-MY")} limit for SJKP.` };
  return { state: "yes", schemes, note: g === null ? "Income checked against take-home; your gross decides." : "" };
}
