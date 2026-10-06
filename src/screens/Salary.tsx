import { useEffect, useRef, useState } from "react";
import { RollingNumber, useSettled } from "../components/RollingNumber";
import { Segmented } from "../components/ui";
import { calc, fmt, fmt2, type SalaryMode } from "../engine";
import { back, go, useRouter } from "../state/router";
import { setState, useApp } from "../state/store";

const PAYDAYS: [string, string][] = [
  ["1", "1st"],
  ["7", "7th"],
  ["15", "15th"],
  ["25", "25th"],
  ["last", "Last day"],
];
const PRESET_DAYS = PAYDAYS.map(([v]) => v);

/** F1 · Salary (required, no skip) */
export function Salary() {
  const S = useApp();
  const { stack } = useRouter();
  const c = calc(S);
  const has = !!S.raw;
  const inp = useRef<HTMLInputElement>(null);
  // "Try RM 3,500" rolls every digit in; typing only rolls new digits
  const [sampleKey, setSampleKey] = useState(0);
  // Take-home waits for a 200 ms typing pause, then rolls changed digits 30 ms apart
  const settledNet = useSettled(c.net, 200);

  useEffect(() => {
    if (!S.raw) {
      const id = setTimeout(() => inp.current?.focus({ preventScroll: true }), 300);
      return () => clearTimeout(id);
    }
    // only on first mount
  }, []);

  const shown = S.raw ? fmt(+S.raw) : "";
  const other = S.payday && !PRESET_DAYS.includes(S.payday);
  const ready = has && !!S.payday;

  return (
    <div className="stack" style={{ minHeight: "100%" }}>
      <div className="section" style={{ gap: 10 }}>
        <div className="row between">
          <div className="over">Let's start · takes 1 minute</div>
          {stack.length > 1 && (
            <button className="link" onClick={back} style={{ color: "var(--ink-400)" }}>
              Cancel
            </button>
          )}
        </div>
        <h1 className="h1">What's your salary?</h1>
        <p className="body">Everything in BajetJe starts here. It stays on this phone and is never uploaded.</p>
      </div>

      <Segmented<SalaryMode>
        label="Salary type"
        value={S.mode}
        options={[
          ["gross", "Gross salary"],
          ["net", "Take-home"],
        ]}
        onChange={(mode) => setState({ mode })}
      />

      <div className="section" style={{ gap: 8 }}>
        <label className="lbl soft" htmlFor="sal">
          {S.mode === "gross" ? "Gross monthly salary" : "Monthly take-home (net pay on your payslip)"}
        </label>
        <div className="field">
          <span className="cur">RM</span>
          <div className="val">
            <RollingNumber key={sampleKey} value={shown} anchor="start" animateOnMount={sampleKey > 0} />
            <input
              ref={inp}
              id="sal"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              aria-describedby="salHelp"
              value={shown}
              onChange={(e) => setState({ raw: e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 7) })}
            />
          </div>
        </div>
        <div className="row" id="salHelp" style={{ flexWrap: "wrap" }}>
          {!has && (
            <>
              <span className="cap">Not sure yet?</span>
              <button
                className="chip"
                onClick={() => {
                  setState({ raw: "3500" });
                  setSampleKey((n) => n + 1);
                }}
              >
                Try RM 3,500
              </button>
            </>
          )}
        </div>
      </div>

      <div className="section" style={{ gap: 10 }}>
        <div className="row between">
          <span className="lbl soft" id="paydayLbl">
            When do you get paid?
          </span>
          <span className="cap">Day of the month</span>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }} role="group" aria-labelledby="paydayLbl">
          {PAYDAYS.map(([v, l]) => (
            <button
              key={v}
              className={`chip${S.payday === v ? " on" : ""}`}
              aria-pressed={S.payday === v}
              onClick={() => setState({ payday: v })}
              style={{ minHeight: 40, padding: "0 14px", fontSize: 13, ...(S.payday === v ? {} : { color: "var(--ink-300)" }) }}
            >
              {l}
            </button>
          ))}
          <label className={`chip${other ? " on" : ""}`} style={{ minHeight: 40, padding: "0 6px 0 14px", fontSize: 13, ...(other ? {} : { color: "var(--ink-300)" }) }}>
            Other
            <select
              aria-label="Other payday"
              value={other ? (S.payday ?? "") : ""}
              onChange={(e) => e.target.value && setState({ payday: e.target.value })}
              style={{ background: "transparent", border: 0, color: "inherit", font: "inherit", padding: "8px 4px", outline: 0 }}
            >
              <option value="">day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1)
                .filter((d) => ![1, 7, 15, 25].includes(d))
                .map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="cap">Your daily budget runs from payday to payday. If the day doesn't exist in a month, we use the last day.</p>
      </div>

      {S.mode === "gross" && (
        <div className="section" style={{ gap: 10 }}>
          <div className="row between">
            <h2 className="over">Auto deductions</h2>
            <span className="cap">Malaysia · 2026 rates</span>
          </div>
          <div className="card" style={{ gap: 12 }}>
            {(
              [
                ["EPF (your share)", "11%", c.epf],
                ["SOCSO", "", c.socso],
                ["EIS", "", c.eis],
                ["Income tax (PCB)", "est.", c.pcb],
              ] as const
            ).map(([n, t, v]) => (
              <div key={n} className="row">
                <span className="lbl" style={{ color: "var(--ink-300)" }}>
                  {n}
                </span>
                {t && (
                  <span className="pill" style={{ background: "var(--ink-700)", color: "var(--ink-400)" }}>
                    {t}
                  </span>
                )}
                <span className="grow" />
                <span className="mono cap" style={{ color: "var(--ink-400)", fontSize: 13 }}>
                  − RM {fmt2(v)}
                </span>
              </div>
            ))}
            <div className="hr" />
            <div className="row">
              <div className="grow">
                <div className="lbl" style={{ fontSize: 15 }}>
                  Your take-home
                </div>
                <div className="cap">Updates as you type</div>
              </div>
              <div className="mono lime" style={{ fontSize: 20, fontWeight: 500 }} aria-live="polite">
                RM&nbsp;
                <RollingNumber value={fmt(settledNet)} anchor="end" stagger={30} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grow" />
      <div className="sticky">
        <button className="btn btn-primary" disabled={!ready} onClick={() => go("plan", "reset")}>
          {has && !S.payday ? "Pick your payday to continue" : "See my 50/30/20"}
        </button>
      </div>
    </div>
  );
}
