import {
  corners,
  insetPlan,
  knurl,
  pathOf,
  pointsAt,
  planOutline,
  ring,
  sideArc,
  sideSeam,
  slabOf,
  topTicks,
  type Plan,
} from "@/components/iso/iso-kit";
import { partsFor, type Item } from "@/components/figures/shared/parts";
import { COINS } from "./model";
import {
  BASE,
  BASE_H,
  BRIDGE_L,
  COIN_H,
  COIN_R,
  FOOT_H,
  FUNNEL_H,
  FUNNEL_Z,
  HINGE_X,
  P,
  PAD_H,
  PHONE_X,
  RAIL_H,
  RAIL_TOP,
  RAIL_Y,
  RAIL_Z,
  SERVER_X,
  coinZ,
} from "./view";

const { slab, post, line, dots, seats, rules } = partsFor(P);

const PHONE: Plan = { x: PHONE_X - 26, y: -40, w: 52, d: 80, r: 8 };
const SERVER: Plan = { x: SERVER_X - 32, y: -34, w: 64, d: 68, r: 2.4 };
const RACK_R = COIN_R + 2.2;
/** Three rods on the far side of the stack, 56 degrees being the camera. */
const backRods = (cx: number) =>
  [186, 236, 286].map((deg): [number, number] => [
    cx + Math.cos((deg * Math.PI) / 180) * RACK_R,
    Math.sin((deg * Math.PI) / 180) * RACK_R,
  ]);
const stripTicks = (cx: number, y: number) =>
  topTicks(cx - 16, cx + 16, 4, 2, y, 0.6, [1.8, 3.4], P);

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

/* The phone lying on the bench, and the server cabinet's plinth */
export const PADS: Item[] = [
  slab("phone", PHONE, 0, PAD_H, { steps: 8, bevel: 0.7, tone: "mid" }),
  line(planOutline(insetPlan(PHONE, 3), PAD_H, P, 6), "lo"),
  line(ring(PHONE_X, -33, 1.1, PAD_H, P, 12), "lo"),
  line(rules(PHONE_X - 10, PHONE.y + PHONE.d - 8, [20], 0, PAD_H), "mid", true),
  slab("server", SERVER, 0, PAD_H, {
    steps: 3,
    bevel: 0.7,
    inner: sideSeam(SERVER, 1.6, P, 3),
  }),
  line(planOutline(insetPlan(SERVER, 2.6), PAD_H, P, 3), "faint"),
  dots(seats(corners(SERVER, 4.4), PAD_H), 0.45),
  ...[-1, 1].map((side) =>
    line(
      planOutline(
        { x: SERVER_X + side * 25 - 2.5, y: -20, w: 5, d: 40, r: 1.6 },
        PAD_H,
        P,
        3
      ),
      "lo"
    )
  ),
];

/* Rods behind each stack, and coin ticks in front of it */
const rack = (cx: number, h: number, name: string): Item[] =>
  backRods(cx).flatMap(([x, y]): Item[] => [
    post(`${name}.rod`, x, y, 1.5, PAD_H, h, { steps: 12 }),
    post(`${name}.rod-cap`, x, y, 2.2, PAD_H + h, 1.2, { steps: 12 }),
  ]);

const CABINET: Plan = { x: SERVER_X - 30, y: -32, w: 60, d: 12, r: 1.6 };
const ventAt = (row: number) => {
  const y = CABINET.y + CABINET.d;
  const [x0, x1, z0] = [CABINET.x + 8, CABINET.x + CABINET.w - 8, 18 + row * 4];
  return pathOf(
    pointsAt(
      [
        [x0, y, z0],
        [x1, y, z0],
        [x1, y, z0 + 1.6],
        [x0, y, z0 + 1.6],
      ],
      P
    ),
    true
  );
};

export const RACKS: Item[] = [
  slab("server.cabinet", CABINET, PAD_H, 46, {
    steps: 3,
    bevel: 0.7,
    inner: sideSeam(CABINET, 12, P, 3),
  }),
  ...[0, 1, 2, 3, 4].map((row) => line(ventAt(row), "lo")),
  dots(seats(corners(CABINET, 2.6), PAD_H + 46), 0.45),
  ...rack(PHONE_X, 42, "phone"),
  ...rack(SERVER_X, 34, "server"),
];

/* Funnel the expenses fall through, held from a column behind the phone */
const COLUMN: Plan = { x: PHONE_X - 4, y: -30, w: 8, d: 6, r: 1 };
const ARM: Plan = { x: PHONE_X - 3, y: -24, w: 6, d: 7.4, r: 0.8 };
const FUNNEL_R = COIN_R + 2.6;
export const COLUMN_ART: Item[] = [
  slab("funnel.column", COLUMN, PAD_H, FUNNEL_Z + 5 - PAD_H, { bevel: 0.4 }),
  slab("funnel.arm", ARM, FUNNEL_Z + 2, 3),
];
export const FUNNEL: Item[] = [
  post("funnel", PHONE_X, 0, FUNNEL_R, FUNNEL_Z, FUNNEL_H, {
    steps: 40,
    bevel: 0.6,
    inner: sideArc(PHONE_X, 0, FUNNEL_R, FUNNEL_Z + 3, P, 28),
  }),
  line(
    knurl(PHONE_X, 0, FUNNEL_R, FUNNEL_Z, FUNNEL_Z + 3, 40, P, 0.1),
    "faint"
  ),
  line(ring(PHONE_X, 0, COIN_R + 0.6, FUNNEL_Z + FUNNEL_H, P, 40), "mid"),
];

/* The rail in two fixed lengths, on posts, with the bridge's gap between */
const LEFT: Plan = {
  x: PHONE_X + COIN_R + 3,
  y: -RAIL_Y,
  w: HINGE_X - PHONE_X - COIN_R - 3,
  d: RAIL_Y * 2,
  r: 0.6,
};
const RIGHT: Plan = {
  x: HINGE_X + BRIDGE_L,
  y: -RAIL_Y,
  w: SERVER_X - COIN_R - 3 - HINGE_X - BRIDGE_L,
  d: RAIL_Y * 2,
  r: 0.6,
};
const railPost = (at: number): Item[] => [
  post("rail.foot", at, 0, 6, 0, 2, { tone: "lo" }),
  post("rail.post", at, 0, 2.6, 2, RAIL_Z - 2, {
    steps: 16,
  }),
];
const railTop = (plan: Plan) => {
  const ticks = topTicks(
    plan.x + 2,
    plan.x + plan.w - 2,
    3,
    3,
    plan.y,
    RAIL_TOP,
    [1.4, 2.6],
    P
  );
  return [
    slab("rail", plan, RAIL_Z, RAIL_H, { crease: "none" }),
    line(ticks.minor, "lo"),
    line(ticks.major, "mid"),
  ];
};
export const RAIL_LEFT: Item[] = [
  ...railPost(LEFT.x + LEFT.w * 0.7),
  ...railTop(LEFT),
];
export const RAIL_RIGHT: Item[] = [
  ...railPost(RIGHT.x + RIGHT.w * 0.25),
  ...railTop(RIGHT),
];

const tick = (cx: number) => {
  const strip: Plan = { x: cx - 18, y: 26, w: 36, d: 7, r: 0.8 };
  const ticks = stripTicks(cx, strip.y);
  return [
    slab("strip", strip, PAD_H, 0.6, { tone: "lo", crease: "none", steps: 2 }),
    line(ticks.minor, "lo"),
    line(ticks.major, "mid"),
  ];
};
export const STRIPS: Item[] = [...tick(PHONE_X), ...tick(SERVER_X)];

export const coinAt = (cx: number, index: number): Item[] => [
  post("coin", cx, 0, COIN_R, coinZ(index), COIN_H, {
    tone: "hi",
    steps: 40,
    bevel: 0.6,
    inner: sideArc(cx, 0, COIN_R, coinZ(index) + COIN_H / 2, P, 28),
  }),
  line(ring(cx, 0, COIN_R - 2.6, coinZ(index) + COIN_H, P, 32), "faint"),
];
export const PHONE_COINS = Array.from({ length: COINS }, (_, index) =>
  coinAt(PHONE_X, index)
);
export const SERVER_COINS = Array.from({ length: COINS }, (_, index) =>
  coinAt(SERVER_X, index)
);
/** The one in flight, built on the phone's pad. */
export const FLYING = coinAt(PHONE_X, 0);

export const HALO = slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill;
