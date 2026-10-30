import { ISO_CSS, dotsSvg, lineSvg, solidSvg } from "@/components/iso/iso-kit";
import type { Item } from "./parts";

export const paint = (items: Item[]) =>
  items
    .map((item) => {
      if (item.kind === "line") return lineSvg(item.d, { tone: item.tone });
      if (item.kind === "dots")
        return dotsSvg(item.points, { size: item.size, tone: item.tone });
      return solidSvg(item.paths, {
        tone: item.tone,
        crease: item.crease,
        inner: item.inner ? lineSvg(item.inner, { tone: "faint" }) : "",
      });
    })
    .join("");

/** One script-free dark file for a hover card. `css` adds the figure's own rules and idle. */
export function cardShell({
  width,
  height,
  accent,
  css,
  body,
}: {
  width: number;
  height: number;
  accent: string;
  css: string;
  body: string;
}) {
  const paper = "#141414";
  const tokens = `.iso{--anatomy-paper:${paper};--anatomy-face:${paper};--anatomy-top:#262626;--anatomy-shade-0:#101010;--anatomy-shade-1:#161616;--anatomy-shade-2:#1b1b1b;--anatomy-shade-3:#202020;--anatomy-hi:#d9d7d1;--anatomy-mid:#8e8c86;--anatomy-lo:#5c5b57;--anatomy-faint:#383836;--anatomy-lit:${accent};--anatomy-dot:#eceae4;--anatomy-halo:#000;--anatomy-halo-opacity:.6;--anatomy-weight:.6px}.lit{fill:${accent};stroke:${accent};stroke-width:.6}.pp{fill:${paper};stroke:#8e8c86;stroke-width:.6}.cd .iso-shade{fill:#2e2e2c}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="iso" width="${width}" height="${height}"><style>${ISO_CSS}${tokens}${css}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>${body}</svg>\n`;
}
