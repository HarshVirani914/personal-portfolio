import type { Flat } from "@/components/iso/iso-kit";
import { EX, EZ } from "./view";

/** Turns a flat part about a pivot in the world's x-z plane, as a screen matrix. */
export function turnAbout([px, py]: Flat, value: number) {
  const angle = value * (Math.PI / 2);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const det = EX[0] * EZ[1] - EX[1] * EZ[0];
  const inv = [EZ[1] / det, -EX[1] / det, -EZ[0] / det, EX[0] / det] as const;
  const x = [c * inv[0] - s * inv[1], s * inv[0] + c * inv[1]] as const;
  const y = [c * inv[2] - s * inv[3], s * inv[2] + c * inv[3]] as const;
  const a = EX[0] * x[0] + EZ[0] * x[1];
  const b = EX[1] * x[0] + EZ[1] * x[1];
  const e = EX[0] * y[0] + EZ[0] * y[1];
  const f = EX[1] * y[0] + EZ[1] * y[1];
  const fine = (n: number) => Math.round(n * 1e4) / 1e4;
  return `matrix(${fine(a)} ${fine(b)} ${fine(e)} ${fine(f)} ${fine(px - a * px - e * py)} ${fine(py - b * px - f * py)})`;
}
