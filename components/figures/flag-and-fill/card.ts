import { ISO_CSS, translateAlong } from "@/components/iso/iso-kit";
import {
  BENCH,
  BLOCK_ART,
  CHEEK_BACK,
  CHEEK_FRONT,
  DIAL_ART,
  DIVIDERS,
  GANTRY,
  HALO,
  HOPPER,
  HOPPER_FRONT,
  JAW_ART,
  SHEET_ART,
  SHUTTLE_ART,
  STOP_FRONT,
  TRAY_BACK,
  TRAY_FRONT,
  cardAt,
} from "./geometry";
import { paint } from "@/components/figures/shared/card";
import { turnAbout } from "./flag-turn";
import { flagArt, needleAt, stemAt } from "./frame";
import { COUNT, UNSURE } from "./model";
import { HEIGHT, LIFT, P, READER_X, WIDTH, slotX } from "./view";

/**
 * The home hover card's figure: one file, no script, always dark like the card
 * it sits on, so it costs the home page nothing until a row is opened. Five
 * cards are filed; the shuttle idles between the reader and the next pocket.
 */
const FILED = 5;
const ACCENT = "#e07aa8";
const PAPER = "#141414";

const TOKENS = `.iso{--anatomy-paper:${PAPER};--anatomy-face:${PAPER};--anatomy-top:#262626;--anatomy-shade-0:#101010;--anatomy-shade-1:#161616;--anatomy-shade-2:#1b1b1b;--anatomy-shade-3:#202020;--anatomy-hi:#d9d7d1;--anatomy-mid:#8e8c86;--anatomy-lo:#5c5b57;--anatomy-faint:#383836;--anatomy-lit:${ACCENT};--anatomy-dot:#eceae4;--anatomy-halo:#000;--anatomy-halo-opacity:.6;--anatomy-weight:.6px}`;

export function cardSvg() {
  const to = slotX(FILED);
  const reach = translateAlong(P, [to - READER_X, 0, 0]);
  const flagBody = Array.from({ length: COUNT }, (_, index) => {
    const art = flagArt(index);
    const up = UNSURE.includes(index) && index < FILED;
    const [px, py] = art.pivot;
    return `<g transform="${turnAbout(art.pivot, up ? 1 : 0)}"><path class="iso-line" data-tone="mid" d="${art.staff}"/><path class="${up ? "fp up" : "fp"}" d="${art.plate}"/></g><circle class="pv" cx="${px}" cy="${py}" r="1.3"/>`;
  }).join("");
  const body = [
    `<path class="iso-halo" d="${HALO}"/>`,
    paint(BENCH),
    paint(GANTRY),
    paint(CHEEK_BACK),
    paint(HOPPER),
    paint(SHEET_ART),
    paint(HOPPER_FRONT),
    paint(CHEEK_FRONT),
    paint(BLOCK_ART),
    paint(DIAL_ART),
    `<path class="iso-line" data-tone="hi" d="${needleAt(0.62)}"/>`,
    paint(TRAY_BACK),
    ...Array.from(
      { length: COUNT },
      (_, index) =>
        `${index ? paint(DIVIDERS[index - 1]!) : ""}${index < FILED ? `<g class="cd">${paint(cardAt(index))}</g>` : ""}`
    ),
    paint(TRAY_FRONT),
    `<g class="sh">${index0()}</g>`,
    paint(STOP_FRONT),
    flagBody,
  ].join("");

  function index0() {
    const held = `<g transform="${translateAlong(P, [READER_X - slotX(0), 0, LIFT])}" class="cd">${paint(cardAt(0))}</g>`;
    return `${held}<g transform="${translateAlong(P, [0, 0, LIFT])}">${paint(JAW_ART)}</g><path class="iso-fill" d="${stemAt(LIFT)}"/><path class="iso-line" data-tone="mid" d="${stemAt(LIFT)}"/>${paint(SHUTTLE_ART)}`;
  }

  const css = `${ISO_CSS}${TOKENS}.cd .iso-shade{fill:#2e2e2c}.fp{fill:${PAPER};stroke:#8e8c86;stroke-width:.6}.fp.up{fill:${ACCENT};stroke:${ACCENT}}.pv{fill:#262626;stroke:#8e8c86;stroke-width:.6}.sh{animation:go 9s cubic-bezier(.45,0,.55,1) infinite alternate}@keyframes go{0%,12%{transform:none}88%,100%{transform:${reach.replace(" ", "px,").replace(")", "px)")}}}@media (prefers-reduced-motion:reduce){.sh{animation:none}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" class="iso" width="${WIDTH}" height="${HEIGHT}"><style>${css}</style>${body}</svg>\n`;
}
