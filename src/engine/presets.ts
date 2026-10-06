import type { Bucket, Commitment, IconName } from "./types";

type Preset = { icon: IconName; name: string; cat: string; debt: boolean; ex: number; bucket: Bucket };

/** Default rows, and the "Fill with an example" amounts. */
export const PRESETS: Preset[] = [
  { icon: "home", name: "Room rent", cat: "Housing", debt: false, ex: 650, bucket: "needs" },
  { icon: "grad", name: "PTPTN", cat: "Education", debt: true, ex: 150, bucket: "needs" },
  { icon: "bus", name: "LRT & e-hailing", cat: "Transport", debt: false, ex: 150, bucket: "needs" },
  { icon: "heart", name: "Parents", cat: "Family", debt: false, ex: 200, bucket: "needs" },
  { icon: "shield", name: "Takaful", cat: "Insurance", debt: false, ex: 80, bucket: "needs" },
  { icon: "phone", name: "Phone & internet", cat: "Bills", debt: false, ex: 80, bucket: "needs" },
  { icon: "zap", name: "Utilities share", cat: "Bills", debt: false, ex: 60, bucket: "needs" },
  { icon: "tv", name: "Streaming & apps", cat: "Lifestyle", debt: false, ex: 40, bucket: "wants" },
  { icon: "shield", name: "ASB", cat: "Investment", debt: false, ex: 100, bucket: "savings" },
];

type Quick = { icon: IconName; name: string; cat: string; debt: boolean };

export const QUICK: Record<Bucket, Quick[]> = {
  needs: [
    { icon: "car", name: "Car loan", cat: "Loan", debt: true },
    { icon: "home", name: "Home loan", cat: "Loan", debt: true },
    { icon: "card", name: "Credit card", cat: "Loan", debt: true },
    { icon: "card", name: "BNPL", cat: "Loan", debt: true },
    { icon: "heart", name: "Zakat", cat: "Giving", debt: false },
  ],
  wants: [
    { icon: "zap", name: "Gym", cat: "Health", debt: false },
    { icon: "tv", name: "Subscription", cat: "Lifestyle", debt: false },
  ],
  savings: [
    { icon: "heart", name: "Tabung Haji", cat: "Savings", debt: false },
    { icon: "shield", name: "Emergency fund", cat: "Savings", debt: false },
    { icon: "card", name: "Extra EPF", cat: "Savings", debt: false },
  ],
};

export type BucketDef = { key: Bucket; label: string; color: string; share: number; hint: string };

export const BUCKETS: BucketDef[] = [
  { key: "needs", label: "Needs", color: "var(--color-ink-400)", share: 0.5, hint: "Rent, transport, bills, loans, family" },
  { key: "wants", label: "Wants", color: "var(--color-amber-400)", share: 0.3, hint: "Subscriptions, gym, hobbies" },
  { key: "savings", label: "Savings", color: "var(--color-lime-300)", share: 0.2, hint: "ASB, Tabung Haji, emergency fund" },
];

export const freshCommitments = (): Commitment[] =>
  PRESETS.map((p, i) => ({ id: "c" + i, ...p, amt: 0 }));

/** The example set used by "Fill with an example" (amounts filled in). */
export const exampleCommitments = (): Commitment[] =>
  PRESETS.map((p, i) => ({ id: "c" + i, ...p, amt: p.ex }));

let n = 0;
/** Unique row id, safe for rows added in the same millisecond. */
export const uid = () =>
  "c" + (globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + "-" + (n++).toString(36));
