/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- audit.mjs is untyped kit code
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import * as A from "@/components/iso/audit.mjs";
import { cardSvg } from "./card";
import { STEM_FROM } from "./frame";
import {
  BENCH,
  BLOCK_ART,
  CHEEK_BACK,
  CHEEK_FRONT,
  DIAL_ART,
  DIVIDERS,
  GANTRY,
  HOPPER,
  HOPPER_FRONT,
  JAW_ART,
  SHEET_ART,
  SHUTTLE_ART,
  STOP_FRONT,
  TRAY_BACK,
  TRAY_FRONT,
  cardAt,
  type Item,
  type Shape,
} from "./geometry";
import {
  COUNT,
  FIELDS,
  THRESHOLD,
  UNSURE,
  flaggedOf,
  poseOf,
  readoutOf,
  tourAt,
} from "./model";
import {
  HOUSING_Z,
  LIFT,
  P,
  READER_TOP,
  READER_X,
  CARD_Z,
  SHUTTLE_TRAVEL,
  STEM_R,
  slotX,
} from "./view";

/** The audit ray-casts every overlap, which is slow on a loaded CI runner. */
const AUDIT_MS = 60_000;
const pose = (t: number) =>
  poseOf(t, slotX, READER_X, LIFT, READER_TOP - CARD_Z);
const none = FIELDS.map(() => false);

const shapeOf = (name: string, shape: Shape) =>
  shape.kind === "slab"
    ? A.slab(shape.plan, shape.z, shape.h, { name }, shape.steps)
    : A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, { name });

function record() {
  const R = A.recorder(P, {
    order: ["shuttle"],
    spring: { stagger: 0.035, stiffness: 64, damping: 14.2, substeps: 4 },
  });
  let key = 0;
  const put = (items: Item[], moving = false) => {
    for (const item of items) {
      if (item.kind !== "solid") continue;
      const shape = R.solid(shapeOf(R.nameFor(item.name), item.shape));
      R.put({
        key: key++,
        name: shape.name,
        piece: moving ? "shuttle" : "",
        move: moving ? [SHUTTLE_TRAVEL, 0, 0] : [0, 0, 0],
        shapes: [shape],
      });
    }
  };
  [
    BENCH,
    GANTRY,
    CHEEK_BACK,
    HOPPER,
    SHEET_ART,
    HOPPER_FRONT,
    CHEEK_FRONT,
    BLOCK_ART,
    DIAL_ART,
    TRAY_BACK,
  ].forEach((items) => put(items));
  for (let index = 0; index < COUNT; index++) {
    if (index > 0) put(DIVIDERS[index - 1]!);
    put(cardAt(index));
  }
  put(TRAY_FRONT);
  put(JAW_ART, true);
  const stem: Item = {
    kind: "solid",
    name: "shuttle.stem",
    paths: {
      fill: "",
      outline: "",
      crease: "",
      top: "",
      shades: ["", "", "", ""],
    },
    shape: {
      kind: "cylinder",
      cx: READER_X,
      cy: 0,
      r: STEM_R,
      z: STEM_FROM,
      h: HOUSING_Z - STEM_FROM + 0.4,
    },
    tone: "mid",
    crease: "none",
    inner: "",
  };
  put([stem], true);
  put(SHUTTLE_ART, true);
  put(STOP_FRONT);
  return R;
}

describe("flag and fill model", () => {
  it("flags exactly the fields under the threshold", () => {
    expect(UNSURE).toEqual(
      FIELDS.flatMap((field, index) => (field.sure < THRESHOLD ? [index] : []))
    );
    expect(UNSURE.length).toBeGreaterThan(0);
    expect(flaggedOf(pose(COUNT), none)).toBe(UNSURE.length);
    expect(flaggedOf(pose(0), none)).toBe(0);
  });

  it("works money out instead of reading it", () => {
    const money = FIELDS.findIndex((field) => field.money);
    expect(pose(money + 0.35).stage).toBe("calculate");
    expect(pose(0.35).stage).toBe("validate");
  });

  it("seats every filed card and shows no card ahead of the machine", () => {
    const mid = pose(3.5);
    expect(
      mid.cards
        .slice(0, 3)
        .every((card) => card.shown === 1 && card.z === 0 && card.x === 0)
    ).toBe(true);
    expect(mid.cards.slice(4).every((card) => card.shown === 0)).toBe(true);
  });

  it("names step, field and flag count in both locales", () => {
    expect(readoutOf(pose(2.1), none, "en")).toBe("read · HS code · 0 flagged");
    expect(readoutOf(pose(COUNT), none, "de")).toBe(
      `fertig · ${COUNT}/${COUNT} · ${UNSURE.length} markiert`
    );
  });

  it("never moves the shuttle past its travel", () => {
    for (let t = 0; t <= COUNT; t += 0.01) {
      const { shuttle } = pose(t);
      expect(shuttle).toBeGreaterThanOrEqual(READER_X - 1e-9);
      expect(shuttle).toBeLessThanOrEqual(READER_X + SHUTTLE_TRAVEL + 1e-9);
    }
  });

  it("clears every flag before the tour loops", () => {
    const run = COUNT / 0.42;
    expect(tourAt(run + 0.1).checked.some(Boolean)).toBe(false);
    expect(
      tourAt(run + 1.1 * (UNSURE.length + 0.5)).checked.filter(Boolean)
    ).toHaveLength(UNSURE.length);
  });
});

describe("flag and fill geometry", { timeout: AUDIT_MS }, () => {
  const R = record();

  it("holds every solid up from the bench", () => {
    const { loose, sunk } = A.supports(R.solids, R.tubes, {});
    expect(loose).toEqual([]);
    expect(sunk).toEqual([]);
  });

  it("lets the shuttle run the whole rail without touching anything", () => {
    for (const state of [0.25, 0.5, 0.75, 1])
      expect(A.solidClearances(R.solids, { state })).toEqual([]);
  });

  it("paints every overlapping pair in true depth order", () => {
    const states = [0, 0.25, 0.5, 0.75, 1];
    const overlaps = A.overlapsOf(R.items, P, { states, skip: A.sameRun });
    // Paint order is the items' order, whatever the shuttle's position: nothing re-sorts live.
    const wrong = overlaps.pairs.filter(
      (pair) => pair.front[pair.a < pair.b ? 0 : 1].area >= overlaps.least
    );
    expect(
      wrong.map(
        (pair) =>
          `${A.labelOf(pair.state)}: ${R.items[pair.a].name} / ${R.items[pair.b].name}`
      )
    ).toEqual([]);
  });
});

describe("flag and fill card", () => {
  const file = join(process.cwd(), "public/figures/flag-and-fill.svg");

  it("ships the still the geometry produces (UPDATE_FIGURES=1 rewrites it)", () => {
    const svg = cardSvg();
    if (process.env.UPDATE_FIGURES) writeFileSync(file, svg);
    expect(readFileSync(file, "utf8")).toBe(svg);
  });

  it("stays light enough to load on hover", () => {
    expect(gzipSync(cardSvg()).byteLength).toBeLessThan(40_000);
  });
});
