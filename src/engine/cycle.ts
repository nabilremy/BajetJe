import type { Payday } from "./types";

export const DAY = 86400000;

/** Payday in a given month. If the day doesn't exist (e.g. 31 Feb), use the last day. */
export function payDate(y: number, m: number, pd: Payday): Date {
  const last = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, pd === "last" ? last : Math.min(+pd, last));
}

export type Cycle = {
  prev: Date;
  next: Date;
  /** days in this pay cycle */
  days: number;
  /** 1-based day of the cycle that is today */
  idx: number;
  /** days until next payday */
  left: number;
};

/** Pay cycle = last payday (inclusive) to next payday (exclusive). Payday itself starts a new cycle. */
export function cycle(pd: Payday | null, now: Date = new Date()): Cycle {
  const p = pd || "last";
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const here = payDate(t.getFullYear(), t.getMonth(), p);
  const [prev, next] =
    t >= here
      ? [here, payDate(t.getFullYear(), t.getMonth() + 1, p)]
      : [payDate(t.getFullYear(), t.getMonth() - 1, p), here];
  return {
    prev,
    next,
    days: Math.round((+next - +prev) / DAY),
    idx: Math.round((+t - +prev) / DAY) + 1,
    left: Math.round((+next - +t) / DAY),
  };
}
