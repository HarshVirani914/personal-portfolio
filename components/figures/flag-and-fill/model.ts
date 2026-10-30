/**
 * The figure's one source of truth: a sample shipment of eight fields and the
 * pure pose of the machine at any moment. `t` counts fields filed, so t = 2.5
 * is halfway through the third field. Nothing here touches the DOM.
 */
export type Locale = "en" | "de";
export type Stage =
  "read" | "calculate" | "validate" | "file" | "flag" | "done";

export interface Field {
  name: Record<Locale, string>;
  /** The machine's confidence, 0 to 1. Illustrative: a sample, not a measured run. */
  sure: number;
  /** Money is worked out in code, never by the model. */
  money?: boolean;
}

export const FIELDS: Field[] = [
  { name: { en: "shipper", de: "Versender" }, sure: 0.96 },
  { name: { en: "consignee", de: "Empfänger" }, sure: 0.93 },
  { name: { en: "HS code", de: "HS-Code" }, sure: 0.62 },
  { name: { en: "origin", de: "Ursprung" }, sure: 0.9 },
  { name: { en: "quantity", de: "Menge" }, sure: 0.97 },
  { name: { en: "weight", de: "Gewicht" }, sure: 0.71 },
  { name: { en: "value", de: "Warenwert" }, sure: 1, money: true },
  { name: { en: "tracking", de: "Sendungsnummer" }, sure: 0.95 },
];

export const COUNT = FIELDS.length;
/** Below this the machine does not trust its own reading, so it raises the flag. */
export const THRESHOLD = 0.8;
export const UNSURE = FIELDS.flatMap((field, index) =>
  field.sure < THRESHOLD ? [index] : []
);

/** Parts of one field's cycle, as fractions of it. */
const READ = 0.3;
const CHECK = 0.45;
const CARRY = 0.72;
const DROP = 0.88;

const clamp = (value: number, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};
const between = (u: number, from: number, to: number) =>
  ease((u - from) / (to - from));

export interface CardPose {
  /** 0 is not made yet, 1 is on the machine. */
  shown: number;
  /** World offset from the card's seat in its slot. */
  x: number;
  z: number;
}

export interface Pose {
  index: number;
  stage: Stage;
  shuttle: number;
  jaw: number;
  sheet: number;
  needle: number;
  cards: CardPose[];
  /** Each flag from 0 (down) to 1 (up), before a person has checked it. */
  raised: number[];
}

export function poseOf(
  t: number,
  slotX: (index: number) => number,
  readerX: number,
  lift: number,
  rise: number
): Pose {
  const at = clamp(t, 0, COUNT);
  const whole = Math.floor(at);
  const index = Math.min(whole, COUNT - 1);
  const u = whole >= COUNT ? 1 : at - whole;
  const field = FIELDS[index]!;
  const slot = slotX(index);
  const from = index === 0 ? readerX : slotX(index - 1);
  const done = whole >= COUNT;

  const shuttle =
    u < READ
      ? from + (readerX - from) * between(u, 0, READ)
      : slot + (readerX - slot) * (1 - between(u, CHECK, CARRY));
  const jaw =
    u < CARRY
      ? lift
      : u < DROP
        ? lift * (1 - between(u, CARRY, DROP))
        : lift * between(u, DROP, 1);

  const cards = FIELDS.map((_, slotIndex): CardPose => {
    if (slotIndex < whole) return { shown: 1, x: 0, z: 0 };
    if (slotIndex > index || u < READ)
      return { shown: 0, x: readerX - slotX(slotIndex), z: lift };
    const z =
      u < CHECK
        ? lift - rise * (1 - between(u, READ, CHECK))
        : u < CARRY
          ? lift
          : u < DROP
            ? jaw
            : 0;
    return { shown: clamp((u - READ) / 0.06), x: shuttle - slot, z };
  });

  const raised = FIELDS.map((item, slotIndex) => {
    if (item.sure >= THRESHOLD) return 0;
    if (slotIndex < whole) return 1;
    return slotIndex === index ? between(u, DROP, 1) : 0;
  });

  const checking = between(u, READ * 0.7, CHECK);
  const needle = done ? 0 : checking * field.sure * (1 - between(u, CARRY, 1));
  const sheet = u < READ ? Math.sin((u / READ) * Math.PI) : 0;

  const stage: Stage = done
    ? "done"
    : u < READ
      ? "read"
      : u < CHECK
        ? field.money
          ? "calculate"
          : "validate"
        : u >= DROP && field.sure < THRESHOLD
          ? "flag"
          : "file";

  return { index, stage, shuttle, jaw, sheet, needle, cards, raised };
}

const STAGES: Record<Locale, Record<Stage, string>> = {
  en: {
    read: "read",
    calculate: "calculate",
    validate: "validate",
    file: "file",
    flag: "flag",
    done: "done",
  },
  de: {
    read: "lesen",
    calculate: "rechnen",
    validate: "prüfen",
    file: "ablegen",
    flag: "markieren",
    done: "fertig",
  },
};

const FLAGGED: Record<Locale, string> = { en: "flagged", de: "markiert" };

export const flaggedOf = (pose: Pose, checked: boolean[]) =>
  pose.raised.filter((value, index) => value > 0.5 && !checked[index]).length;

export function readoutOf(pose: Pose, checked: boolean[], locale: Locale) {
  const stage = STAGES[locale][pose.stage];
  const field =
    pose.stage === "done"
      ? `${COUNT}/${COUNT}`
      : FIELDS[pose.index]!.name[locale];
  return `${stage} · ${field} · ${flaggedOf(pose, checked)} ${FLAGGED[locale]}`;
}

/** The idle tour, as a pure function of its clock. */
export const TOUR_RATE = 0.42;
const TOUR_RUN = COUNT / TOUR_RATE;
const TOUR_HOLD = 1.1;
const TOUR_FADE = 0.9;
export const TOUR_LOOP = TOUR_RUN + TOUR_HOLD * (UNSURE.length + 1) + TOUR_FADE;

export function tourAt(clock: number) {
  const at = clock % TOUR_LOOP;
  const after = at - TOUR_RUN;
  const checked = FIELDS.map((_, index) => {
    const order = UNSURE.indexOf(index);
    return order >= 0 && after >= TOUR_HOLD * (order + 1);
  });
  const fade = clamp((at - (TOUR_LOOP - TOUR_FADE)) / TOUR_FADE);
  return { t: Math.min(at * TOUR_RATE, COUNT), checked, fade };
}
