import {
  axisVector,
  boxCorners,
  fitProjection,
  iso,
  type Flat,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const WIDTH = 640;
export const HEIGHT = 372;
export const AZIMUTH = 52;

export const BASE: Plan = { x: -176, y: -64, w: 338, d: 126, r: 8 };
export const BASE_H = 9;
export const FOOT_H = 5;

/** The card tray: eight pockets, one per field. */
export const PITCH = 18;
export const SLOT_0 = -24;
export const slotX = (index: number) => SLOT_0 + index * PITCH;
export const TRAY: Plan = { x: -35, y: -28, w: 148, d: 56, r: 2 };
export const SILL_H = 4;
export const FLOOR_H = 2;
export const WALL = 2;
export const WALL_TOP = 24;
export const DIVIDER_TOP = 19;
export const CARD_Z = SILL_H + FLOOR_H;
export const CARD_H = 28;
export const CARD_W = 2.2;
export const CARD_D = 44;
export const CARD_TOP = CARD_Z + CARD_H;

/** The reader's card exit and the shuttle's travel. */
export const READER_X = -60;
export const READER_TOP = 28;
export const LIFT = 30;
export const SHUTTLE_TRAVEL = slotX(7) - READER_X;

export const RAIL_Y = -46;
export const RAIL_D = 8;
export const RAIL_Z = 78;
export const RAIL_H = 8;
export const RAIL_TOP = RAIL_Z + RAIL_H;
export const POST_X = [-126, 128];
export const POST_W = 10;

export const JAW_H = 4;
export const HOUSING_Z = 73;
export const HOUSING_H = 14;
export const HOUSING_R = 6;
export const STEM_R = 1.3;

export const DIAL: Flat = [-60, 43.5];
export const DIAL_R = 13;
export const DIAL_Z = 5;
export const DIAL_H = 6;
export const DIAL_TOP = DIAL_Z + DIAL_H;
/** The dial reads 0 to 1 over this sweep, centred on the far side. */
export const DIAL_SWEEP = 1.6 * Math.PI;

export const FLAG_Y = TRAY.y + TRAY.d + 0.6;
export const FLAG_Z = 20;
export const FLAG_L = 15;
export const flagX = (index: number) => slotX(index) - 7.5;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [POST_X[1]!, RAIL_Y, RAIL_TOP + 7],
    [-134, RAIL_Y, RAIL_TOP + 7],
  ],
  WIDTH,
  HEIGHT,
  { pad: 10, azimuth: AZIMUTH }
);

export const at = (point: Point3) => iso(point, P);
export const EX = axisVector(P, [1, 0, 0]);
export const EZ = axisVector(P, [0, 0, 1]);
