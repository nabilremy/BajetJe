import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { fmt, verdict, type Plan } from "../engine";
import { useT } from "../i18n";
import { setState, useApp } from "../state/store";
import { Icon } from "./Icon";
import { RollingNumber } from "./RollingNumber";
import { toneVar } from "./ui";

type Kind = "week" | "left";
type Box = DOMRect;
const E = "cubic-bezier(0.23, 1, 0.32, 1)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const D = 380;
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Extra money card (docs/extra-money-motion.md): health pill, the big number, week / till-payday chips with tooltips,
 * and the commitments | savings | extra bar. The collapse button shrinks the number with a FLIP (transform only), the
 * card height eases, chips and bar ride with it, and the pill hops (fade out in place, pop in at its new place).
 */
export function ExtraCard({ c, i }: { c: Plan; i: number }) {
  const S = useApp();
  const t = useT();
  const [tip, setTip] = useState<Kind | null>(null);
  const [ax, setAx] = useState(24);
  const card = useRef<HTMLDivElement>(null);
  const amt = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLSpanElement>(null);
  const first = useRef<{ boxes: Record<string, Box>; h0: number } | null>(null);
  const anims = useRef<Animation[]>([]);
  const toggled = useRef(false);

  const extra = c.extra;
  const perDay = Math.max(0, Math.floor(extra / c.days));
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  const vKey = vName === "Healthy" ? "common.healthy" : vName === "Caution" ? "common.caution" : "common.high";
  const tot = Math.max(c.net, c.commit + c.savC) || 1;
  const pC = (c.commit / tot) * 100;
  const pS = (c.savC / tot) * 100;
  const pX = (Math.max(0, extra) / tot) * 100;
  const parts = () => ({ amt: amt.current, pill: pill.current, chips: chips.current, bar: bar.current });

  // Tooltip: close on outside tap or Esc
  useEffect(() => {
    if (!tip) return;
    const onDoc = (e: PointerEvent) => {
      if (!chips.current?.contains(e.target as Node)) setTip(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTip(null);
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [tip]);

  const toggleSize = () => {
    // First: measure every moving part where it is drawn now (mid-animation included), then stop what is running
    const el = card.current;
    if (el && !reduced()) {
      const boxes: Record<string, Box> = {};
      for (const [k, n] of Object.entries(parts())) if (n) boxes[k] = n.getBoundingClientRect();
      first.current = { boxes, h0: el.getBoundingClientRect().height };
    }
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    toggled.current = true;
    setTip(null); // nothing floats over a moving card
    setState({ xsmall: !S.xsmall });
  };

  // Last, Invert, Play: runs after the layout switched, before paint
  useLayoutEffect(() => {
    const f = first.current;
    first.current = null;
    const el = card.current;
    if (!toggled.current || !f || !el) return; // first render, or reduced motion: the layout just switches
    toggled.current = false;
    const last: Record<string, Box> = {};
    for (const [k, n] of Object.entries(parts())) if (n) last[k] = n.getBoundingClientRect();
    const h1 = el.getBoundingClientRect().height;
    const dx = (k: string) => f.boxes[k].left - last[k].left;
    const dy = (k: string) => f.boxes[k].top - last[k].top;
    const run: Animation[] = [];
    const { amt: a, pill: p, chips: ch, bar: b } = parts();
    // 1. number: travel + scale from its old box
    if (a && f.boxes.amt) {
      const s = f.boxes.amt.height / (last.amt.height || 1);
      run.push(a.animate([{ transform: `translate(${dx("amt")}px, ${dy("amt")}px) scale(${s})` }, { transform: "none" }], { duration: D, easing: E }));
    }
    // 2. pill hops: drift 8 px the way it is heading and fade (100 ms), hidden while the number passes, pop in from 12 px behind
    if (p && f.boxes.pill) {
      const x = dx("pill");
      const y = dy("pill");
      const dir = x < 0 ? 1 : -1;
      run.push(
        p.animate(
          [
            { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, easing: E },
            { transform: `translate(${x + dir * 8}px, ${y}px) scale(.9)`, opacity: 0, offset: 100 / 440 },
            { transform: `translateX(${-dir * 12}px) scale(.9)`, opacity: 0, offset: 180 / 440, easing: SPRING },
            { transform: "none", opacity: 1 },
          ],
          { duration: 440, easing: "linear" },
        ),
      );
    }
    // 3. chips and bar ride with the card
    for (const [k, n] of [["chips", ch], ["bar", b]] as const)
      if (n && f.boxes[k]) run.push(n.animate([{ transform: `translateY(${dy(k)}px)` }, { transform: "none" }], { duration: D, easing: E }));
    // 4. height eases; clip only while it moves so the tooltip is never cut
    el.style.overflow = "hidden";
    const ha = el.animate([{ height: f.h0 + "px" }, { height: h1 + "px" }], { duration: D, easing: E });
    // A second tap cancels this one and starts its own clip, so only the latest run unclips
    ha.onfinish = () => {
      if (anims.current.includes(ha)) el.style.overflow = "";
    };
    run.push(ha);
    // 5. icon turns in
    if (icon.current) run.push(icon.current.animate([{ transform: "rotate(-90deg) scale(.6)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 240, easing: SPRING }));
    anims.current = run;
  }, [S.xsmall]);

  const openTip = (k: Kind, el: HTMLButtonElement) => {
    setAx(el.offsetLeft + 24);
    setTip(tip === k ? null : k);
  };
  const n = tip === "week" ? 7 : c.daysLeft;

  return (
    <div ref={card} className={`card xcard${S.xsmall ? " small" : ""}`} data-r="" style={{ "--i": i } as CSSProperties}>
      <div className="row" style={{ gap: 10 }}>
        <span className="xop" aria-hidden="true">
          =
        </span>
        <span className="lbl grow" style={{ fontSize: 13 }}>
          {t("simple.left")}
        </span>
        <button className="iconbtn xbtn" aria-pressed={S.xsmall} aria-label={t(S.xsmall ? "hub.heroGrow" : "hub.heroShrink")} onClick={toggleSize}>
          <span ref={icon} style={{ display: "grid", placeItems: "center" }}>
            <Icon name={S.xsmall ? "grow" : "shrink"} />
          </span>
        </button>
      </div>
      <div className="xhead">
        <span ref={pill} className={`pill${extra >= 0 && vCol === "lime" ? " tint" : ""}`} style={extra < 0 || vCol !== "lime" ? { background: extra < 0 ? "var(--coral)" : toneVar(vCol), color: "var(--ink-900)" } : undefined}>
          {extra < 0 ? t("x.over") : t(vKey)}
        </span>
        <div ref={amt} className="xamt" style={extra < 0 ? { color: "var(--coral)" } : undefined}>
          <RollingNumber value={(extra < 0 ? "−RM " : "RM ") + fmt(Math.abs(extra))} anchor="end" stagger={30} animateOnMount />
        </div>
      </div>
      <div ref={chips} className="row tipwrap" style={{ flexWrap: "wrap" }}>
        <button className="chip" aria-expanded={tip === "week"} aria-controls="x-tip" onClick={(e) => openTip("week", e.currentTarget)}>
          <b>RM {fmt(perDay * 7)}</b> {t("chips.week")} <Icon name="info" />
        </button>
        <button className="chip" aria-expanded={tip === "left"} aria-controls="x-tip" onClick={(e) => openTip("left", e.currentTarget)}>
          <b>RM {fmt(perDay * c.daysLeft)}</b> {t("x.tillPayday")} <Icon name="info" />
        </button>
        {tip && (
          <div className="tip" id="x-tip" role="dialog" key={tip} style={{ "--ax": ax + "px" } as CSSProperties}>
            <div className="lbl">{t(tip === "week" ? "x.weekTitle" : "x.leftTitle")}</div>
            <div className="eq">
              <span>{t("simple.left")}</span>
              <b>RM {fmt(Math.max(0, extra))}</b>
              <span>{t("tip.divide")}</span>
              <b>{c.days}</b>
              <span>{t("tip.daily")}</span>
              <b>RM {fmt(perDay)}</b>
              <span>{t(tip === "week" ? "tip.x7" : "tip.xLeft")}</span>
              <b>{n}</b>
              <span className="tot">{t(tip === "week" ? "tip.weekly" : "tip.tillPayday")}</span>
              <b className="tot">RM {fmt(perDay * n)}</b>
            </div>
            <p className="cap" style={{ color: "var(--ink-400)" }}>
              {t("x.note", { v: fmt(c.savings) })}
            </p>
          </div>
        )}
      </div>
      <div ref={bar} className="section xbar" style={{ gap: 8, paddingTop: 6 }}>
        <div className="lbar" role="img" aria-label={[t("simple.barCommit", { pct: Math.round(pC) }), c.savC ? t("simple.barSave", { pct: Math.round(pS) }) : "", t("simple.barLeft", { pct: Math.round(pX) })].filter(Boolean).join(", ")}>
          <i className="grow-x" style={{ flexGrow: pC || 0.001, background: "var(--bucket-needs)" }} />
          <i className="grow-x" style={{ flexGrow: pS || 0.001, background: "var(--bucket-savings)" }} />
          <i className="grow-x" style={{ flexGrow: pX || 0.001, background: "var(--lime)" }} />
        </div>
        <div className="row between cap">
          <span>{t("simple.barCommit", { pct: Math.round(pC) })}</span>
          {c.savC > 0 && <span>{t("simple.barSave", { pct: Math.round(pS) })}</span>}
          <span>{t("simple.barLeft", { pct: Math.round(pX) })}</span>
        </div>
      </div>
    </div>
  );
}
