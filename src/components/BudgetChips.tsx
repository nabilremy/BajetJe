import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fmt, type Plan } from "../engine";
import { useT } from "../i18n";
import { Icon } from "./Icon";

type Kind = "week" | "left";

/** "RM x a week" and "RM y budget till payday", each with a tooltip that shows the maths. */
export function BudgetChips({ c, style }: { c: Plan; style?: CSSProperties }) {
  const t = useT();
  const [open, setOpen] = useState<Kind | null>(null);
  const [ax, setAx] = useState(24);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (k: Kind, el: HTMLButtonElement) => {
    setAx(el.offsetLeft + 24);
    setOpen(open === k ? null : k);
  };

  const src: [string, number] = c.commit || c.savC ? [t("tip.srcLeft"), c.left] : [t("tip.srcWants"), c.wants];
  const n = open === "week" ? 7 : c.daysLeft;

  return (
    <div ref={wrap} className="row tipwrap" style={{ flexWrap: "wrap", ...style }}>
      <button className="chip" aria-expanded={open === "week"} aria-controls="budget-tip" onClick={(e) => toggle("week", e.currentTarget)}>
        <b>RM {fmt(c.daily * 7)}</b> {t("chips.week")} <Icon name="info" />
      </button>
      <button className="chip" aria-expanded={open === "left"} aria-controls="budget-tip" onClick={(e) => toggle("left", e.currentTarget)}>
        <b>RM {fmt(c.daily * c.daysLeft)}</b> {t("chips.tillPayday")} <Icon name="info" />
      </button>
      {open && (
        <div className="tip" id="budget-tip" role="dialog" key={open} style={{ "--ax": ax + "px" } as CSSProperties}>
          <div className="lbl">{t(open === "week" ? "tip.weekTitle" : "tip.leftTitle")}</div>
          <div className="eq">
            <span>{src[0]}</span>
            <b>RM {fmt(src[1])}</b>
            <span>{t("tip.divide")}</span>
            <b>{c.days}</b>
            <span>{t("tip.daily")}</span>
            <b>RM {fmt(c.daily)}</b>
            <span>{t(open === "week" ? "tip.x7" : "tip.xLeft")}</span>
            <b>{n}</b>
            <span className="tot">{t(open === "week" ? "tip.weekly" : "tip.tillPayday")}</span>
            <b className="tot">RM {fmt(c.daily * n)}</b>
          </div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            {t("tip.note", { daily: fmt(c.daily) })}
          </p>
        </div>
      )}
    </div>
  );
}
