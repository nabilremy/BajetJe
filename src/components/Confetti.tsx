import { useEffect, useRef } from "react";
import { CONFETTI } from "../brand/assets";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
// White ink first: the doodle style is white on dark, with marker yellow and a little lime for the win
const COLOURS = ["var(--color-ink-50)", "var(--color-ink-50)", "var(--marker)", "var(--marker)", "var(--lime)"];
const COUNT = 40;

/**
 * Doodle confetti burst from its parent's centre (brand/generators/confetti.js pieces).
 * Sampled projectile motion on transform + opacity only; never blocks taps; nothing under reduced motion.
 */
export function Confetti({ fire, delay = 0 }: { fire: boolean; delay?: number }) {
  const layer = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = layer.current;
    if (!fire || !el || reduced() || !el.animate) return;
    const timer = setTimeout(() => {
      for (let i = 0; i < COUNT; i++) {
        const piece = document.createElement("i");
        piece.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${CONFETTI[i % CONFETTI.length]}</svg>`;
        piece.style.color = COLOURS[i % COLOURS.length];
        el.appendChild(piece);
        // Up and out across the screen (biased left: the pill sits on the right edge), then gravity takes over
        const angle = (-118 + (Math.random() * 2 - 1) * 62) * (Math.PI / 180);
        const speed = 260 + Math.random() * 300;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const g = 820 + Math.random() * 220;
        const spin = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360);
        const size = 0.8 + Math.random() * 0.6;
        const dur = 1600 + Math.random() * 600;
        const frames: Keyframe[] = [];
        for (let k = 0; k <= 10; k++) {
          const t = (k / 10) * (dur / 1000);
          const x = vx * t * (1 - 0.18 * (k / 10)); // a touch of air drag on the sideways drift
          const y = vy * t + 0.5 * g * t * t;
          frames.push({
            transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(spin * t).toFixed(0)}deg) scale(${(k === 0 ? 0.4 : size).toFixed(2)})`,
            opacity: k < 7 ? 1 : 1 - (k - 6) / 4,
          });
        }
        piece.animate(frames, { duration: dur, delay: Math.random() * 90, easing: "linear", fill: "both" }).finished.then(
          () => piece.remove(),
          () => piece.remove(),
        );
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      el.replaceChildren();
    };
  }, [fire, delay]);

  return <span ref={layer} className="confetti" aria-hidden="true" />;
}
