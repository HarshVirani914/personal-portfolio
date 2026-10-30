import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const background = "#0e0e0f";
const ink = "#eceae4";
const muted = "#8e8c86";

/** The dark theme's agent colour, for pages without an accent of their own. */
export const ogAgentAccent = "#7c98ff";

/**
 * Instrument Serif, subset to the card's text. The build already reaches Google
 * Fonts through next/font. If it can't, the card falls back to the default sans.
 */
async function loadSerif(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Instrument+Serif&text=${encodeURIComponent(text)}`
    ).then((response) => response.text());
    const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

/** The shared social card: one per page, in that page's language. */
export async function ogImage({
  kicker,
  title,
  subtitle,
  name,
  accent,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  name: string;
  accent: string;
}) {
  const serif = await loadSerif(
    [kicker, title, subtitle, name].filter(Boolean).join("")
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background,
        color: ink,
        fontFamily: "Instrument Serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 30,
          color: muted,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: accent,
          }}
        />
        {kicker}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 48 ? 76 : 112,
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: "flex",
              fontSize: 36,
              lineHeight: 1.25,
              color: muted,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ display: "flex", fontSize: 30 }}>{name}</div>
    </div>,
    {
      ...ogSize,
      // ImageResponse caches for a year by default, which would outlive a CMS edit.
      headers: {
        "cache-control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
      ...(serif && {
        fonts: [
          {
            name: "Instrument Serif",
            data: serif,
            weight: 400 as const,
            style: "normal" as const,
          },
        ],
      }),
    }
  );
}
