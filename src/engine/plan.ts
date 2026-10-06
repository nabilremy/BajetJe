import { cycle, type Cycle } from "./cycle";
import { payroll, type Payroll } from "./payroll";
import { rates, type Rates } from "./rates";
import type { Bucket, Commitment, Payday, SalaryMode } from "./types";

export type PlanInput = {
  mode: SalaryMode;
  /** digits only, e.g. "3500" */
  raw: string;
  payday: Payday | null;
  commitments: Commitment[];
  /** Monthly total typed in Simple mode; used as one needs commitment until any item has an amount. */
  simpleTotal?: number;
};

export type Plan = Payroll & {
  raw: number;
  days: number;
  today: number;
  daysLeft: number;
  needs: number;
  wants: number;
  savings: number;
  savingsOut: number;
  needsC: number;
  wantsC: number;
  savC: number;
  /** sum of every listed item (all buckets) */
  listed: number;
  /** Simple-mode total in use (0 once items are listed) */
  lump: number;
  /** fixed commitments = needs + wants buckets */
  commit: number;
  debt: number;
  ratio: number;
  debtRatio: number;
  /** left after fixed commitments and the 20% savings target (prototype "leftForYou"; used for the savings tip) */
  left: number;
  /**
   * Extra money: take-home minus everything listed (needs + wants + savings). Savings the user hasn't filled in
   * stay here; the 20% target is a suggestion, never a silent deduction.
   */
  extra: number;
  daily: number;
  cy: Cycle;
};

/** The whole monthly plan from salary, payday and commitments. */
export function calc(s: PlanInput, now: Date = new Date(), r: Rates = rates()): Plan {
  const raw = +s.raw || 0;
  const p = s.mode === "gross" ? payroll(raw, r) : { epf: 0, socso: 0, eis: 0, pcb: 0, net: raw };
  const net = Math.round(p.net);
  const cy = cycle(s.payday, now);
  const days = cy.days;
  const needs = Math.round(net * r.split.needs);
  const wants = Math.round(net * r.split.wants);
  const savings = net - needs - wants;
  const sumB = (b: Bucket) =>
    s.commitments.filter((c) => c.bucket === b).reduce((a, c) => a + (+c.amt || 0), 0);
  const listed = s.commitments.reduce((a, c) => a + (+c.amt || 0), 0);
  const lump = listed ? 0 : +(s.simpleTotal ?? 0) || 0;
  const needsC = sumB("needs") + lump;
  const wantsC = sumB("wants");
  const savC = sumB("savings");
  const commit = needsC + wantsC;
  const savingsOut = Math.max(savings, savC);
  const debt = s.commitments.filter((c) => c.debt).reduce((a, c) => a + (+c.amt || 0), 0);
  const ratio = net ? (commit / net) * 100 : 0;
  const left = net - commit - savingsOut;
  const extra = net - commit - savC;
  // Nothing entered yet: spend the 30% wants share. Otherwise: extra money over the pay cycle.
  const daily = Math.max(0, Math.floor(commit + savC ? extra / days : wants / days));
  return {
    ...p,
    raw,
    net,
    days,
    today: cy.idx,
    daysLeft: cy.left,
    needs,
    wants,
    savings,
    savingsOut,
    needsC,
    wantsC,
    savC,
    listed,
    lump,
    commit,
    debt,
    ratio,
    debtRatio: net ? (debt / net) * 100 : 0,
    left,
    extra,
    daily,
    cy,
  };
}

export const isKlShort = (needs: number, r: Rates = rates()) => needs < r.split.klNeedsBasics;
