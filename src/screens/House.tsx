import type { CSSProperties } from "react";
import { AmberNote, ChoiceChips, Gauge, ImpactBars, Legal, Navbar, Segmented, StatusPill, toneVar } from "../components/ui";
import { EligibilityCheck } from "../components/EligibilityCheck";
import { calc, eligibility, fmt, home, instalmentFor, k, pct, rates, verdict } from "../engine";
import { setState, useApp } from "../state/store";

/** F6 · Housing */
export function House() {
  const S = useApp();
  const c = calc(S);
  const rent = c.net * rates().home.share;
  const cur = S.commitments.filter((x) => x.cat === "Housing").reduce((a, x) => a + x.amt, 0);
  const curPct = (cur / (c.net || 1)) * 100;
  const h = home(c.net, c.savingsOut, S.rate, S.homeDown);
  const afterPct = ((c.commit - cur + h.inst) / (c.net || 1)) * 100;
  const [rv, rc] = verdict(curPct, 30, 40);
  const [av, ac] = verdict(afterPct, 50, 65);
  const elig = eligibility(S.elig, S.mode, S.raw);

  const pickDown = (v: number) => {
    if (v === 0) setState({ eligOpen: true, ...(elig.state === "yes" ? { homeDown: 0 } : {}) });
    else setState({ homeDown: v, eligOpen: false });
  };

  return (
    <div className="stack">
      <Navbar title="How much home can I afford?" />
      <div className="section" style={{ gap: 6 }}>
        <div className="over">Healthy housing budget</div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="hero-md lime">RM {fmt(rent)}</span>
          <span className="h2">/ month</span>
        </div>
        <p className="body">30% of your take-home. Use it for rent or a mortgage instalment.</p>
      </div>

      {cur > 0 && (
        <div className="section">
          <div className="row between">
            <div>
              <div className="lbl">Your rent now</div>
              <div className="cap">
                RM {fmt(cur)} · {pct(curPct)} of take-home
              </div>
            </div>
            <StatusPill tone={rc}>{rv}</StatusPill>
          </div>
          <Gauge p={curPct} stops={[30, 40]} max={50} sweep />
        </div>
      )}

      <Segmented
        label="Rent or buy"
        value={S.home}
        options={[
          ["rent", "Rent"],
          ["buy", "Buy"],
        ]}
        onChange={(v) => setState({ home: v })}
      />

      {S.home === "rent" ? (
        <div className="card">
          <h2 className="over">Renting</h2>
          <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
            <span className="lbl">Up to</span>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
              RM {fmt(rent)}
            </span>
            <span className="cap">/mo</span>
          </div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            {cur
              ? cur <= rent
                ? `That's RM ${fmt(rent - cur)} more than you pay now. Room to upgrade if you want to.`
                : `You pay RM ${fmt(cur - rent)} above the healthy line.`
              : "Add your rent in commitments to compare."}
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="over">Home price you can carry</h2>
            <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
              <span className="lbl">Up to ~</span>
              <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
                RM {k(h.price)}
              </span>
            </div>
            <ChoiceChips
              label="Down payment"
              value={S.eligOpen && elig.state === "pending" ? 0 : S.homeDown}
              options={[
                [0, "Full loan (0%)"],
                [0.1, "10%"],
                [0.2, "20%"],
              ]}
              onChange={pickDown}
            />
            {S.eligOpen && <EligibilityCheck />}
            {(
              [
                ["Loan (" + pct((1 - S.homeDown) * 100) + ")", "35 years at " + S.rate + "%", h.loan],
                ["Monthly instalment", h.capped ? "below your 30% limit" : "30% of take-home", h.capped ? instalmentFor(h.loan, S.rate) : h.inst],
                ["Down payment (" + pct(S.homeDown * 100) + ")", S.homeDown === 0 ? "none with a first-home scheme" : "cash upfront, plus legal fees", h.dep],
              ] as const
            ).map(([n, s, v]) => (
              <div key={s} className="row">
                <div className="grow">
                  <div className="lbl" style={{ color: "var(--ink-300)" }}>
                    {n}
                  </div>
                  <div className="cap">{s}</div>
                </div>
                <span className="mono">RM {fmt(v)}</span>
              </div>
            ))}
            <div className="row" style={{ gap: 6 }} role="group" aria-label="Interest rate">
              <span className="cap">Rate</span>
              {[3.5, 4, 4.5].map((r) => (
                <button key={r} className="chip" aria-pressed={S.rate === r} onClick={() => setState({ rate: r })} style={S.rate === r ? { background: "var(--ink-700)", color: "var(--ink-50)" } : undefined}>
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {S.homeDown === 0 && (
            <AmberNote title="100% financing has conditions">
              Only through first-home schemes like Skim Rumah Pertamaku or SJKP: Malaysian, first home, price up to RM 500k, income limits apply.
              {h.capped ? " Capped at RM 500k." : ""} You borrow more, so you pay more interest, and your max price is RM{" "}
              {k(home(c.net, c.savingsOut, S.rate, 0.1).price - h.price)} lower than with 10% down. Legal and valuation fees may still apply.
            </AmberNote>
          )}

          {S.homeDown !== 0 && (
            <div className="section">
              <h2 className="over">Saving for the down payment</h2>
              <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
                  {h.months === Infinity ? "n/a" : h.months < 12 ? h.months + " months" : "~" + Math.round((h.months / 12) * 10) / 10 + " years"}
                </span>
                <span className="cap">at RM {fmt(c.savingsOut)} a month</span>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {Array.from({ length: Math.min(5, Math.ceil(h.months / 12)) }, (_, i) => {
                  const f = Math.min(1, Math.max(0, (h.months - i * 12) / 12));
                  return (
                    <div key={i} className="grow" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className="track">
                        <i style={{ width: `${f * 100}%`, background: "var(--ink-300)" } as CSSProperties} />
                      </div>
                      <span className="cap">Year {i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {c.commit > 0 && (
            <div className="section">
              <div className="row between">
                <h2 className="over">If you buy at this price</h2>
                <StatusPill tone={ac}>{av}</StatusPill>
              </div>
              <ImpactBars
                title="Commitments"
                rows={[
                  ["Now", c.ratio, "var(--ink-600)", pct(c.ratio)],
                  ["After", afterPct, toneVar(ac), pct(afterPct)],
                ]}
              />
              <p className="cap" style={{ color: "var(--ink-400)" }}>
                Instalment replaces your current rent of RM {fmt(cur)}.
              </p>
            </div>
          )}
        </>
      )}
      <Legal>Estimates only. Bank approval, rates and fees vary. Not financial advice.</Legal>
    </div>
  );
}
