/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- audit.mjs is untyped kit code
import * as A from "@/components/iso/audit.mjs";
import type { Item, Shape } from "./parts";

const shapeOf = (name: string, shape: Shape) =>
  shape.kind === "slab"
    ? A.slab(shape.plan, shape.z, shape.h, { name }, shape.steps)
    : A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, { name });

export interface Layer {
  items: Item[];
  /** World travel of a moving part, checked along its whole run. */
  move?: [number, number, number];
}

/**
 * The kit's geometry checks for a figure of plain solids, painted in `layers`
 * order: everything held up from the bench (first solid is `stand.`), nothing
 * sunk, moving parts clear all the way, and true depth wherever two overlap.
 */
export function auditLayers(layers: Layer[], P: unknown) {
  const R = A.recorder(P, {});
  let key = 0;
  for (const { items, move } of layers) {
    for (const item of items) {
      if (item.kind !== "solid") continue;
      const shape = R.solid(shapeOf(R.nameFor(item.name), item.shape));
      R.put({
        key: key++,
        name: shape.name,
        piece: move ? "moving" : "",
        move: move ?? [0, 0, 0],
        shapes: [shape],
      });
    }
  }
  const { loose, sunk } = A.supports(R.solids, [], {});
  const states = [0, 0.25, 0.5, 0.75, 1];
  const moved = states.flatMap((state) =>
    A.solidClearances(R.solids, { state })
  );
  const overlaps = A.overlapsOf(R.items, P, { states });
  const wrong = overlaps.pairs.filter(
    (pair) => pair.front[pair.a < pair.b ? 0 : 1].area >= overlaps.least
  );
  return {
    loose,
    sunk: sunk.map((pair) => `${pair.a} / ${pair.b} ${pair.depth}`),
    moved: moved.map((hit) => JSON.stringify(hit)),
    order: wrong.map(
      (pair) =>
        `${A.labelOf(pair.state)}: ${R.items[pair.a].name} / ${R.items[pair.b].name}`
    ),
  };
}
