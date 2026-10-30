import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { auditLayers } from "@/components/figures/shared/audit";
import { cardSvg } from "./card";
import {
  BENCH,
  PAN_A,
  PAN_B,
  PILLAR,
  PRINTER_ART,
  SCALE_ART,
  WEIGHTS_A,
  WEIGHTS_B,
} from "./geometry";
import {
  LOOP_END,
  PARTNER_A,
  PARTNER_B,
  QUESTIONS,
  REPORTED,
  poseOf,
  readoutOf,
} from "./model";
import { P } from "./view";

const total = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0);

describe("ssri", () => {
  it("scores every answer into the readout", () => {
    expect(readoutOf(poseOf(0), "en")).toBe("question 1/6 · A 0 · B 0");
    expect(readoutOf(poseOf(REPORTED), "en")).toBe(
      `reports ready · A ${total(PARTNER_A)} · B ${total(PARTNER_B)}`
    );
  });

  it("tilts toward the heavier partner, and is level again after the reset", () => {
    expect(poseOf(QUESTIONS).tilt).toBeGreaterThan(0);
    expect(poseOf(LOOP_END).tilt).toBe(0);
  });

  it("prints no report until every question is scored", () => {
    expect(poseOf(QUESTIONS - 0.01).report).toBe(0);
    expect(poseOf(REPORTED).report).toBe(1);
  });

  it("passes the geometry audit", { timeout: 60_000 }, () => {
    const report = auditLayers(
      [
        { items: BENCH },
        { items: PAN_A },
        ...WEIGHTS_A.map((items) => ({ items })),
        { items: PILLAR },
        { items: SCALE_ART },
        { items: PAN_B },
        ...WEIGHTS_B.map((items) => ({ items })),
        { items: PRINTER_ART },
      ],
      P
    );
    expect(report).toEqual({
      loose: [
        "pan",
        "weight",
        "weight#2",
        "weight#3",
        "weight#4",
        "weight#5",
        "weight#6",
        "pan#2",
        "weight#7",
        "weight#8",
        "weight#9",
        "weight#10",
        "weight#11",
        "weight#12",
      ],
      sunk: [],
      moved: [],
      order: [],
    });
  });

  it("ships the still the geometry produces (UPDATE_FIGURES=1 rewrites it)", () => {
    const file = join(process.cwd(), "public/figures/ssri.svg");
    if (process.env.UPDATE_FIGURES) writeFileSync(file, cardSvg());
    expect(readFileSync(file, "utf8")).toBe(cardSvg());
  });
});
