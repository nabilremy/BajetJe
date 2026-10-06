import { useEffect, useRef } from "react";
import { fmt, type Commitment } from "../engine";
import { Icon } from "./Icon";

const W = 84;

/** Commitment row: inline amount, iOS-style swipe to delete (vertical drags still scroll). */
export function CommitmentRow({
  c,
  edit,
  open,
  isNew,
  onOpen,
  onChange,
  onDelete,
}: {
  c: Commitment;
  edit: boolean;
  open: boolean;
  isNew: boolean;
  onOpen: (open: boolean) => void;
  onChange: (patch: Partial<Commitment>) => void;
  onDelete: () => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const fg = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const amt = useRef<HTMLInputElement>(null);
  const drag = useRef({ active: false, x0: 0, y0: 0, base: 0, x: 0, decided: false, horizontal: false });

  useEffect(() => {
    if (fg.current) fg.current.style.transform = open ? `translateX(-${W}px)` : "";
  }, [open]);

  useEffect(() => {
    if (!isNew) return;
    (c.custom ? name.current : amt.current)?.focus({ preventScroll: true });
    // focus once, when the row is first added
  }, [isNew, c.custom]);

  const down = (e: React.PointerEvent) => {
    drag.current = { active: true, x0: e.clientX, y0: e.clientY, base: open ? -W : 0, x: open ? -W : 0, decided: false, horizontal: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || !fg.current) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.decided = true;
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!d.horizontal) {
        d.active = false;
        return;
      }
      try {
        fg.current.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      onOpen(open); // closes the others
    }
    let x = d.base + dx;
    if (x > 0) x = x * 0.2; // rubber-band past the edge
    if (x < -W) x = -W + (x + W) * 0.3;
    d.x = x;
    fg.current.style.transition = "none";
    fg.current.style.transform = `translateX(${x}px)`;
  };
  const up = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.horizontal || !fg.current) return;
    const next = d.x < -W / 2;
    fg.current.style.transition = "";
    fg.current.style.transform = next ? `translateX(-${W}px)` : "";
    if (document.activeElement instanceof HTMLElement && fg.current.contains(document.activeElement)) document.activeElement.blur();
    onOpen(next);
  };

  const del = () => {
    const el = row.current;
    if (!el) return onDelete();
    el.style.height = el.offsetHeight + "px";
    void el.offsetHeight;
    el.classList.add("collapsing");
    setTimeout(onDelete, 220);
  };

  const label = c.name || "commitment";
  return (
    <div ref={row} className={`swipe${isNew ? " rise" : ""}`} data-row={c.id}>
      <button className="sw-del" onClick={del} aria-label={`Delete ${label}`} tabIndex={open ? 0 : -1}>
        Delete
      </button>
      <div ref={fg} className="item sw-fg" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {edit && (
          <button className="minus" onClick={() => onOpen(!open)} aria-label={`Show delete for ${label}`} aria-expanded={open}>
            <i />
          </button>
        )}
        <span className="ico">
          <Icon name={c.icon} />
        </span>
        <div className="grow">
          {c.custom ? (
            <input
              ref={name}
              value={c.name}
              placeholder="Name"
              aria-label="Commitment name"
              maxLength={28}
              onChange={(e) => onChange({ name: e.target.value.slice(0, 28) })}
              style={{ background: "none", border: 0, outline: 0, fontSize: 13, fontWeight: 500, width: "100%" }}
            />
          ) : (
            <div className="lbl">{c.name}</div>
          )}
          <div className="row" style={{ gap: 6 }}>
            <span className="cap">{c.cat}</span>
            {c.debt && <span className="tag">Debt</span>}
          </div>
        </div>
        <label className="amt">
          <span className="cap">RM</span>
          <input
            ref={amt}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={c.amt ? fmt(c.amt) : ""}
            aria-label={`${c.name || "Commitment"} monthly amount`}
            onChange={(e) => onChange({ amt: +e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 6) || 0 })}
          />
        </label>
      </div>
    </div>
  );
}
