import {
  corners,
  insetPlan,
  knurl,
  pathOf,
  pointsAt,
  planOutline,
  ring,
  segment,
  sideArc,
  sideSeam,
  slabOf,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";
import { partsFor, type Item } from "@/components/figures/shared/parts";
import { PARTNER_A, PARTNER_B } from "./model";
import {
  ARM,
  BASE,
  BASE_H,
  FOOT_H,
  P,
  PAN_H,
  PAN_R,
  PAN_TOP,
  PAN_Z,
  PIVOT_Z,
} from "./view";

const { slab, post, line, dots, seats } = partsFor(P);

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

/* Pillar, with a scale plate behind the pointer */
const SCALE: Plan = { x: -18, y: 0, w: 36, d: 3, r: 0.6 };
const tick = (deg: number, big: boolean) => {
  const a = (deg * Math.PI) / 180;
  const [r0, r1] = [big ? 12.4 : 13.6, 15];
  return segment(
    [Math.sin(a) * r0, 3, PIVOT_Z + 6 + Math.cos(a) * r0],
    [Math.sin(a) * r1, 3, PIVOT_Z + 6 + Math.cos(a) * r1],
    P
  );
};
const arc = pathOf(
  pointsAt(
    Array.from({ length: 13 }, (_, step): Point3 => {
      const a = ((-30 + step * 5) * Math.PI) / 180;
      return [Math.sin(a) * 15, 3, PIVOT_Z + 6 + Math.cos(a) * 15];
    }),
    P
  )
);
export const PILLAR: Item[] = [
  post("pillar.foot", 0, 0, 20, 0, 3, { tone: "lo", steps: 40, bevel: 0.6 }),
  post("pillar.step", 0, 0, 12, 3, 4, { steps: 32, bevel: 0.5 }),
  line(knurl(0, 0, 12, 3.4, 6.6, 32, P, 0.1), "faint"),
  post("pillar.column", 0, 0, 4.6, 7, PIVOT_Z - 11, {
    inner: [28, 56].map((z) => sideArc(0, 0, 4.6, z, P, 16)).join(""),
  }),
  post("pillar.head", 0, 0, 6.4, PIVOT_Z - 4, 4, { steps: 24 }),
];
export const SCALE_ART: Item[] = [
  slab("pillar.neck", { x: -3, y: -2.5, w: 6, d: 5, r: 1 }, PIVOT_Z, 6),
  slab("pillar.scale", SCALE, PIVOT_Z + 6, 20, {
    steps: 2,
    inner: sideSeam(SCALE, PIVOT_Z + 8, P, 2),
  }),
  line(arc, "mid"),
  line(
    [-30, -20, -10, 10, 20, 30]
      .map((deg) => tick(deg, Math.abs(deg) === 30))
      .join(""),
    "lo"
  ),
  line(tick(0, true), "hi"),
];

const pan = (cx: number): Item[] => [
  post("pan", cx, 0, PAN_R, PAN_Z, PAN_H, {
    tone: "mid",
    steps: 48,
    bevel: 0.6,
  }),
  line(ring(cx, 0, PAN_R - 3, PAN_TOP, P, 40), "faint"),
];
export const PAN_A = pan(-ARM);
export const PAN_B = pan(ARM);

/** One weight per answer, stacked on the pan; heavier answers are thicker. */
const weights = (cx: number, values: number[]) => {
  let z = PAN_TOP;
  return values.map((value, index): Item[] => {
    const h = value * 1.5;
    const r = 13 - index * 1.3;
    const item = post("weight", cx, 0, r, z, h, {
      tone: "hi",
      steps: 28,
      inner: sideArc(cx, 0, r, z + h / 2, P, 20),
    });
    z += h;
    return [item];
  });
};
export const WEIGHTS_A = weights(-ARM, PARTNER_A);
export const WEIGHTS_B = weights(ARM, PARTNER_B);

/* Printer, one sheet per respondent */
const PRINTER: Plan = { x: -36, y: 26, w: 72, d: 26, r: 2.4 };
const PRINTER_H = 16;
const slot = (x: number): Plan => ({ x: x - 12, y: 37, w: 24, d: 4, r: 1 });
export const PRINTER_ART: Item[] = [
  slab("printer", PRINTER, 0, PRINTER_H, {
    steps: 4,
    bevel: 0.7,
    inner: sideSeam(PRINTER, 5, P, 4),
  }),
  ...[-16, 16].map((x) => line(planOutline(slot(x), PRINTER_H, P, 3), "mid")),
  dots(seats(corners(PRINTER, 3.6), PRINTER_H), 0.45),
];
export const SHEETS = [-16, 16].map((x): Item[] => [
  slab("report", { x: x - 10, y: 38.4, w: 20, d: 1.2, r: 0.1 }, PRINTER_H, 18, {
    tone: "hi",
    crease: "none",
    steps: 2,
  }),
  line(
    `${segment([x - 7, 39.6, PRINTER_H + 14], [x + 6, 39.6, PRINTER_H + 14], P)}${segment([x - 7, 39.6, PRINTER_H + 10], [x + 3, 39.6, PRINTER_H + 10], P)}`,
    "lo",
    true
  ),
]);

/** Sheets show only above their slots: they rise out of the printer's top. */
export const SHEET_CLIP = [-16, 16]
  .map((x) => {
    const [a, b] = pointsAt(
      [
        [x - 12, 39, PRINTER_H],
        [x + 12, 39, PRINTER_H],
      ],
      P
    );
    return `M${a![0]} ${a![1]}L${b![0]} ${b![1]}L${b![0]} ${b![1] - 60}L${a![0]} ${a![1] - 60}Z`;
  })
  .join("");

export const HALO = slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill;
