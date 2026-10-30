import {
  cylinder,
  onTop,
  pointsAt,
  slabOf,
  type Flat,
  type LineTone,
  type Plan,
  type Plane,
  type Projection,
  type SolidPaths,
  type Tone,
} from "@/components/iso/iso-kit";

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

export interface Style {
  tone?: Tone;
  crease?: Tone | "none";
  bevel?: number;
  steps?: number;
  inner?: string;
}

/** The part builders, bound to one figure's camera. */
export function partsFor(P: Projection) {
  const slab = (
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
  ): Item => ({
    kind: "solid",
    name,
    paths: slabOf(plan, z, h, P, steps, bevel),
    shape: { kind: "slab", plan, z, h, steps },
    tone,
    crease,
    inner,
  });
  const post = (
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
  ): Item => ({
    kind: "solid",
    name,
    paths: cylinder(cx, cy, r, z, h, P, steps, bevel),
    shape: { kind: "cylinder", cx, cy, r, z, h },
    tone,
    crease,
    inner,
  });
  const line = (d: string, tone: LineTone = "lo", free = false): Item => ({
    kind: "line",
    d,
    tone,
    free,
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
  return { slab, post, line, dots, seats, rules };
}
