import { ELIG_DISCLAIMER, eligibility, fmt, type Elig } from "../engine";
import { getState, setState, useApp } from "../state/store";
import { StatusPill } from "./ui";

/** First-home full-loan check: Pending / Eligible / Not eligible. */
export function EligibilityCheck() {
  const S = useApp();
  const e = S.elig;
  const r = eligibility(e, S.mode, S.raw);

  const answer = (key: keyof Elig, v: boolean) => {
    const elig = { ...getState().elig, [key]: v };
    const res = eligibility(elig, S.mode, S.raw);
    const hd = getState().homeDown;
    setState({ elig, homeDown: res.state === "yes" ? 0 : hd === 0 ? 0.1 : hd });
  };

  const q = (key: keyof Elig, label: string) => (
    <div className="row" style={{ gap: 8 }} role="group" aria-label={label}>
      <span className="lbl grow" style={{ color: "var(--ink-300)" }}>
        {label}
      </span>
      {(
        [
          [true, "Yes"],
          [false, "No"],
        ] as const
      ).map(([v, l]) => (
        <button key={l} className={`chip${e[key] === v ? " on" : ""}`} aria-pressed={e[key] === v} onClick={() => answer(key, v)} style={{ minHeight: 36, ...(e[key] === v ? {} : { background: "var(--ink-700)" }) }}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ background: "var(--ink-900)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row between">
        <div className="lbl">Can you get a full loan?</div>
        <button className="link" onClick={() => setState({ eligOpen: false })} style={{ color: "var(--ink-400)" }}>
          Close
        </button>
      </div>
      {q("first", "Is this your first home?")}
      {q("citizen", "Malaysian citizen?")}
      {q("age", "Aged 40 or below?")}
      <p className="cap">
        Income is taken from your salary (RM {fmt(+S.raw || 0)}
        {S.mode === "gross" ? " gross" : " take-home"}).
      </p>
      <div aria-live="polite">
        {r.state === "pending" ? (
          <p className="cap">Answer all 3 to see if a full loan is possible.</p>
        ) : r.state === "yes" ? (
          <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
            <StatusPill tone="lime">Likely eligible</StatusPill>
            <span className="cap" style={{ color: "var(--ink-300)" }}>
              {r.schemes.join(" or ")}. {r.note}
            </span>
          </div>
        ) : (
          <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
            <StatusPill tone="coral">Not eligible</StatusPill>
            <span className="cap" style={{ color: "var(--ink-300)" }}>
              {r.why} Showing 10% down instead.
            </span>
          </div>
        )}
      </div>
      <p className="cap" style={{ fontSize: 11 }}>
        {ELIG_DISCLAIMER}
      </p>
    </div>
  );
}
