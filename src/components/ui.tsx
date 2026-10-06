import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Tone } from "../engine";
import { useT } from "../i18n";
import { setState, useApp } from "../state/store";
import { back } from "../state/router";
import { Icon } from "./Icon";

export const toneVar = (t: Tone) => `var(--${t})`;

export function Navbar({ title, right }: { title: string; right?: ReactNode }) {
  const t = useT();
  return (
    <div className="row" style={{ gap: 12 }}>
      <button className="iconbtn" onClick={back} aria-label={t("common.back")}>
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

/** Segmented control: the thumb slides from the old option (260 ms). */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  const i = Math.max(0, options.findIndex(([v]) => v === value));
  return (
    <div className="seg" role="group" aria-label={label} style={{ "--i": i } as CSSProperties}>
      {options.map(([v, l]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

/** Pops the chip the user just picked (spring 340 ms). Re-keys it so the animation restarts. */
export function usePop<T>() {
  const [just, setJust] = useState<{ v: T; n: number } | null>(null);
  return {
    pop: (v: T) => setJust((j) => ({ v, n: (j?.n ?? 0) + 1 })),
    cls: (v: T) => (just && just.v === v ? " just" : ""),
    key: (v: T) => `${String(v)}${just && just.v === v ? ":" + just.n : ""}`,
  };
}

/** Choice chips (payday, down payment). Selected = ink-50 fill; the new pick pops. */
export function ChoiceChips<T extends string | number>({ value, options, onChange, label, style, selectedStyle }: { value: T | null; options: [T, string][]; onChange: (v: T) => void; label: string; style?: CSSProperties; selectedStyle?: CSSProperties }) {
  const p = usePop<T>();
  return (
    <div className="row" style={{ gap: 6, flexWrap: "wrap" }} role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={p.key(v)}
          className={`chip${value === v && !selectedStyle ? " on" : ""}${p.cls(v)}`}
          aria-pressed={value === v}
          onClick={() => {
            p.pop(v);
            onChange(v);
          }}
          style={{ minHeight: 36, ...style, ...(value === v ? selectedStyle : {}) }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** EN | BM switch, remembered on device. Thumb slides. */
export function LangSwitch() {
  const { lang } = useApp();
  const t = useT();
  const pick = (l: "en" | "ms") => {
    if (l === lang) return;
    document.documentElement.lang = l;
    setState({ lang: l });
  };
  return (
    <div className="lang" role="group" aria-label={t("common.language")} style={{ "--i": lang === "ms" ? 1 : 0 } as CSSProperties}>
      <button aria-pressed={lang !== "ms"} onClick={() => pick("en")} lang="en">
        EN
      </button>
      <button aria-pressed={lang === "ms"} onClick={() => pick("ms")} lang="ms">
        BM
      </button>
    </div>
  );
}

/** On/off switch; the knob springs. */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="tgl" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ "--i": on ? 1 : 0 } as CSSProperties}>
      <i />
    </button>
  );
}

/** Reaction chip with a doodle sparkle: pops in once. Never on legal or loan copy. */
export function Reaction({ children, ...rest }: { children: ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="react" {...rest}>
      <Icon name="sparkle" />
      <span>{children}</span>
    </span>
  );
}

/** Zoned gauge (Healthy / Caution / High) with a marker that can sweep in. */
export function Gauge({ p, stops, max, sweep }: { p: number; stops: [number, number]; max: number; sweep?: boolean }) {
  const t = useT();
  const [a, b] = stops;
  const W = (x: number) => (x / max) * 100;
  return (
    <>
      <div style={{ position: "relative", padding: "5px 0" }} role="img" aria-label={t("gauge.aria", { pct: Math.round(p), a, b })}>
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
        <span className="lime">{t("gauge.healthy", { a })}</span>
        <span className="amber">{t("gauge.caution", { a, b })}</span>
        <span className="coral">{t("gauge.high", { b })}</span>
      </div>
    </>
  );
}

/** Now / After comparison bars. Rows: [key, percent, colour, label] */
export function ImpactBars({ title, rows }: { title: string; rows: [string, number, string, string][] }) {
  return (
    <div className="section" style={{ gap: 8 }}>
      <div className="lbl">{title}</div>
      {rows.map(([n, v, col, label]) => (
        <div key={n} className="row" style={{ gap: 10 }}>
          <div className="track grow">
            <i style={{ width: `${Math.max(0, Math.min(v, 100))}%`, background: col }} />
          </div>
          <span className="mono cap" style={{ minWidth: 96, textAlign: "right", color: "var(--ink-50)", whiteSpace: "nowrap" }}>
            {label}
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
  const tr = useT();
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
          {tr("common.undo")}
        </button>
      )}
    </div>
  );
}
