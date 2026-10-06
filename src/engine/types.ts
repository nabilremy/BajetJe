export type Bucket = "needs" | "wants" | "savings";
export type SalaryMode = "gross" | "net";
/** "1" to "31" or "last" */
export type Payday = string;

/** Doodle icon set (brand/icons) */
export type IconName =
  | "back" | "bus" | "car" | "card" | "check" | "grad" | "heart" | "home" | "info" | "loader" | "pen"
  | "phone" | "plus" | "shield" | "sparkle" | "trash" | "tv" | "vbars" | "vjars" | "vledger" | "x" | "zap";

export type Commitment = {
  id: string;
  icon: IconName;
  name: string;
  cat: string;
  debt: boolean;
  bucket: Bucket;
  amt: number;
  custom?: boolean;
  ex?: number;
};

export type Elig = { first: boolean | null; citizen: boolean | null; age: boolean | null };
