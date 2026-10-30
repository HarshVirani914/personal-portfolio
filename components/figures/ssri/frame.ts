import { pointsAt, type Flat, type Point3 } from "@/components/iso/iso-kit";
import { ARM, BEAM_H, BEAM_Y, P, PAN_R, PAN_TOP, PIVOT_Z } from "./view";

const line = (points: Point3[], closed = false) => {
  const flat: Flat[] = pointsAt(points, P);
  return `M${flat.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}${closed ? "Z" : ""}`;
};
const RADIANS = Math.PI / 180;

/** How far a pan sinks at a tilt; `side` is -1 for partner A's. */
export const panDrop = (tilt: number, side: number) =>
  Math.sin(tilt * RADIANS) * ARM * side;

/** The beam, rebuilt each frame because it turns in depth. */
export function beamAt(tilt: number) {
  const c = Math.cos(tilt * RADIANS);
  const s = Math.sin(tilt * RADIANS);
  const point = (x: number, y: number, z: number): Point3 => [
    x * c - z * s,
    y,
    PIVOT_Z + x * s + z * c,
  ];
  return {
    top: line(
      [
        point(-ARM, -BEAM_Y, BEAM_H / 2),
        point(ARM, -BEAM_Y, BEAM_H / 2),
        point(ARM, BEAM_Y, BEAM_H / 2),
        point(-ARM, BEAM_Y, BEAM_H / 2),
      ],
      true
    ),
    side: line(
      [
        point(-ARM, BEAM_Y, BEAM_H / 2),
        point(ARM, BEAM_Y, BEAM_H / 2),
        point(ARM, BEAM_Y, -BEAM_H / 2),
        point(-ARM, BEAM_Y, -BEAM_H / 2),
      ],
      true
    ),
    end: line(
      [
        point(ARM, -BEAM_Y, BEAM_H / 2),
        point(ARM, BEAM_Y, BEAM_H / 2),
        point(ARM, BEAM_Y, -BEAM_H / 2),
        point(ARM, -BEAM_Y, -BEAM_H / 2),
      ],
      true
    ),
  };
}

/** Three hangers from a beam end to its pan's rim. */
export function hangersAt(tilt: number, side: number) {
  const cx = side * ARM;
  const end = PIVOT_Z + panDrop(tilt, side);
  const rim = PAN_TOP + panDrop(tilt, side);
  return [0, 120, 240]
    .map((deg) => {
      const angle = (deg + 62) * RADIANS;
      return line([
        [cx, 0, end],
        [
          cx + Math.cos(angle) * (PAN_R - 1.5),
          Math.sin(angle) * (PAN_R - 1.5),
          rim,
        ],
      ]);
    })
    .join("");
}

/** The pointer on the scale plate. */
export function pointerAt(tilt: number) {
  const angle = tilt * 2.4 * RADIANS;
  return line([
    [Math.sin(angle) * 2, 3.4, PIVOT_Z + 6 + Math.cos(angle) * 2],
    [Math.sin(angle) * 15, 3.4, PIVOT_Z + 6 + Math.cos(angle) * 15],
  ]);
}
