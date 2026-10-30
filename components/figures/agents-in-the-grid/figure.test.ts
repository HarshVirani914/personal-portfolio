import { describe, expect, it } from "vitest";
import { auditLayers } from "@/components/figures/shared/audit";
import {
  BENCH,
  BRIDGE_BACK,
  HEAD,
  LEGS,
  ROD_SOLID,
  SLEEVE,
  TILES,
} from "./geometry";
import { LAST, poseOf, readoutOf, tourAt } from "./model";
import { COLUMN, P } from "./view";

describe("agents in the grid", () => {
  it("runs the five stops in order, each named in the readout", () => {
    expect(readoutOf(poseOf(1), "en")).toBe("read · B2:B5 · 2/5");
    expect(readoutOf(poseOf(LAST), "de")).toBe("prüfen · D3 · 5/5");
  });

  it("writes only after reading the whole range and checks only after writing", () => {
    expect(poseOf(1.4).read).toBe(4);
    expect(poseOf(2.9).written).toBe(false);
    expect(poseOf(3.2).checked).toBe(false);
    expect(poseOf(LAST).checked).toBe(true);
  });

  it("stops the head over the written cell", () => {
    expect(poseOf(3).row).toBeCloseTo(2);
    expect(poseOf(3).press).toBe(1);
  });

  it("keeps the tour on the rail", () => {
    for (let clock = 0; clock < 40; clock += 0.1) {
      expect(tourAt(clock)).toBeGreaterThanOrEqual(0);
      expect(tourAt(clock)).toBeLessThanOrEqual(LAST);
    }
  });

  it("passes the geometry audit", () => {
    const travel: [number, number, number] = [LAST * COLUMN, 0, 0];
    const report = auditLayers(
      [
        { items: BENCH },
        { items: TILES },
        { items: LEGS, move: travel },
        { items: BRIDGE_BACK, move: travel },
        { items: SLEEVE, move: travel },
        { items: [ROD_SOLID], move: travel },
        { items: HEAD, move: travel },
      ],
      P
    );
    expect(report).toEqual({ loose: [], sunk: [], moved: [], order: [] });
  });
});
