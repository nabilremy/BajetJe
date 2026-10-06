import { describe, expect, it } from "vitest";
import { format } from "./format";
import { M, NOTES } from "./messages";
import { noteFor, translate } from "./index";

describe("format", () => {
  it("fills placeholders", () => {
    expect(format("RM {v} left", { v: "1,062" })).toBe("RM 1,062 left");
  });
  it("handles plurals", () => {
    const m = "{days, plural, one {# day} other {# days}} to payday";
    expect(format(m, { days: 1 })).toBe("1 day to payday");
    expect(format(m, { days: 19 })).toBe("19 days to payday");
  });
  it("renders the pay cycle line in both languages", () => {
    const p = { start: "25 Sept", end: "24 Oct", days: 19 };
    expect(translate("en", "hub.cycle", p)).toBe("Pay cycle 25 Sept to 24 Oct · 19 days to payday");
    expect(translate("ms", "hub.cycle", p)).toBe("Kitaran gaji 25 Sept hingga 24 Oct · 19 hari lagi gaji masuk");
  });
});

describe("catalogue", () => {
  const all = Object.entries(M).flatMap(([k, v]) => v.map((s) => [k, s] as const));
  it("has no em dash in any string", () => {
    expect(all.filter(([, s]) => s.includes(String.fromCharCode(0x2014)))).toEqual([]);
  });
  it("uses the same placeholders in EN and BM", () => {
    const names = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();
    for (const [k, [en, ms]] of Object.entries(M)) expect([k, names(ms)]).toEqual([k, names(en)]);
  });
});

describe("salary notes", () => {
  it("never repeats the same line twice in a row", () => {
    let prev = "";
    for (let i = 0; i < 200; i++) {
      const n = noteFor(3500, "en");
      expect(n).not.toBe(prev);
      prev = n;
    }
  });
  it("only teases higher salaries", () => {
    const low = NOTES.ms.find(([min]) => min === 0)![1];
    expect(low.some((x) => /nak sikit|kopi/.test(x))).toBe(false);
  });
});
