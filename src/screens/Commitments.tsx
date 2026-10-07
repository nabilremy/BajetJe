import { useEffect, useRef, useState, type ReactNode } from "react";
import { CommitmentRow } from "../components/CommitmentRow";
import { Icon } from "../components/Icon";
import { RollingNumber, useSettled } from "../components/RollingNumber";
import { Navbar, toast } from "../components/ui";
import { BUCKETS, calc, fmt, freshCommitments, PRESETS, QUICK, uid, verdict, type Bucket, type BucketDef, type Commitment, type Plan } from "../engine";
import { itemName, useLang, useT, type MsgKey, type T } from "../i18n";
import { go } from "../state/router";
import { getState, MAX_SAVED_LISTS, setState, useApp, type SavedList } from "../state/store";

let editMode = false;
/** Which of Needs / Wants / Savings are unfolded. All folded by default; remembered until the app closes. */
let openBuckets: ReadonlySet<Bucket> = new Set();

const copyItems = (items: Commitment[]) => items.map((x) => ({ ...x }));

/** F3 · Commitments */
export function Commitments() {
  const S = useApp();
  const t = useT();
  const lang = useLang();
  const [edit, setEdit] = useState(editMode);
  const [open, setOpen] = useState(openBuckets);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  // Totals and notes update after a short typing pause
  const settled = useSettled(S.commitments, 150);
  const c = calc({ ...S, commitments: settled });

  const unfold = (next: ReadonlySet<Bucket>) => {
    openBuckets = next;
    setOpen(next);
  };
  const toggleBucket = (k: Bucket) => {
    const next = new Set(open);
    if (!next.delete(k)) next.add(k);
    unfold(next);
  };

  const update = (id: string, patch: Partial<Commitment>) =>
    setState((s) => ({ commitments: s.commitments.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  /** Swap the whole list, with one Undo that puts the old one back. */
  const replaceList = (next: Commitment[], msg: string) => {
    const prev = getState().commitments;
    setOpenId(null);
    setPicked(new Set());
    setState({ commitments: next });
    toast(msg, () => setState({ commitments: prev }));
  };

  const remove = (id: string) => {
    const list = getState().commitments;
    const idx = list.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const item = list[idx];
    setOpenId(null);
    setState({ commitments: list.filter((x) => x.id !== id) });
    toast(t("commit.deleted", { name: itemName(lang, item.name, item.custom) || t("commit.fallbackName") }), () =>
      setState((s) => {
        const next = [...s.commitments];
        next.splice(Math.min(idx, next.length), 0, item);
        return { commitments: next };
      }),
    );
  };

  const pick = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const allPicked = S.commitments.length > 0 && picked.size === S.commitments.length;
  const deletePicked = () =>
    replaceList(
      getState().commitments.filter((x) => !picked.has(x.id)),
      t("commit.deletedN", { n: picked.size }),
    );

  const add = (bucket: Bucket, quick?: number) => {
    const q = quick === undefined ? { icon: "card" as const, name: "", cat: "Other", debt: false } : QUICK[bucket][quick];
    const id = uid();
    setState((s) => ({ commitments: [...s.commitments, { id, ...q, bucket, amt: 0, custom: quick === undefined }] }));
    setNewId(id);
  };

  const fillExample = () =>
    setState((s) => {
      const list = s.commitments.map((x) => ({ ...x }));
      PRESETS.forEach((p, i) => {
        // Match the default row by id first, so a renamed default ("House rent") is filled, not duplicated
        let row = list.find((x) => x.id === "c" + i) ?? list.find((x) => x.name === p.name);
        if (!row) {
          row = { id: uid(), ...p, amt: 0 };
          list.push(row);
        }
        row.amt = p.ex;
        row.bucket = p.bucket;
      });
      return { commitments: list };
    });

  const hasAmounts = S.commitments.some((x) => x.amt > 0);
  // Anything worth clearing: an amount, a renamed or added row, or a deleted default
  const dirty = hasAmounts || S.commitments.length !== PRESETS.length || S.commitments.some((x) => x.custom);

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
        title={t("commit.title")}
        right={
          <button
            className="link"
            style={{ color: "var(--ink-300)" }}
            onClick={() => {
              editMode = !edit;
              setEdit(!edit);
              setOpenId(null);
              setPicked(new Set());
              // Picking needs the rows in view
              if (!edit) unfold(new Set(BUCKETS.map((b) => b.key)));
            }}
          >
            {t(edit ? "common.done" : "common.edit")}
          </button>
        }
      />
      <div className="section" style={{ gap: 6 }}>
        <h2 className="h1">{t("commit.heading")}</h2>
        <p className="body">{t("commit.body")}</p>
        {!hasAmounts && S.simpleTotal > 0 && (
          <p className="cap" style={{ color: "var(--amber)" }}>
            {t("commit.simpleNote", { v: fmt(S.simpleTotal) })}
          </p>
        )}
      </div>

      <ListTools t={t} hasAmounts={hasAmounts} dirty={dirty} onExample={fillExample} onReset={() => replaceList(freshCommitments(), t("commit.resetDone"))} onUse={(l) => replaceList(copyItems(l.items), t("lists.used", { name: l.name }))} />

      {BUCKETS.map((b) => (
        <BucketSection
          key={b.key}
          b={b}
          c={c}
          t={t}
          open={open.has(b.key)}
          onToggle={() => toggleBucket(b.key)}
          chips={QUICK[b.key].map((q, i) => (
            <button key={q.name} className="chip" style={{ minHeight: 36 }} onClick={() => add(b.key, i)}>
              <Icon name="plus" className="svg-i ic-sm" />
              {itemName(lang, q.name)}
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
                selected={picked.has(x.id)}
                onSelect={() => pick(x.id)}
                open={openId === x.id}
                isNew={newId === x.id}
                onOpen={(o) => setOpenId(o ? x.id : null)}
                onChange={(p) => update(x.id, p)}
                onDelete={() => remove(x.id)}
              />
            ))}
          <button className="item add" onClick={() => add(b.key)}>
            <Icon name="plus" className="svg-i ic-sm" />
            {t(ADD[b.key])}
          </button>
        </BucketSection>
      ))}

      <div className="grow" />
      <div className="sticky">
        <div className="row">
          <div className="grow">
            <div className="lbl soft">{t("commit.fixed")}</div>
            <div className="cap">{c.net ? t("commit.share", { pct: Math.round(c.ratio), net: fmt(c.net) }) : ""}</div>
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
        {edit ? (
          <div className="row" style={{ gap: 16 }}>
            <button className="link" style={{ flex: "none", color: "var(--ink-300)" }} disabled={!S.commitments.length} onClick={() => setPicked(allPicked ? new Set() : new Set(S.commitments.map((x) => x.id)))}>
              {t(allPicked ? "commit.selectNone" : "commit.selectAll")}
            </button>
            <button className="btn btn-danger" disabled={!picked.size} onClick={deletePicked}>
              {picked.size ? t("commit.deleteN", { n: picked.size }) : t("commit.deleteNone")}
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" disabled={!(c.commit || c.savC)} onClick={() => go("health")}>
            {t("commit.cta")}
          </button>
        )}
      </div>
    </div>
  );
}

/** Example, save, start fresh, and the saved lists to bring back later. Everything stays on this phone. */
function ListTools({ t, hasAmounts, dirty, onExample, onReset, onUse }: { t: T; hasAmounts: boolean; dirty: boolean; onExample: () => void; onReset: () => void; onUse: (l: SavedList) => void }) {
  const { savedLists, commitments } = useApp();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [armed, setArmed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (naming) input.current?.select();
  }, [naming]);
  // Start fresh: two taps within 3 s, like "Delete all my data"
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  const startNaming = () => {
    setName(t("lists.defaultName", { n: savedLists.length + 1 }));
    setNaming(true);
  };

  const save = () => {
    const label = name.trim().slice(0, 24) || t("lists.defaultName", { n: savedLists.length + 1 });
    // Saving under a name that exists updates that list
    const others = savedLists.filter((l) => l.name.toLowerCase() !== label.toLowerCase());
    if (others.length >= MAX_SAVED_LISTS) return toast(t("lists.full", { n: MAX_SAVED_LISTS }));
    setState({ savedLists: [...others, { id: uid(), name: label, items: copyItems(commitments) }] });
    setNaming(false);
    toast(t("lists.saved", { name: label }));
  };

  const removeList = (l: SavedList) => {
    const idx = savedLists.findIndex((x) => x.id === l.id);
    setState({ savedLists: savedLists.filter((x) => x.id !== l.id) });
    toast(t("commit.deleted", { name: l.name }), () =>
      setState((s) => {
        const next = [...s.savedLists];
        next.splice(Math.min(idx, next.length), 0, l);
        return { savedLists: next };
      }),
    );
  };

  return (
    <div className="section" style={{ gap: 16 }}>
      <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
        <button className="chip" style={{ minHeight: 36 }} onClick={onExample}>
          <Icon name="sparkle" className="svg-i ic-sm" />
          {t("commit.example")}
        </button>
        {hasAmounts && !naming && (
          <button className="chip" style={{ minHeight: 36 }} onClick={startNaming}>
            <Icon name="save" className="svg-i ic-sm" />
            {t("lists.save")}
          </button>
        )}
        {dirty && (
          <button
            className="chip"
            onClick={() => {
              if (!armed) return setArmed(true);
              setArmed(false);
              onReset();
            }}
            style={{ minHeight: 36, ...(armed ? { color: "var(--coral)" } : {}) }}
          >
            <Icon name="reset" className="svg-i ic-sm" />
            {t(armed ? "commit.resetArmed" : "commit.reset")}
          </button>
        )}
      </div>

      {naming && (
        <form
          className="savebar"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input ref={input} value={name} maxLength={24} placeholder={t("lists.namePlaceholder")} aria-label={t("lists.nameAria")} autoComplete="off" onChange={(e) => setName(e.target.value)} />
          <button type="button" className="link" style={{ color: "var(--ink-400)", padding: "10px 4px", margin: 0 }} onClick={() => setNaming(false)}>
            {t("common.cancel")}
          </button>
          <button type="submit" className="chip on" style={{ minHeight: 36, padding: "0 14px", fontSize: 13, fontWeight: 500 }}>
            {t("lists.saveCta")}
          </button>
        </form>
      )}

      {savedLists.length > 0 && (
        <section className="section" aria-labelledby="saved-lists" style={{ gap: 8 }}>
          <h3 className="over" id="saved-lists">
            {t("lists.title")}
          </h3>
          <div className="list">
            {savedLists.map((l) => {
              const filled = l.items.filter((x) => x.amt > 0);
              return (
                <div key={l.id} className="item rise" style={{ paddingRight: 8 }}>
                  <div className="grow">
                    <div className="lbl">{l.name}</div>
                    <div className="cap">{t("lists.meta", { n: filled.length, v: fmt(filled.reduce((a, x) => a + x.amt, 0)) })}</div>
                  </div>
                  <button className="chip" style={{ minHeight: 36, padding: "0 14px", fontSize: 13, background: "var(--ink-700)", color: "var(--ink-50)" }} aria-label={t("lists.useAria", { name: l.name })} onClick={() => onUse(l)}>
                    {t("lists.use")}
                  </button>
                  <button className="iconbtn ghost" aria-label={t("lists.deleteAria", { name: l.name })} onClick={() => removeList(l)}>
                    <Icon name="trash" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

const ADD: Record<BucketDef["key"], MsgKey> = { needs: "commit.addNeeds", wants: "commit.addWants", savings: "commit.addSavings" };
const HINT: Record<BucketDef["key"], MsgKey> = { needs: "commit.hintNeeds", wants: "commit.hintWants", savings: "commit.hintSavings" };

/** Needs / Wants / Savings. Folded by default: the header, bar and note still show the budget at a glance. */
function BucketSection({ b, c, t, open, onToggle, chips, children }: { b: BucketDef; c: Plan; t: T; open: boolean; onToggle: () => void; chips: ReactNode; children: ReactNode }) {
  const used = b.key === "needs" ? c.needsC : b.key === "wants" ? c.wantsC : c.savC;
  const budget = b.key === "needs" ? c.needs : b.key === "wants" ? c.wants : c.savings;
  const over = used > budget;
  let note = t(HINT[b.key]);
  let amber = false;
  if (used) {
    const v = fmt(Math.abs(budget - used));
    if (b.key === "savings") note = used >= budget ? t("commit.savingsOk") : t("commit.savingsMore", { v });
    else if (over) {
      note = t(b.key === "needs" ? "commit.overNeeds" : "commit.overWants", { v });
      amber = true;
    } else {
      // "Plenty of room!" while under half the bucket is used
      const room = used < budget * 0.5;
      note = t(b.key === "needs" ? (room ? "commit.leftNeedsRoom" : "commit.leftNeeds") : room ? "commit.leftWantsRoom" : "commit.leftWants", { v });
    }
  }
  return (
    <section className="section bucket" aria-labelledby={`b-${b.key}`} style={{ gap: 10 }}>
      <h3 id={`b-${b.key}`}>
        <button className="fold-head" aria-expanded={open} aria-controls={`fold-${b.key}`} onClick={onToggle}>
          <span className="row" style={{ gap: 8 }}>
            <span className="sw" style={{ background: b.color, width: 10, height: 10 }} />
            <span className="h3">{t(`bucket.${b.key}`)}</span>
            <span className="cap">{b.share * 100}%</span>
          </span>
          <span className="row" style={{ gap: 8 }}>
            <span className="mono cap" style={{ color: "var(--ink-300)" }}>
              RM {fmt(used)} / {fmt(budget)}
            </span>
            <Icon name="back" className="svg-i chev" />
          </span>
        </button>
      </h3>
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
      <div className={`fold${open ? " open" : ""}`} id={`fold-${b.key}`} inert={!open}>
        <div>
          <div className="list">{children}</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {chips}
          </div>
        </div>
      </div>
    </section>
  );
}
