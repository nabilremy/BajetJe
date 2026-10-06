import { rates, type Rates } from "./rates";

export type CarDown = 0 | 0.1 | 0.2 | 0.3;
export type CarVerdict = "Comfortable" | "Tight" | "Unaffordable";

const months = (r: Rates) => r.car.years * 12;

/** Instalment + insurance per RM of car price (9 yrs, ~3% flat). */
export const carCoef = (dp: number, r: Rates = rates()) =>
  ((1 - dp) * r.car.flatFactor) / months(r) + r.car.insuranceRate / 12;

export type CarCost = { inst: number; petrol: number; ins: number; service: number; total: number; down: number };

/** True monthly cost of a car: instalment, petrol, insurance and road tax, servicing. */
export function carAllIn(price: number, dp: number, r: Rates = rates()): CarCost {
  const inst = (price * (1 - dp) * r.car.flatFactor) / months(r);
  const ins = (price * r.car.insuranceRate) / 12 + r.car.roadTaxMonthly;
  return {
    inst,
    petrol: r.car.petrol,
    ins,
    service: r.car.servicing,
    total: inst + r.car.petrol + ins + r.car.servicing,
    down: price * dp,
  };
}

/** Highest price whose all-in cost stays within `share` of take-home. */
export const carLimit = (net: number, share: number, dp: number, r: Rates = rates()) =>
  Math.max(0, (net * share - (r.car.roadTaxMonthly + r.car.petrol + r.car.servicing)) / carCoef(dp, r));

export const carVerdict = (sharePct: number, r: Rates = rates()): [CarVerdict, "lime" | "amber" | "coral"] =>
  sharePct <= r.car.comfortableShare * 100
    ? ["Comfortable", "lime"]
    : sharePct <= r.car.tightShare * 100
      ? ["Tight", "amber"]
      : ["Unaffordable", "coral"];
