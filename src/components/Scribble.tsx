import type { ReactNode } from "react";
import { UNDERLINE } from "../brand/assets";

/**
 * Words with a hand-sketched marker underline (brand/generators/underline.js).
 * The main swipe draws on left to right, then a looser return pass draws back right to left, once per mount.
 */
export function Scribble({ children }: { children: ReactNode }) {
  return (
    <span className="scribble">
      {children}
      {UNDERLINE.paths.map((d, i) => (
        <svg key={i} className={`scr scr-${i}`} viewBox={UNDERLINE.viewBox} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}
