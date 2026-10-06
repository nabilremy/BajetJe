import { Icon } from "../components/Icon";
import { RollingNumber } from "../components/RollingNumber";
import { Gauge, Navbar, StatusPill, toneVar } from "../components/ui";
import { calc, fmt, pct, verdict } from "../engine";
import { backTo, go } from "../state/router";
import { useApp } from "../state/store";

/** F4 · Commitment Health */
export function Health() {
  const S = useApp();
  const c = calc(S);
  const [vName, vCol] = verdict(c.ratio, 50, 65);
  const left = Math.max(0, c.left);

  const copy =
    vName === "Healthy"
      ? `of your take-home goes to fixed bills and loans. Your needs (RM ${fmt(c.needsC)}) ${
          c.needsC <= c.needs
            ? `fit inside your 50% budget of RM ${fmt(c.needs)}, with RM ${fmt(c.needs - c.needsC)} to spare.`
            : `are RM ${fmt(c.needsC - c.needs)} over your 50% budget, so less is left for wants.`
        }`
      : vName === "Caution"
        ? `of your take-home is committed. Needs are RM ${fmt(Math.abs(c.needsC - c.needs))} ${c.needsC > c.needs ? "over" : "under"} your 50% budget. Manageable, but keep wants small this month.`
        : `of your take-home. More than two-thirds of your pay is committed, so one surprise bill could leave you short.`;

  // Breakdown: top 4 + Others, debt in coral
  const items = S.commitments.filter((x) => x.amt > 0 && x.bucket !== "savings").sort((a, b) => b.amt - a.amt);
  const others = items.slice(4).reduce((a, x) => a + x.amt, 0);
  const shades = ["var(--ink-300)", "var(--ink-400)", "var(--ink-500)", "var(--ink-600)"];
  let si = 0;
  const parts = items.slice(0, 4).map((x) => ({ n: x.name || "Unnamed", v: x.amt, col: x.debt ? "var(--coral)" : shades[si++] }));
  if (others) parts.push({ n: "Others", v: others, col: "var(--ink-700)" });

  // Salary waterfall: [name, sub, value text, from, to, colour, total row]
  const W = S.mode === "gross" ? c.raw : c.net;
  const sc = (v: number) => (v / (W || 1)) * 100;
  const steps: [string, string, string, number, number, string, boolean][] = [];
  if (S.mode === "gross")
    steps.push(["Gross salary", "", fmt(c.raw), 0, c.raw, "var(--ink-600)", false], ["Deductions", "EPF, SOCSO, EIS, tax", "− " + fmt(c.raw - c.net), c.net, c.raw, "var(--ink-700)", false]);
  steps.push(
    ["Take-home", "", fmt(c.net), 0, c.net, "var(--ink-400)", true],
    ["Commitments", pct(c.ratio), "− " + fmt(c.commit), c.net - c.commit, c.net, "var(--ink-300)", false],
    ["Savings first", "20%", "− " + fmt(c.savingsOut), left, left + c.savingsOut, "var(--ink-500)", false],
    ["For yourself", "food, fun, personal", fmt(left), 0, left, "var(--lime)", true],
  );

  return (
    <div className="stack">
      <Navbar
        title="Commitment health"
        right={
          <button className="link" style={{ color: "var(--ink-300)" }} onClick={() => go("commit")}>
            Edit
          </button>
        }
      />
      <div className="section" style={{ gap: 6 }}>
        <div className="over">Your commitments take</div>
        <div className="row" style={{ gap: 12 }}>
          <span className="hero" style={{ color: toneVar(vCol) }}>
            <RollingNumber value={pct(c.ratio)} anchor="end" stagger={40} animateOnMount />
          </span>
          <StatusPill tone={vCol} big pop>
            {vName}
          </StatusPill>
        </div>
        <p className="body">{copy}</p>
      </div>

      <div className="card">
        <div className="row between">
          <h2 className="over">Breakdown</h2>
          <button className="link" onClick={() => go("commit")}>
            Manage <Icon name="arrow" className="svg-i ic-sm" />
          </button>
        </div>
        <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
          <span className="mono" style={{ fontSize: 28, fontWeight: 700 }}>
            RM {fmt(c.commit)}
          </span>
          <span className="body">/ month</span>
        </div>
        <div className="row" style={{ gap: 2, height: 10 }} aria-hidden="true">
          {parts.map((p) => (
            <i key={p.n} style={{ flex: p.v, height: "100%", background: p.col, borderRadius: 2 }} />
          ))}
        </div>
        <div className="legend">
          {parts.map((p) => (
            <div key={p.n} className="row">
              <span className="sw" style={{ background: p.col }} />
              <span style={{ color: "var(--ink-300)" }}>{p.n}</span>
              <span className="grow" />
              <span className="muted">{pct((p.v / (c.net || 1)) * 100)}</span>
              <span className="mono" style={{ width: 70, textAlign: "right" }}>
                RM {fmt(p.v)}
              </span>
            </div>
          ))}
        </div>
        <div className="hr" />
        <Gauge p={c.ratio} stops={[50, 65]} max={100} sweep />
        <div className="row" style={{ background: "rgba(61,61,59,.5)", borderRadius: 10, padding: "10px 12px" }}>
          <div className="grow">
            <div className="lbl" style={{ color: "var(--ink-300)" }}>
              Debt only (loans)
            </div>
            <div className="cap">Banks look at this when you apply for a loan</div>
          </div>
          <span className="mono" style={{ color: toneVar(verdict(c.debtRatio, 30, 40)[1]) }}>
            {pct(c.debtRatio)}
          </span>
        </div>
      </div>

      <div className="section" style={{ gap: 6 }}>
        <div className="over">After commitments and savings, you can spend</div>
        <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
          <span className="hero">RM {fmt(c.daily)}</span>
          <span className="h2">a day</span>
        </div>
        <p className="body">
          RM {fmt(left)} this month for food, fun and everything personal. RM {fmt(c.savingsOut)} is saved first (20%).
        </p>
      </div>

      <div className="section">
        <h2 className="over">Where your salary goes</h2>
        <div className="wf">
          {steps.map(([n, sub, v, a, b, col, tot]) => (
            <div key={n} style={{ display: "flex", flexDirection: "column", gap: 6, ...(tot ? { paddingTop: 4 } : {}) }}>
              <div className="row">
                <span className={tot ? "lbl" : "cap"} style={tot ? { fontSize: 15 } : { color: "var(--ink-300)", fontSize: 13 }}>
                  {n}
                </span>
                <span className="cap">{sub}</span>
                <span className="grow" />
                <span className="mono" style={{ fontSize: 13, ...(n === "For yourself" ? { color: "var(--lime)" } : {}) }}>
                  RM {v}
                </span>
              </div>
              <div className="bar">
                <i style={{ left: `${sc(a)}%`, width: `${Math.max(1, sc(b) - sc(a))}%`, background: col, ...(tot ? { height: 12 } : {}) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => backTo("plan")}>
        Back to my plan
      </button>
      <p className="cap" style={{ textAlign: "center", fontSize: 11 }}>
        Estimates only. Not financial advice.
      </p>
    </div>
  );
}
