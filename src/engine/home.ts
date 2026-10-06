import { rates, type Rates } from "./rates";

export type HomeDown = 0 | 0.1 | 0.2;
export type Home = {
  inst: number;
  loan: number;
  price: number;
  dep: number;
  capped: boolean;
  /** months to save the deposit; 0 when no deposit, Infinity when no savings */
  months: number;
};

/** Instalment at `rate`% over 35 years for a loan amount. */
export const instalmentFor = (loan: number, rate: number, r: Rates = rates()) => {
  const i = rate / 1200;
  return (loan * i) / (1 - Math.pow(1 + i, -r.home.months));
};

/** Home price you can carry with a 30% of take-home instalment. 0% down is capped at RM 500k. */
export function home(net: number, savings: number, rate: number, dp: number, r: Rates = rates()): Home {
  const i = rate / 100 / 12;
  const n = r.home.months;
  const inst = net * r.home.share;
  const loan = (inst * (1 - Math.pow(1 + i, -n))) / i;
  let price = loan / (1 - dp);
  const capped = dp === 0 && price > r.home.fullLoanPriceCap;
  if (capped) price = r.home.fullLoanPriceCap;
  const dep = price * dp;
  return {
    inst,
    loan: price * (1 - dp),
    price,
    dep,
    capped,
    months: dep === 0 ? 0 : savings ? Math.ceil(dep / savings) : Infinity,
  };
}
