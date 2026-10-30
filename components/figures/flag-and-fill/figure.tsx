import "@/components/iso/iso.css";
import "@/components/figures/shared/figure.css";
import "./figure.css";
import { Parts } from "@/components/figures/shared/art";
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
  THRESHOLD_MARK,
  LAMP_AT,
  cardAt,
} from "./geometry";
import { FlagAndFillLive } from "./live";
import { COUNT, type Locale } from "./model";

const LABELS: Record<Locale, { aria: string; img: string }> = {
  en: {
    aria: "Card sorter for a customs declaration: arrow keys file the next field, Space lets a person check a flagged field",
    img: "A bench machine that sorts a customs declaration into a card tray. Shipping papers wait in a hopper and slide under a reader. A dial shows how sure the machine is of each field. A shuttle on a rail carries one card per field into its pocket, and when the machine is unsure a small flag rises on the tray for a person to check.",
  },
  de: {
    aria: "Kartensortierer für eine Zollanmeldung: Pfeiltasten legen das nächste Feld ab, die Leertaste lässt eine Person ein markiertes Feld prüfen",
    img: "Eine Tischmaschine, die eine Zollanmeldung in einen Kartenkasten sortiert. Versanddokumente warten im Magazin und gleiten unter einen Leser. Eine Anzeige zeigt, wie sicher die Maschine bei jedem Feld ist. Ein Schlitten auf einer Schiene trägt je Feld eine Karte in ihr Fach, und ist die Maschine unsicher, hebt sich am Kasten eine kleine Fahne, damit eine Person prüft.",
  },
};

export function FlagAndFillFigure({
  locale,
  testId,
}: {
  locale: Locale;
  testId?: string | undefined;
}) {
  const text = LABELS[locale];
  return (
    <FlagAndFillLive
      locale={locale}
      testId={testId}
      aria={text.aria}
      label={text.img}
      halo={HALO}
      thresholdMark={THRESHOLD_MARK}
      lampAt={LAMP_AT}
      bench={<Parts id="bench" items={BENCH} />}
      gantry={<Parts id="gantry" items={GANTRY} />}
      hopper={<Parts id="hopper" items={HOPPER} />}
      hopperFront={<Parts id="hopper-front" items={HOPPER_FRONT} />}
      cheekBack={<Parts id="cheek-back" items={CHEEK_BACK} />}
      sheet={<Parts id="sheet" items={SHEET_ART} />}
      cheekFront={<Parts id="cheek-front" items={CHEEK_FRONT} />}
      block={<Parts id="block" items={BLOCK_ART} />}
      dial={<Parts id="dial" items={DIAL_ART} />}
      trayBack={<Parts id="tray-back" items={TRAY_BACK} />}
      dividers={DIVIDERS.map((items, index) => (
        <Parts key={index} id={`divider-${index}`} items={items} />
      ))}
      cards={Array.from({ length: COUNT }, (_, index) => (
        <Parts key={index} id={`card-${index}`} items={cardAt(index)} />
      ))}
      trayFront={<Parts id="tray-front" items={TRAY_FRONT} />}
      jaw={<Parts id="jaw" items={JAW_ART} />}
      shuttle={<Parts id="shuttle" items={SHUTTLE_ART} />}
      stopFront={<Parts id="stop-front" items={STOP_FRONT} />}
    />
  );
}
