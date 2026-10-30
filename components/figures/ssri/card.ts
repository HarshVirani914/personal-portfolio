import { translateAlong } from "@/components/iso/iso-kit";
import { cardShell, paint } from "@/components/figures/shared/card";
import { beamAt, hangersAt, panDrop, pointerAt } from "./frame";
import {
  BENCH,
  HALO,
  PAN_A,
  PAN_B,
  PILLAR,
  PRINTER_ART,
  SCALE_ART,
  SHEET_CLIP,
  SHEETS,
  WEIGHTS_A,
  WEIGHTS_B,
} from "./geometry";
import { QUESTIONS, poseOf } from "./model";
import { HEIGHT, P, WIDTH } from "./view";

/** The home hover card: the sample couple part-way through, with a report rising and falling. */
export function cardSvg() {
  const { tilt } = poseOf(QUESTIONS);
  const beam = beamAt(tilt);
  const line = (d: string) =>
    `<path class="iso-line" data-tone="mid" d="${d}"/>`;
  const hung = (side: number, pan: string) =>
    `<g transform="${translateAlong(P, [0, 0, panDrop(tilt, side)])}">${pan}</g>`;
  const body = [
    `<path class="iso-halo" d="${HALO}"/>`,
    paint(BENCH),
    line(hangersAt(tilt, -1)),
    hung(-1, paint(PAN_A) + WEIGHTS_A.map(paint).join("")),
    paint(PILLAR),
    `<path class="pp" d="${beam.top}"/><path class="pp" d="${beam.side}"/><path class="pp" d="${beam.end}"/>`,
    paint(SCALE_ART),
    `<path class="iso-line" style="stroke:#d9805a" d="${pointerAt(tilt)}"/>`,
    line(hangersAt(tilt, 1)),
    hung(1, paint(PAN_B) + WEIGHTS_B.map(paint).join("")),
    paint(PRINTER_ART),
    `<clipPath id="s"><path d="${SHEET_CLIP}"/></clipPath><g clip-path="url(#s)"><g class="rp">${SHEETS.map(paint).join("")}</g></g>`,
  ].join("");
  return cardShell({
    width: WIDTH,
    height: HEIGHT,
    accent: "#d9805a",
    css: `.rp{animation:go 6s ease-in-out infinite alternate}@keyframes go{from{transform:translate(0,14px)}to{transform:none}}`,
    body,
  });
}
