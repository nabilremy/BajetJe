export const fmt = (n: number) => Math.round(n).toLocaleString("en-MY");
export const fmt2 = (n: number) =>
  n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** 28,752 -> "29k" */
export const k = (n: number) => (n >= 1000 ? Math.round(n / 1000) + "k" : fmt(n));
export const pct = (n: number) => Math.round(n) + "%";
export const fmtD = (d: Date) => d.getDate() + " " + d.toLocaleString("en-MY", { month: "short" });
