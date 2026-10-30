import {
  corners,
  insetPlan,
  planOutline,
  ring,
  segment,
  sideSeam,
  slabOf,
  type Plan,
} from "@/components/iso/iso-kit";
import { partsFor, type Item } from "@/components/figures/shared/parts";
import { FLOOR, PINS, SHEAR, pinFit, pinX } from "./model";
import {
  BAR_Y,
  BAR_Z,
  BASE,
  BASE_H,
  BELL,
  DRIVER_H,
  FOOT_H,
  GATE_X,
  LOCK,
  P,
  PIN_R,
  PIN_Y,
  SILL,
  TRAY_X,
  WALL_TOP,
} from "./view";

const { slab, post, line, dots, seats, rules } = partsFor(P);

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
];

/* The lock body: a sill the key runs on and the cut-away wall behind the pins */
const FACE = LOCK.y + LOCK.d;
const chamber = (x: number) => {
  const w = PIN_R + 1;
  const [z0, z1] = [FLOOR, BAR_Z];
  return `${segment([x - w, FACE, z0], [x - w, FACE, z1], P)}${segment([x + w, FACE, z0], [x + w, FACE, z1], P)}`;
};

export const LOCK_ART: Item[] = [
  slab("lock.sill", SILL, 0, FLOOR, {
    steps: 4,
    bevel: 0.7,
    inner: sideSeam(SILL, 5, P, 4),
  }),
  slab("lock.wall", LOCK, FLOOR, WALL_TOP - FLOOR, {
    steps: 4,
    bevel: 0.7,
    inner: sideSeam(LOCK, SHEAR, P, 4),
  }),
  line(
    Array.from({ length: PINS }, (_, index) => chamber(pinX(index))).join(""),
    "lo"
  ),

  dots(seats(corners(LOCK, 3), WALL_TOP), 0.45),
  ...Array.from({ length: PINS }, (_, index): Item[] => {
    const plan: Plan = { x: pinX(index) - 1, y: -22, w: 2, d: 18, r: 0.2 };
    return [
      slab("source.card", plan, WALL_TOP, 13, {
        tone: "hi",
        crease: "none",
        steps: 2,
      }),
    ];
  }).flat(),
];

export const KEY_PINS: Item[][] = Array.from({ length: PINS }, (_, index) => [
  post(
    "stand.pin",
    pinX(index),
    PIN_Y,
    PIN_R,
    pinFit(index),
    SHEAR - pinFit(index),
    { tone: "hi", steps: 20 }
  ),
]);
export const DRIVERS: Item[][] = Array.from({ length: PINS }, (_, index) => [
  post("stand.driver", pinX(index), PIN_Y, PIN_R, SHEAR, DRIVER_H, {
    steps: 20,
  }),
]);

/* The spring bar, painted over the springs' tops */
const BAR: Plan = { x: LOCK.x, y: 0, w: LOCK.w, d: BAR_Y, r: 1.2 };
export const BAR_ART: Item[] = [
  slab("lock.bar", BAR, BAR_Z, 6, { bevel: 0.6, tone: "mid" }),
  dots(
    seats(
      Array.from({ length: PINS }, (_, index) => [pinX(index), BAR_Y / 2]),
      BAR_Z + 6
    ),
    0.45
  ),
];

/* Gate and output tray: a bar in guides at the lock's end, and where a grounded answer lands */
const GUIDE = (y: number): Plan => ({ x: GATE_X - 3, y, w: 6, d: 4, r: 0.6 });
export const GUIDE_BACK: Item[] = [slab("gate.guide", GUIDE(-20), 0, 46)];
export const GATE: Item[] = [
  slab("gate.bar", { x: GATE_X - 1.4, y: -16, w: 2.8, d: 30, r: 0.4 }, 12, 24, {
    tone: "hi",
    crease: "none",
  }),
];
export const GUIDE_FRONT: Item[] = [
  slab("gate.guide", GUIDE(14), 0, 46),
  slab("gate.head", { x: GATE_X - 4, y: -21, w: 8, d: 40, r: 1 }, 46, 4, {
    bevel: 0.5,
  }),
];

const TRAY: Plan = { x: TRAY_X - 8, y: -24, w: 42, d: 42, r: 1.4 };
export const TRAY_ART: Item[] = [
  slab("tray.floor", TRAY, 0, 2, { tone: "lo", bevel: 0.5 }),
  line(planOutline(insetPlan(TRAY, 2), 2, P), "faint"),
  dots(seats(corners(TRAY, 2.4), 2), 0.4),
];

/** The answer that gets through, built on the lock's side of the gate. */
export const ANSWER: Item[] = [
  slab("answer", { x: GATE_X - 24, y: -15, w: 20, d: 26, r: 0.6 }, 2, 1.2, {
    tone: "hi",
    crease: "none",
    steps: 2,
  }),
  line(rules(GATE_X - 21, -10, [13, 9, 11], 5, 3.2), "lo", true),
];

/* The person, a counter bell for what no source backs up */
const [BX, BY] = BELL;
export const BELL_ART: Item[] = [
  post("bell.foot", BX, BY, 14, 0, 2, { tone: "lo", bevel: 0.5 }),
  post("bell.stem", BX, BY, 1.4, 2, 5, { steps: 12 }),
  post("bell.skirt", BX, BY, 11, 7, 3),
  post("bell.body", BX, BY, 8.6, 10, 5),
  post("bell.crown", BX, BY, 5.4, 15, 3),
  post("bell.button", BX, BY, 1.8, 18, 3, { steps: 12 }),
];
export const BELL_LAMP = seats([[BX, BY]], 21)[0]!;

export const HALO = slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill;
