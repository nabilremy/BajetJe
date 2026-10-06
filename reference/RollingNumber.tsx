"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

/* ------------------------------------------------------------------ */
/* RollingNumber                                                       */
/* Animates only the characters that are new or changed.              */
/* anchor="start": typing (new digits appear on the right)            */
/* anchor="end":   computed totals (units place stays stable)         */
/* ------------------------------------------------------------------ */

type Anchor = "start" | "end";

type RollingNumberProps = {
  value: string; // already formatted, e.g. "3,500"
  anchor?: Anchor;
  stagger?: number; // ms between changed digits
  className?: string;
};

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
  className = "",
}: RollingNumberProps) {
  const prev = useRef<Map<string, string> | null>(null); // null = first paint
  const slots = toSlots(value, anchor);

  useEffect(() => {
    prev.current = new Map(slots.map((s) => [s.slot, s.ch]));
  });

  let order = 0;

  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      {/* Clipped line: digits rise from below the baseline */}
      <span aria-hidden className="inline-flex overflow-hidden py-[0.08em] leading-none">
        {slots.map(({ ch, slot }) => {
          const isNew = prev.current !== null && prev.current.get(slot) !== ch;
          const delay = isNew && stagger ? order++ * stagger : 0;
          return (
            <span
              key={`${slot}:${ch}`} // key changes only when this slot's char changes
              className={`inline-block tabular-nums ${
                isNew ? "motion-safe:animate-digit-in motion-reduce:animate-digit-fade" : ""
              }`}
              style={delay ? { animationDelay: `${delay}ms` } : undefined}
            >
              {ch}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SalaryField                                                         */
/* Real <input> on top for caret, selection and keyboards; the visible */
/* digits come from RollingNumber underneath. Backspace is instant.    */
/* ------------------------------------------------------------------ */

const formatMYR = (raw: string) => (raw ? Number(raw).toLocaleString("en-MY") : "");

export function SalaryField({
  value,
  onChange,
}: {
  value: string; // digits only, e.g. "3500"
  onChange: (raw: string) => void;
}) {
  const shown = formatMYR(value);

  return (
    <label className="flex h-16 items-center gap-2 rounded-xl bg-ink-800 px-4 ring-1 ring-ink-700 transition-shadow duration-150 ease-out-strong focus-within:ring-2 focus-within:ring-lime-300">
      <span className="text-[15px] font-medium text-ink-500">RM</span>
      <span className="relative flex-1 font-mono text-[28px] font-bold">
        <RollingNumber value={shown} anchor="start" className="text-ink-50" />
        <input
          inputMode="numeric"
          autoComplete="off"
          aria-label="Gross monthly salary"
          placeholder="0"
          value={shown}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 7))
          }
          className="absolute inset-0 w-full bg-transparent text-transparent caret-lime-300 outline-none placeholder:text-ink-700"
        />
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* TakeHome                                                            */
/* Waits for a 200 ms typing pause (inside the 400 ms Doherty budget), */
/* then rolls only the changed digits, 30 ms apart.                    */
/* ------------------------------------------------------------------ */

function useSettled<T>(value: T, ms = 200) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}

export function TakeHome({ net }: { net: number }) {
  const settled = useSettled(net);
  return (
    <span aria-live="polite" className="font-mono text-xl font-medium text-lime-300">
      RM&nbsp;
      <RollingNumber value={settled.toLocaleString("en-MY")} anchor="end" stagger={30} />
    </span>
  );
}

/* Press feedback for every button:
   className="transition-transform duration-[120ms] ease-out-strong active:scale-[0.97]" */
