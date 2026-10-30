import "@/components/iso/iso.css";
import "@/components/figures/shared/figure.css";
import { Parts } from "@/components/figures/shared/art";
import {
  ANSWER,
  BAR_ART,
  BELL_ART,
  BELL_LAMP,
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
import { SupportLive } from "./live";
import type { Locale } from "./model";

const LABELS: Record<Locale, { aria: string; img: string }> = {
  en: {
    aria: "Pin-tumbler gate for a support agent: Space or the arrow keys run the next question",
    img: "A cut-away pin-tumbler lock on a bench. A key stands for a drafted answer and five pins for its claims, each under a source card. When every pin reaches the shear line the gate lifts and the answer passes to a tray. When a pin does not, the key comes out to search again, up to twice, and then a counter bell calls a person.",
  },
  de: {
    aria: "Stiftschloss-Tor für einen Support-Agenten: Leertaste oder Pfeiltasten starten die nächste Frage",
    img: "Ein aufgeschnittenes Stiftschloss auf einer Werkbank. Ein Schlüssel steht für eine entworfene Antwort, fünf Stifte für ihre Aussagen, jeder unter einer Quellkarte. Erreicht jeder Stift die Trennlinie, hebt sich das Tor und die Antwort gelangt in eine Ablage. Sonst kommt der Schlüssel wieder heraus und sucht neu, höchstens zweimal, dann ruft eine Tischglocke eine Person.",
  },
};

const many = (id: string, groups: Parameters<typeof Parts>[0]["items"][]) =>
  groups.map((items, index) => (
    <Parts key={index} id={`${id}-${index}`} items={items} />
  ));

export function SupportAgentFigure({
  locale,
  testId,
}: {
  locale: Locale;
  testId?: string | undefined;
}) {
  const text = LABELS[locale];
  return (
    <SupportLive
      locale={locale}
      testId={testId}
      aria={text.aria}
      label={text.img}
      halo={HALO}
      bellLamp={BELL_LAMP}
      bench={<Parts id="bench" items={BENCH} />}
      tray={<Parts id="tray" items={TRAY_ART} />}
      lock={<Parts id="lock" items={LOCK_ART} />}
      keyPins={many("pin", KEY_PINS)}
      drivers={many("driver", DRIVERS)}
      bar={<Parts id="bar" items={BAR_ART} />}
      guideBack={<Parts id="guide-back" items={GUIDE_BACK} />}
      answer={<Parts id="answer" items={ANSWER} />}
      gate={<Parts id="gate" items={GATE} />}
      guideFront={<Parts id="guide-front" items={GUIDE_FRONT} />}
      bell={<Parts id="bell" items={BELL_ART} />}
    />
  );
}
