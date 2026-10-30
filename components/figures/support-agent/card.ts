import { translateAlong } from "@/components/iso/iso-kit";
import { cardShell, paint } from "@/components/figures/shared/card";
import { keyPath, springAt, SHANK } from "./frame";
import {
  ANSWER,
  BAR_ART,
  BELL_ART,
  BENCH,
  DRIVERS,
  GATE,
  GUIDE_BACK,
  GUIDE_FRONT,
  HALO,
  KEY_PINS,
  LOCK_ART,
  TRAY_ART,
} from "./geometry";
import { PINS, pinX } from "./model";
import { CARD_TRAVEL, GATE_LIFT, HEIGHT, P, WIDTH, at } from "./view";

const LAMP_Z = 80;

/** The home hover card: the gate open on a grounded answer, which idles into the tray. */
export function cardSvg() {
  const pins = Array.from(
    { length: PINS },
    (_, index) =>
      `<path class="iso-line" data-tone="mid" d="${springAt(index, 0)}"/>${paint(KEY_PINS[index]!)}${paint(DRIVERS[index]!)}`
  ).join("");
  const lamps = Array.from({ length: PINS }, (_, index) => {
    const [cx, cy] = at([pinX(index), -13, LAMP_Z]);
    return `<circle class="lit" cx="${cx}" cy="${cy}" r="1.5"/>`;
  }).join("");
  const slide = translateAlong(P, [-CARD_TRAVEL, 0, 0]);
  const body = [
    `<path class="iso-halo" d="${HALO}"/>`,
    paint(BENCH),
    paint(TRAY_ART),
    `<g class="an">${paint(ANSWER)}</g>`,
    paint(GUIDE_BACK),
    `<g transform="${translateAlong(P, [0, 0, GATE_LIFT])}">${paint(GATE)}</g>`,
    paint(GUIDE_FRONT),
    paint(LOCK_ART),
    lamps,
    pins,
    `<path class="pp" d="${keyPath(0)}"/><path class="pp" d="${SHANK}"/>`,
    paint(BAR_ART),
    paint(BELL_ART),
  ].join("");
  return cardShell({
    width: WIDTH,
    height: HEIGHT,
    accent: "#9a88f0",
    css: `.an{animation:go 7s ease-in-out infinite alternate}@keyframes go{to{transform:${slide.replace(" ", "px,").replace(")", "px)")}}}`,
    body,
  });
}
