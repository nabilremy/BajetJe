import { describe, expect, it } from "vitest";
import golden from "../../docs/golden-values.json";
import { carAllIn, carLimit } from "./car";
import { cycle } from "./cycle";
import { eligibility } from "./eligibility";
import { home } from "./home";
import { payroll } from "./payroll";
import { calc } from "./plan";
import { exampleCommitments } from "./presets";
import type { Elig } from "./types";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const day = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 10, 30);
};

describe("payroll (golden)", () => {
  for (const g of golden.payroll) {
    it(`RM ${g.gross}`, () => {
      const p = payroll(g.gross);
      expect(p.epf).toBe(g.epf);
      expect(p.socso).toBeCloseTo(g.socso, 2);
      expect(p.eis).toBeCloseTo(g.eis, 2);
      expect(p.pcb).toBeCloseTo(g.pcb, 2);
      expect(p.net).toBeCloseTo(g.net, 2);
    });
  }
  it("zero gross is all zeros", () => {
    expect(payroll(0)).toEqual({ epf: 0, socso: 0, eis: 0, pcb: 0, net: 0 });
  });
  it("RM 3,500 midpoint gives SOCSO 17.25 and EIS 6.90", () => {
    const p = payroll(3500);
    expect(p.socso).toBe(17.25);
    expect(p.eis).toBe(6.9);
  });
});

describe("pay cycle (golden)", () => {
  for (const g of golden.payCycle) {
    it(`payday ${g.payday} on ${g.today}`, () => {
      const c = cycle(g.payday, day(g.today));
      expect(ymd(c.prev)).toBe(g.prev);
      expect(ymd(c.next)).toBe(g.next);
      expect(c.days).toBe(g.days);
      expect(c.idx).toBe(g.dayIndex);
      expect(c.left).toBe(g.daysLeft);
    });
  }
});

describe("plan (golden)", () => {
  for (const g of golden.plan) {
    it(`RM ${g.gross} gross with example commitments`, () => {
      const now = day("2026-10-06");
      const p = calc({ mode: "gross", raw: String(g.gross), payday: String(g.payday), commitments: exampleCommitments() }, now);
      expect(p.net).toBe(g.net);
      expect(p.needs).toBe(g.needs);
      expect(p.wants).toBe(g.wants);
      expect(p.savings).toBe(g.savings);
      expect(p.needsC).toBe(g.needsC);
      expect(p.wantsC).toBe(g.wantsC);
      expect(p.savC).toBe(g.savC);
      expect(p.commit).toBe(g.fixedCommitments);
      expect(p.savingsOut).toBe(g.savingsOut);
      expect(+p.ratio.toFixed(2)).toBe(g.ratioPct);
      expect(+p.debtRatio.toFixed(2)).toBe(g.debtRatioPct);
      expect(p.left).toBe(g.leftForYou);
      expect(p.daily).toBe(Math.floor(g.leftForYou / p.days));
    });
  }
  it("daily with no amounts = floor(wants / cycle days)", () => {
    const p = calc({ mode: "net", raw: "3090", payday: "25", commitments: [] }, day("2026-10-06"));
    expect(p.daily).toBe(Math.floor(927 / p.days));
  });
  it("daily never goes below zero", () => {
    const big = exampleCommitments().map((c) => ({ ...c, amt: c.amt * 10 }));
    expect(calc({ mode: "net", raw: "2000", payday: "1", commitments: big }).daily).toBe(0);
  });
});

describe("simple mode total (lump rule)", () => {
  const now = day("2026-10-06");
  const base = { mode: "net" as const, raw: "3090", payday: "25" };
  it("uses the typed total as one needs commitment when nothing is listed", () => {
    const p = calc({ ...base, commitments: [], simpleTotal: 1410 }, now);
    expect(p.lump).toBe(1410);
    expect(p.needsC).toBe(1410);
    expect(p.commit).toBe(1410);
    expect(p.daily).toBe(Math.floor((3090 - 1410 - 618) / p.days));
  });
  it("ignores the typed total once any item has an amount", () => {
    const p = calc({ ...base, commitments: exampleCommitments(), simpleTotal: 9999 }, now);
    expect(p.lump).toBe(0);
    expect(p.commit).toBe(1410);
    expect(p.listed).toBe(1510);
  });
});

describe("car (golden)", () => {
  for (const g of golden.car) {
    it(`${g.down * 100}% down`, () => {
      expect(Math.round(carLimit(g.net, 0.2, g.down))).toBe(g.safeBudget);
      expect(Math.round(carLimit(g.net, 0.25, g.down))).toBe(g.maxTight);
      const a = carAllIn(40000, g.down);
      expect(a.total).toBeCloseTo(g.allIn_40k, 2);
      expect(a.inst).toBeCloseTo(g.instalment_40k, 2);
    });
  }
});

describe("home (golden)", () => {
  for (const g of golden.home) {
    it(`${g.rate}% at ${g.down * 100}% down`, () => {
      const h = home(g.net, 618, g.rate, g.down);
      expect(Math.round(h.inst)).toBe(g.instalment);
      expect(Math.round(h.loan)).toBe(g.loan);
      expect(Math.round(h.price)).toBe(g.price);
      expect(Math.round(h.dep)).toBe(g.deposit);
      expect(h.months).toBe(g.monthsToSaveAt618);
      expect(h.capped).toBe(g.cappedAt500k);
    });
  }
  it("caps 0% down at RM 500k", () => {
    const h = home(20000, 1000, 3.5, 0);
    expect(h.capped).toBe(true);
    expect(h.price).toBe(500000);
  });
});

describe("eligibility (golden)", () => {
  for (const g of golden.eligibility) {
    it(JSON.stringify(g.answers) + " at RM " + g.gross, () => {
      expect(eligibility(g.answers as Elig, "gross", String(g.gross))).toEqual(g.result);
    });
  }
  it("pending until all three answered", () => {
    expect(eligibility({ first: true, citizen: null, age: true }, "gross", "3500").state).toBe("pending");
  });
});
