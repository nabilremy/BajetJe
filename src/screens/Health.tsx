import { Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { savingsTip } from "../components/savingsTip";
import { Gauge, Navbar, Reaction, StatusPill, toneVar } from "../components/ui";
import { calc, fmt, pct, verdict } from "../engine";
import { itemName, useLang, useT } from "../i18n";
import { backTo, go } from "../state/router";
import { useApp } from "../state/store";

/** F4 · Commitment Health */
export function Health() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const c = calc(S);
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  // Extra money: take-home minus everything listed (needs, wants and any savings entered)
  const extra = Math.max(0, c.extra);
  const vKey = vName === "Healthy" ? "healthy" : vName === "Caution" ? "caution" : "high";

  const copy =
    vName === "Healthy"
      ? c.needsC <= c.needs
        ? t("health.copyHealthyFit", { needsC: fmt(c.needsC), needs: fmt(c.needs), spare: fmt(c.needs - c.needsC) })
        : t("health.copyHealthyOver", { needsC: fmt(c.needsC), over: fmt(c.needsC - c.needs) })
      : vName === "Caution"
        ? t(c.needsC > c.needs ? "health.copyCautionOver" : "health.copyCautionUnder", { diff: fmt(Math.abs(c.needsC - c.needs)) })
        : t("health.copyHigh");

  // Breakdown: top 4 + Others, debt in coral
  const items = S.commitments.filter((x) => x.amt > 0 && x.bucket !== "savings").sort((a, b) => b.amt - a.amt);
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
      <div className="section" style={{ gap: 6 }}>
        <div className="over">{t("health.over")}</div>
        <div className="row" style={{ gap: 12 }}>
          <span className="hero" style={{ color: toneVar(vCol) }}>
            <RollingNumber value={pct(c.ratio)} anchor="end" stagger={40} animateOnMount />
          </span>
          <StatusPill tone={vCol} big pop>
            {t(`common.${vKey}`)}
          </StatusPill>
        </div>
        <Reaction>{t(`react.${vKey}`)}</Reaction>
        <p className="body">{copy}</p>
      </div>

      <div className="card">
        <div className="row between">
          <h2 className="over">{t("health.breakdown")}</h2>
          <button className="link" onClick={() => go("commit")}>
            {t("health.manage")}
          </button>
        </div>
        <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
          <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
            RM {fmt(c.commit)}
          </span>
          <span className="body">{t("common.perMonth")}</span>
        </div>
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
        <div className="hr" />
        <Gauge p={c.ratio} stops={[50, 65]} max={100} sweep />
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
      </div>

      <div className="section" style={{ gap: 6 }}>
        <div className="over">{t("health.dailyOver")}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
          <span className="hero-md" style={c.extra < 0 ? { color: "var(--coral)" } : undefined}>
            RM {fmt(extra)}
          </span>
          <span className="h2">{t("common.perMonth")}</span>
        </div>
        <p className="body">{c.extra > 0 ? t("simple.perDay", { v: fmt(c.daily), days: c.days }) : t("simple.overTakeHome")}</p>
        <div className="disclaimer">
          <span style={{ color: "var(--lime)", flex: "none", display: "flex" }}>
            <Icon name="sparkle" />
          </span>
          <p className="cap" style={{ color: "var(--ink-300)" }}>
            {savingsTip(c, t)}
          </p>
        </div>
      </div>

      <div className="section">
        <h2 className="over">{t("health.where")}</h2>
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
