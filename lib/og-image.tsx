import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import type { TextPart } from "@/lib/content/types";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const background = "#0e0e0f";
const ink = "#eceae4";
const ink2 = "#c9c7c0";
const muted = "#8e8c86";
const serif = "Instrument Serif";
const mono = "Geist Mono";

/** The dark theme's agent colour, for pages without an accent of their own. */
export const ogAgentAccent = "#7c98ff";

/** One card per page, in that page's language. The id forms the image URL. */
export function ogImageMetadata(alt: string) {
  return [{ id: "card", alt, size: ogSize, contentType: ogContentType }];
}

const faces = [
  { name: serif, query: "Instrument+Serif", style: "normal" },
  { name: serif, query: "Instrument+Serif:ital@1", style: "italic" },
  { name: mono, query: "Geist+Mono", style: "normal" },
] as const;

async function loadFace(query: string, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(text)}`
  ).then((response) => response.text());
  const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`No font file for ${query}`);
  return fetch(url).then((response) => response.arrayBuffer());
}

/**
 * The card's faces, subset to its text. The build already reaches Google Fonts
 * through next/font. If it can't, the card falls back to the default sans.
 */
async function loadFonts(text: string) {
  try {
    return await Promise.all(
      faces.map(async ({ name, query, style }) => ({
        name,
        style,
        weight: 400 as const,
        data: await loadFace(query, text),
      }))
    );
  } catch {
    return undefined;
  }
}

async function render(element: ReactElement, text: string) {
  const fonts = await loadFonts(text);
  return new ImageResponse(element, {
    ...ogSize,
    ...(fonts && { fonts }),
    // ImageResponse caches for a year by default, which would outlive a CMS edit.
    headers: {
      "cache-control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

function Dot({ color }: { color: string }) {
  return (
    <div
      style={{ width: 12, height: 12, borderRadius: 6, background: color }}
    />
  );
}

/** The home card: the name stacked in the centre, so it survives a square crop. */
export function ogHomeImage({
  first,
  last,
  role,
  coordinates,
  focus,
}: {
  first: string;
  last: string;
  role: string;
  coordinates: string;
  focus: string;
}) {
  return render(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background,
        color: ink,
        fontFamily: serif,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 176,
          lineHeight: 0.92,
          letterSpacing: "-0.015em",
        }}
      >
        <div style={{ display: "flex" }}>{first}</div>
        <div style={{ display: "flex", fontStyle: "italic" }}>{last}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: mono,
          fontSize: 22,
          color: muted,
        }}
      >
        <Dot color={ogAgentAccent} />
        {role}
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 48,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: mono,
          fontSize: 18,
          color: muted,
        }}
      >
        <span>{coordinates}</span>
        <span>{focus}</span>
      </div>
    </div>,
    [first, last, role, coordinates, focus].join("")
  );
}

/** The inner-page frame: accent kicker, headline, then the footer line. */
export function ogImage({
  kicker,
  title,
  subtitle,
  name,
  detail,
  accent,
}: {
  kicker: string;
  title: TextPart[];
  subtitle?: string;
  name: string;
  detail?: string;
  accent: string;
}) {
  const words = title.flatMap((part) =>
    part.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, emphasis: part.emphasis }))
  );
  const length = words.map(({ word }) => word).join(" ").length;
  const fontSize = length > 60 ? 76 : length > 34 ? 92 : 132;

  return render(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        background,
        color: ink,
        fontFamily: serif,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: mono,
          fontSize: 22,
          color: accent,
        }}
      >
        <Dot color={accent} />
        {kicker}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Satori lays out flex boxes only, so each word is its own wrapping item. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: "0.24em",
            fontSize,
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
          }}
        >
          {words.map(({ word, emphasis }, i) => (
            <span key={i} style={{ fontStyle: emphasis ? "italic" : "normal" }}>
              {word}
            </span>
          ))}
        </div>
        {subtitle && (
          <div
            style={{
              display: "flex",
              fontSize: 36,
              lineHeight: 1.2,
              color: ink2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 40,
          fontFamily: mono,
          fontSize: 20,
          color: muted,
        }}
      >
        <span style={{ color: ink, flexShrink: 0 }}>{name}</span>
        {detail && <span style={{ textAlign: "right" }}>{detail}</span>}
      </div>
    </div>,
    [kicker, ...words.map(({ word }) => word), subtitle, name, detail]
      .filter(Boolean)
      .join(" ")
  );
}
