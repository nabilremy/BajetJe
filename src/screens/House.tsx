import type { CSSProperties } from "react";
import { AmberNote, ChoiceChips, Gauge, ImpactBars, Legal, Navbar, Segmented, StatusPill, toneVar } from "../components/ui";

const VERDICT = { Healthy: "common.healthy", Caution: "common.caution", High: "common.high" } as const;
import { EligibilityCheck } from "../components/EligibilityCheck";
import { calc, eligibility, fmt, home, instalmentFor, k, pct, rates, verdict } from "../engine";
import { useT } from "../i18n";
import { setState, useApp } from "../state/store";

/** F6 · Housing */
export function House() {
  const S = useApp();
  const t = useT();
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
      <Navbar title={t("house.title")} />
      <div className="section" style={{ gap: 6 }}>
        <div className="over">{t("house.over")}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="hero-md lime">RM {fmt(rent)}</span>
          <span className="h2">{t("common.perMonth")}</span>
        </div>
        <p className="body">{t("house.body")}</p>
      </div>

      {cur > 0 && (
        <div className="section">
          <div className="row between">
            <div>
              <div className="lbl">{t("house.rentNow")}</div>
              <div className="cap">{t("house.rentNowSub", { v: fmt(cur), pct: Math.round(curPct) })}</div>
            </div>
            <StatusPill tone={rc}>{t(VERDICT[rv])}</StatusPill>
          </div>
          <Gauge p={curPct} stops={[30, 40]} max={50} sweep />
        </div>
      )}

      <Segmented
        label={t("house.rentOrBuy")}
        value={S.home}
        options={[
          ["rent", t("house.rent")],
          ["buy", t("house.buy")],
        ]}
        onChange={(v) => setState({ home: v })}
      />

      {S.home === "rent" ? (
        <div className="card">
          <h2 className="over">{t("house.renting")}</h2>
          <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
            <span className="lbl">{t("common.upTo")}</span>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
              RM {fmt(rent)}
            </span>
            <span className="cap">{t("common.perMo")}</span>
          </div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            {cur ? (cur <= rent ? t("house.more", { v: fmt(rent - cur) }) : t("house.above", { v: fmt(cur - rent) })) : t("house.addRent")}
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="over">{t("house.price")}</h2>
            <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
              <span className="lbl">{t("common.upToApprox")}</span>
              <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
                RM {k(h.price)}
              </span>
            </div>
            <ChoiceChips
              label={t("car.down")}
              value={S.eligOpen && elig.state === "pending" ? 0 : S.homeDown}
              options={[
                [0, t("car.fullLoan")],
                [0.1, "10%"],
                [0.2, "20%"],
              ]}
              onChange={pickDown}
            />
            {S.eligOpen && <EligibilityCheck />}
            {(
              [
                [t("house.loan", { pct: Math.round((1 - S.homeDown) * 100) }), t("house.loanSub", { years: 35, rate: S.rate }), h.loan],
                [t("house.instalment"), t(h.capped ? "house.belowLimit" : "house.thirty"), h.capped ? instalmentFor(h.loan, S.rate) : h.inst],
                [t("house.downPct", { pct: Math.round(S.homeDown * 100) }), t(S.homeDown === 0 ? "house.downNone" : "house.downCash"), h.dep],
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
            <div className="row" style={{ gap: 6 }}>
              <span className="cap">{t("house.rate")}</span>
              <ChoiceChips
                label={t("house.rateAria")}
                value={S.rate}
                options={[3.5, 4, 4.5].map((r) => [r, r + "%"] as [number, string])}
                onChange={(rate) => setState({ rate })}
                style={{ minHeight: 0 }}
                selectedStyle={{ background: "var(--ink-700)", color: "var(--ink-50)" }}
              />
            </div>
          </div>

          {S.homeDown === 0 && (
            <AmberNote title={t("house.fullTitle")}>
              {t("house.fullBody", { capped: h.capped ? t("house.capped") : "", k: k(home(c.net, c.savingsOut, S.rate, 0.1).price - h.price) })}
            </AmberNote>
          )}

          {S.homeDown !== 0 && (
            <div className="section">
              <h2 className="over">{t("house.saving")}</h2>
              <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
                  {h.months === Infinity ? t("house.na") : h.months < 12 ? t("house.months", { n: h.months }) : t("house.years", { n: Math.round((h.months / 12) * 10) / 10 })}
                </span>
                <span className="cap">{t("house.atMonth", { v: fmt(c.savingsOut) })}</span>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {Array.from({ length: Math.min(5, Math.ceil(h.months / 12)) }, (_, i) => {
                  const f = Math.min(1, Math.max(0, (h.months - i * 12) / 12));
                  return (
                    <div key={i} className="grow" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className="track">
                        <i style={{ width: `${f * 100}%`, background: "var(--ink-300)" } as CSSProperties} />
                      </div>
                      <span className="cap">{t("house.year", { n: i + 1 })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {c.commit > 0 && (
            <div className="section">
              <div className="row between">
                <h2 className="over">{t("house.ifBuy")}</h2>
                <StatusPill tone={ac}>{t(VERDICT[av])}</StatusPill>
              </div>
              <ImpactBars
                title={t("common.commitments")}
                rows={[
                  ["now", c.ratio, "var(--ink-600)", t("common.now", { v: pct(c.ratio) })],
                  ["after", afterPct, toneVar(ac), t("common.after", { v: pct(afterPct) })],
                ]}
              />
              <p className="cap" style={{ color: "var(--ink-400)" }}>
                {t("house.replaces", { v: fmt(cur) })}
              </p>
            </div>
          )}
        </>
      )}
      <Legal>{t("house.legal")}</Legal>
    </div>
  );
}
