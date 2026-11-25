import { useEffect } from "react";

const EDITABLE = "input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, [contenteditable=true]";
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll only the screen's own scroller (scrollIntoView would also shift the clipped phone frame) */
function centre(el: HTMLElement) {
  const scroller = el.closest<HTMLElement>(".screen");
  if (!scroller) return;
  const box = el.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  const top = scroller.scrollTop + (box.top - view.top) - (scroller.clientHeight - box.height) / 2;
  scroller.scrollTo({ top: Math.max(0, top), behavior: reduced() ? "auto" : "smooth" });
}

/**
 * Keeps the field you are typing in visible when the on-screen keyboard opens.
 * On the phone the app gets shorter while the keyboard is up (Capacitor pads the window by the keyboard height), and the
 * sticky footers (Commitments total, Salary button) would cover the field. While a field is focused and the screen has
 * shrunk, <html> gets the `kb` class (CSS hides sticky footers) and the field scrolls to the middle of the screen.
 */
export function useKeyboardAware() {
  useEffect(() => {
    const vv = window.visualViewport;
    const height = () => Math.min(window.innerHeight, vv ? vv.height : window.innerHeight);
    let full = height();
    let width = window.innerWidth;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const focused = () => {
      const el = document.activeElement;
      return el instanceof HTMLElement && el.matches(EDITABLE) ? el : null;
    };

    const update = () => {
      // A rotation or window resize sideways is a new full height, not a keyboard
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        full = height();
      }
      const h = height();
      const el = focused();
      if (!el) full = Math.max(full, h);
      // The keyboard takes at least about a fifth of the screen; smaller changes are browser bars
      const open = !!el && h < full - Math.max(120, full * 0.2);
      document.documentElement.classList.toggle("kb", open);
      if (open && el) {
        clearTimeout(timer);
        // Wait for the layout to settle (footer hidden, keyboard done), then centre the field in its screen
        timer = setTimeout(() => centre(el), 60);
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && e.target.matches(EDITABLE)) update();
    };
    // Focus moving between fields keeps the keyboard up; only drop the class once nothing editable is focused
    const onFocusOut = () => setTimeout(update, 0);

    window.addEventListener("resize", update);
    vv?.addEventListener("resize", update);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.documentElement.classList.remove("kb");
    };
  }, []);
}
