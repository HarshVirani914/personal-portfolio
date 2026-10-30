import {
  onTop,
  pointsAt,
  segment,
  type Flat,
  type Plane,
} from "@/components/iso/iso-kit";
import {
  CARD_TOP,
  DIAL,
  DIAL_R,
  DIAL_SWEEP,
  DIAL_TOP,
  FLAG_L,
  FLAG_Y,
  FLAG_Z,
  HOUSING_Z,
  JAW_H,
  P,
  READER_X,
  STEM_R,
  flagX,
} from "./view";

/** Only what is rebuilt each frame, so the client does not ship or run the static art. */
export const FEED_TRAVEL = 40;
export const STEM_FROM = CARD_TOP + JAW_H;

const [DX, DY] = DIAL;

export const dialPoint = (value: number, r: number): Plane => {
  const angle = -DIAL_SWEEP / 2 + value * DIAL_SWEEP;
  return [DX + Math.sin(angle) * r, DY - Math.cos(angle) * r];
};

export const needleAt = (value: number) =>
  onTop(
    [dialPoint(value, -2.4), dialPoint(value, DIAL_R - 4.4)],
    DIAL_TOP + 0.1,
    P
  );

export const stemAt = (jaw: number) => {
  const r = STEM_R * P.scale;
  const low = pointsAt([[READER_X, 0, STEM_FROM + jaw]], P)[0]!;
  const high = pointsAt([[READER_X, 0, HOUSING_Z]], P)[0]!;
  return `M${low[0] - r} ${low[1]}L${high[0] - r} ${high[1]}L${high[0] + r} ${high[1]}L${low[0] + r} ${low[1]}Z`;
};

/** Flag, drawn lying down along the tray's face and turned up about its pivot. */
const onFace = (x: number, z: number): Flat =>
  pointsAt([[x, FLAG_Y, z]], P)[0]!;
const PLATE: [number, number][] = [
  [FLAG_L - 7, 0],
  [FLAG_L, 0],
  [FLAG_L, 5.4],
  [FLAG_L - 7, 5.4],
];

export function flagArt(index: number) {
  const x = flagX(index);
  const plate = PLATE.map(([px, pz]) => onFace(x + px, FLAG_Z + pz));
  return {
    pivot: onFace(x, FLAG_Z),
    staff: segment([x, FLAG_Y, FLAG_Z], [x + FLAG_L, FLAG_Y, FLAG_Z], P),
    plate: `M${plate.map(([sx, sy]) => `${sx} ${sy}`).join("L")}Z`,
  };
}
