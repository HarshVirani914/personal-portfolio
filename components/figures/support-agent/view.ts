import {
  axisVector,
  boxCorners,
  fitProjection,
  iso,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const WIDTH = 600;
export const HEIGHT = 372;
export const AZIMUTH = 66;

export const BASE: Plan = { x: -128, y: -44, w: 310, d: 92, r: 8 };
export const BASE_H = 9;
export const FOOT_H = 5;

export const LOCK: Plan = { x: -74, y: -26, w: 148, d: 26, r: 2 };
export const SILL: Plan = { x: -74, y: -26, w: 148, d: 44, r: 2 };
export const WALL_TOP = 66;
export const BAR_Z = 58;
export const BAR_Y = 14;
export const PIN_Y = 7;
export const PIN_R = 4.2;
export const DRIVER_H = 9;

export const GATE_X = -80;
export const GATE_LIFT = 22;
export const TRAY_X = -118;
export const CARD_TRAVEL = 16;
export const BELL: [number, number] = [146, 18];

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners(LOCK, 0, WALL_TOP + 14),
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: AZIMUTH }
);

export const at = (point: Point3) => iso(point, P);
export const EX = axisVector(P, [1, 0, 0]);
export const EZ = axisVector(P, [0, 0, 1]);
