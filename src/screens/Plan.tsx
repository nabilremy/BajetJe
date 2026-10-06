import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BudgetChips } from "../components/BudgetChips";
import { Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { SplitCard } from "../components/SplitCard";
import { Gauge, StatusPill, toast } from "../components/ui";
import { calc, carLimit, DAY, fmt, fmtD, isKlShort, k, pct, rates, verdict, type IconName } from "../engine";
import { go } from "../state/router";
import { exportBackup, importBackup, useApp, wipeAll } from "../state/store";

/** No name is collected, so the hub greets with a friendly calling, picked once per app launch. */
const CALLINGS = ["Master", "Boss", "Bos", "Geng", "Kawan", "Champ", "Sifu", "Legend", "Chief", "Bestie"];
const calling = CALLINGS[Math.floor(Math.random() * CALLINGS.length)];

/** Hub reveal plays once per session */
let revealed = false;
export const resetReveal = () => {
  revealed = false;
};

/** F2 · My Plan (hub) */
export function Plan() {
  const S = useApp();
  const c = calc(S);
  const has = c.commit > 0;
  const anyAmount = c.commit + c.savC > 0;
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  const kl = isKlShort(c.needs);
  const carSafe = carLimit(c.net, rates().car.comfortableShare, S.carDown);
  const rent = c.net * rates().home.share;
  const [reveal] = useState(() => !revealed);
  const [revealing, setRevealing] = useState(reveal);

  useEffect(() => {
    revealed = true;
    if (!reveal) return;
    const id = setTimeout(() => setRevealing(false), 1400);
    return () => clearTimeout(id);
  }, [reveal]);

  const r = (i: number) => ({ "data-r": "", style: { "--i": i } as CSSProperties });

  return (
    <div className={`stack${revealing ? " reveal" : ""}`}>
      <div className="row" {...r(0)}>
        <div className="grow">
          <h1 className="h2">Hi, {calling}</h1>
          <p className="body">
            Pay cycle {fmtD(c.cy.prev)} to {fmtD(new Date(+c.cy.next - DAY))} · {c.daysLeft} day{c.daysLeft === 1 ? "" : "s"} to payday
          </p>
        </div>
        <span className="pill" style={{ background: "var(--ink-800)", color: "var(--ink-400)" }}>
          <Icon name="shield" />
          On device
        </span>
      </div>

      <div className="card" {...r(1)} style={{ ...r(1).style, flexDirection: "row", alignItems: "center", padding: "14px 12px 14px 16px" }}>
        <div className="grow">
          <div className="over">Take-home pay</div>
          <div className="row" style={{ alignItems: "baseline", gap: 4 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
              RM {fmt(c.net)}
            </span>
            <span className="body">/ month</span>
          </div>
          <div className="cap">{S.mode === "gross" ? "After EPF, SOCSO, EIS and tax" : "Entered as take-home"}</div>
        </div>
        <button className="btn btn-quiet" style={{ width: "auto", minHeight: 44, padding: "0 16px", borderRadius: 999, gap: 6 }} onClick={() => go("salary")}>
          <Icon name="pen" />
          Edit
        </button>
      </div>

      <div className="section" style={{ gap: 6 }}>
        <div className="over" {...r(2)}>
          {has ? "After bills and savings, you can spend" : "You can spend"}
        </div>
        <div className="row" {...r(2)} style={{ ...r(2).style, alignItems: "baseline", gap: 10 }}>
          <span className="hero lime">
            <RollingNumber value={"RM " + fmt(Math.max(0, c.daily))} anchor="end" />
          </span>
          <span className="h2">a day</span>
        </div>
        <div className="row body" {...r(3)}>
          <span className="sw" style={{ background: "var(--amber)", borderRadius: 99 }} />
          {anyAmount ? `RM ${fmt(c.left)} this month for food, fun and personal stuff` : `From your 30% wants: RM ${fmt(c.wants)} ÷ ${c.days} days`}
        </div>
        <div className="strip" {...r(4)} role="img" aria-label={`Day ${c.today} of ${c.days} in this pay cycle`}>
          {Array.from({ length: c.days }, (_, i) => (
            <i key={i} className={i + 1 < c.today ? "" : i + 1 === c.today ? "t today" : "f"} />
          ))}
          <span className="tl" style={{ left: `${((c.today - 0.5) / c.days) * 100}%` }}>
            Today
          </span>
        </div>
        <div className="row between cap" {...r(4)}>
          <span>Paid {fmtD(c.cy.prev)}</span>
          <span>Next payday {fmtD(c.cy.next)}</span>
        </div>
        <div {...r(5)}>
          <BudgetChips c={c} style={{ paddingTop: 6 }} />
        </div>
      </div>

      <div {...r(6)}>
        <SplitCard c={c} />
      </div>

      {kl && (
        <div {...r(7)} style={{ ...r(7).style, background: "rgba(255,187,51,.12)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="lbl amber">Needs may run short in KL</div>
          <p className="cap" style={{ color: "var(--ink-400)" }}>
            EPF's Belanjawanku guide puts a single person's basics in Klang Valley at about RM {fmt(rates().split.klNeedsBasics)}. Your 50% is RM {fmt(c.needs)}.
          </p>
          <button className="link" onClick={() => go("commit")} style={{ alignSelf: "flex-start" }}>
            Check my commitments <Icon name="arrow" className="svg-i ic-sm" />
          </button>
        </div>
      )}

      {has ? (
        <div className="card" {...r(8)}>
          <div className="row between">
            <h2 className="over">Commitment health</h2>
            <StatusPill tone={vCol}>{vName}</StatusPill>
          </div>
          <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
              {pct(c.ratio)}
            </span>
            <span className="cap">of take-home · RM {fmt(c.commit)} a month</span>
          </div>
          <Gauge p={c.ratio} stops={[50, 65]} max={100} />
          <div className="row between">
            <span className="cap" style={{ color: "var(--ink-400)" }}>
              {c.needsC <= c.needs ? `RM ${fmt(c.needs - c.needsC)} left in your needs budget` : `Needs over by RM ${fmt(c.needsC - c.needs)}`}
            </span>
            <button className="link" onClick={() => go("health")}>
              Details <Icon name="arrow" className="svg-i ic-sm" />
            </button>
          </div>
        </div>
      ) : (
        <div className="card" {...r(8)}>
          <h2 className="over">Commitment health</h2>
          <div className="h3">Want to check if your commitment is healthy?</div>
          <p className="body">List your fixed monthly commitments. We check them against your 50% needs budget of RM {fmt(c.needs)}.</p>
          <Illustration />
          <button className="btn btn-primary" onClick={() => go("commit")}>
            Add my commitments
          </button>
        </div>
      )}

      <div className="section" {...r(9)} style={{ ...r(9).style, gap: 12 }}>
        <h2 className="over">What can I afford?</h2>
        <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
          <AffordTile icon="car" title="Car" pre="Comfortable up to" val={carSafe ? "RM " + k(carSafe) : "Not yet"} unit="" meta={`RM ${fmt(c.net * 0.2)}/mo all-in`} share={0.2} cta="See cars" onClick={() => go("car")} />
          <AffordTile icon="home" title="Home" pre="Rent up to" val={"RM " + fmt(rent)} unit="/mo" meta="30% of take-home" share={0.3} cta="See housing" onClick={() => go("house")} />
        </div>
      </div>

      <p className="cap" style={{ textAlign: "center", fontSize: 11, padding: "4px 12px 0" }}>
        Estimates only, based on EPF, PERKESO, LHDN and Belanjawanku guidelines. Not financial advice.
      </p>
      <DataControls />
    </div>
  );
}

function AffordTile(p: { icon: IconName; title: string; pre: string; val: ReactNode; unit: string; meta: string; share: number; cta: string; onClick: () => void }) {
  return (
    <button className="card afford" onClick={p.onClick} style={{ flex: 1, padding: 16, gap: 10, textAlign: "left", transition: "transform 120ms var(--ease)" }}>
      <div className="row" style={{ gap: 10 }}>
        <span className="ico">
          <Icon name={p.icon} />
        </span>
        <span className="lbl" style={{ fontSize: 15 }}>
          {p.title}
        </span>
      </div>
      <div>
        <div className="cap">{p.pre}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 3 }}>
          <span className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            {p.val}
          </span>
          <span className="cap">{p.unit}</span>
        </div>
      </div>
      <div className="track" style={{ height: 6 }}>
        <i style={{ width: `${p.share * 100}%`, background: "var(--lime)" }} />
      </div>
      <div className="cap" style={{ color: "var(--ink-400)" }}>
        {p.meta}
      </div>
      <span className="lbl row" style={{ gap: 4 }}>
        {p.cta} <Icon name="arrow" className="svg-i ic-sm" />
      </span>
    </button>
  );
}

/** Export / import for changing phones, and wipe (two taps within 3 s). */
function DataControls() {
  const [armed, setArmed] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  const wipe = async () => {
    if (!armed) return setArmed(true);
    await wipeAll();
    resetReveal();
    go("salary", "reset");
  };

  return (
    <div className="section" style={{ gap: 24, alignItems: "center" }}>
      <div className="row" style={{ gap: 16 }}>
        <button className="link" onClick={exportBackup} style={{ color: "var(--ink-500)", fontSize: 12 }}>
          Export backup
        </button>
        <button className="link" onClick={() => file.current?.click()} style={{ color: "var(--ink-500)", fontSize: 12 }}>
          Import backup
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              await importBackup(f);
              toast("Plan restored from backup");
            } catch (err) {
              toast((err as Error).message);
            }
          }}
        />
      </div>
      <button className="link" onClick={wipe} style={{ color: armed ? "var(--coral)" : "var(--ink-500)", fontSize: 12 }}>
        <Icon name="trash" />
        <span> {armed ? "Tap again to delete everything" : "Delete all my data from this phone"}</span>
      </button>
    </div>
  );
}

function Illustration() {
  return (
    <svg viewBox="18 0 232 96" width="232" height="96" fill="none" aria-hidden="true" style={{ maxWidth: "100%", alignSelf: "center" }}>
      <g transform="rotate(-8 60 48)">
        <rect x="28" y="22" width="64" height="50" rx="6" fill="#2A2A28" stroke="#545451" strokeWidth="1.5" />
      </g>
      <g transform="rotate(4 66 46)">
        <rect x="34" y="20" width="64" height="50" rx="6" fill="#2A2A28" stroke="#6F6F6C" strokeWidth="1.5" />
        <path d="M44 33H70M44 41H84M44 49H62" stroke="#6F6F6C" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 58H88" stroke="#949491" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M112 52H140" stroke="#545451" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 5" />
      <path d="M152 76A44 44 0 0 1 240 76" stroke="#3D3D3B" strokeWidth="8" strokeLinecap="round" />
      <path d="M152 76A44 44 0 0 1 196 32" stroke="#C5FF73" strokeOpacity=".45" strokeWidth="8" strokeLinecap="round" />
      <path d="M196 76L180 44" stroke="#949491" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
      <circle cx="196" cy="76" r="4" fill="#F7F7F6" />
    </svg>
  );
}
