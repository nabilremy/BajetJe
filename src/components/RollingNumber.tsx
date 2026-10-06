import { useEffect, useRef, useState } from "react";

/* Animates only the characters that are new or changed.
   anchor="start": typing (new digits appear on the right)
   anchor="end":   computed totals (units place stays stable) */

type Anchor = "start" | "end";

const isDigit = (c: string) => c >= "0" && c <= "9";

/** Give each character a stable slot. Digits are counted from the stable
 *  side and commas are ignored, so "350" -> "3,500" keeps 3, 5, 0 in place. */
function toSlots(text: string, anchor: Anchor) {
  const chars = [...text];
  const total = chars.filter(isDigit).length;
  let seen = 0;
  return chars.map((ch) => {
    const d = isDigit(ch);
    if (d) seen++;
    const pos = anchor === "start" ? seen : total - seen + (d ? 1 : 0);
    return { ch, slot: `${d ? "d" : "s"}${pos}` };
  });
}

export function RollingNumber({
  value,
  anchor = "start",
  stagger = 0,
  animateOnMount = false,
  className = "",
}: {
  value: string;
  anchor?: Anchor;
  /** ms between changed digits */
  stagger?: number;
  /** roll every digit in on first paint (e.g. the health % hero) */
  animateOnMount?: boolean;
  className?: string;
}) {
  // null = first paint, nothing animates
  const prev = useRef<Map<string, string> | null>(animateOnMount ? new Map() : null);
  const slots = toSlots(value, anchor);

  useEffect(() => {
    prev.current = new Map(slots.map((s) => [s.slot, s.ch]));
  });

  let order = 0;
  return (
    <span className={`roll ${className}`} role="text" aria-label={value}>
      {slots.map(({ ch, slot }) => {
        const isNew = prev.current !== null && prev.current.get(slot) !== ch;
        const delay = isNew && stagger ? order++ * stagger : 0;
        return (
          <span key={`${slot}:${ch}`} aria-hidden="true" className={isNew ? "in" : undefined} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
            {ch === " " ? "\u00a0" : ch}
          </span>
        );
      })}
    </span>
  );
}

/** Waits for a typing pause before passing the value on. */
export function useSettled<T>(value: T, ms = 200) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}
