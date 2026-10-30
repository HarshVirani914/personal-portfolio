import { describe, expect, it } from "vitest";
import { handoffHref } from "@/lib/agent/handoff";

const copy = {
  subject: "Question from your portfolio:",
  greeting: "Hi Harsh,",
  signature: "[Your name, company]",
};

const parse = (href: string) => {
  const url = new URL(href);
  return {
    protocol: url.protocol,
    to: url.pathname,
    subject: url.searchParams.get("subject"),
    body: url.searchParams.get("body"),
  };
};

describe("handoffHref", () => {
  it("addresses a draft to Harsh with the question in it", () => {
    const mail = parse(
      handoffHref({ email: "h@example.com", question: "Is he free?", copy })
    );
    expect(mail.protocol).toBe("mailto:");
    expect(mail.to).toBe("h@example.com");
    expect(mail.subject).toBe("Question from your portfolio: Is he free?");
    expect(mail.body).toBe(
      "Hi Harsh,\r\n\r\nIs he free?\r\n\r\n[Your name, company]"
    );
  });

  it("cuts the subject to the first 60 characters", () => {
    const mail = parse(
      handoffHref({ email: "h@example.com", question: "x".repeat(80), copy })
    );
    expect(mail.subject).toBe(`${copy.subject} ${"x".repeat(60)}`);
    expect(mail.body).toContain("x".repeat(80));
  });

  it("does not split an emoji at the cut", () => {
    const href = handoffHref({
      email: "h@example.com",
      question: `${"x".repeat(59)}😀😀`,
      copy,
    });
    expect(parse(href).subject).toBe(`${copy.subject} ${"x".repeat(59)}😀`);
  });

  it("encodes anything that would break out of the link", () => {
    const href = handoffHref({
      email: "h@example.com",
      question: "a&cc=evil@example.com?b=1#c",
      copy,
    });
    expect(href).not.toContain("&cc=");
    expect(parse(href).subject).toContain("a&cc=evil@example.com?b=1#c");
  });
});
