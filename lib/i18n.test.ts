import { describe, expect, it } from "vitest";
import { localizedPath, parseLocalePath, switchLocale } from "@/lib/i18n";

describe("parseLocalePath", () => {
  it("treats unprefixed paths as English", () => {
    expect(parseLocalePath("/")).toEqual({ locale: "en", path: "/" });
    expect(parseLocalePath("/about")).toEqual({ locale: "en", path: "/about" });
  });

  it("reads the German prefix", () => {
    expect(parseLocalePath("/de")).toEqual({ locale: "de", path: "/" });
    expect(parseLocalePath("/de/work/flag-and-fill")).toEqual({
      locale: "de",
      path: "/work/flag-and-fill",
    });
  });

  it("does not mistake a path starting with a locale-like word", () => {
    expect(parseLocalePath("/design")).toEqual({
      locale: "en",
      path: "/design",
    });
  });
});

describe("localizedPath", () => {
  it("keeps English unprefixed", () => {
    expect(localizedPath("/about", "en")).toBe("/about");
    expect(localizedPath("/", "en")).toBe("/");
  });

  it("prefixes German", () => {
    expect(localizedPath("/about", "de")).toBe("/de/about");
    expect(localizedPath("/", "de")).toBe("/de");
  });
});

describe("switchLocale", () => {
  it("keeps the visitor on the same page", () => {
    expect(switchLocale("/about", "de")).toBe("/de/about");
    expect(switchLocale("/de/about", "en")).toBe("/about");
    expect(switchLocale("/de", "en")).toBe("/");
  });
});
