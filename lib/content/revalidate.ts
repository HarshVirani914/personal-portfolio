import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { tagForDocumentType } from "@/lib/content/source";

type Options = {
  secret: string | undefined;
  /** Marks a cache tag stale. Injected so the handler runs without Next. */
  revalidate: (tag: string) => void;
};

const json = (body: unknown, status: number) => Response.json(body, { status });

/**
 * Handles Sanity's publish webhook. The webhook projection must include the
 * document type, for example `{ _type }`. A valid signature revalidates the
 * tag for that type; anything else is rejected without touching the cache.
 */
export async function handleRevalidate(
  request: Request,
  { secret, revalidate }: Options
) {
  if (!secret) return json({ message: "Revalidation is not configured" }, 500);

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return json({ message: "Invalid signature" }, 401);
  }

  let type: unknown;
  try {
    type = (JSON.parse(body) as { _type?: unknown })._type;
  } catch {
    return json({ message: "Body is not valid JSON" }, 400);
  }
  if (typeof type !== "string") return json({ message: "Missing _type" }, 400);

  const tag = tagForDocumentType(type);
  if (!tag) return json({ revalidated: [] }, 200);

  revalidate(tag);
  return json({ revalidated: [tag] }, 200);
}
