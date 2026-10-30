import {
  corners,
  insetPlan,
  knurl,
  sideArc,
  planOutline,
  ring,
  sideSeam,
  slabOf,
  topTicks,
  type Plan,
} from "@/components/iso/iso-kit";
import { partsFor, type Item } from "@/components/figures/shared/parts";
import { BUILT_X, DIAL_AT_Y, HEAD_X } from "./frame";
import {
  BASE,
  BASE_H,
  BEAM_H,
  BEAM_TOP,
  BEAM_Z,
  COLUMN,
  COLUMNS,
  DIAL_R,
  FOOT_H,
  HEAD_H,
  HEAD_REACH,
  P,
  RAIL_Y,
  ROW,
  ROWS,
  SHEET_Z,
  SLEEVE_H,
  SLEEVE_Z,
  TILE_D,
  TILE_W,
  TILE_Z,
  TRUCK_H,
  columnX,
  rowY,
} from "./view";

const { slab, post, line, dots, seats, rules } = partsFor(P);

/* Bench and rails */
const RAIL = (y: number): Plan => ({
  x: BASE.x + 12,
  y: y - 4,
  w: BASE.w - 24,
  d: 8,
  r: 1,
});
const railTicks = (y: number) =>
  topTicks(
    columnX(0) - HEAD_REACH,
    columnX(4) - HEAD_REACH,
    COLUMN / 5,
    5,
    y - 4,
    2.4,
    [1.6, 3.6],
    P
  );
const stops = (y: number): Item[] =>
  [BASE.x + 15, BASE.x + BASE.w - 18].map((x) =>
    slab("rail.stop", { x, y: y - 5, w: 3, d: 10, r: 0.6 }, 2.4, 3.4)
  );
const railParts = (y: number): Item[] => {
  const ticks = railTicks(y);
  return [
    slab("rail", RAIL(y), 0, 2.4, { bevel: 0.5 }),
    line(ticks.minor, "lo"),
    line(ticks.major, "mid"),
    ...stops(y),
  ];
};
const SHEET: Plan = {
  x: columnX(0) - COLUMN / 2 - 3,
  y: rowY(0) - ROW / 2 - 3,
  w: COLUMN * COLUMNS + 6,
  d: ROW * ROWS + 6,
  r: 2,
};

export const BENCH: Item[] = [
  ...corners(BASE, 20).flatMap(([x, y]): Item[] => [
    post("stand.flange", x, y, 8, -BASE_H - FOOT_H, 1.6, { tone: "lo" }),
    post("stand.foot", x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6),
  ]),
  slab("stand.base", BASE, -BASE_H, BASE_H, { steps: 8, bevel: 1.6 }),
  line(planOutline(insetPlan(BASE, 4.5), 0, P), "lo"),
  line(
    corners(BASE, 11)
      .map(([x, y]) => ring(x, y, 2.2, 0, P, 16))
      .join(""),
    "lo"
  ),
  dots(seats(corners(BASE, 11), 0)),
  ...railParts(-RAIL_Y),
  slab("sheet.bed", SHEET, 0, SHEET_Z, { tone: "lo", steps: 4, bevel: 0.6 }),
  dots(seats(corners(SHEET, 2.4), SHEET_Z), 0.4),
];

/* One tile per cell, painted far column first, far row first */
export const TILES: Item[] = Array.from({ length: COLUMNS }, (_, column) =>
  Array.from({ length: ROWS }, (_, row): Item[] => {
    const plan: Plan = {
      x: columnX(column) - TILE_W / 2,
      y: rowY(row) - TILE_D / 2,
      w: TILE_W,
      d: TILE_D,
      r: 0.8,
    };
    const head = row === 0;
    const widths = head
      ? [20]
      : [[10, 22, 15, 26, 18][(column * 3 + row) % 5]!];
    return [
      slab("sheet.tile", plan, SHEET_Z, TILE_Z - SHEET_Z, {
        tone: head ? "mid" : "lo",
        crease: "none",
        steps: 2,
      }),
      line(
        rules(plan.x + 4, plan.y + 6.5, widths, 0, TILE_Z),
        head ? "mid" : "lo",
        true
      ),
    ];
  }).flat()
).flat();

/** A cell's top, for the overlays that light it. */
export const cellTop = (column: number, row: number) =>
  planOutline(
    {
      x: columnX(column) - TILE_W / 2,
      y: rowY(row) - TILE_D / 2,
      w: TILE_W,
      d: TILE_D,
      r: 0.8,
    },
    TILE_Z,
    P,
    2
  );

/* Bridge: built over the first column. The back truck and beam, then the head, then the front truck. */
const X = HEAD_X;
const truck = (y: number): Plan => ({
  x: X - 9,
  y: y - 6,
  w: 18,
  d: 12,
  r: 1.6,
});
const riser = (y: number): Plan => ({
  x: X - 4,
  y: y - 3.4,
  w: 8,
  d: 6.8,
  r: 1,
});
const legParts = (y: number): Item[] => [
  slab("bridge.truck", truck(y), 2.4, TRUCK_H - 2.4, { bevel: 0.5 }),
  dots(seats(corners(truck(y), 2.2), TRUCK_H), 0.45),
  slab("bridge.leg", riser(y), TRUCK_H, BEAM_Z - TRUCK_H),
];
const BEAM: Plan = {
  x: X - 5,
  y: -RAIL_Y - 4,
  w: 10,
  d: RAIL_Y * 2 + 8,
  r: 1.2,
};
const beamTicks = topTicks(
  rowY(0),
  rowY(4),
  ROW / 4,
  4,
  X + 3,
  BEAM_TOP,
  [1, 2],
  P,
  "y"
);

export const LEGS: Item[] = [...legParts(-RAIL_Y), ...legParts(RAIL_Y)];

export const BRIDGE_BACK: Item[] = [
  slab("bridge.beam", BEAM, BEAM_Z, BEAM_H, {
    bevel: 0.6,
    inner: sideSeam(BEAM, BEAM_Z + 3, P, 3),
  }),
  line(beamTicks.minor, "lo"),
  line(beamTicks.major, "mid"),
  dots(
    seats(
      [
        [X, -RAIL_Y],
        [X, RAIL_Y],
      ],
      BEAM_TOP
    )
  ),
];

/* Head: a saddle on the beam reaching over the cell it works on */
const SADDLE: Plan = { x: X - 7, y: -9, w: HEAD_REACH + 13, d: 18, r: 1.6 };
export const HEAD: Item[] = [
  slab("head.saddle", SADDLE, BEAM_TOP, HEAD_H, { steps: 4, bevel: 0.6 }),
  dots(seats(corners(SADDLE, 2.2), BEAM_TOP + HEAD_H), 0.45),
  post("head.dial", BUILT_X - 3, DIAL_AT_Y, DIAL_R, BEAM_TOP + HEAD_H, 1.2, {
    steps: 24,
  }),
  line(
    ring(BUILT_X - 3, DIAL_AT_Y, DIAL_R - 0.8, BEAM_TOP + HEAD_H + 1.2, P, 24),
    "faint"
  ),
];
export const SLEEVE: Item[] = [
  post("head.tip", BUILT_X, 0, 2, SLEEVE_Z, 2, { steps: 16 }),
  post("head.sleeve", BUILT_X, 0, 3.4, SLEEVE_Z + 2, SLEEVE_H - 2, {
    steps: 20,
    inner: `${knurl(BUILT_X, 0, 3.4, SLEEVE_Z + 6, SLEEVE_Z + 10, 16, P, 0)}${sideArc(BUILT_X, 0, 3.4, SLEEVE_Z + 6, P, 16)}${sideArc(BUILT_X, 0, 3.4, SLEEVE_Z + 10, P, 16)}`,
  }),
];
export const ROD_SOLID = post(
  "head.rod",
  BUILT_X,
  0,
  1.4,
  SLEEVE_Z + SLEEVE_H,
  BEAM_TOP - SLEEVE_Z - SLEEVE_H
);

export const HALO = slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill;
