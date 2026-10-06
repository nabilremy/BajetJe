import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { HEALTH_EMPTY } from "../brand/assets";
import { BudgetChips } from "../components/BudgetChips";
import { BrandSvg, Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { SplitCard } from "../components/SplitCard";
import { Gauge, LangSwitch, Reaction, StatusPill, toast } from "../components/ui";
import { calc, carLimit, DAY, fmt, fmtD, isKlShort, k, pct, rates, verdict, type IconName } from "../engine";
import { calling, useLang, useT, type MsgKey } from "../i18n";
import { go } from "../state/router";
import { exportBackup, importBackup, useApp, wipeAll } from "../state/store";

/** Hub reveal plays once per session */
let revealed = false;
export const resetReveal = () => {
  revealed = false;
};

const VERDICT_KEY = { Healthy: "common.healthy", Caution: "common.caution", High: "common.high" } as const;

/** Daily budget reaction tiers: >= 100 / >= 40 / >= 20 / below */
const dailyReaction = (d: number): MsgKey => (d >= 100 ? "react.daily100" : d >= 40 ? "react.daily40" : d >= 20 ? "react.daily20" : "react.dailyLow");

/** F2 · My Plan (hub) */
export function Plan() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const c = calc(S);
  const has = c.commit > 0;
  const anyAmount = c.commit + c.savC > 0;
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  const kl = isKlShort(c.needs);
  const carSafe = carLimit(c.net, rates().car.comfortableShare, S.carDown);
  const rent = c.net * rates().home.share;
  const [reveal] = useState(() => !revealed);
  const [revealing, setRevealing] = useState(reveal);

  useEffect(() => {
    revealed = true;
    if (!reveal) return;
    const id = setTimeout(() => setRevealing(false), 1400);
    return () => clearTimeout(id);
  }, [reveal]);

  const r = (i: number, extra?: CSSProperties) => ({ "data-r": "", style: { "--i": i, ...extra } as CSSProperties });

  return (
    <div className={`stack${revealing ? " reveal" : ""}`}>
      <div className="row" {...r(0)}>
        <div className="grow">
          <h1 className="h2">{t("hub.greeting", { calling: calling(lang) })}</h1>
          <p className="body">{t("hub.cycle", { start: fmtD(c.cy.prev), end: fmtD(new Date(+c.cy.next - DAY)), days: c.daysLeft })}</p>
        </div>
        <LangSwitch />
      </div>

      <div className="card" {...r(1, { flexDirection: "row", alignItems: "center", padding: "14px 12px 14px 16px" })}>
        <div className="grow">
          <div className="over">{t("hub.takeHomePay")}</div>
          <div className="row" style={{ alignItems: "baseline", gap: 4 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
              RM {fmt(c.net)}
            </span>
            <span className="body">{t("common.perMonth")}</span>
          </div>
          <div className="cap">{t(S.mode === "gross" ? "hub.afterDeductions" : "hub.enteredNet")}</div>
        </div>
        <button className="btn btn-quiet" style={{ width: "auto", minHeight: 44, padding: "0 16px", borderRadius: 999, gap: 6 }} onClick={() => go("salary")}>
          <Icon name="pen" />
          {t("common.edit")}
        </button>
      </div>

      <div className="section" style={{ gap: 6 }}>
        <div className="over" {...r(2)}>
          {t(has ? "hub.canSpendAfter" : "hub.canSpend")}
        </div>
        <div className="row" {...r(2, { alignItems: "baseline", gap: 10 })}>
          <span className="hero lime">
            <RollingNumber value={"RM " + fmt(Math.max(0, c.daily))} anchor="end" />
          </span>
          <span className="h2">{t("common.aDay")}</span>
        </div>
        <Reaction {...r(3)}>{t(dailyReaction(c.daily))}</Reaction>
        <div className="row body" {...r(3)}>
          <span className="sw" style={{ background: "var(--amber)", borderRadius: 99 }} />
          {anyAmount ? t("hub.formulaLeft", { left: fmt(c.left) }) : t("hub.formulaWants", { wants: fmt(c.wants), days: c.days })}
        </div>
        <div className="strip" {...r(4)} role="img" aria-label={t("hub.stripAria", { today: c.today, days: c.days })}>
          {Array.from({ length: c.days }, (_, i) => (
            <i key={i} className={i + 1 < c.today ? "" : i + 1 === c.today ? "t today" : "f"} />
          ))}
          <span className="tl" style={{ left: `${((c.today - 0.5) / c.days) * 100}%` }}>
            {t("common.today")}
          </span>
        </div>
        <div className="row between cap" {...r(4)}>
          <span>{t("hub.paid", { date: fmtD(c.cy.prev) })}</span>
          <span>{t("hub.nextPayday", { date: fmtD(c.cy.next) })}</span>
        </div>
        <div {...r(5)}>
          <BudgetChips c={c} style={{ paddingTop: 6 }} />
        </div>
      </div>

      <div {...r(6)}>
        <SplitCard c={c} />
      </div>

      {kl && (
        <div {...r(7, { background: "rgba(255,187,51,.12)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 })}>
          <div className="lbl amber">{t("kl.title")}</div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            {t("kl.body", { basics: fmt(rates().split.klNeedsBasics), needs: fmt(c.needs) })}
          </p>
          <button className="link" onClick={() => go("commit")} style={{ alignSelf: "flex-start" }}>
            {t("kl.link")}
          </button>
        </div>
      )}

      {has ? (
        <div className="card" {...r(8)}>
          <div className="row between">
            <h2 className="over">{t("health.card")}</h2>
            <StatusPill tone={vCol}>{t(VERDICT_KEY[vName])}</StatusPill>
          </div>
          <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
              {pct(c.ratio)}
            </span>
            <span className="cap">{t("health.cardAmount", { amt: fmt(c.commit) })}</span>
          </div>
          <Gauge p={c.ratio} stops={[50, 65]} max={100} />
          <div className="row between">
            <span className="cap" style={{ color: "var(--ink-400)" }}>
              {c.needsC <= c.needs ? t("health.needsLeft", { v: fmt(c.needs - c.needsC) }) : t("health.needsOver", { v: fmt(c.needsC - c.needs) })}
            </span>
            <button className="link" onClick={() => go("health")}>
              {t("health.details")}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" {...r(8)}>
          <h2 className="over">{t("health.card")}</h2>
          <div className="h3">{t("health.emptyTitle")}</div>
          <p className="body">{t("health.emptyBody", { needs: fmt(c.needs) })}</p>
          <BrandSvg svg={HEALTH_EMPTY} style={{ width: "100%", maxWidth: 314, height: 96, alignSelf: "center" }} />
          <button className="btn btn-primary" onClick={() => go("commit")}>
            {t("health.add")}
          </button>
        </div>
      )}

      <div className="section" {...r(9, { gap: 12 })}>
        <h2 className="over">{t("afford.title")}</h2>
        <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
          <AffordTile icon="car" title={t("afford.car")} pre={t("afford.carPre")} val={carSafe ? "RM " + k(carSafe) : t("afford.notYet")} unit="" meta={t("afford.carMeta", { v: fmt(c.net * 0.2) })} share={0.2} cta={t("afford.seeCars")} onClick={() => go("car")} />
          <AffordTile icon="home" title={t("afford.home")} pre={t("afford.homePre")} val={"RM " + fmt(rent)} unit={t("common.perMo")} meta={t("afford.homeMeta")} share={0.3} cta={t("afford.seeHousing")} onClick={() => go("house")} />
        </div>
      </div>

      <p className="cap" style={{ textAlign: "center", fontSize: 11, padding: "4px 12px 0" }}>
        {t("hub.legal")}
      </p>
      <DataControls />
    </div>
  );
}

function AffordTile(p: { icon: IconName; title: string; pre: string; val: ReactNode; unit: string; meta: string; share: number; cta: string; onClick: () => void }) {
  return (
    <button className="card afford" onClick={p.onClick} style={{ flex: 1, padding: 16, gap: 10, textAlign: "left", transition: "transform 120ms var(--ease)" }}>
      <div className="row" style={{ gap: 10 }}>
        <span className="ico">
          <Icon name={p.icon} />
        </span>
        <span className="lbl" style={{ fontSize: 15 }}>
          {p.title}
        </span>
      </div>
      <div>
        <div className="cap">{p.pre}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 3 }}>
          <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            {p.val}
          </span>
          <span className="cap">{p.unit}</span>
        </div>
      </div>
      <div className="track" style={{ height: 6 }}>
        <i style={{ width: `${p.share * 100}%`, background: "var(--lime)" }} />
      </div>
      <div className="cap" style={{ color: "var(--ink-400)" }}>
        {p.meta}
      </div>
      <span className="lbl">{p.cta}</span>
    </button>
  );
}

/** Export / import for changing phones, and wipe (two taps within 3 s). Wipe returns to Welcome. */
function DataControls() {
  const t = useT();
  const [armed, setArmed] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  const wipe = async () => {
    if (!armed) return setArmed(true);
    await wipeAll();
    document.documentElement.lang = "en";
    resetReveal();
    go("welcome", "reset");
  };

  return (
    <div className="section" style={{ gap: 24, alignItems: "center" }}>
      <div className="row" style={{ gap: 16 }}>
        <button className="link" onClick={exportBackup} style={{ color: "var(--ink-500)", fontSize: 12 }}>
          {t("hub.export")}
        </button>
        <button className="link" onClick={() => file.current?.click()} style={{ color: "var(--ink-500)", fontSize: 12 }}>
          {t("hub.import")}
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              const s = await importBackup(f);
              document.documentElement.lang = s.lang;
              toast(t("hub.restored"));
            } catch {
              toast(t("hub.notBackup"));
            }
          }}
        />
      </div>
      <button className="link" onClick={wipe} style={{ color: armed ? "var(--coral)" : "var(--ink-500)", fontSize: 12 }}>
        <Icon name="trash" />
        <span> {t(armed ? "hub.wipeArmed" : "hub.wipe")}</span>
      </button>
    </div>
  );
}
