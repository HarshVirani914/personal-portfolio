import { pointsAt, type Flat, type Point3 } from "@/components/iso/iso-kit";
import {
  BRIDGE_L,
  BRIDGE_UP,
  HINGE_X,
  P,
  RAIL_H,
  RAIL_TOP,
  RAIL_Y,
} from "./view";

const path = (points: Point3[]) => {
  const flat: Flat[] = pointsAt(points, P);
  return `M${flat.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
};

/** The drawbridge at 0 (raised) to 1 (down), rebuilt each frame: it turns in depth. */
export function bridgeAt(down: number) {
  const angle = ((1 - down) * BRIDGE_UP * Math.PI) / 180;
  const x = HINGE_X + Math.cos(angle) * BRIDGE_L;
  const z = RAIL_TOP + Math.sin(angle) * BRIDGE_L;
  const under = RAIL_H;
  const dx = Math.sin(angle) * under;
  const dz = Math.cos(angle) * under;
  return {
    top: path([
      [HINGE_X, -RAIL_Y, RAIL_TOP],
      [x, -RAIL_Y, z],
      [x, RAIL_Y, z],
      [HINGE_X, RAIL_Y, RAIL_TOP],
    ]),
    side: path([
      [HINGE_X, RAIL_Y, RAIL_TOP],
      [x, RAIL_Y, z],
      [x + dx, RAIL_Y, z - dz],
      [HINGE_X + dx, RAIL_Y, RAIL_TOP - dz],
    ]),
    end: path([
      [x, -RAIL_Y, z],
      [x, RAIL_Y, z],
      [x + dx, RAIL_Y, z - dz],
      [x + dx, -RAIL_Y, z - dz],
    ]),
  };
}
