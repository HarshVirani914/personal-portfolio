import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { auditLayers } from "@/components/figures/shared/audit";
import { cardSvg } from "./card";
import {
  BENCH,
  COLUMN_ART,
  FUNNEL,
  PADS,
  PHONE_COINS,
  RACKS,
  RAIL_LEFT,
  RAIL_RIGHT,
  SERVER_COINS,
  STRIPS,
} from "./geometry";
import { COINS, END, LOOP_END, poseOf, readoutOf } from "./model";
import { DROP_FROM, P, RAIL_TOP, coinZ } from "./view";

const pose = (t: number) => poseOf(t, coinZ, DROP_FROM, RAIL_TOP);

describe("pocketpulse", () => {
  it("keeps saving with the bridge up", () => {
    expect(pose(COINS).phone).toBe(COINS);
    expect(pose(COINS).server).toBe(0);
    expect(readoutOf(pose(COINS), "en")).toBe(
      `offline · ${COINS} on phone · 0 on server`
    );
  });

  it("only sends coins across a lowered bridge", () => {
    for (let t = 0; t <= END; t += 0.02) {
      const { flight, bridge } = pose(t);
      if (flight.across > 0) expect(bridge).toBe(1);
    }
    expect(pose(END).server).toBe(COINS);
  });

  it("never loses a coin", () => {
    for (let t = COINS; t < END; t += 0.02) {
      const now = pose(t);
      expect(now.phone + now.server + (now.flight.shown ? 1 : 0)).toBe(COINS);
    }
  });

  it("ends a loop where it starts", () => {
    expect(pose(LOOP_END).bridge).toBe(0);
    expect(pose(LOOP_END).fade).toBe(1);
  });

  it("passes the geometry audit", { timeout: 60_000 }, () => {
    const report = auditLayers(
      [
        { items: BENCH },
        { items: PADS },
        { items: STRIPS },
        { items: COLUMN_ART },
        { items: RACKS },
        ...PHONE_COINS.map((items) => ({ items })),
        { items: RAIL_LEFT },
        { items: RAIL_RIGHT },
        ...SERVER_COINS.map((items) => ({ items })),
        { items: FUNNEL },
      ],
      P
    );
    expect(report).toEqual({ loose: [], sunk: [], moved: [], order: [] });
  });

  it("ships the still the geometry produces (UPDATE_FIGURES=1 rewrites it)", () => {
    const file = join(process.cwd(), "public/figures/pocketpulse.svg");
    if (process.env.UPDATE_FIGURES) writeFileSync(file, cardSvg());
    expect(readFileSync(file, "utf8")).toBe(cardSvg());
  });
});
