import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { WELCOME_DOODLE } from "../brand/assets";
import { BrandSvg, Icon, Mark, Wordmark } from "../components/Icon";
import { LangSwitch } from "../components/ui";
import { useLang, useT } from "../i18n";
import { go } from "../state/router";
import { getState, setState } from "../state/store";

/**
 * F0b Welcome (first launch only, see docs/WELCOME_TASK.md).
 * Blocks rise in once; on EN | BM change the top bar stays still and the rest fades up in the new language.
 */
export function Welcome() {
  const t = useT();
  const lang = useLang();
  const [revealing, setRevealing] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const firstLang = useRef(true);

  useEffect(() => {
    const id = setTimeout(() => setRevealing(false), 1400);
    return () => clearTimeout(id);
  }, []);

  // Language changed: restart the fade-up on everything except the top bar
  useLayoutEffect(() => {
    if (firstLang.current) {
      firstLang.current = false;
      return;
    }
    setRevealing(false);
    setSwapping(false);
    const raf = requestAnimationFrame(() => setSwapping(true));
    const id = setTimeout(() => setSwapping(false), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [lang]);

  const start = () => {
    setState({ welcomed: true });
    // Replace the stack so Back never returns here; returning users with a plan go straight to it
    const s = getState();
    go(s.raw && s.payday ? "plan" : "salary", "reset");
  };

  const r = (i: number, extra?: CSSProperties) => ({ "data-r": "", style: { "--i": i, ...extra } as CSSProperties });

  return (
    <div className={`stack welcome${revealing ? " reveal" : ""}${swapping ? " lang-swap" : ""}`} style={{ minHeight: "100%" }}>
      <div className="row keep" {...r(0, { gap: 8 })}>
        <Mark id="sk-welcome" size={34} />
        <Wordmark />
        <span className="grow" />
        <LangSwitch />
      </div>
      <div className="doodle" {...r(1)}>
        <BrandSvg svg={WELCOME_DOODLE} className="doodle-svg" label={t("welcome.doodleAlt")} />
      </div>
      <div className="section" {...r(2, { gap: 8 })}>
        <h1 className="welcome-title">{t("welcome.title")}</h1>
        <p className="welcome-lede">{t("welcome.body")}</p>
      </div>
      <div className="disclaimer" {...r(3)}>
        <span className="disclaimer-icon">
          <Icon name="info" />
        </span>
        <div>
          <div className="disclaimer-title">{t("welcome.disclaimerTitle")}</div>
          <p className="cap" style={{ color: "var(--ink-400)", marginTop: 4 }}>
            {t("welcome.disclaimerBody")}
          </p>
        </div>
      </div>
      <div className="grow" />
      <div className="welcome-cta" {...r(4)}>
        <button className="btn btn-primary" onClick={start}>
          {t("welcome.start")}
        </button>
        <div className="row cap" style={{ justifyContent: "center", gap: 6 }}>
          <Icon name="shield" className="svg-i ic-sm" />
          <span>{t("common.privacy")}</span>
        </div>
      </div>
    </div>
  );
}
