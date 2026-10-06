import { useEffect, useRef, type ReactElement } from "react";
import { ToastHost } from "./components/ui";
import { Car } from "./screens/Car";
import { Commitments } from "./screens/Commitments";
import { Health } from "./screens/Health";
import { House } from "./screens/House";
import { Plan } from "./screens/Plan";
import { Salary } from "./screens/Salary";
import { useRouter, type ScreenName } from "./state/router";

const SCREENS: Record<ScreenName, () => ReactElement> = {
  salary: Salary,
  plan: Plan,
  commit: Commitments,
  health: Health,
  car: Car,
  house: House,
};

const TITLES: Record<ScreenName, string> = {
  salary: "Your salary",
  plan: "My plan",
  commit: "My commitments",
  health: "Commitment health",
  car: "Car",
  house: "Housing",
};

export function App() {
  const { stack, dir, nav } = useRouter();
  const name = stack[stack.length - 1] ?? "salary";
  const Screen = SCREENS[name];
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = `${TITLES[name]} · BajetJe`;
    ref.current?.scrollTo(0, 0);
  }, [name, nav]);

  return (
    <div className="stage">
      <main className="phone">
        {/* key on nav: every navigation remounts with the push transition (280 ms) */}
        <section ref={ref} key={nav} className={`screen ${dir === "back" ? "in-back" : "in-fwd"}`} data-screen={name}>
          <Screen />
        </section>
        {/* Frosted strip behind the phone's status bar, so the clock and icons stay readable while scrolling */}
        <div className="statusbar" aria-hidden="true" />
        <ToastHost />
      </main>
    </div>
  );
}
