import { describe, expect, it } from "vitest";
import { exampleCommitments } from "../engine";
import { fresh, MAX_SAVED_LISTS, normalise } from "./store";

describe("saved commitment lists", () => {
  it("start empty, and older saved data without them still loads", () => {
    expect(fresh().savedLists).toEqual([]);
    expect(normalise({ raw: "3500", payday: "25" }).savedLists).toEqual([]);
  });
  it("keep their name and items through a save and load", () => {
    const s = normalise({ savedLists: [{ id: "a", name: "Now", items: exampleCommitments() }] });
    expect(s.savedLists).toHaveLength(1);
    expect(s.savedLists[0].name).toBe("Now");
    expect(s.savedLists[0].items.reduce((a, x) => a + x.amt, 0)).toBe(1510);
  });
  it("drop broken entries, tidy amounts and cap the count", () => {
    const many = Array.from({ length: MAX_SAVED_LISTS + 5 }, (_, i) => ({ id: "l" + i, name: "List " + i, items: [] }));
    expect(normalise({ savedLists: many }).savedLists).toHaveLength(MAX_SAVED_LISTS);
    const s = normalise({ savedLists: [null, { id: "x" }, { id: "ok", name: "A", items: [{ ...exampleCommitments()[0], amt: -5 }] }] });
    expect(s.savedLists.map((l) => l.id)).toEqual(["ok"]);
    expect(s.savedLists[0].items[0].amt).toBe(0);
  });
});
