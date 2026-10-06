import { useEffect, useRef } from "react";
import { Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { AmberNote, ChoiceChips, ImpactBars, Legal, Navbar, StatusPill, toneVar } from "../components/ui";
import { calc, carAllIn, carLimit, carVerdict, fmt, k, pct, rates, verdict, type Plan } from "../engine";
import { go } from "../state/router";
import { setState, useApp } from "../state/store";

const downLabel = (d: number) => (d === 0 ? "a full loan" : pct(d * 100) + " down");

/** F5 · Car */
export function Car() {
  const S = useApp();
  const c = calc(S);
  const R = rates().car;
  const safe = carLimit(c.net, R.comfortableShare, S.carDown);
  const tight = carLimit(c.net, R.tightShare, S.carDown);
  const max = Math.max(60000, Math.ceil((tight * 1.5) / 10000) * 10000);
  const p = Math.min(S.carPrice, max);
  const safeQ = Math.floor(safe / 1000) * 1000;
  const tightQ = Math.floor(tight / 1000) * 1000;
  const alt = carLimit(c.net, R.comfortableShare, 0.1);

  return (
    <div className="stack">
      <Navbar title="What car can I afford?" />
      <div className="section" style={{ gap: 6 }}>
        <div className="over">Your safe car budget</div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="h2">Up to</span>
          <span className="hero-md lime">RM {k(safe)}</span>
        </div>
        <p className="body">
          Keeps the all-in car cost under RM {fmt(c.net * 0.2)}/mo, 20% of your take-home, with {downLabel(S.carDown)}.
        </p>
      </div>

      <div className="section" style={{ gap: 8 }}>
        <div className="row between">
          <h2 className="over">Down payment</h2>
          <span className="cap">9 yrs · ~3% flat</span>
        </div>
        <ChoiceChips
          label="Down payment"
          value={S.carDown}
          options={[
            [0, "Full loan (0%)"],
            [0.1, "10%"],
            [0.2, "20%"],
            [0.3, "30%"],
          ]}
          onChange={(carDown) => setState({ carDown })}
        />
        {S.carDown === 0 ? (
          <AmberNote title="Full loans are the exception">
            Most banks lend up to 90%. 100% is mainly graduate schemes for new cars. With 10% down (RM {fmt(alt * 0.1)}), the same monthly budget buys up to RM {k(alt)}.
          </AmberNote>
        ) : (
          <p className="cap">Upfront cash at your safe budget: RM {fmt(safe * S.carDown)}. Need a full loan? Pick 0%.</p>
        )}
      </div>

      <div className="section">
        <h2 className="over">What fits your salary</h2>
        <div style={{ position: "relative", paddingTop: 22 }}>
          <div className="zones">
            <i style={{ width: `${(safe / max) * 100}%`, background: "var(--lime)" }} />
            <i style={{ width: `${((tight - safe) / max) * 100}%`, background: "var(--amber)" }} />
            <i style={{ flex: 1, background: "var(--coral)" }} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: -6, pointerEvents: "none" }} aria-hidden="true">
            <div style={{ position: "absolute", left: `${(p / max) * 100}%`, transform: "translateX(-50%)", top: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span className="mono" style={{ fontSize: 12 }}>
                RM {k(p)}
              </span>
              <span style={{ width: 4, height: 20, borderRadius: 2, background: "var(--ink-50)" }} />
            </div>
          </div>
        </div>
        <div className="row between cap">
          <span>RM 0</span>
          <span>RM {k(max / 2)}</span>
          <span>RM {k(max)}+</span>
        </div>
        {(
          [
            ["lime", "Comfortable", "up to RM " + k(safe), "New entry hatchback, or a used compact"],
            ["amber", "Tight", "RM " + k(safe) + " to " + k(tight), "New compact hatchback or sedan"],
            ["coral", "Stretch too far", "above RM " + k(tight), "Compact SUV and up"],
          ] as const
        ).map(([col, n, r, ex]) => (
          <div key={n} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <span className="sw" style={{ background: `var(--${col})`, marginTop: 5 }} />
            <div>
              <div className="row" style={{ gap: 6 }}>
                <span className="lbl">{n}</span>
                <span className="mono cap">{r}</span>
              </div>
              <div className="cap">{ex}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="row between">
          <h2 className="over">Try a price</h2>
          <span className="cap">{S.carDown === 0 ? "Full loan" : pct(S.carDown * 100) + " down"} · 9 yrs</span>
        </div>
        <div className="field" style={{ height: 56 }}>
          <span className="cur">RM</span>
          <div className="val" style={{ fontSize: 24 }}>
            <RollingNumber value={fmt(p)} anchor="end" />
          </div>
          <span className="cap">Car price</span>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="cap">Jump to</span>
          {(
            [
              [safeQ, "Comfortable max"],
              [tightQ, "Max"],
            ] as const
          ).map(([v, l]) => (
            <button key={l} className={`chip${v === p ? " on" : ""}`} aria-pressed={v === p} style={{ minHeight: 36 }} onClick={() => setState({ carPrice: v })}>
              {l} · RM {k(v)}
            </button>
          ))}
        </div>
        <input type="range" className="range" min={10000} max={max} step={1000} value={p} aria-label="Car price" aria-valuetext={`RM ${fmt(p)}`} onChange={(e) => setState({ carPrice: +e.target.value })} />
        <CarOutcome c={c} price={p} />
      </div>
      <Legal>Estimates only. Actual rates, insurance and approval depend on the lender. Not financial advice.</Legal>
    </div>
  );
}

function CarOutcome({ c, price }: { c: Plan; price: number }) {
  const S = useApp();
  const a = carAllIn(price, S.carDown);
  const share = (a.total / (c.net || 1)) * 100;
  const [vn, vc] = carVerdict(share);
  // Verdict card rises in when the verdict changes (not on first paint)
  const prev = useRef<string | null>(null);
  const changed = prev.current !== null && prev.current !== vn;
  useEffect(() => {
    prev.current = vn;
  });

  const transport = S.commitments.filter((x) => x.cat === "Transport").reduce((s, x) => s + x.amt, 0);
  const after = c.commit - (S.carSwap ? transport : 0) + a.total;
  const afterPct = (after / (c.net || 1)) * 100;
  const dailyAfter = (c.net - after - c.savingsOut) / c.days;
  const [an, ac] = verdict(afterPct, 50, 65);

  const costs: [string, number, string][] = [
    ["Loan instalment", a.inst, "var(--amber)"],
    ["Petrol", a.petrol, "var(--ink-300)"],
    ["Insurance & road tax", a.ins, "var(--ink-400)"],
    ["Servicing", a.service, "var(--ink-500)"],
  ];

  return (
    <div>
      <div key={changed ? vn : "card"} className={`card${changed ? " rise-fast" : ""}`} style={{ gap: 10 }} aria-live="polite">
        <div className="row between">
          <StatusPill tone={vc}>{vn}</StatusPill>
          <span className="cap">{pct(share)} of take-home</span>
        </div>
        <div className="over">True monthly cost</div>
        <div className="mono" style={{ fontSize: 40, fontWeight: 700, lineHeight: "44px" }}>
          RM {fmt(a.total)}
        </div>
        <div className="row" style={{ gap: 2, height: 10 }} aria-hidden="true">
          {costs.map(([n, v, col]) => (
            <i key={n} style={{ flex: v, height: "100%", background: col, borderRadius: 2 }} />
          ))}
        </div>
        <div className="legend">
          {costs.map(([n, v, col]) => (
            <div key={n} className="row">
              <span className="sw" style={{ background: col }} />
              <span style={{ color: "var(--ink-300)" }}>{n}</span>
              <span className="grow" />
              <span className="mono">RM {fmt(v)}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ fontSize: 12 }}>
          <span style={{ color: "var(--ink-300)" }}>Paid upfront ({S.carDown === 0 ? "full loan" : pct(S.carDown * 100) + " down"})</span>
          <span className="grow" />
          <span className="mono">RM {fmt(a.down)}</span>
        </div>
        <p className="cap" style={{ color: "var(--ink-400)" }}>
          Running costs add {pct(((a.total - a.inst) / a.inst) * 100)} on top of the instalment.
        </p>
      </div>
      {c.commit ? (
        <div className="section" style={{ paddingTop: 20 }}>
          <div className="row between">
            <h2 className="over">If you buy it</h2>
            <StatusPill tone={ac}>{an}</StatusPill>
          </div>
          <ImpactBars
            title="Commitments"
            rows={[
              ["Now", c.ratio, "var(--ink-600)", pct(c.ratio)],
              ["After", afterPct, toneVar(ac), pct(afterPct)],
            ]}
          />
          <ImpactBars
            title="You can spend a day"
            rows={[
              ["Now", 100, "var(--ink-600)", "RM " + fmt(c.daily)],
              ["After", c.daily ? (Math.max(0, dailyAfter) / c.daily) * 100 : 0, "var(--lime)", "RM " + fmt(Math.max(0, dailyAfter))],
            ]}
          />
          {transport > 0 && (
            <label className="row cap" style={{ gap: 8, minHeight: 44 }}>
              <input type="checkbox" checked={S.carSwap} onChange={(e) => setState({ carSwap: e.target.checked })} style={{ accentColor: "var(--lime)", width: 18, height: 18 }} />
              Stop paying RM {fmt(transport)} for transport
            </label>
          )}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16, gap: 8 }}>
          <div className="lbl">See what this does to your month</div>
          <p className="cap">Add your commitments to check the impact on your health and daily spend.</p>
          <button className="link" onClick={() => go("commit")} style={{ alignSelf: "flex-start" }}>
            Add commitments <Icon name="arrow" className="svg-i ic-sm" />
          </button>
        </div>
      )}
    </div>
  );
}
