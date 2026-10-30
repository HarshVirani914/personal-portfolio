import "@/components/iso/iso.css";
import "@/components/figures/shared/figure.css";
import { Parts } from "@/components/figures/shared/art";
import {
  BENCH,
  BRIDGE_BACK,
  HALO,
  HEAD,
  LEGS,
  SLEEVE,
  TILES,
  cellTop,
} from "./geometry";
import { GridLive } from "./live";
import type { Locale } from "./model";

const LABELS: Record<Locale, { aria: string; img: string }> = {
  en: {
    aria: "Reading carriage on a spreadsheet: arrow keys or dragging step through the agent's loop of look, read, reason, act and check",
    img: "A flatbed machine with a spreadsheet of five columns and five rows laid out as tiles. A bridge on two rails carries a reading head across the columns. It looks at the header row, reads a range, stops to reason, presses a value into one cell and checks it.",
  },
  de: {
    aria: "Lesewagen auf einer Tabelle: Pfeiltasten oder Ziehen führen durch die Schleife des Agenten aus Ansehen, Lesen, Abwägen, Handeln und Prüfen",
    img: "Eine Flachbettmaschine mit einer Tabelle aus fünf Spalten und fünf Zeilen als Kacheln. Eine Brücke auf zwei Schienen führt einen Lesekopf über die Spalten. Er sieht die Kopfzeile an, liest einen Bereich, hält zum Abwägen an, drückt einen Wert in eine Zelle und prüft ihn.",
  },
};

export function AgentsInTheGridFigure({
  locale,
  testId,
}: {
  locale: Locale;
  testId?: string | undefined;
}) {
  const text = LABELS[locale];
  return (
    <GridLive
      locale={locale}
      testId={testId}
      aria={text.aria}
      label={text.img}
      halo={HALO}
      rangeCells={[1, 2, 3, 4].map((row) => cellTop(1, row))}
      writtenCell={cellTop(3, 2)}
      bench={<Parts id="bench" items={BENCH} />}
      tiles={<Parts id="tiles" items={TILES} />}
      legs={<Parts id="legs" items={LEGS} />}
      bridgeBack={<Parts id="bridge-back" items={BRIDGE_BACK} />}
      head={<Parts id="head" items={HEAD} />}
      sleeve={<Parts id="sleeve" items={SLEEVE} />}
    />
  );
}
