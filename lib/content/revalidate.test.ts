import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { handleRevalidate } from "@/lib/content/revalidate";
import { contentTags } from "@/lib/content/source";

const secret = "test-secret";

/** Signs a body the way Sanity does: t=<timestamp>,v1=<base64url hmac of "<t>.<body>">. */
function sign(body: string) {
  const timestamp = Date.now();
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("base64url");
  return `t=${timestamp},v1=${digest}`;
}

const post = (body: string, signature?: string) =>
  new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: signature ? { "sanity-webhook-signature": signature } : {},
    body,
  });

describe("revalidation route", () => {
  it("rejects a missing signature", async () => {
    const revalidate = vi.fn();
    const response = await handleRevalidate(post('{"_type":"hero"}'), { secret, revalidate });
    expect(response.status).toBe(401);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("rejects an invalid signature", async () => {
    const revalidate = vi.fn();
    const body = '{"_type":"hero"}';
    const response = await handleRevalidate(post(body, sign('{"_type":"project"}')), { secret, revalidate });
    expect(response.status).toBe(401);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("revalidates the tag for the published document type", async () => {
    const revalidate = vi.fn();
    const body = '{"_type":"hero"}';
    const response = await handleRevalidate(post(body, sign(body)), { secret, revalidate });
    expect(response.status).toBe(200);
    expect(revalidate).toHaveBeenCalledExactlyOnceWith(contentTags.hero);
    expect(await response.json()).toEqual({ revalidated: [contentTags.hero] });
  });

  it("revalidates research when a research document is published", async () => {
    const revalidate = vi.fn();
    const body = '{"_type":"research"}';
    const response = await handleRevalidate(post(body, sign(body)), { secret, revalidate });
    expect(response.status).toBe(200);
    expect(revalidate).toHaveBeenCalledExactlyOnceWith(contentTags.research);
  });

  it("revalidates skills when a skill group is published", async () => {
    const revalidate = vi.fn();
    const body = '{"_type":"skillGroup"}';
    const response = await handleRevalidate(post(body, sign(body)), { secret, revalidate });
    expect(response.status).toBe(200);
    expect(revalidate).toHaveBeenCalledExactlyOnceWith(contentTags.skillGroup);
  });

  it.each([
    ["experience", contentTags.experience],
    ["education", contentTags.education],
    ["certification", contentTags.certification],
  ])("revalidates %s when it is published", async (type, tag) => {
    const revalidate = vi.fn();
    const body = JSON.stringify({ _type: type });
    const response = await handleRevalidate(post(body, sign(body)), { secret, revalidate });
    expect(response.status).toBe(200);
    expect(revalidate).toHaveBeenCalledExactlyOnceWith(tag);
  });

  it("revalidates nothing for a document type the site does not read", async () => {
    const revalidate = vi.fn();
    const body = '{"_type":"sanity.imageAsset"}';
    const response = await handleRevalidate(post(body, sign(body)), { secret, revalidate });
    expect(response.status).toBe(200);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("refuses to run when no secret is configured", async () => {
    const body = '{"_type":"hero"}';
    const response = await handleRevalidate(post(body, sign(body)), { secret: undefined, revalidate: vi.fn() });
    expect(response.status).toBe(500);
  });
});
