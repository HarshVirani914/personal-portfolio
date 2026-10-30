import {
  corners,
  cylinder,
  insetPlan,
  knurl,
  onTop,
  pathOf,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  segment,
  sideArc,
  sideSeam,
  sideTicks,
  slabOf,
  topTicks,
  type Flat,
  type LineTone,
  type Plan,
  type Plane,
  type SolidPaths,
  type Tone,
} from "@/components/iso/iso-kit";
import { dialPoint } from "./frame";
import { COUNT, THRESHOLD } from "./model";
import {
  BASE,
  BASE_H,
  CARD_D,
  CARD_H,
  CARD_TOP,
  CARD_W,
  CARD_Z,
  DIAL,
  DIAL_H,
  DIAL_R,
  DIAL_SWEEP,
  DIAL_TOP,
  DIAL_Z,
  DIVIDER_TOP,
  FLOOR_H,
  FOOT_H,
  HOUSING_H,
  HOUSING_R,
  HOUSING_Z,
  JAW_H,
  P,
  PITCH,
  POST_W,
  POST_X,
  RAIL_D,
  RAIL_H,
  RAIL_TOP,
  RAIL_Y,
  RAIL_Z,
  READER_TOP,
  READER_X,
  SILL_H,
  TRAY,
  WALL,
  WALL_TOP,
  slotX,
} from "./view";

/** What a part is in the world, kept so the audit test checks what is drawn. */
export type Shape =
  | { kind: "slab"; plan: Plan; z: number; h: number; steps: number }
  | {
      kind: "cylinder";
      cx: number;
      cy: number;
      r: number;
      z: number;
      h: number;
    };

export type Item =
  | {
      kind: "solid";
      name: string;
      paths: SolidPaths;
      shape: Shape;
      tone: Tone;
      crease: Tone | "none";
      inner: string;
    }
  | { kind: "line"; d: string; tone: LineTone; free: boolean }
  | { kind: "dots"; points: Flat[]; size: number; tone: Tone };

interface Style {
  tone?: Tone;
  crease?: Tone | "none";
  bevel?: number;
  steps?: number;
  inner?: string;
}

function slab(
  name: string,
  plan: Plan,
  z: number,
  h: number,
  {
    tone = "mid",
    crease = "faint",
    bevel = 0,
    steps = 3,
    inner = "",
  }: Style = {}
): Item {
  return {
    kind: "solid",
    name,
    paths: slabOf(plan, z, h, P, steps, bevel),
    shape: { kind: "slab", plan, z, h, steps },
    tone,
    crease,
    inner,
  };
}

function post(
  name: string,
  cx: number,
  cy: number,
  r: number,
  z: number,
  h: number,
  {
    tone = "mid",
    crease = "faint",
    bevel = 0,
    steps = 28,
    inner = "",
  }: Style = {}
): Item {
  return {
    kind: "solid",
    name,
    paths: cylinder(cx, cy, r, z, h, P, steps, bevel),
    shape: { kind: "cylinder", cx, cy, r, z, h },
    tone,
    crease,
    inner,
  };
}

const line = (d: string, tone: LineTone = "lo", free?: boolean): Item => ({
  kind: "line",
  d,
  tone,
  free: free ?? false,
});
const dots = (points: Flat[], size = 0.5, tone: Tone = "mid"): Item => ({
  kind: "dots",
  points,
  size,
  tone,
});
const seats = (points: Plane[], z: number) =>
  pointsAt(
    points.map(([x, y]) => [x, y, z]),
    P
  );
const rules = (
  x: number,
  y: number,
  widths: number[],
  gap: number,
  z: number
) =>
  widths
    .map((width, row) =>
      onTop(
        [
          [x, y + row * gap],
          [x + width, y + row * gap],
        ],
        z,
        P
      )
    )
    .join("");

/* Bench */
const STRIP: Plan = {
  x: slotX(0) - 9,
  y: TRAY.y + TRAY.d + 8,
  w: PITCH * COUNT,
  d: 8,
  r: 1,
};
const PLATE: Plan = {
  x: BASE.x + 14,
  y: BASE.y + BASE.d - 28,
  w: 62,
  d: 16,
  r: 2,
};
const stripTicks = topTicks(
  STRIP.x + 9,
  STRIP.x + STRIP.w - 9,
  PITCH / 3,
  3,
  STRIP.y,
  0.6,
  [2, 4.2],
  P
);

export const BENCH: Item[] = [
  ...corners(BASE, 22).flatMap(([x, y]): Item[] => [
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
  slab("bench.strip", STRIP, 0, 0.6, { tone: "lo", crease: "none" }),
  line(stripTicks.minor, "lo"),
  line(stripTicks.major, "mid"),
  slab("bench.plate", PLATE, 0, 0.8, { tone: "lo", crease: "none" }),
  line(planOutline(insetPlan(PLATE, 1.6), 0.8, P), "faint"),
  line(rules(PLATE.x + 11, PLATE.y + 4.8, [40, 28, 34], 3.2, 0.8), "lo", true),
  dots(
    seats(
      [
        [PLATE.x + 5, PLATE.y + 8],
        [PLATE.x + PLATE.w - 5, PLATE.y + 8],
      ],
      0.8
    ),
    0.45
  ),
];

/* Gantry: posts, rail, ruler and end stops, behind everything else */
const RAIL: Plan = {
  x: POST_X[0]! - 8,
  y: RAIL_Y - RAIL_D / 2,
  w: POST_X[1]! - POST_X[0]! + POST_W + 16,
  d: RAIL_D,
  r: 1.4,
};
const RAIL_FACE = RAIL_Y + RAIL_D / 2;
const railTicks = sideTicks(
  READER_X,
  slotX(7),
  PITCH / 3,
  3,
  RAIL_FACE,
  RAIL_TOP,
  [2, 4.2],
  P
);
const STOPS = [READER_X - 15, slotX(7) + 15];

function stopAt(x: number) {
  return slab(
    "gantry.stop",
    { x: x - 1.5, y: RAIL_Y - RAIL_D / 2 - 0.4, w: 3, d: RAIL_D + 0.8, r: 0.6 },
    RAIL_TOP,
    2.2
  );
}

export const GANTRY: Item[] = [
  ...POST_X.flatMap((x): Item[] => {
    const plan: Plan = {
      x,
      y: RAIL_Y - RAIL_D / 2,
      w: POST_W,
      d: RAIL_D,
      r: 1.5,
    };
    return [
      slab("gantry.foot", insetPlan(plan, -3), 0, 2.4, {
        tone: "lo",
        bevel: 0.5,
      }),
      slab("gantry.post", plan, 2.4, RAIL_Z - 2.4),
      dots(
        seats(
          [
            [x - 1, RAIL_Y],
            [x + POST_W + 1, RAIL_Y],
          ],
          2.4
        ),
        0.45
      ),
    ];
  }),
  slab("gantry.rail", RAIL, RAIL_Z, RAIL_H, { bevel: 0.8 }),
  line(railTicks.minor, "lo"),
  line(railTicks.major, "mid"),
  dots(
    seats(
      POST_X.map((x) => [x + POST_W / 2, RAIL_Y]),
      RAIL_TOP
    )
  ),
  stopAt(STOPS[0]!),
];

/** The far stop stands nearer the viewer than the carriage, so it is painted after it. */
export const STOP_FRONT: Item[] = [stopAt(STOPS[1]!)];

/* Hopper: the shipping papers on their platen, on a feed plate that reaches under the reader */
const PLATEN: Plan = { x: -164, y: -26, w: 80, d: 52, r: 2.4 };
const SHEET: Plan = { x: -156, y: -18.5, w: 34, d: 37, r: 0.6 };
const SHEET_Z = 2.4;
const SHEET_H = 1;
const SHEETS = 5;
export const SHEET_TOP = SHEET_Z + SHEETS * SHEET_H;
const nudge = (plan: Plan, index: number): Plan => ({
  ...plan,
  x: plan.x + ((index * 7) % 3) * 0.5 - 0.5,
  y: plan.y + ((index * 5) % 3) * 0.4 - 0.4,
});

function pin(side: number): Item[] {
  return [
    post("hopper.pin", SHEET.x + 17, side * 22.4, 1.6, SHEET_Z, 9, {
      steps: 14,
    }),
    post("hopper.pin-cap", SHEET.x + 17, side * 22.4, 2.4, SHEET_Z + 9, 1.2, {
      steps: 14,
    }),
  ];
}

export const HOPPER: Item[] = [
  slab("hopper.platen", PLATEN, 0, SHEET_Z, { tone: "mid", bevel: 0.6 }),
  line(planOutline(insetPlan(PLATEN, 2), SHEET_Z, P), "faint"),
  dots(seats(corners(PLATEN, 3.4), SHEET_Z), 0.45),
  ...pin(-1),
  ...Array.from({ length: SHEETS }, (_, index) =>
    slab(
      "hopper.sheet",
      nudge(SHEET, index),
      SHEET_Z + index * SHEET_H,
      SHEET_H,
      { tone: "mid", crease: "none", steps: 2 }
    )
  ),
];

export const HOPPER_FRONT: Item[] = pin(1);

/** The sheet that slides under the reader, built on the top of the stack. */
const FEED: Plan = { ...SHEET };
export const SHEET_ART: Item[] = [
  slab("hopper.feed", FEED, SHEET_TOP, 0.6, {
    tone: "hi",
    crease: "none",
    steps: 2,
  }),
  line(
    rules(
      FEED.x + 5,
      FEED.y + 6,
      [20, 14, 23, 17, 21, 10],
      4.6,
      SHEET_TOP + 0.6
    ),
    "lo",
    true
  ),
];

/* Reader: a bridge over the platen with a lamp bar, then the block that prints the card */
const CHEEK_X = -112;
const CHEEK_W = 14;
const BAR: Plan = { x: CHEEK_X - 3, y: -29, w: CHEEK_W + 6, d: 58, r: 1.6 };
const BAR_Z = 22;
const BLOCK: Plan = { x: READER_X - 18, y: -28, w: 36, d: 56, r: 2.4 };
const SLOT_PLAN: Plan = { x: READER_X - 2.2, y: -23, w: 4.4, d: 46, r: 1 };

export const CHEEK_BACK: Item[] = [
  slab(
    "reader.cheek-back",
    { x: CHEEK_X, y: -29, w: CHEEK_W, d: 3, r: 0.6 },
    0,
    BAR_Z,
    { bevel: 0.4 }
  ),
];
export const CHEEK_FRONT: Item[] = [
  slab(
    "reader.cheek-front",
    { x: CHEEK_X, y: 26, w: CHEEK_W, d: 3, r: 0.6 },
    0,
    BAR_Z,
    { bevel: 0.4 }
  ),
  slab("reader.bar", BAR, BAR_Z, 6, { bevel: 0.7 }),
  line(planOutline(insetPlan(BAR, 2.4), BAR_Z + 6, P), "faint"),
  dots(seats(corners(BAR, 3.8), BAR_Z + 6), 0.45),
  post("reader.lamp", CHEEK_X + CHEEK_W / 2, 0, 4, BAR_Z + 6, 2, { steps: 20 }),
];
export const LAMP_AT = pointsAt([[CHEEK_X + CHEEK_W / 2, 0, BAR_Z + 8]], P)[0]!;

/** A closed slot on the block's front face. */
function ventAt(row: number) {
  const y = BLOCK.y + BLOCK.d;
  const [x0, x1] = [BLOCK.x + 7, BLOCK.x + 29];
  const z0 = 11 + row * 2.8;
  const z1 = z0 + 1.2;
  return pathOf(
    pointsAt(
      [
        [x0, y, z0],
        [x1, y, z0],
        [x1, y, z1],
        [x0, y, z1],
      ],
      P
    ),
    true
  );
}

export const BLOCK_ART: Item[] = [
  slab("reader.block", BLOCK, 0, READER_TOP, {
    steps: 5,
    bevel: 0.8,
    inner: sideSeam(BLOCK, 7, P, 5),
  }),
  line(planOutline(SLOT_PLAN, READER_TOP, P, 3), "mid"),
  line(planOutline(insetPlan(SLOT_PLAN, 1), READER_TOP, P, 3), "lo"),
  dots(seats(corners(BLOCK, 4.5), READER_TOP), 0.45),
  ...[0, 1, 2, 3, 4].map((row) => line(ventAt(row), "lo")),
];

/* Dial: how sure the machine is of the field in hand */
const [DX, DY] = DIAL;
const STAND: Plan = { x: DX - 15, y: DY - 15, w: 30, d: 30, r: 3 };
const dialTicks = radialTicks(
  DX,
  DY,
  DIAL_R - 2.6,
  21,
  5,
  DIAL_TOP,
  [1.3, 2.6],
  P,
  -DIAL_SWEEP / 2,
  DIAL_SWEEP * (21 / 20)
);

export const needleAt = (value: number) =>
  onTop(
    [dialPoint(value, -2.4), dialPoint(value, DIAL_R - 4.4)],
    DIAL_TOP + 0.1,
    P
  );

export const DIAL_ART: Item[] = [
  slab("dial.stand", STAND, 0, DIAL_Z, { tone: "lo", bevel: 0.6 }),
  dots(seats(corners(STAND, 3.2), DIAL_Z), 0.45),
  post("dial.puck", DX, DY, DIAL_R, DIAL_Z, DIAL_H, {
    steps: 48,
    inner: sideArc(DX, DY, DIAL_R, DIAL_TOP - 2.6, P, 40),
  }),
  line(knurl(DX, DY, DIAL_R, DIAL_TOP - 2.6, DIAL_TOP, 54, P, 0.1), "faint"),
  line(ring(DX, DY, DIAL_R - 1.2, DIAL_TOP, P, 48), "lo"),
  line(dialTicks.minor, "lo"),
  line(dialTicks.major, "mid"),
  line(ring(DX, DY, 1.6, DIAL_TOP, P, 14), "mid"),
];
export const THRESHOLD_MARK = pointsAt(
  [[...dialPoint(THRESHOLD, DIAL_R - 2), DIAL_TOP]],
  P
)[0]!;

/* Tray: walls, sills and the dividers between pockets */
const T = TRAY;
const SILLS = [T.x + 6, T.x + T.w - 16].map((x): Plan => ({
  x,
  y: T.y + 2,
  w: 10,
  d: T.d - 4,
  r: 1,
}));
const WALL_Z = SILL_H + FLOOR_H;

export const TRAY_BACK: Item[] = [
  ...SILLS.map((plan) => slab("tray.sill", plan, 0, SILL_H, { tone: "lo" })),
  slab("tray.floor", T, SILL_H, FLOOR_H, { tone: "lo", crease: "none" }),
  slab(
    "tray.back",
    { x: T.x, y: T.y, w: T.w, d: WALL, r: 0.4 },
    WALL_Z,
    WALL_TOP - WALL_Z,
    { bevel: 0.3 }
  ),
  slab(
    "tray.left",
    { x: T.x, y: T.y + WALL, w: WALL, d: T.d - WALL * 2, r: 0.3 },
    WALL_Z,
    WALL_TOP - WALL_Z,
    { bevel: 0.3 }
  ),
];

export const DIVIDERS: Item[][] = Array.from(
  { length: COUNT - 1 },
  (_, index) => [
    slab(
      "tray.divider",
      {
        x: slotX(index) + PITCH / 2 - 0.5,
        y: T.y + WALL,
        w: 1,
        d: T.d - WALL * 2,
        r: 0.2,
      },
      WALL_Z,
      DIVIDER_TOP - WALL_Z,
      { crease: "none", steps: 2 }
    ),
  ]
);

const LABEL_W = 12.5;
const labelPlan = (index: number) => ({
  x: slotX(index) - LABEL_W / 2,
  z0: 8,
  z1: 16.4,
});
const FACE_Y = T.y + T.d;

export const TRAY_FRONT: Item[] = [
  slab(
    "tray.right",
    { x: T.x + T.w - WALL, y: T.y + WALL, w: WALL, d: T.d - WALL * 2, r: 0.3 },
    WALL_Z,
    WALL_TOP - WALL_Z,
    { bevel: 0.3 }
  ),
  slab(
    "tray.front",
    { x: T.x, y: T.y + T.d - WALL, w: T.w, d: WALL, r: 0.4 },
    WALL_Z,
    WALL_TOP - WALL_Z,
    { bevel: 0.3 }
  ),
  ...Array.from({ length: COUNT }, (_, index): Item[] => {
    const { x, z0, z1 } = labelPlan(index);
    const left = slotX(index) - LABEL_W / 2 + 1.8;
    return [
      line(
        `${segment([x, FACE_Y, z0], [x + LABEL_W, FACE_Y, z0], P)}${segment([x + LABEL_W, FACE_Y, z0], [x + LABEL_W, FACE_Y, z1], P)}${segment([x + LABEL_W, FACE_Y, z1], [x, FACE_Y, z1], P)}${segment([x, FACE_Y, z1], [x, FACE_Y, z0], P)}`,
        "lo"
      ),
      line(
        `${segment([left, FACE_Y, z1 - 2.8], [left + 8.9, FACE_Y, z1 - 2.8], P)}${segment([left, FACE_Y, z1 - 5.4], [left + 5.4, FACE_Y, z1 - 5.4], P)}`,
        "lo",
        true
      ),
    ];
  }).flat(),
];

/* One card, built in the first slot and moved to the others */
const CARD: Plan = {
  x: slotX(0) - CARD_W / 2,
  y: -CARD_D / 2,
  w: CARD_W,
  d: CARD_D,
  r: 0.2,
};
const CARD_FACE = CARD.x + CARD.w;
export const cardAt = (index: number): Item[] => {
  const dx = PITCH * index;
  const plan = { ...CARD, x: CARD.x + dx };
  const face = CARD_FACE + dx;
  const row = (y0: number, y1: number, z: number) =>
    segment([face, y0, z], [face, y1, z], P);
  return [
    slab("card", plan, CARD_Z, CARD_H, {
      tone: "hi",
      crease: "none",
      steps: 2,
    }),
    line(
      row(-CARD_D / 2 + 4, CARD_D / 2 - 14, CARD_TOP - 3) +
        row(-CARD_D / 2 + 4, CARD_D / 2 - 22, CARD_TOP - 6),
      "lo",
      true
    ),
  ];
};

/* Shuttle: built at the reader, moved along x. Jaw hangs from a stem that slides in the housing. */
const SX = READER_X;
const CARRIAGE: Plan = {
  x: SX - 13,
  y: RAIL_Y - RAIL_D / 2 - 2,
  w: 26,
  d: RAIL_D + 4,
  r: 2,
};
const CARRIAGE_H = 7;
const ARM_Z = RAIL_TOP + 1;
const ARM_H = 5;
const ARM: Plan = {
  x: SX - 3.4,
  y: CARRIAGE.y + CARRIAGE.d,
  w: 6.8,
  d: -(CARRIAGE.y + CARRIAGE.d) + 2,
  r: 1,
};
const HOUSING_TOP = HOUSING_Z + HOUSING_H;
const JAW: Plan = {
  x: SX - 3.4,
  y: -CARD_D / 2 + 3,
  w: 6.8,
  d: CARD_D - 6,
  r: 1,
};
const JAW_Z = CARD_TOP;

/** Jaw, at the height where it grips a seated card; `JAW_LIFT` raises it to carry. */
export const JAW_ART: Item[] = [
  slab("shuttle.jaw", JAW, JAW_Z, JAW_H, { tone: "mid", bevel: 0.4 }),
  dots(
    seats(
      [
        [SX, JAW.y + 3],
        [SX, JAW.y + JAW.d - 3],
      ],
      JAW_Z + JAW_H
    ),
    0.45
  ),
];

export const SHUTTLE_ART: Item[] = [
  post("shuttle.collar", SX, 0, HOUSING_R + 0.8, HOUSING_Z, 2.4),
  post("shuttle.housing", SX, 0, HOUSING_R, HOUSING_Z + 2.4, HOUSING_H - 4.4, {
    inner: sideArc(SX, 0, HOUSING_R, HOUSING_Z + 8, P, 20),
  }),
  post("shuttle.cap", SX, 0, HOUSING_R + 0.8, HOUSING_TOP - 2, 2),
  slab("shuttle.carriage", CARRIAGE, RAIL_TOP, CARRIAGE_H, {
    steps: 3,
    bevel: 0.7,
  }),
  dots(seats(corners(CARRIAGE, 3), RAIL_TOP + CARRIAGE_H), 0.45),
  post("shuttle.thumb", SX - 7, RAIL_Y, 2.6, RAIL_TOP + CARRIAGE_H, 3.2, {
    steps: 18,
    inner: knurl(
      SX - 7,
      RAIL_Y,
      2.6,
      RAIL_TOP + CARRIAGE_H,
      RAIL_TOP + CARRIAGE_H + 3.2,
      14,
      P
    ),
  }),
  slab("shuttle.arm", ARM, ARM_Z, ARM_H, { bevel: 0.5 }),
  dots(
    seats(
      [
        [SX, ARM.y + 3],
        [SX, ARM.y + ARM.d - 3],
      ],
      ARM_Z + ARM_H
    ),
    0.45
  ),
];

export const HALO = slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill;
