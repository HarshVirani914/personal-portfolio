#!/usr/bin/env node
/**
 * Captures a desktop-width screenshot of the homepage for Open Graph.
 * Scrolls the hero into the vertical center of the 1200x630 viewport.
 *
 * Usage:
 *   node scripts/capture-og-image.mjs
 *   node scripts/capture-og-image.mjs --url https://your-domain.com
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const outputPath = join(projectRoot, "public/og/homepage-desktop.png");

/** Open Graph recommended aspect ratio (1.91:1) */
const VIEWPORT = { width: 1200, height: 630 };
const DEFAULT_URL = "http://127.0.0.1:3000";
const HERO_SELECTOR = "#hero";
/** Scroll past geometric center so the hero sits slightly higher in the OG frame */
const HERO_CAPTURE_LIFT_PX = 72;

const parseUrl = () => {
  const index = process.argv.indexOf("--url");
  if (index === -1 || !process.argv[index + 1]) {
    return DEFAULT_URL;
  }
  return process.argv[index + 1];
};

const waitForPageReady = async (page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(
    () => document.fonts?.ready?.then(() => true),
    { timeout: 15_000 }
  ).catch(() => undefined);
  await page.waitForSelector(HERO_SELECTOR, { state: "visible", timeout: 15_000 });
  await page.waitForTimeout(1500);
};

const centerHeroInViewport = async (page) => {
  await page.evaluate(
    ({ selector, liftPx }) => {
      const hero = document.querySelector(selector);
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const heroCenterY = window.scrollY + rect.top + rect.height / 2;
      const scrollTop = heroCenterY - window.innerHeight / 2 + liftPx;

      window.scrollTo({
        top: Math.max(0, scrollTop),
        left: 0,
        behavior: "instant",
      });
    },
    { selector: HERO_SELECTOR, liftPx: HERO_CAPTURE_LIFT_PX }
  );

  await page.waitForTimeout(400);
};

const main = async () => {
  const targetUrl = parseUrl();
  await mkdir(dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  try {
    await page.emulateMedia({
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await waitForPageReady(page);
    await centerHeroInViewport(page);
    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: false,
    });
    console.log(`OG screenshot saved: ${outputPath} (${VIEWPORT.width}x${VIEWPORT.height})`);
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error("Failed to capture OG image:", error.message);
  console.error("Start the site with: npm run dev");
  console.error("Install Playwright once with: pnpm exec playwright install chromium");
  process.exit(1);
});
