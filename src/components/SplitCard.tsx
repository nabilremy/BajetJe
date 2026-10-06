import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { fmt, type Plan } from "../engine";
import { setState, useApp, type SplitView } from "../state/store";
import { useT, type T } from "../i18n";
import { Icon } from "./Icon";

const VIEWS = [
  ["bars", "vbars", "split.bars", "split.barsView"],
  ["jars", "vjars", "split.jars", "split.jarsView"],
  ["ledger", "vledger", "split.list", "split.listView"],
] as const;

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 50/30/20 split: one container for every view; only the body changes. */
export function SplitCard({ c }: { c: Plan }) {
  const S = useApp();
  const t = useT();
  const [how, setHow] = useState(false);
  const [swap, setSwap] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const prevH = useRef<number | null>(null);
  const vi = Math.max(0, VIEWS.findIndex((v) => v[0] === S.variant));

  const pick = (v: SplitView) => {
    if (v === S.variant) return;
    prevH.current = body.current?.offsetHeight ?? null;
    setState({ variant: v });
    setSwap((n) => n + 1);
  };

  // Body height eases 260 ms between views
  useLayoutEffect(() => {
    const el = body.current;
    const h0 = prevH.current;
    prevH.current = null;
    if (!el || h0 === null || !el.animate || reduced()) return;
    el.animate([{ height: h0 + "px" }, { height: el.offsetHeight + "px" }], { duration: 260, easing: "cubic-bezier(0.23,1,0.32,1)" });
  }, [swap]);

  return (
    <div className="section split">
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <h2 className="over">{t("split.title")}</h2>
          <button className="iconbtn" aria-expanded={how} aria-label={t("split.how")} onClick={() => setHow(!how)} style={{ width: 28, height: 28, background: "none", color: "var(--ink-500)" }}>
            <Icon name="info" />
          </button>
        </div>
        <div className="vt" role="group" aria-label={t("split.chartView")} style={{ "--i": vi } as CSSProperties}>
          {VIEWS.map(([v, i, l, aria]) => (
            <button key={v} aria-pressed={S.variant === v} aria-label={t(aria)} title={t(l)} onClick={() => pick(v)}>
              <Icon name={i} />
            </button>
          ))}
        </div>
      </div>
      {how && (
        <p className="cap" style={{ color: "var(--ink-400)" }}>
          {t("split.howBody")}
        </p>
      )}
      <div ref={body} key={swap} className={`split-body${swap ? " swap" : ""}`}>
        <SplitBody c={c} view={S.variant} t={t} />
      </div>
    </div>
  );
}

function SplitBody({ c, view, t }: { c: Plan; view: SplitView; t: T }) {
  const B: [string, string, number, number, string][] = [
    [t("bucket.needs"), "var(--ink-400)", c.needs, 50, t("split.needsDesc")],
    [t("bucket.wants"), "var(--amber)", c.wants, 30, t("split.wantsDesc")],
    [t("bucket.savings"), "var(--lime)", c.savingsOut, 20, t("split.savingsDesc")],
  ];
  if (view === "jars")
    return (
      <>
        <div className="jars">
          {B.map(([n, col, v, p], i) => (
            <div key={n} className="jar">
              <div className="glass">
                <i className="grow-y" style={{ "--i": i, height: `${(p / 50) * 86}%`, background: col } as CSSProperties} />
                <span>{p}%</span>
              </div>
              <div className="lbl">{n}</div>
              <div className="mono" style={{ fontSize: 15 }}>
                RM {fmt(v)}
              </div>
            </div>
          ))}
        </div>
        <p className="cap">{t("split.jarsNote")}</p>
      </>
    );
  if (view === "ledger")
    return (
      <div className="ledger">
        {B.map(([n, col, v, p, d], i) => (
          <div key={n} className="grow-r" style={{ "--i": i } as CSSProperties}>
            <div className="row" style={{ gap: 8 }}>
              <span className="sw" style={{ background: col }} />
              <span className="lbl">{n}</span>
              <span className="cap">{p}%</span>
            </div>
            <div className="cap" style={{ textAlign: "right" }}>
              {t("split.perDay", { v: fmt(v / c.days) })}
            </div>
            <div className="big">RM {fmt(v)}</div>
            <div />
            <div className="cap" style={{ gridColumn: "1/-1" }}>
              {d}
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <>
      <div className="row" style={{ gap: 3, height: 32 }}>
        {B.map(([n, col, , p], i) => (
          <div key={n} className="grow-x" style={{ "--i": i, flex: p, height: "100%", background: col, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 10, transformOrigin: "left" } as CSSProperties}>
            <span className="lbl" style={{ color: "var(--ink-900)" }}>
              {p}%
            </span>
          </div>
        ))}
      </div>
      <div className="list" style={{ gap: 14 }}>
        {B.map(([n, col, v, , d]) => (
          <div key={n} className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <span className="sw" style={{ background: col, width: 10, height: 10, marginTop: 6 }} />
            <div className="grow">
              <div className="lbl" style={{ fontSize: 15 }}>
                {n}
              </div>
              <div className="cap">{d}</div>
            </div>
            <div className="mono" style={{ fontSize: 15 }}>
              RM {fmt(v)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
