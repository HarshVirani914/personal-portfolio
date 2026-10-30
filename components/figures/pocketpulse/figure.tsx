import "@/components/iso/iso.css";
import "@/components/figures/shared/figure.css";
import { Parts } from "@/components/figures/shared/art";
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
import { PocketLive } from "./live";
import type { Locale } from "./model";

const LABELS: Record<Locale, { aria: string; img: string }> = {
  en: {
    aria: "Coin racks for an offline expense tracker: arrow keys move through the run, Space lowers or raises the bridge",
    img: "A phone lies on a bench with a rack of coins on it, and a server plinth stands at the other end. Each coin is an expense, and it drops through a funnel onto the phone. A drawbridge in the rail between them stands for the connection: raised, coins simply stack up on the phone; lowered, they cross to the server.",
  },
  de: {
    aria: "Münzständer für einen Offline-Ausgaben-Tracker: Pfeiltasten gehen durch den Ablauf, die Leertaste senkt oder hebt die Brücke",
    img: "Ein Handy liegt auf einer Werkbank mit einem Münzständer darauf, am anderen Ende steht ein Server-Sockel. Jede Münze ist eine Ausgabe und fällt durch einen Trichter auf das Handy. Eine Zugbrücke in der Schiene dazwischen steht für die Verbindung: Oben stapeln sich die Münzen auf dem Handy, unten wandern sie zum Server.",
  },
};

const many = (id: string, groups: Parameters<typeof Parts>[0]["items"][]) =>
  groups.map((items, index) => (
    <Parts key={index} id={`${id}-${index}`} items={items} />
  ));

export function PocketPulseFigure({
  locale,
  testId,
}: {
  locale: Locale;
  testId?: string | undefined;
}) {
  const text = LABELS[locale];
  return (
    <PocketLive
      locale={locale}
      testId={testId}
      aria={text.aria}
      label={text.img}
      halo={HALO}
      bench={<Parts id="bench" items={BENCH} />}
      pads={<Parts id="pads" items={PADS} />}
      racks={<Parts id="racks" items={RACKS} />}
      strips={<Parts id="strips" items={STRIPS} />}
      column={<Parts id="column" items={COLUMN_ART} />}
      phoneCoins={many("phone-coin", PHONE_COINS)}
      serverCoins={many("server-coin", SERVER_COINS)}
      flying={<Parts id="flying" items={FLYING} />}
      railLeft={<Parts id="rail-left" items={RAIL_LEFT} />}
      railRight={<Parts id="rail-right" items={RAIL_RIGHT} />}
      funnel={<Parts id="funnel" items={FUNNEL} />}
    />
  );
}
