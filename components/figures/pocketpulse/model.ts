/**
 * Offline first, as two coin racks and a drawbridge. Each coin is an expense.
 * It lands on the phone whatever the connection; the bridge is the connection.
 * `t` runs through four drops, the bridge coming down, four crossings and a reset.
 */
export type Locale = "en" | "de";

export const COINS = 4;
const LOWERED = 4.6;
export const END = LOWERED + COINS;
export const LOOP_END = END + 1;
export const REST = COINS;

const clamp = (value: number, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export interface Flight {
  /** 0 at the phone's rack, 1 at the server's. */
  across: number;
  z: number;
  shown: boolean;
}

export interface Pose {
  phone: number;
  server: number;
  bridge: number;
  online: boolean;
  fade: number;
  flight: Flight;
}

export function poseOf(
  time: number,
  stack: (index: number) => number,
  drop: number,
  rail: number
): Pose {
  const t = clamp(time, 0, LOOP_END);
  const bridge = ease((t - COINS) / 0.6) * (1 - ease((t - END) / 0.6));
  const none: Flight = { across: 0, z: 0, shown: false };
  if (t < COINS) {
    const index = Math.floor(t);
    const u = t - index;
    const z = stack(index) + (drop - stack(index)) * (1 - u * u);
    return {
      phone: index,
      server: 0,
      bridge,
      online: false,
      fade: 0,
      flight: u > 0 ? { across: 0, z, shown: true } : none,
    };
  }
  if (t < LOWERED)
    return {
      phone: COINS,
      server: 0,
      bridge,
      online: bridge > 0.5,
      fade: 0,
      flight: none,
    };
  if (t >= END)
    return {
      phone: 0,
      server: COINS,
      bridge,
      online: bridge > 0.5,
      fade: ease(t - END),
      flight: none,
    };
  const index = Math.floor(t - LOWERED);
  const u = t - LOWERED - index;
  const from = stack(COINS - 1 - index);
  const to = stack(index);
  const z =
    u < 0.3
      ? from + (rail - from) * ease(u / 0.3)
      : u < 0.75
        ? rail
        : rail + (to - rail) * ((u - 0.75) / 0.25) ** 2;
  const flight =
    u > 0 ? { across: ease((u - 0.3) / 0.45), z, shown: true } : none;
  return {
    phone: COINS - index - (u > 0 ? 1 : 0),
    server: index,
    bridge,
    online: true,
    fade: 0,
    flight,
  };
}

const WORDS: Record<
  Locale,
  { offline: string; online: string; phone: string; sent: string }
> = {
  en: {
    offline: "offline",
    online: "online",
    phone: "on phone",
    sent: "on server",
  },
  de: {
    offline: "offline",
    online: "online",
    phone: "auf dem Handy",
    sent: "auf dem Server",
  },
};

export function readoutOf(pose: Pose, locale: Locale) {
  const word = WORDS[locale];
  const phone =
    pose.phone + (pose.flight.shown && pose.flight.across === 0 ? 1 : 0);
  return `${pose.online ? word.online : word.offline} · ${Math.min(phone, COINS)} ${word.phone} · ${pose.server} ${word.sent}`;
}

export const RATE = 0.55;
const HOLD = 1.2;
const RUN = LOOP_END / RATE;
const LOOP = RUN + HOLD;
export const tourAt = (clock: number) =>
  Math.min((clock % LOOP) * RATE, LOOP_END);
export const clockOf = (t: number) => t / RATE;
