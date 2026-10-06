import { useState, type ReactNode } from "react";
import { CommitmentRow } from "../components/CommitmentRow";
import { Icon } from "../components/Icon";
import { RollingNumber, useSettled } from "../components/RollingNumber";
import { Navbar, toast } from "../components/ui";
import { BUCKETS, calc, fmt, pct, PRESETS, QUICK, uid, verdict, type BucketDef, type Commitment, type Plan } from "../engine";
import { go } from "../state/router";
import { getState, setState, useApp } from "../state/store";

let editMode = false;

/** F3 · Commitments */
export function Commitments() {
  const S = useApp();
  const [edit, setEdit] = useState(editMode);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  // Totals and notes update after a short typing pause
  const settled = useSettled(S.commitments, 150);
  const c = calc({ ...S, commitments: settled });

  const update = (id: string, patch: Partial<Commitment>) =>
    setState((s) => ({ commitments: s.commitments.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const remove = (id: string) => {
    const list = getState().commitments;
    const idx = list.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const item = list[idx];
    setOpenId(null);
    setState({ commitments: list.filter((x) => x.id !== id) });
    toast(`Deleted ${item.name || "commitment"}`, () =>
      setState((s) => {
        const next = [...s.commitments];
        next.splice(Math.min(idx, next.length), 0, item);
        return { commitments: next };
      }),
    );
  };

  const add = (bucket: Commitment["bucket"], quick?: number) => {
    const q = quick === undefined ? { icon: "card" as const, name: "", cat: "Other", debt: false } : QUICK[bucket][quick];
    const id = uid();
    setState((s) => ({ commitments: [...s.commitments, { id, ...q, bucket, amt: 0, custom: quick === undefined }] }));
    setNewId(id);
  };

  const fillExample = () =>
    setState((s) => {
      const list = s.commitments.map((x) => ({ ...x }));
      PRESETS.forEach((p) => {
        let row = list.find((x) => x.name === p.name);
        if (!row) {
          row = { id: uid(), ...p, amt: 0 };
          list.push(row);
        }
        row.amt = p.ex;
        row.bucket = p.bucket;
      });
      return { commitments: list };
    });

  return (
    <div
      className="stack"
      style={{ minHeight: "100%" }}
      onPointerDown={(e) => {
        const t = e.target as HTMLElement;
        if (!t.closest(".sw-fg") && !t.closest(".sw-del")) setOpenId(null);
      }}
    >
      <Navbar
        title="My commitments"
        right={
          <button
            className="link"
            style={{ color: "var(--ink-300)" }}
            onClick={() => {
              editMode = !edit;
              setEdit(!edit);
              setOpenId(null);
            }}
          >
            {edit ? "Done" : "Edit"}
          </button>
        }
      />
      <div className="section" style={{ gap: 6 }}>
        <h2 className="h1">What do you pay every month?</h2>
        <p className="body">Fixed amounts only, grouped by your 50/30/20 split. Swipe left on a row to delete it.</p>
        <button className="link" onClick={fillExample} style={{ alignSelf: "flex-start", color: "var(--ink-400)" }}>
          Fill with an example
        </button>
      </div>

      {BUCKETS.map((b) => (
        <BucketSection
          key={b.key}
          b={b}
          c={c}
          chips={QUICK[b.key].map((q, i) => (
            <button key={q.name} className="chip" style={{ minHeight: 36 }} onClick={() => add(b.key, i)}>
              <Icon name="plus" className="svg-i ic-sm" />
              {q.name}
            </button>
          ))}
        >
          {S.commitments
            .filter((x) => x.bucket === b.key)
            .map((x) => (
              <CommitmentRow
                key={x.id}
                c={x}
                edit={edit}
                open={openId === x.id}
                isNew={newId === x.id}
                onOpen={(o) => setOpenId(o ? x.id : null)}
                onChange={(p) => update(x.id, p)}
                onDelete={() => remove(x.id)}
              />
            ))}
          <button className="item add" onClick={() => add(b.key)}>
            <Icon name="plus" className="svg-i ic-sm" />
            Add to {b.label.toLowerCase()}
          </button>
        </BucketSection>
      ))}

      <div className="grow" />
      <div className="sticky" style={{ borderTop: "1px solid var(--ink-800)" }}>
        <div className="row">
          <div className="grow">
            <div className="lbl soft">Fixed commitments</div>
            <div className="cap">{c.net ? `${pct(c.ratio)} of your RM ${fmt(c.net)} take-home · savings not included` : ""}</div>
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            RM&nbsp;
            <RollingNumber value={fmt(c.commit)} anchor="end" stagger={30} />
          </div>
        </div>
        <div className="track">
          <i
            style={{
              background: `var(--${verdict(c.ratio, 50, 65)[1]})`,
              transition: "transform 250ms var(--ease)",
              width: "100%",
              transform: `scaleX(${Math.min(c.ratio, 100) / 100})`,
            }}
          />
          <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "var(--ink-50)" }} />
        </div>
        <button className="btn btn-primary" disabled={!(c.commit || c.savC)} onClick={() => go("health")}>
          Check my commitment health
        </button>
      </div>
    </div>
  );
}

function BucketSection({ b, c, chips, children }: { b: BucketDef; c: Plan; chips: ReactNode; children: ReactNode }) {
  const used = b.key === "needs" ? c.needsC : b.key === "wants" ? c.wantsC : c.savC;
  const budget = b.key === "needs" ? c.needs : b.key === "wants" ? c.wants : c.savings;
  const over = used > budget;
  let note = b.hint;
  let amber = false;
  if (used) {
    if (b.key === "savings")
      note = used >= budget ? "On track: you already save at least 20%." : `RM ${fmt(budget - used)} more goes to savings automatically to reach 20%.`;
    else if (over) {
      note = `Over by RM ${fmt(used - budget)}. ${b.key === "needs" ? "This comes out of your wants." : "Your daily spending money shrinks."} You can still add more.`;
      amber = true;
    } else note = `RM ${fmt(budget - used)} left in ${b.label.toLowerCase()}`;
  }
  return (
    <section className="section" aria-labelledby={`b-${b.key}`} style={{ gap: 10 }}>
      <div className="row between">
        <div className="row" style={{ gap: 8 }}>
          <span className="sw" style={{ background: b.color, width: 10, height: 10 }} />
          <h3 className="h3" id={`b-${b.key}`}>
            {b.label}
          </h3>
          <span className="cap">{b.share * 100}%</span>
        </div>
        <span className="mono cap" style={{ color: "var(--ink-300)" }}>
          RM {fmt(used)} / {fmt(budget)}
        </span>
      </div>
      <div className="track">
        <i
          style={{
            width: "100%",
            transformOrigin: "left",
            transform: `scaleX(${budget ? Math.min(used / budget, 1) : 0})`,
            transition: "transform 250ms var(--ease), background 150ms",
            background: over && b.key !== "savings" ? "var(--amber)" : b.color,
          }}
        />
      </div>
      <p className="cap" style={amber ? { color: "var(--amber)" } : undefined} aria-live="polite">
        {note}
      </p>
      <div className="list">{children}</div>
      <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
        {chips}
      </div>
    </section>
  );
}
