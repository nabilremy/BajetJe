import { eligibility, fmt, type Elig } from "../engine";
import { useT, type MsgKey } from "../i18n";
import { getState, setState, useApp } from "../state/store";
import { usePop, StatusPill } from "./ui";

/** Engine reasons are English (golden-tested); map them to message keys. */
const WHY: Record<string, MsgKey> = {
  "100% financing is only for your first home.": "elig.notFirst",
  "First-home schemes are for Malaysian citizens only.": "elig.notCitizen",
  "Your income is above the RM 11,000 limit for SJKP.": "elig.income",
};

/** First-home full-loan check: Pending / Eligible / Not eligible. */
export function EligibilityCheck() {
  const S = useApp();
  const t = useT();
  const pop = usePop<string>();
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
          [true, t("common.yes")],
          [false, t("common.no")],
        ] as const
      ).map(([v, l]) => (
        <button
          key={pop.key(key + v)}
          className={`chip${e[key] === v ? " on" : ""}${pop.cls(key + v)}`}
          aria-pressed={e[key] === v}
          onClick={() => {
            pop.pop(key + v);
            answer(key, v);
          }}
          style={{ minHeight: 36, ...(e[key] === v ? {} : { background: "var(--ink-700)" }) }}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ background: "var(--ink-900)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row between">
        <div className="lbl">{t("elig.title")}</div>
        <button className="link" onClick={() => setState({ eligOpen: false })} style={{ color: "var(--ink-400)" }}>
          {t("common.close")}
        </button>
      </div>
      {q("first", t("elig.first"))}
      {q("citizen", t("elig.citizen"))}
      {q("age", t("elig.age"))}
      <p className="cap">{t(S.mode === "gross" ? "elig.incomeGross" : "elig.incomeNet", { v: fmt(+S.raw || 0) })}</p>
      <div aria-live="polite">
        {r.state === "pending" ? (
          <p className="cap">{t("elig.pending")}</p>
        ) : r.state === "yes" ? (
          <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
            <StatusPill tone="lime">{t("elig.likely")}</StatusPill>
            <span className="cap" style={{ color: "var(--ink-300)" }}>
              {r.schemes.join(t("elig.or"))}. {r.note ? t("elig.netNote") : ""}
            </span>
          </div>
        ) : (
          <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
            <StatusPill tone="coral">{t("elig.not")}</StatusPill>
            <span className="cap" style={{ color: "var(--ink-300)" }}>
              {WHY[r.why] ? t(WHY[r.why]) : r.why}
            </span>
          </div>
        )}
      </div>
      <p className="cap" style={{ fontSize: 11 }}>
        {t("elig.disclaimer")}
      </p>
    </div>
  );
}
