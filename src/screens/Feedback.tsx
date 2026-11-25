import { useEffect, useRef, useState } from "react";
import { SPEECH_DOODLE } from "../brand/assets";
import { BrandSvg, Icon } from "../components/Icon";
import { ChoiceChips, Navbar } from "../components/ui";
import { useLang, useT } from "../i18n";
import { sendFeedback, validEmail, type SendResult, type Topic } from "../state/feedback";
import { backTo } from "../state/router";

const MAX = 2000;
// Kept for the session, so leaving the screen by accident does not lose what was typed
let draft = { topic: null as Topic | null, message: "", email: "" };

/**
 * F7 · Send feedback (requested, Nov 2026; not in the prototype or Figma).
 * Topic chips, a message, an optional email for a reply, an honest note on what is sent, then Send.
 * Sending only happens on tap; failures keep the text so nothing is lost.
 */
export function Feedback() {
  const t = useT();
  const lang = useLang();
  const [topic, setTopic] = useState<Topic | null>(draft.topic);
  const [message, setMessage] = useState(draft.message);
  const [email, setEmail] = useState(draft.email);
  const [state, setState] = useState<"edit" | "sending" | "sent">("edit");
  const [error, setError] = useState<Exclude<SendResult, "sent"> | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const live = useRef(true);

  useEffect(() => {
    draft = { topic, message, email };
  }, [topic, message, email]);
  useEffect(() => () => void (live.current = false), []);

  const emailOk = validEmail(email);
  const ready = message.trim().length >= 3 && emailOk && state === "edit";

  const send = async () => {
    if (!ready) return;
    setError(null);
    setState("sending");
    const res = await sendFeedback({ topic: topic ?? "other", message, email, lang });
    if (!live.current) return;
    if (res === "sent") {
      draft = { topic: null, message: "", email: "" };
      setState("sent");
    } else {
      setError(res);
      setState("edit");
    }
  };

  if (state === "sent")
    return (
      <div className="stack">
        <Navbar title={t("fb.title")} />
        <div className="section rise" style={{ alignItems: "center", textAlign: "center", gap: 12, paddingTop: 24 }}>
          <BrandSvg svg={SPEECH_DOODLE} style={{ width: 96, height: 96 }} />
          <h2 className="h2">{t("fb.thanksTitle")}</h2>
          <p className="body">{t("fb.thanksBody")}</p>
        </div>
        <button className="btn btn-primary" onClick={() => backTo("plan")}>
          {t("health.back")}
        </button>
        <button
          className="link"
          style={{ alignSelf: "center" }}
          onClick={() => {
            setTopic(null);
            setMessage("");
            setEmail("");
            setEmailTouched(false);
            setState("edit");
          }}
        >
          {t("fb.another")}
        </button>
      </div>
    );

  return (
    <div className="stack">
      <Navbar title={t("fb.title")} />
      <div className="section" style={{ gap: 6 }}>
        <h2 className="h2">{t("fb.heading")}</h2>
        <p className="body">{t("fb.lede")}</p>
      </div>

      <div className="section" style={{ gap: 10 }}>
        <div className="over">{t("fb.topic")}</div>
        <ChoiceChips<Topic>
          label={t("fb.topic")}
          value={topic}
          onChange={setTopic}
          options={[
            ["idea", t("fb.idea")],
            ["problem", t("fb.problem")],
            ["confusing", t("fb.confusing")],
            ["other", t("fb.other")],
          ]}
        />
      </div>

      <label className="section" style={{ gap: 8 }}>
        <span className="over">{t("fb.message")}</span>
        <span className="field area">
          <textarea value={message} maxLength={MAX} rows={5} placeholder={t("fb.placeholder")} onChange={(e) => setMessage(e.target.value)} />
        </span>
        <span className="cap" style={{ alignSelf: "flex-end" }} aria-live="polite">
          {message.length} / {MAX}
        </span>
      </label>

      <label className="section" style={{ gap: 8 }}>
        <span className="over">{t("fb.email")}</span>
        <span className={`field text${emailTouched && !emailOk ? " bad" : ""}`}>
          <input type="email" inputMode="email" autoComplete="email" value={email} placeholder={t("fb.emailPh")} maxLength={120} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} />
        </span>
        <span className="cap" style={emailTouched && !emailOk ? { color: "var(--amber)" } : undefined}>
          {emailTouched && !emailOk ? t("fb.emailBad") : t("fb.emailHelp")}
        </span>
      </label>

      <div className="disclaimer">
        <span style={{ color: "var(--ink-400)", flex: "none", display: "flex" }}>
          <Icon name="shield" />
        </span>
        <p className="cap" style={{ color: "var(--ink-300)" }}>
          {t("fb.privacy")}
        </p>
      </div>

      {error && (
        <div className="note-amber rise-fast" role="alert">
          <div className="lbl amber">{t(error === "offline" ? "fb.errOfflineTitle" : "fb.errTitle")}</div>
          <p className="cap" style={{ color: "var(--ink-300)" }}>
            {t(error === "offline" ? "fb.errOffline" : error === "notSetUp" ? "fb.errNotSetUp" : "fb.errFailed")}
          </p>
        </div>
      )}

      <button className={`btn btn-primary${state === "sending" ? " loading" : ""}`} disabled={!ready && state !== "sending"} onClick={send} aria-busy={state === "sending"}>
        {state === "sending" ? (
          <>
            <Icon name="loader" className="svg-i spin" />
            {t("fb.sending")}
          </>
        ) : (
          t("fb.send")
        )}
      </button>
    </div>
  );
}
