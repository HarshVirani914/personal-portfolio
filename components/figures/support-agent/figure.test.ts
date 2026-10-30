import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { auditLayers } from "@/components/figures/shared/audit";
import { cardSvg } from "./card";
import {
  BAR_ART,
  BELL_ART,
  BENCH,
  DRIVERS,
  GATE,
  GUIDE_BACK,
  GUIDE_FRONT,
  KEY_PINS,
  LOCK_ART,
  TRAY_ART,
} from "./geometry";
import { END, PINS, poseOf, readoutOf } from "./model";
import { P } from "./view";

describe("support agent", () => {
  it("lifts the gate only when every pin fits", () => {
    for (let t = 0; t <= END; t += 0.02) {
      const pose = poseOf(t);
      if (pose.gate > 0.5) expect(pose.fits).toBe(PINS);
    }
  });

  it("lets one question through at once, one after one retry, and sends one to a person", () => {
    expect(poseOf(0.86).passed).toBe(true);
    expect(poseOf(2).passed).toBe(false);
    expect(poseOf(2.86).passed).toBe(true);
    const silent = poseOf(END);
    expect(silent.passed).toBe(false);
    expect(silent.human).toBe(true);
    expect(silent.tried).toBe(3);
    expect(readoutOf(silent, "en")).toContain("to a person");
  });

  it("passes the geometry audit", { timeout: 60_000 }, () => {
    const report = auditLayers(
      [
        { items: BENCH },
        { items: TRAY_ART },
        { items: GUIDE_BACK },
        { items: GATE },
        { items: GUIDE_FRONT },
        { items: LOCK_ART },
        ...KEY_PINS.flatMap((items, index) => [
          { items },
          { items: DRIVERS[index]! },
        ]),
        { items: BAR_ART },
        { items: BELL_ART },
      ],
      P
    );
    expect(report).toEqual({ loose: [], sunk: [], moved: [], order: [] });
  });
});

describe("support agent card", () => {
  it("ships the still the geometry produces (UPDATE_FIGURES=1 rewrites it)", () => {
    const file = join(process.cwd(), "public/figures/support-agent.svg");
    if (process.env.UPDATE_FIGURES) writeFileSync(file, cardSvg());
    expect(readFileSync(file, "utf8")).toBe(cardSvg());
  });
});
