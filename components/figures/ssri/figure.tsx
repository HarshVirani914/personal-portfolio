import "@/components/iso/iso.css";
import "@/components/figures/shared/figure.css";
import { Parts } from "@/components/figures/shared/art";
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
import { SsriLive } from "./live";
import type { Locale } from "./model";

const LABELS: Record<Locale, { aria: string; img: string }> = {
  en: {
    aria: "Balance for a couple's retirement assessment: arrow keys answer the next question",
    img: "A balance on a bench with one pan for each partner in a couple. Every answer is scored and lands as a weight, so the beam shows the gap between them on a small scale. When all six sample questions are done a printer in front issues one report for each partner.",
  },
  de: {
    aria: "Waage für das Ruhestands-Assessment eines Paares: Pfeiltasten beantworten die nächste Frage",
    img: "Eine Waage auf einer Werkbank mit je einer Schale pro Person eines Paares. Jede Antwort wird gewertet und landet als Gewicht, sodass der Balken den Abstand zwischen beiden auf einer kleinen Skala zeigt. Sind alle sechs Beispielfragen beantwortet, gibt ein Drucker davor für jede Person einen Bericht aus.",
  },
};

const many = (id: string, groups: Parameters<typeof Parts>[0]["items"][]) =>
  groups.map((items, index) => (
    <Parts key={index} id={`${id}-${index}`} items={items} />
  ));

export function SsriFigure({
  locale,
  testId,
}: {
  locale: Locale;
  testId?: string | undefined;
}) {
  const text = LABELS[locale];
  return (
    <SsriLive
      locale={locale}
      testId={testId}
      aria={text.aria}
      label={text.img}
      halo={HALO}
      bench={<Parts id="bench" items={BENCH} />}
      pillar={<Parts id="pillar" items={PILLAR} />}
      scale={<Parts id="scale" items={SCALE_ART} />}
      panA={<Parts id="pan-a" items={PAN_A} />}
      panB={<Parts id="pan-b" items={PAN_B} />}
      weightsA={many("weight-a", WEIGHTS_A)}
      weightsB={many("weight-b", WEIGHTS_B)}
      printer={<Parts id="printer" items={PRINTER_ART} />}
      sheets={many("sheet", SHEETS)}
      sheetClip={SHEET_CLIP}
    />
  );
}
