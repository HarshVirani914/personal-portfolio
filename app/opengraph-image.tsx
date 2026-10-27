import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { siteConfig } from "@/lib/metadata";

export const alt = `${siteConfig.name} — portfolio homepage`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const OG_SCREENSHOT_PATH = join(
  process.cwd(),
  "public/og/homepage-desktop.png"
);

export default async function Image(): Promise<Response> {
  const imageBuffer = await readFile(OG_SCREENSHOT_PATH);

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
