/**
 * Grounded or silent, as a pin-tumbler gate. The key is a drafted answer and
 * each pin a claim: the pin only reaches the shear line when the answer fits
 * its source. `t` counts attempts across three questions, 0 to 6.
 */
export type Locale = "en" | "de";

export const PINS = 5;
export const pinX = (index: number) => -48 + index * 24;
export const FLOOR = 12;
export const SHEAR = 36;
export const BLADE = 62;
export const OUT = 96;
/** Height of the key under each pin when the answer fits. */
const FITS = [22, 17, 25, 19, 23];
const LOW = 15;

/** Each attempt's error per pin, as a question's search gets better or runs out. */
const ATTEMPTS: number[][] = [
  [0, 0, 0, 0, 0],
  [0, 0, 6, 0, 0],
  [0, 0, 0, 0, 0],
  [5, 0, 0, 0, 0],
  [0, 0, 0, -5, 0],
  [0, -4, 0, 0, 6],
];
const LAST_OF = [1, 3, 6];
export const END = 6;
/** Where each question comes to rest for the reader. */
export const QUESTION_ENDS = [0.86, 2.86, 6];
export const REST = 0.86;

const clamp = (value: number, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export const pinFit = (index: number) => FITS[index]!;

/** Top of the key at a point on the blade (0 at the blade's centre). */
export function keyAt(s: number, attempt: number) {
  if (Math.abs(s) > BLADE) return FLOOR;
  let top = LOW;
  for (let pin = 0; pin < PINS; pin++) {
    const flank = Math.abs(s - pinX(pin));
    const crest = FITS[pin]! + ATTEMPTS[attempt]![pin]!;
    top = Math.max(top, crest - Math.max(0, flank - 3) * 1.1);
  }
  return Math.max(LOW, top);
}

export interface Pose {
  attempt: number;
  question: number;
  tries: number;
  tried: number;
  key: number;
  drift: number[];
  fits: number;
  passed: boolean;
  gate: number;
  card: number;
  shown: number;
  u: number;
  human: boolean;
}

export function poseOf(time: number): Pose {
  const t = clamp(time, 0, END);
  const attempt = Math.max(0, Math.ceil(t) - 1);
  const u = t - attempt;
  const question = LAST_OF.findIndex((last) => attempt < last);
  const first = question === 0 ? 0 : LAST_OF[question - 1]!;
  const passed = ATTEMPTS[attempt]!.every((error) => error === 0);
  const leaves = passed ? 0.9 : 0.74;
  const key =
    u < 0.5
      ? OUT * (1 - ease(u / 0.5))
      : OUT * ease((u - leaves) / (1 - leaves));
  const drift = FITS.map((fit, pin) => keyAt(pinX(pin) - key, attempt) - fit);
  const gate = passed
    ? ease((u - 0.66) / 0.1) * (1 - ease((u - 0.86) / 0.06))
    : 0;
  return {
    attempt,
    question,
    tries: LAST_OF[question]! - first,
    tried: attempt - first + 1,
    key,
    drift,
    fits: drift.filter((value) => Math.abs(value) < 0.3).length,
    passed: passed && u >= 0.66,
    u,
    gate,
    card: passed ? ease((u - 0.74) / 0.1) : 0,
    shown: passed ? ease((u - 0.72) / 0.04) * (1 - ease((u - 0.9) / 0.1)) : 0,
    human: attempt === END - 1 && u >= 0.74,
  };
}

const WORDS: Record<
  Locale,
  {
    attempt: string;
    claims: string;
    checking: string;
    grounded: string;
    again: string;
    person: string;
  }
> = {
  en: {
    attempt: "try",
    claims: "claims",
    checking: "checking",
    grounded: "grounded",
    again: "search again",
    person: "to a person",
  },
  de: {
    attempt: "Versuch",
    claims: "Aussagen",
    checking: "prüft",
    grounded: "belegt",
    again: "neu suchen",
    person: "an eine Person",
  },
};

export function readoutOf(pose: Pose, locale: Locale) {
  const word = WORDS[locale];
  const settled = pose.u >= 0.74;
  const state = pose.human
    ? word.person
    : pose.passed
      ? word.grounded
      : settled
        ? word.again
        : word.checking;
  return `${word.attempt} ${pose.tried}/3 · ${pose.fits}/${PINS} ${word.claims} · ${state}`;
}

export const RATE = 0.4;
const HOLD = 1.4;
const LOOP = END / RATE + HOLD;
export const tourAt = (clock: number) => Math.min((clock % LOOP) * RATE, END);
export const clockOf = (t: number) => t / RATE;
