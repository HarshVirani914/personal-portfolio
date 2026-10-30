import { translateAlong } from "@/components/iso/iso-kit";
import { cardShell, paint } from "@/components/figures/shared/card";
import { bridgeAt } from "./frame";
import {
  BENCH,
  COLUMN_ART,
  FLYING,
  FUNNEL,
  HALO,
  PADS,
  PHONE_COINS,
  RACKS,
  RAIL_LEFT,
  RAIL_RIGHT,
  SERVER_COINS,
  STRIPS,
} from "./geometry";
import { HEIGHT, P, PHONE_X, RAIL_TOP, SERVER_X, WIDTH, coinZ } from "./view";

/** The home hover card: the bridge down, one coin idling across it. */
export function cardSvg() {
  const bridge = bridgeAt(1);
  const start = translateAlong(P, [0, 0, RAIL_TOP - coinZ(0)]);
  const across = translateAlong(P, [
    SERVER_X - PHONE_X,
    0,
    RAIL_TOP - coinZ(0),
  ]);
  const css = (value: string) => value.replace(" ", "px,").replace(")", "px)");
  const body = [
    `<path class="iso-halo" d="${HALO}"/>`,
    paint(BENCH),
    paint(PADS),
    paint(STRIPS),
    paint(COLUMN_ART),
    paint(RACKS),
    PHONE_COINS.slice(0, 2).map(paint).join(""),
    paint(RAIL_LEFT),
    `<path class="pp" d="${bridge.end}"/><path class="pp" d="${bridge.side}"/><path class="pp" d="${bridge.top}"/>`,
    paint(RAIL_RIGHT),
    SERVER_COINS.slice(0, 1).map(paint).join(""),
    `<g class="fly">${paint(FLYING)}</g>`,
    paint(FUNNEL),
  ].join("");
  return cardShell({
    width: WIDTH,
    height: HEIGHT,
    accent: "#d4a63a",
    css: `.fly{transform:${css(start)};animation:go 8s ease-in-out infinite alternate}@keyframes go{from{transform:${css(start)}}to{transform:${css(across)}}}`,
    body,
  });
}
