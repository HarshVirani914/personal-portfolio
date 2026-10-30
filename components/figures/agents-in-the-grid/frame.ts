import { onTop, pointsAt, type Plane } from "@/components/iso/iso-kit";
import {
  DIAL_R,
  HEAD_H,
  BEAM_TOP,
  HEAD_REACH,
  P,
  SLEEVE_H,
  SLEEVE_Z,
  columnX,
} from "./view";

/** Only what is rebuilt each frame. The head is built over the first column, on row 0. */
export const BUILT_X = columnX(0);
export const HEAD_X = BUILT_X - HEAD_REACH;

export const DIAL_AT_Y = 0;
const DIAL_AT: Plane = [BUILT_X - 3, DIAL_AT_Y];
export const dialAt = (value: number) => {
  const angle = -2.3 + value * 4.6;
  const tip: Plane = [
    DIAL_AT[0] + Math.sin(angle) * (DIAL_R - 1.2),
    DIAL_AT[1] - Math.cos(angle) * (DIAL_R - 1.2),
  ];
  return onTop([DIAL_AT, tip], BEAM_TOP + HEAD_H + 1.2, P);
};

/** The rod between the head and its sleeve, stretched as the sleeve presses down. */
export const rodAt = (press: number) => {
  const r = 1.4 * P.scale;
  const low = pointsAt([[BUILT_X, 0, SLEEVE_Z + SLEEVE_H - press]], P)[0]!;
  const high = pointsAt([[BUILT_X, 0, BEAM_TOP]], P)[0]!;
  return `M${low[0] - r} ${low[1]}L${high[0] - r} ${high[1]}L${high[0] + r} ${high[1]}L${low[0] + r} ${low[1]}Z`;
};
