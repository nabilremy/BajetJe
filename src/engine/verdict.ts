export type Tone = "lime" | "amber" | "coral";
export type HealthVerdict = "Healthy" | "Caution" | "High";

/** <= a Healthy, <= b Caution, above High. Warn, never block. */
export const verdict = (pct: number, a: number, b: number): [HealthVerdict, Tone] =>
  pct <= a ? ["Healthy", "lime"] : pct <= b ? ["Caution", "amber"] : ["High", "coral"];
