import { useEffect, useState } from "react";
import { Icon, Mark } from "../components/Icon";
import { useT } from "../i18n";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** F0 Splash: every launch, 1.6 s (0.8 s reduced motion), tap to skip. Sketch B lines appear, hatching colours in. */
export function Splash() {
  const t = useT();
  const [state, setState] = useState<"in" | "out" | "gone">("in");

  useEffect(() => {
    const id = setTimeout(() => setState((s) => (s === "in" ? "out" : s)), reduced() ? 800 : 1600);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (state !== "out") return;
    const id = setTimeout(() => setState("gone"), 320);
    return () => clearTimeout(id);
  }, [state]);

  if (state === "gone") return null;
  return (
    <div className={`splash${state === "out" ? " out" : ""}`} role="img" aria-label="BajetJe" onClick={() => setState("out")}>
      <Mark id="sk-splash" wipe className="mark" />
      <div className="sp-word">
        Bajet<b>Je</b>
      </div>
      <div className="sp-tag">{t("common.tagline")}</div>
      <div className="sp-priv">
        <Icon name="shield" />
        {t("common.privacy")}
      </div>
    </div>
  );
}
