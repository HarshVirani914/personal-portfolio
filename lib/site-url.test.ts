import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
  it("uses the one setting when present", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://harsh.dev/");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect(getSiteUrl()).toBe("https://harsh.dev");
  });

  it("adds a scheme to a bare host", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "harsh.dev");
    expect(getSiteUrl()).toBe("https://harsh.dev");
  });

  it("falls back to the deployment URL, even when the setting is blank", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect(getSiteUrl()).toBe("https://preview.vercel.app");
  });

  it("falls back to localhost with nothing set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
