import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { HEALTH_EMPTY } from "../brand/assets";
import { CommitCard, MoneyCard } from "../components/CommitCard";
import { ExtraCard } from "../components/ExtraCard";
import { BrandSvg, Icon } from "../components/Icon";
import { savingsTip } from "../components/savingsTip";
import { SplitCard } from "../components/SplitCard";
import { LangSwitch } from "../components/ui";
import { calc, carLimit, DAY, fmt, fmtD, k, rates, type IconName } from "../engine";
import { calling, useLang, useT } from "../i18n";
import { go } from "../state/router";
import { useApp, wipeAll } from "../state/store";

/** Hub reveal plays once per session */
let revealed = false;
export const resetReveal = () => {
  revealed = false;
};

type R = (i: number, extra?: CSSProperties) => { "data-r": string; style: CSSProperties };
const r: R = (i, extra) => ({ "data-r": "", style: { "--i": i, ...extra } as CSSProperties });

/**
 * F2 · My Plan (V2 dashboard, one layout for everyone). Reading order: header, pay-cycle strip, the money flow
 * (Take-home -> Commitments -> Extra money, joined by a spine), 50/30/20, what can I afford, tip, legal.
 * With nothing listed yet the flow holds the 50/30/20 card and the commitment-health invitation instead.
 * On a language change the header stays and everything below fades up.
 */
export function Plan() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const c = calc(S);
  const has = c.commit + c.savC > 0;
  const [reveal] = useState(() => !revealed);
  const [revealing, setRevealing] = useState(reveal);
  const [swapping, setSwapping] = useState(false);
  const prevLang = useRef(lang);
  const carSafe = carLimit(c.net, rates().car.comfortableShare, S.carDown);
  const rent = c.net * rates().home.share;

  useEffect(() => {
    revealed = true;
    if (!reveal) return;
    const id = setTimeout(() => setRevealing(false), 1600);
    return () => clearTimeout(id);
  }, [reveal]);

  useLayoutEffect(() => {
    if (prevLang.current === lang) return;
    prevLang.current = lang;
    setRevealing(false);
    setSwapping(false);
    const raf = requestAnimationFrame(() => setSwapping(true));
    const id = setTimeout(() => setSwapping(false), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [lang]);

  return (
    <div className={`stack${revealing ? " reveal" : ""}${swapping ? " look-swap" : ""}`}>
      <div className="row keep" {...r(0)}>
        <div className="grow">
          <h1 className="h2">{t("hub.greeting", { calling: calling(lang) })}</h1>
          <p className="body">{t("hub.cycle", { start: fmtD(c.cy.prev), end: fmtD(new Date(+c.cy.next - DAY)), days: c.daysLeft })}</p>
        </div>
        <LangSwitch />
      </div>

      <div className="section" {...r(1, { gap: 8 })}>
        <div className="strip" role="img" aria-label={t("hub.stripAria", { today: c.today, days: c.days })}>
          {Array.from({ length: c.days }, (_, i) => (
            <i key={i} className={i + 1 < c.today ? "" : i + 1 === c.today ? "t today" : "f"} />
          ))}
          <span className="tl" style={{ left: `${((c.today - 0.5) / c.days) * 100}%` }}>
            {t("common.today")}
          </span>
        </div>
        <div className="row between cap">
          <span>{fmtD(c.cy.prev)}</span>
          <span>{t("hub.payday", { date: fmtD(c.cy.next) })}</span>
        </div>
      </div>

      <div className="flow">
        <MoneyCard
          over={t("hub.takeHomePay")}
          value={"RM " + fmt(c.net)}
          perMonth={t("common.perMonth")}
          helper={t(S.mode === "gross" ? "hub.afterDeductions" : "hub.enteredNet")}
          editLabel={t("simple.editSalary")}
          onEdit={() => go("salary")}
          i={2}
        />
        {has ? (
          <>
            <CommitCard c={c} i={3} />
            <ExtraCard c={c} i={4} />
          </>
        ) : (
          <>
            <div {...r(3)}>
              <SplitCard c={c} layout="inCard" />
            </div>
            <div className="card" {...r(4)}>
              <h2 className="over">{t("health.card")}</h2>
              <div className="h3">{t("health.emptyTitle")}</div>
              <p className="body">{t("health.emptyBody", { needs: fmt(c.needs) })}</p>
              <BrandSvg svg={HEALTH_EMPTY} style={{ width: "100%", maxWidth: 314, height: 96, alignSelf: "center" }} />
              <button className="btn btn-primary" onClick={() => go("commit")}>
                {t("health.add")}
              </button>
            </div>
          </>
        )}
      </div>

      {has && (
        <div {...r(5)}>
          <SplitCard c={c} layout="headOut" />
        </div>
      )}

      <div className="section" {...r(6, { gap: 12 })}>
        <h2 className="over">{t("afford.title")}</h2>
        <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
          <AffordTile icon="car" title={t("afford.car")} pre={t("afford.carPre")} val={carSafe ? "RM " + k(carSafe) : t("afford.notYet")} unit="" meta={t("afford.carMeta", { v: fmt(c.net * 0.2) })} share={0.2} cta={t("afford.seeCars")} onClick={() => go("car")} />
          <AffordTile icon="home" title={t("afford.home")} pre={t("afford.homePre")} val={"RM " + fmt(rent)} unit={t("common.perMo")} meta={t("afford.homeMeta")} share={0.3} cta={t("afford.seeHousing")} onClick={() => go("house")} />
        </div>
      </div>

      <div className="disclaimer" {...r(7)}>
        <span style={{ color: "var(--lime)", flex: "none", display: "flex" }}>
          <Icon name="sparkle" />
        </span>
        <p className="cap" style={{ color: "var(--ink-300)" }}>
          {savingsTip(c, t)}
        </p>
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

/** Wipe everything on this phone (two taps within 3 s), then back to Welcome. With saved commitment lists, the second
 *  tap is a choice: delete everything, or delete but keep the lists (6 s to read it). */
function DataControls() {
  const t = useT();
  const lists = useApp().savedLists.length;
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), lists ? 6000 : 3000);
    return () => clearTimeout(id);
  }, [armed, lists]);

  const wipeNow = async (keepLists: boolean) => {
    await wipeAll(keepLists);
    document.documentElement.lang = "en";
    resetReveal();
    go("welcome", "reset");
  };
  const wipe = () => (armed ? wipeNow(false) : setArmed(true));

  if (armed && lists)
    return (
      <div className="section rise-fast" style={{ alignItems: "center", gap: 20 }} role="group" aria-label={t("hub.wipe")}>
        <p className="cap" style={{ textAlign: "center", color: "var(--ink-300)" }}>
          {t("hub.wipeAsk", { n: lists })}
        </p>
        <div className="row" style={{ flexWrap: "wrap", justifyContent: "center", gap: "24px 20px" }}>
          <button className="link" onClick={() => wipeNow(true)} style={{ fontSize: 12 }}>
            {t("hub.wipeKeep")}
          </button>
          <button className="link" onClick={() => wipeNow(false)} style={{ color: "var(--coral)", fontSize: 12 }}>
            <Icon name="trash" />
            <span> {t("hub.wipeAll")}</span>
          </button>
        </div>
      </div>
    );

  return (
    <button className="link" onClick={wipe} style={{ alignSelf: "center", color: armed ? "var(--coral)" : "var(--ink-500)", fontSize: 12 }}>
      <Icon name="trash" />
      <span> {t(armed ? "hub.wipeArmed" : "hub.wipe")}</span>
    </button>
  );
}
