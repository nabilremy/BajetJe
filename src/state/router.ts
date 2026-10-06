import { useSyncExternalStore } from "react";

export type ScreenName = "salary" | "plan" | "commit" | "health" | "car" | "house";
type Dir = "fwd" | "back";

let stack: ScreenName[] = [];
let dir = "fwd" as Dir;
let nav = 0;
const listeners = new Set<() => void>();
let snap: { stack: ScreenName[]; dir: Dir; nav: number } = { stack, dir, nav };

const emit = () => {
  snap = { stack, dir, nav: ++nav };
  listeners.forEach((l) => l());
};

/** Push a screen (fwd) or reset the stack to it. */
export function go(name: ScreenName, mode: "fwd" | "reset" = "fwd") {
  // Each pushed screen gets a history entry, so the phone's back button steps back instead of closing the app
  if (mode === "fwd" && stack.length) history.pushState({ bj: stack.length }, "");
  stack = mode === "reset" ? [name] : [...stack, name];
  dir = "fwd";
  emit();
}

function pop() {
  const prev = stack[stack.length - 2] ?? "plan";
  stack = stack.length > 1 ? stack.slice(0, -1) : [prev];
  dir = "back";
  emit();
}

export function back() {
  if (stack.length > 1 && history.state?.bj) history.back();
  else pop();
}

/** Jump back to a screen and make it the root (e.g. "Back to my plan"). */
export function backTo(name: ScreenName) {
  stack = [name];
  dir = "back";
  emit();
}

// Phone or browser back button
window.addEventListener("popstate", () => {
  if (stack.length > 1) pop();
});

export function useRouter() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
  );
}
