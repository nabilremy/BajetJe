import { useEffect, useRef } from "react";
import { RollingNumber } from "../components/RollingNumber";
import { AmberNote, ChoiceChips, ImpactBars, Legal, Navbar, StatusPill, Toggle, toneVar, usePop } from "../components/ui";
import { calc, carAllIn, carLimit, carVerdict, fmt, k, pct, rates, verdict, type Plan } from "../engine";
import { useT, type T } from "../i18n";
import { go } from "../state/router";
import { setState, useApp } from "../state/store";


/** F5 · Car */
export function Car() {
  const S = useApp();
  const t = useT();
  const jump = usePop<string>();
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
      <Navbar title={t("car.title")} />
      <div className="section" style={{ gap: 6 }}>
        <div className="over">{t("car.over")}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="h2">{t("common.upTo")}</span>
          <span className="hero-md lime">RM {k(safe)}</span>
        </div>
        <p className="body">
          {S.carDown === 0 ? t("car.bodyFull", { cap: fmt(c.net * 0.2) }) : t("car.bodyDown", { cap: fmt(c.net * 0.2), dp: Math.round(S.carDown * 100) })}
        </p>
      </div>

      <div className="section" style={{ gap: 8 }}>
        <div className="row between">
          <h2 className="over">{t("car.down")}</h2>
          <span className="cap">{t("car.terms")}</span>
        </div>
        <ChoiceChips
          label={t("car.down")}
          value={S.carDown}
          options={[
            [0, t("car.fullLoan")],
            [0.1, "10%"],
            [0.2, "20%"],
            [0.3, "30%"],
          ]}
          onChange={(carDown) => setState({ carDown })}
        />
        {S.carDown === 0 ? (
          <AmberNote title={t("car.fullTitle")}>{t("car.fullBody", { down: fmt(alt * 0.1), k: k(alt) })}</AmberNote>
        ) : (
          <p className="cap">{t("car.upfront", { v: fmt(safe * S.carDown) })}</p>
        )}
      </div>

      <div className="section">
        <h2 className="over">{t("car.fits")}</h2>
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
            ["lime", t("car.comfortable"), t("car.rangeUpTo", { a: k(safe) }), t("car.exComfortable")],
            ["amber", t("car.tight"), t("car.rangeBetween", { a: k(safe), b: k(tight) }), t("car.exTight")],
            ["coral", t("car.stretch"), t("car.rangeAbove", { a: k(tight) }), t("car.exStretch")],
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
          <h2 className="over">{t("car.try")}</h2>
          <span className="cap">{S.carDown === 0 ? t("car.termFull") : t("car.termDown", { dp: Math.round(S.carDown * 100) })}</span>
        </div>
        <div className="field" style={{ height: 56 }}>
          <span className="cur">RM</span>
          <div className="val" style={{ fontSize: 24 }}>
            <RollingNumber value={fmt(p)} anchor="end" />
          </div>
          <span className="cap">{t("car.price")}</span>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="cap">{t("car.jump")}</span>
          {(
            [
              [safeQ, "car.jumpComfortable"],
              [tightQ, "car.jumpMax"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={jump.key(l)}
              className={`chip${v === p ? " on" : ""}${jump.cls(l)}`}
              aria-pressed={v === p}
              style={{ minHeight: 36 }}
              onClick={() => {
                jump.pop(l);
                setState({ carPrice: v });
              }}
            >
              {t(l, { k: k(v) })}
            </button>
          ))}
        </div>
        <input type="range" className="range" min={10000} max={max} step={1000} value={p} aria-label={t("car.price")} aria-valuetext={`RM ${fmt(p)}`} onChange={(e) => setState({ carPrice: +e.target.value })} />
        <CarOutcome c={c} price={p} t={t} />
      </div>
      <Legal>{t("car.legal")}</Legal>
    </div>
  );
}

const CAR_VERDICT = { Comfortable: "car.comfortable", Tight: "car.tight", Unaffordable: "car.unaffordable" } as const;
const HEALTH_VERDICT = { Healthy: "common.healthy", Caution: "common.caution", High: "common.high" } as const;

function CarOutcome({ c, price, t }: { c: Plan; price: number; t: T }) {
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
    [t("car.instalment"), a.inst, "var(--amber)"],
    [t("car.petrol"), a.petrol, "var(--ink-300)"],
    [t("car.insurance"), a.ins, "var(--ink-400)"],
    [t("car.servicing"), a.service, "var(--ink-500)"],
  ];

  return (
    <div>
      <div key={changed ? vn : "card"} className={`card${changed ? " rise-fast" : ""}`} style={{ gap: 10 }} aria-live="polite">
        <div className="row between">
          <StatusPill tone={vc}>{t(CAR_VERDICT[vn])}</StatusPill>
          <span className="cap">{t("common.pctOfTakeHome", { pct: Math.round(share) })}</span>
        </div>
        <div className="over">{t("car.trueCost")}</div>
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
          <span style={{ color: "var(--ink-300)" }}>{S.carDown === 0 ? t("car.paidFull") : t("car.paidDown", { dp: Math.round(S.carDown * 100) })}</span>
          <span className="grow" />
          <span className="mono">RM {fmt(a.down)}</span>
        </div>
        <p className="cap" style={{ color: "var(--ink-400)" }}>
          {t("car.running", { pct: Math.round(((a.total - a.inst) / a.inst) * 100) })}
        </p>
      </div>
      {c.commit ? (
        <div className="section" style={{ paddingTop: 20 }}>
          <div className="row between">
            <h2 className="over">{t("car.ifBuy")}</h2>
            <StatusPill tone={ac}>{t(HEALTH_VERDICT[an])}</StatusPill>
          </div>
          <ImpactBars
            title={t("common.commitments")}
            rows={[
              ["now", c.ratio, "var(--ink-600)", t("common.now", { v: pct(c.ratio) })],
              ["after", afterPct, toneVar(ac), t("common.after", { v: pct(afterPct) })],
            ]}
          />
          <ImpactBars
            title={t("car.spendDay")}
            rows={[
              ["now", 100, "var(--ink-600)", t("common.now", { v: "RM " + fmt(c.daily) })],
              ["after", c.daily ? (Math.max(0, dailyAfter) / c.daily) * 100 : 0, "var(--lime)", t("common.after", { v: "RM " + fmt(Math.max(0, dailyAfter)) })],
            ]}
          />
          {transport > 0 && (
            <div className="row cap" style={{ gap: 10, minHeight: 44 }}>
              <Toggle on={S.carSwap} onChange={(carSwap) => setState({ carSwap })} label={t("car.swapAria")} />
              <span>{t("car.swap", { v: fmt(transport) })}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16, gap: 8 }}>
          <div className="lbl">{t("car.emptyTitle")}</div>
          <p className="cap">{t("car.emptyBody")}</p>
          <button className="link" onClick={() => go("commit")} style={{ alignSelf: "flex-start" }}>
            {t("car.emptyLink")}
          </button>
        </div>
      )}
    </div>
  );
}
