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
export const AZIMUTH = 48;

export const BASE: Plan = { x: -130, y: -68, w: 260, d: 136, r: 8 };
export const BASE_H = 9;
export const FOOT_H = 5;

export const COLUMNS = 5;
export const ROWS = 5;
export const COLUMN = 38;
export const ROW = 16;
export const columnX = (index: number) => (index - 2) * COLUMN;
export const rowY = (index: number) => (index - 2) * ROW;
export const TILE_W = 34;
export const TILE_D = 13;
export const SHEET_Z = 2;
export const TILE_Z = 3.2;
export const TILE_TOP = 4;

export const RAIL_Y = 56;
export const TRUCK_H = 7;
export const BEAM_Z = 40;
export const BEAM_H = 8;
export const BEAM_TOP = BEAM_Z + BEAM_H;
export const HEAD_REACH = 10;
export const HEAD_H = 7;
export const SLEEVE_Z = 8;
export const SLEEVE_H = 12;
export const PRESS = 3;
export const DIAL_R = 4.6;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [0, -RAIL_Y, BEAM_TOP + HEAD_H + 4],
    [0, RAIL_Y, BEAM_TOP + HEAD_H + 4],
  ],
  WIDTH,
  HEIGHT,
  { pad: 10, azimuth: AZIMUTH }
);

export const at = (point: Point3) => iso(point, P);
export const EX = axisVector(P, [1, 0, 0]);
