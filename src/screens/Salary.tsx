import { useEffect, useRef, useState } from "react";
import { NOTE_ARROW } from "../brand/assets";
import { BrandSvg, Icon } from "../components/Icon";
import { RollingNumber, useSettled } from "../components/RollingNumber";
import { Segmented, usePop } from "../components/ui";
import { calc, fmt, fmt2, type SalaryMode } from "../engine";
import { noteFor, useLang, useT, type MsgKey } from "../i18n";
import { back, go, useRouter } from "../state/router";
import { setState, useApp } from "../state/store";

const PAYDAYS: [string, MsgKey][] = [
  ["1", "salary.pd1"],
  ["7", "salary.pd7"],
  ["15", "salary.pd15"],
  ["25", "salary.pd25"],
  ["last", "salary.pdLast"],
];
const PRESET_DAYS = PAYDAYS.map(([v]) => v);
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** F1 · Salary (required, no skip) */
export function Salary() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const { stack } = useRouter();
  const c = calc(S);
  const has = !!S.raw;
  const inp = useRef<HTMLInputElement>(null);
  const pop = usePop<string>();
  // "Try RM 3,500" rolls every digit in; typing only rolls new digits
  const [sampleKey, setSampleKey] = useState(0);
  // While typing: "Crunching the numbers..." then take-home rolls changed digits 30 ms apart after 450 ms
  const settledRaw = useSettled(S.raw, 450);
  const crunching = settledRaw !== S.raw;
  const settledNet = calc({ ...S, raw: settledRaw }).net;
  // Submit: loading button + handwritten note, then the plan
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!S.raw) {
      const id = setTimeout(() => inp.current?.focus({ preventScroll: true }), 300);
      return () => clearTimeout(id);
    }
  }, []);

  const shown = S.raw ? fmt(+S.raw) : "";
  const other = S.payday && !PRESET_DAYS.includes(S.payday);
  const ready = has && !!S.payday;

  const submit = () => {
    if (note) return;
    setNote(noteFor(c.net, lang));
    setTimeout(() => go("plan", "reset"), reduced() ? 500 : 1300);
  };

  return (
    <div className="stack" style={{ minHeight: "100%" }}>
      <div className="section" style={{ gap: 10 }}>
        <div className="row between">
          <div className="over">{t("salary.over")}</div>
          {stack.length > 1 && (
            <button className="link" onClick={back} style={{ color: "var(--ink-400)" }}>
              {t("common.cancel")}
            </button>
          )}
        </div>
        <h1 className="h1">{t("salary.title")}</h1>
        <p className="body">{t("salary.body")}</p>
      </div>

      <Segmented<SalaryMode>
        label={t("salary.type")}
        value={S.mode}
        options={[
          ["gross", t("salary.gross")],
          ["net", t("salary.net")],
        ]}
        onChange={(mode) => setState({ mode })}
      />

      <div className="section" style={{ gap: 8 }}>
        <label className="lbl soft" htmlFor="sal">
          {t(S.mode === "gross" ? "salary.grossLabel" : "salary.netLabel")}
        </label>
        <div className="field">
          <span className="cur">RM</span>
          <div className="val">
            <RollingNumber key={sampleKey} value={shown} anchor="start" animateOnMount={sampleKey > 0} />
            <input
              ref={inp}
              id="sal"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              aria-describedby="salHelp"
              value={shown}
              onChange={(e) => setState({ raw: e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 7) })}
            />
          </div>
        </div>
        <div className="row" id="salHelp" style={{ flexWrap: "wrap" }}>
          {!has && (
            <>
              <span className="cap">{t("salary.notSure")}</span>
              <button
                className="chip"
                onClick={() => {
                  setState({ raw: "3500" });
                  setSampleKey((n) => n + 1);
                }}
              >
                {t("salary.try")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="section" style={{ gap: 10 }}>
        <div className="row between">
          <span className="lbl soft" id="paydayLbl">
            {t("salary.when")}
          </span>
          <span className="cap">{t("salary.dom")}</span>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }} role="group" aria-labelledby="paydayLbl">
          {PAYDAYS.map(([v, l]) => (
            <button
              key={pop.key(v)}
              className={`chip${S.payday === v ? " on" : ""}${pop.cls(v)}`}
              aria-pressed={S.payday === v}
              onClick={() => {
                pop.pop(v);
                setState({ payday: v });
              }}
              style={{ minHeight: 40, padding: "0 14px", fontSize: 13, ...(S.payday === v ? {} : { color: "var(--ink-300)" }) }}
            >
              {t(l)}
            </button>
          ))}
          <label key={pop.key("other")} className={`chip${other ? " on" : ""}${pop.cls("other")}`} style={{ minHeight: 40, padding: "0 6px 0 14px", fontSize: 13, ...(other ? {} : { color: "var(--ink-300)" }) }}>
            {t("common.other")}
            <select
              aria-label={t("salary.otherPayday")}
              value={other ? (S.payday ?? "") : ""}
              onChange={(e) => {
                if (!e.target.value) return;
                pop.pop("other");
                setState({ payday: e.target.value });
              }}
              style={{ background: "transparent", border: 0, color: "inherit", font: "inherit", padding: "8px 4px", outline: 0 }}
            >
              <option value="">{t("salary.dayPlaceholder")}</option>
              {Array.from({ length: 31 }, (_, i) => i + 1)
                .filter((d) => ![1, 7, 15, 25].includes(d))
                .map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="cap">{t("salary.cycleNote")}</p>
      </div>

      {S.mode === "gross" && (
        <div className="section" style={{ gap: 10 }}>
          <div className="row between">
            <h2 className="over">{t("salary.deductions")}</h2>
            <span className="cap">{t("salary.rates")}</span>
          </div>
          <div className="card" style={{ gap: 12 }}>
            {(
              [
                ["salary.epf", "11%", c.epf],
                ["salary.socso", "", c.socso],
                ["salary.eis", "", c.eis],
                ["salary.pcb", t("common.est"), c.pcb],
              ] as const
            ).map(([n, tag, v]) => (
              <div key={n} className="row">
                <span className="lbl" style={{ color: "var(--ink-300)" }}>
                  {t(n)}
                </span>
                {tag && (
                  <span className="pill" style={{ background: "var(--ink-700)", color: "var(--ink-400)" }}>
                    {tag}
                  </span>
                )}
                <span className="grow" />
                <span className="mono cap" style={{ color: "var(--ink-400)", fontSize: 13 }}>
                  − RM {fmt2(v)}
                </span>
              </div>
            ))}
            <div className="hr" />
            <div className="row">
              <div className="grow">
                <div className="lbl" style={{ fontSize: 15 }}>
                  {t("salary.yourTakeHome")}
                </div>
                <div className="cap">{t(crunching ? "salary.crunchingNumbers" : "salary.updates")}</div>
              </div>
              <div className="mono lime" style={{ fontSize: 20, fontWeight: 500 }} aria-live="polite">
                RM&nbsp;
                <RollingNumber value={fmt(settledNet)} anchor="end" stagger={30} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grow" />
      <div className="sticky">
        <div className="cta-wrap">
          {note && (
            <div className="note" aria-live="polite">
              <BrandSvg svg={NOTE_ARROW} />
              <span>{note}</span>
            </div>
          )}
          <button className={`btn btn-primary${note ? " loading" : ""}`} disabled={!ready} onClick={submit} aria-busy={!!note}>
            {note ? (
              <>
                <Icon name="loader" className="svg-i spin" />
                <span>{t("salary.ctaLoading")}</span>
              </>
            ) : (
              t(has && !S.payday ? "salary.ctaPickPayday" : "salary.cta")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
