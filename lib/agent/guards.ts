import { createHash } from "node:crypto";
import type { Locale } from "@/lib/i18n";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

/** Two spellings of one question should share an Answer Cache entry. */
export function normalizeQuestion(question: string) {
  return question
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s?!.…]+$/, "");
}

/** Includes the Knowledge View, so a CMS publish retires every old answer. */
export function answerKey(question: string, locale: Locale, knowledge: string) {
  return sha256(
    JSON.stringify([normalizeQuestion(question), locale, sha256(knowledge)])
  );
}

export const visitorHash = (ip: string, salt: string) =>
  sha256(`${salt}:${ip}`);

export const utcDay = (date: Date) => date.toISOString().slice(0, 10);

export function sameOrigin(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Vercel sets these itself, so a client cannot forge them. */
export function clientIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
