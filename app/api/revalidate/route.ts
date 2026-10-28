import { revalidateTag } from "next/cache";
import { handleRevalidate } from "@/lib/content/revalidate";

export async function POST(request: Request) {
  return handleRevalidate(request, {
    secret: process.env.SANITY_REVALIDATE_SECRET,
    // expire: 0 so the very next visit sees the published change, not stale content.
    revalidate: (tag) => revalidateTag(tag, { expire: 0 }),
  });
}
