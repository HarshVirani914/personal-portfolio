import { pointsAt, type Flat } from "@/components/iso/iso-kit";
import { BLADE, FLOOR, OUT, keyAt, pinFit, pinX, SHEAR } from "./model";
import { BAR_Z, DRIVER_H, P, PIN_Y } from "./view";

const flat = (x: number, z: number): Flat => pointsAt([[x, PIN_Y, z]], P)[0]!;
const pathOf = (points: Flat[]) =>
  `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;

/** The key's profile for one attempt, at rest in the lock. */
export function keyPath(attempt: number) {
  const top: Flat[] = [];
  for (let s = -BLADE; s <= BLADE; s += 2) top.push(flat(s, keyAt(s, attempt)));
  return `${pathOf([flat(-BLADE, FLOOR), ...top, flat(BLADE, FLOOR)])}Z`;
}

/** The shank and bow, which keep the key's hand clear of the lock. */
export const SHANK = `${pathOf([flat(BLADE, FLOOR), flat(BLADE, 15), flat(BLADE + OUT * 0.55, 15), flat(BLADE + OUT * 0.55, FLOOR)])}Z`;

/** A spring from a driver pin to the bar, as a zigzag in the pins' plane. */
export function springAt(index: number, drift: number) {
  const x = pinX(index);
  const from = SHEAR + DRIVER_H + drift;
  const turns = 8;
  const points: Flat[] = [];
  for (let step = 0; step <= turns; step++) {
    const wide = step === 0 || step === turns ? 0 : step % 2 ? 3 : -3;
    points.push(flat(x + wide, from + ((BAR_Z - from) * step) / turns));
  }
  return pathOf(points);
}

export const pinLength = (index: number) => SHEAR - pinFit(index);
