/**
 * A couple's assessment as a balance. Each answer is scored automatically and
 * lands as a weight on that partner's pan, and the beam shows the gap between
 * them. `t` counts questions, then the two reports, then the reset. Scores are
 * a sample couple, not client data.
 */
export type Locale = "en" | "de";

export const PARTNER_A = [4, 5, 3, 6, 4, 5];
export const PARTNER_B = [3, 4, 4, 3, 5, 2];
export const QUESTIONS = PARTNER_A.length;
export const REPORTED = QUESTIONS + 1;
export const LOOP_END = REPORTED + 1;
/** Beam tilt in degrees per point of gap. */
export const TILT = 1.1;

const sum = (values: number[], count: number) =>
  values.slice(0, count).reduce((total, value) => total + value, 0);
const clamp = (value: number, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export interface Pose {
  question: number;
  a: number;
  b: number;
  /** Degrees; positive sinks partner A's pan. */
  tilt: number;
  /** Per question: 0 falling in, 1 on the pan. */
  landed: number[];
  report: number;
  fade: number;
}

export function poseOf(time: number): Pose {
  const t = clamp(time, 0, LOOP_END);
  const whole = Math.min(Math.floor(t), QUESTIONS);
  const fade = ease(t - REPORTED);
  const landed = PARTNER_A.map((_, index) => ease((t - index) / 0.5));
  const shownA = PARTNER_A.reduce(
    (total, value, index) => total + value * landed[index]!,
    0
  );
  const shownB = PARTNER_B.reduce(
    (total, value, index) => total + value * landed[index]!,
    0
  );
  return {
    question: whole,
    a: sum(PARTNER_A, whole),
    b: sum(PARTNER_B, whole),
    tilt: (shownA - shownB) * TILT * (1 - fade),
    landed,
    report: ease(t - QUESTIONS) * (1 - fade),
    fade,
  };
}

const WORDS: Record<Locale, { question: string; report: string }> = {
  en: { question: "question", report: "reports ready" },
  de: { question: "Frage", report: "Berichte fertig" },
};

export function readoutOf(pose: Pose, locale: Locale) {
  const word = WORDS[locale];
  const stage =
    pose.question >= QUESTIONS
      ? word.report
      : `${word.question} ${pose.question + 1}/${QUESTIONS}`;
  return `${stage} · A ${pose.a} · B ${pose.b}`;
}

export const RATE = 0.5;
const HOLD = 1.6;
const LOOP = LOOP_END / RATE + HOLD;
export const tourAt = (clock: number) =>
  Math.min((clock % LOOP) * RATE, LOOP_END);
export const clockOf = (t: number) => t / RATE;
