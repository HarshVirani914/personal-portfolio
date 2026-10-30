import {
  boxCorners,
  fitProjection,
  iso,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const WIDTH = 600;
export const HEIGHT = 372;
export const AZIMUTH = 56;

export const BASE: Plan = { x: -126, y: -56, w: 268, d: 112, r: 8 };
export const BASE_H = 9;
export const FOOT_H = 5;

export const PHONE_X = -74;
export const SERVER_X = 88;
export const PAD_H = 4;
export const COIN_R = 14;
export const COIN_H = 4.4;
export const coinZ = (index: number) => PAD_H + index * COIN_H;

export const RAIL_Z = 58;
export const RAIL_H = 2;
export const RAIL_TOP = RAIL_Z + RAIL_H;
export const RAIL_Y = 7;
export const HINGE_X = -18;
export const BRIDGE_L = 50;
export const BRIDGE_UP = 58;
export const FUNNEL_Z = 74;
export const FUNNEL_H = 10;
export const DROP_FROM = FUNNEL_Z + FUNNEL_H;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [PHONE_X, 0, DROP_FROM + 8],
    [BASE.x, 0, DROP_FROM],
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: AZIMUTH }
);

export const at = (point: Point3) => iso(point, P);
