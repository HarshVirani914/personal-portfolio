import {
  boxCorners,
  fitProjection,
  iso,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const WIDTH = 600;
export const HEIGHT = 372;
export const AZIMUTH = 62;

export const BASE: Plan = { x: -124, y: -48, w: 248, d: 112, r: 8 };
export const BASE_H = 9;
export const FOOT_H = 5;

export const PIVOT_Z = 96;
export const ARM = 78;
export const BEAM_Y = 2.6;
export const BEAM_H = 4;
export const PAN_Z = 44;
export const PAN_R = 24;
export const PAN_H = 2.4;
export const PAN_TOP = PAN_Z + PAN_H;
export const DROP = 16;
export const REPORT_RISE = 16;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [0, 0, PIVOT_Z + 24],
    [-ARM, 0, PIVOT_Z + 14],
    [ARM, 0, PIVOT_Z + 14],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: AZIMUTH }
);

export const at = (point: Point3) => iso(point, P);
