import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { fmt, type Plan } from "../engine";
import { itemName, useLang, useT } from "../i18n";
import { go } from "../state/router";
import { setState, useApp } from "../state/store";
import { Icon } from "./Icon";

const E = "cubic-bezier(0.23, 1, 0.32, 1)";
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Plain money card in the flow: overline, value, helper, pencil */
export function MoneyCard(p: { over: string; value: string; perMonth?: string; helper: string; editLabel: string; onEdit: () => void; i: number }) {
  return (
    <div className="mcard" data-r="" style={{ "--i": p.i } as CSSProperties}>
      <div className="grow">
        <div className="over">{p.over}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 4 }}>
          <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            {p.value}
          </span>
          {p.perMonth && <span className="body">{p.perMonth}</span>}
        </div>
        <div className="cap">{p.helper}</div>
      </div>
      <button className="iconbtn" aria-label={p.editLabel} onClick={p.onEdit} style={{ background: "none", color: "var(--ink-400)" }}>
        <Icon name="pen" />
      </button>
    </div>
  );
}

/**
 * Commitments card with an inline breakdown (docs/commitments-breakdown.md): read here, edit in F3.
 * The card height eases open (300 ms) and closed (220 ms); rows fade up; a tap mid-way restarts from the current height.
 */
export function CommitCard({ c, i }: { c: Plan; i: number }) {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const open = S.cbOpen;
  const card = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const h0 = useRef<number | null>(null);
  const anims = useRef<Animation[]>([]);
  const items = S.commitments.filter((x) => x.amt > 0);

  const toggle = () => {
    h0.current = card.current && !reduced() ? card.current.getBoundingClientRect().height : null;
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    setState({ cbOpen: !open });
  };

  useLayoutEffect(() => {
    const el = card.current;
    const from = h0.current;
    h0.current = null;
    if (!el || from === null) return;
    const b = body.current;
    // Closing: measure the shut card, then keep the body visible while the card eases shut and hide it at the end
    const to = el.getBoundingClientRect().height;
    if (!open && b) b.hidden = false;
    el.style.overflow = "hidden";
    const ha = el.animate([{ height: from + "px" }, { height: to + "px" }], { duration: open ? 300 : 220, easing: E });
    const run: Animation[] = [ha];
    if (open && b)
      b.querySelectorAll(".crow, .cnote").forEach((r, k) =>
        run.push(r.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 240, delay: 60 + Math.min(k, 8) * 25, easing: E, fill: "backwards" })),
      );
    if (!open && b) run.push(b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out", fill: "forwards" }));
    ha.onfinish = () => {
      if (!anims.current.includes(ha)) return;
      el.style.overflow = "";
      if (!open && b) b.hidden = true;
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
    };
    anims.current = run;
  }, [open]);

  // Typed one total and no list: no breakdown to show
  if (!c.listed)
    return <MoneyCard over={t("common.commitments")} value={"RM " + fmt(c.commit)} helper={t("simple.inTotal")} editLabel={t("simple.editCommitments")} onEdit={() => go("commit")} i={i} />;

  const group = (key: "needs" | "wants" | "savings", label: string, col: string, total: number, note?: string) => {
    const rows = items.filter((x) => x.bucket === key).sort((a, b) => b.amt - a.amt);
    if (!rows.length) return null;
    return (
      <div className="cgrp" key={key}>
        <div className="crow chead">
          <span className="cdot" style={{ background: col }} />
          <span className="over grow">{label}</span>
          <span className="mono">RM {fmt(total)}</span>
        </div>
        {rows.map((x) => (
          <div key={x.id} className="crow citem">
            <span className="grow">{itemName(lang, x.name, x.custom) || t("commit.fallbackName")}</span>
            <span className="mono">RM {fmt(x.amt)}</span>
          </div>
        ))}
        {note && <div className="cap cnote">{note}</div>}
      </div>
    );
  };

  return (
    <div ref={card} className={`mcard ccard${open ? " open" : ""}`} data-r="" style={{ "--i": i } as CSSProperties}>
      <div className="row" style={{ gap: 12, alignItems: "center", width: "100%" }}>
        <div className="grow">
          <div className="over">{t("common.commitments")}</div>
          <div className="row" style={{ alignItems: "baseline", gap: 4 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
              RM {fmt(c.commit)}
            </span>
          </div>
          <button className="disc" aria-expanded={open} aria-controls="cbody" onClick={toggle}>
            <span className="disc-l">{t(open ? "cb.hide" : "cb.see")}</span>
            <span className="disc-n">{t("cb.items", { n: items.length })}</span>
            <Icon name="chev" />
          </button>
        </div>
        <button className="iconbtn" aria-label={t("simple.editCommitments")} onClick={() => go("commit")} style={{ background: "none", color: "var(--ink-400)" }}>
          <Icon name="pen" />
        </button>
      </div>
      <div ref={body} className="cbody" id="cbody" hidden={!open}>
        {group("needs", t("bucket.needs"), "var(--ink-400)", c.needsC - c.lump)}
        {group("wants", t("bucket.wants"), "var(--amber)", c.wantsC)}
        {group("savings", t("cb.savings"), "var(--lime)", c.savC, t("cb.savNote"))}
      </div>
    </div>
  );
}
