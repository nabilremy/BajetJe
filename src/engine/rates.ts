import bundled from "./rates.json";

/** Versioned rates bundled with the app. A newer copy can be fetched from a static URL (see loadRates). */
export type Rates = {
  version: string;
  effective: string;
  payroll: {
    epfEmployee: number;
    socsoEmployee: number;
    eisEmployee: number;
    wageCeiling: number;
    wageCeilingMidpoint: number;
    pcb: {
      epfReliefCap: number;
      personalRelief: number;
      socsoEisReliefCap: number;
      rebate: number;
      rebateMaxChargeable: number;
      /** [upper bound of band (null = no limit), rate] */
      brackets: [number | null, number][];
    };
  };
  split: { needs: number; wants: number; klNeedsBasics: number };
  car: {
    years: number;
    flatFactor: number;
    insuranceRate: number;
    roadTaxMonthly: number;
    petrol: number;
    servicing: number;
    comfortableShare: number;
    tightShare: number;
  };
  home: { share: number; months: number; fullLoanPriceCap: number };
  eligibility: { srpMaxGross: number; sjkpMaxIncome: number };
};

export const BUNDLED_RATES = bundled as Rates;

let active: Rates = BUNDLED_RATES;
export const rates = () => active;

/** Shape check before trusting a downloaded rates file. */
export function isRates(x: unknown): x is Rates {
  const r = x as Rates;
  return (
    !!r &&
    typeof r.version === "string" &&
    typeof r.payroll?.epfEmployee === "number" &&
    Array.isArray(r.payroll?.pcb?.brackets) &&
    typeof r.split?.needs === "number" &&
    typeof r.car?.flatFactor === "number" &&
    typeof r.home?.months === "number" &&
    typeof r.eligibility?.sjkpMaxIncome === "number"
  );
}

/** Rates only come down; nothing personal goes up. Falls back to the bundled copy on any failure. */
export async function loadRates(url: string | undefined): Promise<Rates> {
  if (!url) return active;
  try {
    const res = await fetch(url, { cache: "no-cache", credentials: "omit" });
    const json: unknown = await res.json();
    if (isRates(json)) active = json;
  } catch {
    /* offline or bad file: keep bundled rates */
  }
  return active;
}

export function setRates(r: Rates) {
  active = r;
}
