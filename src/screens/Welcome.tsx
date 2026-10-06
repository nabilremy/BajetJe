import { useEffect, useState, type CSSProperties } from "react";
import { WELCOME_DOODLE } from "../brand/assets";
import { BrandSvg, Icon, Mark, Wordmark } from "../components/Icon";
import { LangSwitch } from "../components/ui";
import { useT } from "../i18n";
import { go } from "../state/router";
import { setState } from "../state/store";

/** F0b Welcome (first launch): doodle, value line, disclaimer, start. */
export function Welcome() {
  const t = useT();
  const [revealing, setRevealing] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setRevealing(false), 1400);
    return () => clearTimeout(id);
  }, []);
  const r = (i: number, extra?: CSSProperties) => ({ "data-r": "", style: { "--i": i, ...extra } as CSSProperties });

  return (
    <div className={`stack welcome${revealing ? " reveal" : ""}`} style={{ minHeight: "100%" }}>
      <div className="row" {...r(0, { gap: 8 })}>
        <Mark id="sk-welcome" size={34} />
        <Wordmark />
        <span className="grow" />
        <LangSwitch />
      </div>
      <div className="doodle" {...r(1)}>
        <BrandSvg svg={WELCOME_DOODLE} className="doodle-svg" label={t("welcome.doodleAlt")} />
      </div>
      <div className="section" {...r(2, { gap: 8 })}>
        <h1 className="h1">{t("welcome.title")}</h1>
        <p className="body">{t("welcome.body")}</p>
      </div>
      <div className="disclaimer" {...r(3)}>
        <span style={{ color: "var(--amber)", flex: "none", marginTop: 1 }}>
          <Icon name="info" />
        </span>
        <div>
          <div className="lbl">{t("welcome.disclaimerTitle")}</div>
          <p className="cap" style={{ color: "var(--ink-400)", marginTop: 4 }}>
            {t("welcome.disclaimerBody")}
          </p>
        </div>
      </div>
      <div className="grow" />
      <div className="sticky" {...r(4)}>
        <button
          className="btn btn-primary"
          onClick={() => {
            setState({ welcomed: true });
            go("salary", "reset");
          }}
        >
          {t("welcome.start")}
        </button>
        <div className="row cap" style={{ justifyContent: "center", gap: 6 }}>
          <Icon name="shield" />
          <span>{t("common.privacy")}</span>
        </div>
      </div>
    </div>
  );
}
