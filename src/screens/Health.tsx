import { useEffect, useState } from "react";
import { Confetti } from "../components/Confetti";
import { Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { savingsTip } from "../components/savingsTip";
import { Scribble } from "../components/Scribble";
import { Gauge, Navbar, Reaction, StatusPill, toneVar } from "../components/ui";
import { calc, fmt, pct, verdict } from "../engine";
import { itemName, useLang, useT } from "../i18n";
import { backTo, go } from "../state/router";
import { useApp } from "../state/store";

// Confetti celebrates reaching Healthy: on the first Healthy visit this session, and again only after a visit that wasn't
let lastVerdict: string | null = null;

/**
 * F4 · Commitment Health.
 * Answer first: extra money leads; commitment health and the total sit together in one card; the full breakdown
 * ("Where your salary goes") is tucked behind a tap so the screen stays calm.
 */
export function Health() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const c = calc(S);
  const [open, setOpen] = useState(false);
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  const [celebrate] = useState(() => vName === "Healthy" && lastVerdict !== "Healthy");
  useEffect(() => {
    lastVerdict = vName;
  }, [vName]);
  // Extra money: take-home minus everything listed (needs, wants and any savings entered)
  const extra = Math.max(0, c.extra);
  const vKey = vName === "Healthy" ? "healthy" : vName === "Caution" ? "caution" : "high";
  const fixedItems = S.commitments.filter((x) => x.amt > 0 && x.bucket !== "savings");

  const copy =
    vName === "Healthy"
      ? c.needsC <= c.needs
        ? t("health.copyHealthyFit", { needsC: fmt(c.needsC), needs: fmt(c.needs), spare: fmt(c.needs - c.needsC) })
        : t("health.copyHealthyOver", { needsC: fmt(c.needsC), over: fmt(c.needsC - c.needs) })
      : vName === "Caution"
        ? t(c.needsC > c.needs ? "health.copyCautionOver" : "health.copyCautionUnder", { diff: fmt(Math.abs(c.needsC - c.needs)) })
        : t("health.copyHigh");

  // Breakdown: top 4 + Others, debt in coral
  const items = [...fixedItems].sort((a, b) => b.amt - a.amt);
  const others = items.slice(4).reduce((a, x) => a + x.amt, 0);
  const shades = ["var(--ink-300)", "var(--ink-400)", "var(--ink-500)", "var(--ink-600)"];
  let si = 0;
  const parts = items.slice(0, 4).map((x) => ({ id: x.id, n: itemName(lang, x.name, x.custom) || t("commit.fallbackName"), v: x.amt, col: x.debt ? "var(--coral)" : shades[si++] }));
  if (others) parts.push({ id: "others", n: t("common.others"), v: others, col: "var(--ink-700)" });

  // Salary waterfall: [name, sub, value text, from, to, colour, total row]
  const W = S.mode === "gross" ? c.raw : c.net;
  const sc = (v: number) => (v / (W || 1)) * 100;
  const steps: [string, string, string, number, number, string, boolean][] = [];
  if (S.mode === "gross")
    steps.push([t("wf.gross"), "", fmt(c.raw), 0, c.raw, "var(--ink-600)", false], [t("wf.deductions"), t("wf.deductionsSub"), "− " + fmt(c.raw - c.net), c.net, c.raw, "var(--ink-700)", false]);
  steps.push(
    [t("wf.takeHome"), "", fmt(c.net), 0, c.net, "var(--ink-400)", true],
    [t("common.commitments"), pct(c.ratio), "− " + fmt(c.commit), c.net - c.commit, c.net, "var(--ink-300)", false],
  );
  // Savings appear only as what was actually listed; unfilled savings stay in extra money
  if (c.savC > 0) steps.push([t("wf.savings"), pct((c.savC / (c.net || 1)) * 100), "− " + fmt(c.savC), extra, extra + c.savC, "var(--ink-500)", false]);
  steps.push([t("wf.yourself"), t("wf.yourselfSub"), fmt(extra), 0, extra, "var(--lime)", true]);
  const yourself = t("wf.yourself");

  return (
    <div className="stack">
      <Navbar
        title={t("health.title")}
        right={
          <button className="link" style={{ color: "var(--ink-300)" }} onClick={() => go("commit")}>
            {t("common.edit")}
          </button>
        }
      />

      {/* 1. The answer: extra money */}
      <div className="section" style={{ gap: 6 }}>
        <div className="over">
          <Scribble>{t("health.extraLead")}</Scribble> {t("health.extraTail")}
        </div>
        <span className="hero lime" style={c.extra < 0 ? { color: "var(--coral)" } : undefined}>
          <RollingNumber value={"RM " + fmt(extra)} anchor="end" stagger={30} animateOnMount />
        </span>
        <p className="body">
          {t("common.perMonth")} · {c.extra > 0 ? t("simple.perDay", { v: fmt(c.daily), days: c.days }) : t("simple.overTakeHome")}
        </p>
      </div>

      {/* 2. Health and total commitments, together */}
      <div className="card">
        <div className="row between">
          <h2 className="over">{t("health.card")}</h2>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <StatusPill tone={vCol} pop>
              {t(`common.${vKey}`)}
            </StatusPill>
            <Confetti fire={celebrate} delay={520} />
          </span>
        </div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="mono" style={{ fontSize: 28, fontWeight: 700, color: toneVar(vCol) }}>
            {pct(c.ratio)}
          </span>
          <span className="cap">{t("health.ofTakeHome")}</span>
        </div>
        <Gauge p={c.ratio} stops={[50, 65]} max={100} sweep />
        <Reaction>{t(`react.${vKey}`)}</Reaction>
        <div className="hr" />
        <div className="row">
          <div className="grow">
            <div className="lbl">{t("health.total")}</div>
            <div className="cap">{t("simple.itemsListed", { n: fixedItems.length })}</div>
          </div>
          <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            RM {fmt(c.commit)}
          </span>
          <span className="cap">{t("common.perMo")}</span>
        </div>
      </div>

      <div className="disclaimer">
        <span style={{ color: "var(--lime)", flex: "none", display: "flex" }}>
          <Icon name="sparkle" />
        </span>
        <p className="cap" style={{ color: "var(--ink-300)" }}>
          {savingsTip(c, t)}
        </p>
      </div>

      {/* 3. Details on demand */}
      <div className={`disclose${open ? " open" : ""}`}>
        <button className="disclose-head" aria-expanded={open} aria-controls="health-more" onClick={() => setOpen(!open)}>
          <div className="grow" style={{ textAlign: "left" }}>
            <div className="lbl">{t("health.where")}</div>
            <div className="cap">{t("health.whereHint")}</div>
          </div>
          <Icon name="back" className="svg-i chev" />
        </button>
        <div className="disclose-body" id="health-more" role="region" aria-label={t("health.where")} inert={!open}>
          <div className="disclose-inner">
            <p className="body">
              {pct(c.ratio)} {copy}
            </p>

            <div className="section" style={{ gap: 10 }}>
              <h3 className="over">{t("health.breakdown")}</h3>
              <div className="row" style={{ gap: 2, height: 10 }} aria-hidden="true">
                {parts.map((p) => (
                  <i key={p.id} style={{ flex: p.v, height: "100%", background: p.col, borderRadius: 2 }} />
                ))}
              </div>
              <div className="legend">
                {parts.map((p) => (
                  <div key={p.id} className="row">
                    <span className="sw" style={{ background: p.col }} />
                    <span style={{ color: "var(--ink-300)" }}>{p.n}</span>
                    <span className="grow" />
                    <span className="muted">{pct((p.v / (c.net || 1)) * 100)}</span>
                    <span className="mono" style={{ width: 70, textAlign: "right" }}>
                      RM {fmt(p.v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="row" style={{ background: "rgba(61,61,59,.5)", borderRadius: 10, padding: "10px 12px" }}>
              <div className="grow">
                <div className="lbl" style={{ color: "var(--ink-300)" }}>
                  {t("health.debtOnly")}
                </div>
                <div className="cap">{t("health.debtNote")}</div>
              </div>
              <span className="mono" style={{ color: toneVar(verdict(c.debtRatio, 30, 40)[1]) }}>
                {pct(c.debtRatio)}
              </span>
            </div>

            <div className="wf">
              {steps.map(([n, sub, v, a, b, col, tot]) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", gap: 6, ...(tot ? { paddingTop: 4 } : {}) }}>
                  <div className="row">
                    <span className={tot ? "lbl" : "cap"} style={tot ? { fontSize: 15 } : { color: "var(--ink-300)", fontSize: 13 }}>
                      {n}
                    </span>
                    <span className="cap">{sub}</span>
                    <span className="grow" />
                    <span className="mono" style={{ fontSize: 13, ...(n === yourself ? { color: "var(--lime)" } : {}) }}>
                      RM {v}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ left: `${sc(a)}%`, width: `${Math.max(1, sc(b) - sc(a))}%`, background: col, ...(tot ? { height: 12 } : {}) }} />
                  </div>
                </div>
              ))}
            </div>

            <button className="link" onClick={() => go("commit")} style={{ alignSelf: "flex-start" }}>
              {t("health.manageLink")}
            </button>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => backTo("plan")}>
        {t("health.back")}
      </button>
      <p className="cap" style={{ textAlign: "center", fontSize: 11 }}>
        {t("common.legalShort")}
      </p>
    </div>
  );
}
