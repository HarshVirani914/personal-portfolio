import { Dots, Line, Solid } from "@/components/iso/react/draw";
import type { Item } from "./parts";

/** Paints parts in the order given. Every root is keyed: see the kit's large-page note. */
export function Parts({ items, id }: { items: Item[]; id: string }) {
  return (
    <g key={id}>
      {items.map((item, index) => {
        if (item.kind === "line")
          return (
            <Line key={index} d={item.d} tone={item.tone} free={item.free} />
          );
        if (item.kind === "dots")
          return (
            <Dots
              key={index}
              points={item.points}
              size={item.size}
              tone={item.tone}
            />
          );
        return (
          <Solid
            key={index}
            paths={item.paths}
            tone={item.tone}
            crease={item.crease}
            inner={item.inner ? <Line d={item.inner} tone="faint" /> : null}
          />
        );
      })}
    </g>
  );
}
