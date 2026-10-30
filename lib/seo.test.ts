import { describe, expect, it } from "vitest";
import { clipDescription, languageAlternates, pageMetadata } from "@/lib/seo";

const base = { title: "T", description: "D", siteName: "Harsh Virani" };

describe("languageAlternates", () => {
  it("lists the path in every language", () => {
    expect(languageAlternates("/")).toEqual({ en: "/", de: "/de" });
    expect(languageAlternates("/about")).toEqual({
      en: "/about",
      de: "/de/about",
    });
  });
});

describe("clipDescription", () => {
  it("leaves a short description alone", () => {
    expect(clipDescription("Short.")).toBe("Short.");
  });

  it("cuts a long one at a word boundary", () => {
    const clipped = clipDescription("word ".repeat(60).trim());
    expect(clipped.length).toBeLessThanOrEqual(155);
    expect(clipped.endsWith("word…")).toBe(true);
  });
});

describe("pageMetadata", () => {
  it("points the canonical link at the page's own language", () => {
    const en = pageMetadata({ ...base, locale: "en", path: "/about" });
    const de = pageMetadata({ ...base, locale: "de", path: "/about" });
    expect(en.alternates?.canonical).toBe("/about");
    expect(de.alternates?.canonical).toBe("/de/about");
  });

  it("offers both languages and an English default on either page", () => {
    const de = pageMetadata({ ...base, locale: "de", path: "/work/ssri" });
    expect(de.alternates?.languages).toEqual({
      en: "/work/ssri",
      de: "/de/work/ssri",
      "x-default": "/work/ssri",
    });
  });

  it("describes the social card in the page's language", () => {
    const de = pageMetadata({ ...base, locale: "de", path: "/" });
    expect(de.openGraph).toMatchObject({
      url: "/de",
      locale: "de_DE",
      alternateLocale: ["en_US"],
      title: "T",
      description: "D",
    });
    expect(de.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
