import { useSyncExternalStore } from "react";

export type ScreenName = "welcome" | "salary" | "plan" | "commit" | "health" | "car" | "house";
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
  stack = mode === "reset" ? [name] : [...stack, name];
  dir = "fwd";
  emit();
}

export function back() {
  const prev = stack[stack.length - 2] ?? "plan";
  stack = stack.length > 1 ? stack.slice(0, -1) : [prev];
  dir = "back";
  emit();
}

/** Jump back to a screen and make it the root (e.g. "Back to my plan"). */
export function backTo(name: ScreenName) {
  stack = [name];
  dir = "back";
  emit();
}

export function useRouter() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
  );
}
