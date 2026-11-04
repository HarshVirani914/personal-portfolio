import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { MARKDOWN_PREFIX, prefersMarkdown } from "@/lib/markdown";

/**
 * English is served without a prefix and German under /de. Internally every
 * page lives under app/[locale], so unprefixed paths are rewritten to /en.
 *
 * A request that prefers `text/markdown` is rewritten to the markdown route
 * instead (the Next.js content negotiation pattern, done here because every
 * path is already rewritten for its locale). The markdown response sets
 * `Vary: Accept`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  if (prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = `${MARKDOWN_PREFIX}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*|.*opengraph-image).*)"],
};
