import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { pct, type Tone } from "../engine";
import { back } from "../state/router";
import { Icon } from "./Icon";

export const toneVar = (t: Tone) => `var(--${t})`;

export function Navbar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <button className="iconbtn" onClick={back} aria-label="Back">
        <Icon name="back" />
      </button>
      <h1 className="h3 grow">{title}</h1>
      {right}
    </div>
  );
}

/** Status pill: Healthy / Caution / High / Debt / Neutral, or any verdict label. */
export function StatusPill({ tone, children, big, pop, style }: { tone: Tone | "neutral"; children: ReactNode; big?: boolean; pop?: boolean; style?: CSSProperties }) {
  const bg = tone === "neutral" ? "var(--ink-800)" : toneVar(tone);
  const fg = tone === "neutral" ? "var(--ink-400)" : "var(--ink-900)";
  return (
    <span className={`pill${pop ? " pop" : ""}`} style={{ background: bg, color: fg, ...(big ? { fontSize: 15, padding: "6px 12px" } : {}), ...style }}>
      {children}
    </span>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

/** Choice chips (payday, down payment). Selected = ink-50 fill. */
export function ChoiceChips<T extends string | number>({ value, options, onChange, label, style }: { value: T | null; options: [T, string][]; onChange: (v: T) => void; label: string; style?: CSSProperties }) {
  return (
    <div className="row" style={{ gap: 6, flexWrap: "wrap" }} role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={String(v)} className={`chip${value === v ? " on" : ""}`} aria-pressed={value === v} onClick={() => onChange(v)} style={{ minHeight: 36, ...style }}>
          {l}
        </button>
      ))}
    </div>
  );
}

/** Zoned gauge (Healthy / Caution / High) with a marker that can sweep in. */
export function Gauge({ p, stops, max, sweep }: { p: number; stops: [number, number]; max: number; sweep?: boolean }) {
  const [a, b] = stops;
  const W = (x: number) => (x / max) * 100;
  return (
    <>
      <div style={{ position: "relative", padding: "5px 0" }} role="img" aria-label={`${pct(p)}. Healthy up to ${a}%, caution ${a} to ${b}%, high above ${b}%.`}>
        <div className="zones">
          <i style={{ width: `${W(a)}%`, background: "var(--lime)" }} />
          <i style={{ width: `${W(b - a)}%`, background: "var(--amber)" }} />
          <i style={{ flex: 1, background: "var(--coral)" }} />
        </div>
        <div className={`marker${sweep ? " sweep" : ""}`}>
          <b style={{ "--p": `${(Math.min(p, max) / max) * 100}%` } as CSSProperties} />
        </div>
      </div>
      <div className="row between cap">
        <span className="lime">Healthy ≤ {a}%</span>
        <span className="amber">
          Caution {a} to {b}%
        </span>
        <span className="coral">
          High &gt; {b}%
        </span>
      </div>
    </>
  );
}

/** Now / After comparison bars. */
export function ImpactBars({ title, rows }: { title: string; rows: [string, number, string, string][] }) {
  return (
    <div className="section" style={{ gap: 8 }}>
      <div className="lbl">{title}</div>
      {rows.map(([n, v, col, label]) => (
        <div key={n} className="row" style={{ gap: 10 }}>
          <div className="track grow">
            <i style={{ width: `${Math.max(0, Math.min(v, 100))}%`, background: col }} />
          </div>
          <span className="mono cap" style={{ width: 96, textAlign: "right", color: "var(--ink-50)" }}>
            {n} {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AmberNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="note-amber" role="note">
      <div className="lbl amber">{title}</div>
      <div className="cap" style={{ color: "var(--ink-400)" }}>
        {children}
      </div>
    </div>
  );
}

export function Legal({ children }: { children: ReactNode }) {
  return (
    <p className="cap" style={{ textAlign: "center", fontSize: 11 }}>
      {children}
    </p>
  );
}

/* ---------- Toast with Undo (4 s) ---------- */

type ToastMsg = { id: number; msg: string; undo?: () => void };
let push: ((t: ToastMsg) => void) | null = null;
let seq = 0;

export function toast(msg: string, undo?: () => void) {
  push?.({ id: ++seq, msg, undo });
}

export function ToastHost() {
  const [t, setT] = useState<ToastMsg | null>(null);
  useEffect(() => {
    push = setT;
    return () => {
      push = null;
    };
  }, []);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 4000);
    return () => clearTimeout(id);
  }, [t]);
  if (!t) return null;
  return (
    <div className="toast" role="status" key={t.id}>
      <span className="grow">{t.msg}</span>
      {t.undo && (
        <button
          className="link"
          style={{ color: "var(--lime)", padding: 10, margin: "-10px 0" }}
          onClick={() => {
            setT(null);
            t.undo?.();
          }}
        >
          Undo
        </button>
      )}
    </div>
  );
}
