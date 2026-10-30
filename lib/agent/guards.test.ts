import { describe, expect, it } from "vitest";
import {
  answerKey,
  normalizeQuestion,
  sameOrigin,
  utcDay,
  visitorHash,
} from "@/lib/agent/guards";

describe("normalizeQuestion", () => {
  it("ignores case, spacing and closing punctuation", () => {
    expect(normalizeQuestion("  What   did HE build?! ")).toBe(
      "what did he build"
    );
  });

  it("folds look-alike characters", () => {
    expect(normalizeQuestion("ｗｈａｔ")).toBe("what");
  });
});

describe("answerKey", () => {
  it("changes with the question, the locale and the Knowledge View", () => {
    const base = answerKey("hi", "en", "view");
    expect(answerKey("Hi?", "en", "view")).toBe(base);
    expect(answerKey("hello", "en", "view")).not.toBe(base);
    expect(answerKey("hi", "de", "view")).not.toBe(base);
    expect(answerKey("hi", "en", "edited")).not.toBe(base);
  });
});

describe("visitorHash", () => {
  it("rotates with the salt", () => {
    expect(visitorHash("1.2.3.4", "a")).not.toBe(visitorHash("1.2.3.4", "b"));
  });

  it("does not contain the IP", () => {
    expect(visitorHash("1.2.3.4", "a")).not.toContain("1.2.3.4");
  });
});

describe("utcDay", () => {
  it("rolls over at UTC midnight, not local midnight", () => {
    expect(utcDay(new Date("2026-10-30T23:59:59Z"))).toBe("2026-10-30");
    expect(utcDay(new Date("2026-10-31T00:00:00Z"))).toBe("2026-10-31");
  });
});

describe("sameOrigin", () => {
  const request = (headers: Record<string, string>) =>
    new Request("http://internal/api/agent", { method: "POST", headers });

  it("accepts the page's own origin", () => {
    expect(
      sameOrigin(request({ host: "a.dev", origin: "https://a.dev" }))
    ).toBe(true);
  });

  it("prefers the forwarded host", () => {
    expect(
      sameOrigin(
        request({
          host: "internal",
          "x-forwarded-host": "a.dev",
          origin: "https://a.dev",
        })
      )
    ).toBe(true);
  });

  it("rejects a lookalike and a broken origin", () => {
    expect(
      sameOrigin(request({ host: "a.dev", origin: "https://a.dev.evil.com" }))
    ).toBe(false);
    expect(sameOrigin(request({ host: "a.dev", origin: "null" }))).toBe(false);
  });
});
