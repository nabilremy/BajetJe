/**
 * In-app feedback. The one thing BajetJe sends off the phone, and only when the person taps Send:
 * their message, the topic, an optional reply email, the app version and the language. Never salary, plan or commitments.
 * Web3Forms forwards it to the BajetJe inbox; the access key decides which inbox, so no address lives in the app.
 */
export type Topic = "idea" | "problem" | "confusing" | "other";
export type FeedbackInput = { topic: Topic; message: string; email: string; lang: "en" | "ms" };
export type SendResult = "sent" | "offline" | "failed" | "notSetUp";

const ENDPOINT = "https://api.web3forms.com/submit";
const TOPIC_EN: Record<Topic, string> = { idea: "Idea", problem: "Something's wrong", confusing: "Confusing", other: "Other" };

export const feedbackReady = () => !!import.meta.env.VITE_FEEDBACK_KEY;
export const validEmail = (e: string) => !e.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** The exact fields sent, so the privacy note can stay honest */
export function payload(f: FeedbackInput) {
  const email = f.email.trim();
  return {
    access_key: import.meta.env.VITE_FEEDBACK_KEY ?? "",
    subject: `BajetJe feedback: ${TOPIC_EN[f.topic]}`,
    from_name: "BajetJe app",
    topic: TOPIC_EN[f.topic],
    message: f.message.trim(),
    // Web3Forms uses `email` as the reply-to address
    ...(email ? { email } : {}),
    app_version: __APP_VERSION__,
    language: f.lang === "ms" ? "BM" : "EN",
  };
}

export async function sendFeedback(f: FeedbackInput): Promise<SendResult> {
  if (!feedbackReady()) return "notSetUp";
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload(f)),
      signal: ctrl.signal,
    });
    const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return res.ok && body?.success ? "sent" : "failed";
  } catch {
    // No connection, a timeout, or the request was blocked
    return navigator.onLine === false ? "offline" : "failed";
  } finally {
    clearTimeout(timer);
  }
}
