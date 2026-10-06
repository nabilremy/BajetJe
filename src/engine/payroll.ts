import { rates, type Rates } from "./rates";

export type Payroll = { epf: number; socso: number; eis: number; pcb: number; net: number };

/** SOCSO / EIS wage bracket midpoint, capped at the RM 6,000 ceiling. */
export const bracketMid = (g: number, r: Rates = rates()) =>
  Math.min(Math.floor((g - 0.01) / 100) * 100 + 50, r.payroll.wageCeilingMidpoint);

/** Monthly deductions from gross pay. PCB is an estimate (single, no extra reliefs). */
export function payroll(gross: number, r: Rates = rates()): Payroll {
  if (!gross) return { epf: 0, socso: 0, eis: 0, pcb: 0, net: 0 };
  const P = r.payroll;
  const epf = Math.ceil(gross * P.epfEmployee);
  const mid = gross > P.wageCeiling ? P.wageCeilingMidpoint : bracketMid(gross, r);
  const socso = +(mid * P.socsoEmployee).toFixed(2);
  const eis = +(mid * P.eisEmployee).toFixed(2);
  const ci = Math.max(
    0,
    gross * 12 -
      Math.min(epf * 12, P.pcb.epfReliefCap) -
      P.pcb.personalRelief -
      Math.min((socso + eis) * 12, P.pcb.socsoEisReliefCap),
  );
  let tax = 0;
  let lo = 0;
  for (const [hiRaw, rate] of P.pcb.brackets) {
    const hi = hiRaw ?? Infinity;
    if (ci > lo) tax += (Math.min(ci, hi) - lo) * rate;
    lo = hi;
  }
  if (ci <= P.pcb.rebateMaxChargeable) tax = Math.max(0, tax - P.pcb.rebate);
  const pcb = +(tax / 12).toFixed(2);
  return { epf, socso, eis, pcb, net: gross - epf - socso - eis - pcb };
}
