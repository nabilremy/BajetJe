import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fmt, type Plan } from "../engine";
import { Icon } from "./Icon";

type Kind = "week" | "left";

/** "RM x a week" and "RM y budget till payday", each with a tooltip that shows the maths. */
export function BudgetChips({ c, style }: { c: Plan; style?: CSSProperties }) {
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

  const src: [string, number] = c.commit || c.savC ? ["Left after bills and savings", c.left] : ["30% wants", c.wants];
  const n = open === "week" ? 7 : c.daysLeft;

  return (
    <div ref={wrap} className="row tipwrap" style={{ flexWrap: "wrap", ...style }}>
      <button className="chip" aria-expanded={open === "week"} aria-controls="budget-tip" onClick={(e) => toggle("week", e.currentTarget)}>
        <b>RM {fmt(c.daily * 7)}</b> a week <Icon name="info" />
      </button>
      <button className="chip" aria-expanded={open === "left"} aria-controls="budget-tip" onClick={(e) => toggle("left", e.currentTarget)}>
        <b>RM {fmt(c.daily * c.daysLeft)}</b> budget till payday <Icon name="info" />
      </button>
      {open && (
        <div className="tip" id="budget-tip" role="dialog" key={open} style={{ "--ax": ax + "px" } as CSSProperties}>
          <div className="lbl">{open === "week" ? "Your spending budget for 7 days" : "Your spending budget until payday"}</div>
          <div className="eq">
            <span>{src[0]}</span>
            <b>RM {fmt(src[1])}</b>
            <span>÷ days in this pay cycle</span>
            <b>{c.days}</b>
            <span>= Daily budget</span>
            <b>RM {fmt(c.daily)}</b>
            <span>× {open === "week" ? "7 days" : "days left till payday"}</span>
            <b>{n}</b>
            <span className="tot">{open === "week" ? "Weekly budget" : "Budget till payday"}</span>
            <b className="tot">RM {fmt(c.daily * n)}</b>
          </div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            A plan, not your bank balance. BajetJe doesn't track spending, so this assumes you keep to RM {fmt(c.daily)} a day.
          </p>
        </div>
      )}
    </div>
  );
}
