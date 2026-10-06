import type { CSSProperties } from "react";
import { Icon } from "../components/Icon";
import { RollingNumber, useSettled } from "../components/RollingNumber";
import { Reaction, StatusPill } from "../components/ui";
import { fmt, verdict, type Plan } from "../engine";
import { useT, type MsgKey } from "../i18n";
import { go } from "../state/router";
import { setState, useApp } from "../state/store";

const r = (i: number, extra?: CSSProperties) => ({ "data-r": "", style: { "--i": i, ...extra } as CSSProperties });
const VERDICT_KEY = { Healthy: "common.healthy", Caution: "common.caution", High: "common.high" } as const;
const dailyReaction = (d: number): MsgKey => (d >= 100 ? "react.daily100" : d >= 40 ? "react.daily40" : d >= 20 ? "react.daily20" : "react.dailyLow");

/**
 * F2s · My Plan, Simple mode (default): Take-home − Commitments = Left after commitments.
 * Savings are not deducted here; the tip suggests saving 20% of what's left first (docs/calculation-rules.md).
 */
export function Simple({ c, lookN }: { c: Plan; lookN: number }) {
  const S = useApp();
  const t = useT();
  // The hero and bar follow the typed total after a short pause, then roll the changed digits
  const settledTotal = useSettled(S.simpleTotal, 150);
  const typing = settledTotal !== S.simpleTotal;
  const view = typing ? { ...c, ...shown(c, settledTotal) } : c;

  const left = view.net - view.commit;
  const perDay = Math.max(0, Math.floor(left / c.days));
  const [vName, vCol] = verdict(view.ratio, 50, 65);
  const cp = c.net ? Math.min(100, (view.commit / c.net) * 100) : 0;
  const itemCount = S.commitments.filter((x) => x.amt > 0).length;

  return (
    <>
      <div className="equation" {...r(2)}>
        <div className="ln">
          <span className="op" />
          <div className="grow">
            <div className="lbl soft">{t("simple.takeHome")}</div>
            <div className="cap">{t(S.mode === "gross" ? "hub.afterDeductions" : "hub.enteredNet")}</div>
          </div>
          <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            RM {fmt(c.net)}
          </span>
          <button className="iconbtn" aria-label={t("simple.editSalary")} onClick={() => go("salary")} style={{ width: 32, height: 32, background: "none", color: "var(--ink-400)" }}>
            <Icon name="pen" />
          </button>
        </div>
        <div className="ln">
          <span className="op">−</span>
          <div className="grow">
            <div className="lbl soft">{t("simple.commitments")}</div>
            <div className="cap">{c.listed ? t("simple.itemsListed", { n: itemCount }) : t("simple.inTotal")}</div>
          </div>
          {c.listed ? (
            <>
              <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
                RM {fmt(c.commit)}
              </span>
              <button className="iconbtn" aria-label={t("simple.editCommitments")} onClick={() => go("commit")} style={{ width: 32, height: 32, background: "none", color: "var(--ink-400)" }}>
                <Icon name="pen" />
              </button>
            </>
          ) : (
            <label className="amt-in">
              <span className="cap">RM</span>
              <input
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                aria-label={t("simple.totalAria")}
                value={S.simpleTotal ? fmt(S.simpleTotal) : ""}
                onChange={(e) => setState({ simpleTotal: +e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 6) || 0 })}
              />
            </label>
          )}
        </div>
        <div className="ln result">
          <div className="row">
            <span className="op">=</span>
            <div className="lbl grow">{t("simple.left")}</div>
            {view.commit > 0 && (
              <StatusPill tone={vCol}>{t("simple.committed", { pct: Math.round(view.ratio), verdict: t(VERDICT_KEY[vName]) })}</StatusPill>
            )}
          </div>
          <div className="hero lime simple-hero" style={left < 0 ? { color: "var(--coral)" } : undefined}>
            <RollingNumber key={lookN} value={"RM " + fmt(Math.max(0, left))} anchor="end" stagger={30} animateOnMount={lookN > 0} />
          </div>
          <p className="body">{left > 0 ? t("simple.perDay", { v: fmt(perDay), days: c.days }) : t(view.commit ? "simple.overTakeHome" : "simple.addToSee")}</p>
          {view.commit > 0 && <Reaction>{t(dailyReaction(perDay))}</Reaction>}
        </div>
      </div>

      <div className="section" {...r(3, { gap: 8 })}>
        <div className="lbar" role="img" aria-label={`${t("simple.barCommit", { pct: Math.round(cp) })}, ${t("simple.barLeft", { pct: Math.round(100 - cp) })}`}>
          <i style={{ flexGrow: cp || 0.001, background: "var(--ink-400)" }} />
          <i style={{ flexGrow: Math.max(0.001, 100 - cp), background: "var(--lime)" }} />
        </div>
        <div className="row between cap">
          <span>{t("simple.barCommit", { pct: Math.round(cp) })}</span>
          <span>{t("simple.barLeft", { pct: Math.round(100 - cp) })}</span>
        </div>
      </div>

      {!c.listed && (
        <button className="link" onClick={() => go("commit")} {...r(4, { alignSelf: "flex-start", color: "var(--ink-300)" })}>
          {t("simple.listThem")}
        </button>
      )}

      <div className="disclaimer" {...r(5)}>
        <span style={{ color: "var(--lime)", flex: "none", display: "flex" }}>
          <Icon name="sparkle" />
        </span>
        <p className="cap" style={{ color: "var(--ink-300)" }}>
          {left > c.savings ? t("simple.tipSave", { save: fmt(c.savings), daily: fmt(Math.floor((left - c.savings) / c.days)) }) : t("simple.tipHalf", { needs: fmt(c.needs) })}
        </p>
      </div>

      <button className="btn btn-quiet" onClick={() => setState({ look: "detailed" })} {...r(6)}>
        {t("simple.full")}
      </button>
      <p className="cap" style={{ textAlign: "center", fontSize: 11, padding: "4px 12px 0" }}>
        {t("hub.legal")}
      </p>
    </>
  );
}

/** Commitment numbers using an earlier typed total, so the hero waits for a typing pause. */
function shown(c: Plan, total: number) {
  if (c.listed) return {};
  const commit = c.commit - c.lump + total;
  return { commit, ratio: c.net ? (commit / c.net) * 100 : 0 };
}
