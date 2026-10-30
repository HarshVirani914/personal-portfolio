/** The agent's loop on a sheet. `t` runs 0 to 4: one unit per stop along the rail. */
export type Locale = "en" | "de";

export const STAGES: Record<Locale, string[]> = {
  en: ["look", "read", "reason", "act", "check"],
  de: ["ansehen", "lesen", "abwägen", "handeln", "prüfen"],
};
const RANGES = ["A1:E1", "B2:B5", "B2:B5", "D3", "D3"];

export const LAST = STAGES.en.length - 1;
export const RATE = 0.34;
const HOLD = 1.6;
const SWEEP = LAST / RATE;
const LOOP = 2 * (SWEEP + HOLD);

const clamp = (value: number, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export const tourAt = (clock: number) => {
  const at = clock % LOOP;
  if (at < SWEEP) return at * RATE;
  if (at < SWEEP + HOLD) return LAST;
  if (at < 2 * SWEEP + HOLD) return LAST - (at - SWEEP - HOLD) * RATE;
  return 0;
};
export const clockOf = (t: number) => clamp(t, 0, LAST) / RATE;

export interface Pose {
  stage: number;
  /** Row the head sits over, 0 to 4, fractional while it sweeps. */
  row: number;
  /** How many of the four cells in the range have been read. */
  read: number;
  /** The head's dial, 0 to 1 while the model reasons. */
  thought: number;
  press: number;
  written: boolean;
  checked: boolean;
}

export function poseOf(t: number): Pose {
  const at = clamp(t, 0, LAST);
  const sweep = clamp((at - 0.7) / 0.6);
  const toRow =
    at < 0.7
      ? 0
      : at < 1.3
        ? 1 + 3 * sweep
        : 4 + (2 - 4) * ease((at - 1.3) / 1.5);
  return {
    stage: Math.round(at),
    row: toRow,
    read: clamp(sweep * 4, 0, 4),
    thought: ease((at - 1.6) / 0.8),
    press: Math.max(0, 1 - Math.abs(at - 3) / 0.22),
    written: at >= 2.95,
    checked: at >= 3.85,
  };
}

export function readoutOf(pose: Pose, locale: Locale) {
  return `${STAGES[locale][pose.stage]} · ${RANGES[pose.stage]} · ${pose.stage + 1}/${LAST + 1}`;
}
