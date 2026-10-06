export type Bucket = "needs" | "wants" | "savings";
export type SalaryMode = "gross" | "net";
/** "1" to "31" or "last" */
export type Payday = string;

export type IconName =
  | "home" | "grad" | "bus" | "heart" | "shield" | "phone" | "zap" | "tv" | "car" | "card"
  | "back" | "arrow" | "plus" | "vbars" | "vjars" | "vledger" | "trash" | "info" | "x" | "pen";

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
