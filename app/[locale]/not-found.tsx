"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, isLocale, localizedPath } from "@/lib/i18n";

export default function NotFound() {
  const param = useParams().locale;
  const locale =
    typeof param === "string" && isLocale(param) ? param : defaultLocale;
  const dict = getDictionary(locale).notFound;

  return (
    <main
      id="main"
      className="flex min-h-svh flex-col justify-center gap-6 px-5 md:px-10 lg:px-16"
    >
      <p className="text-mono text-muted-ink font-mono">404</p>
      <h1 className="text-display-m font-serif tracking-[-0.015em]">
        {dict.title}
      </h1>
      <Link
        href={localizedPath("/", locale)}
        className="text-mono text-ink hover:text-agent flex min-h-11 w-fit items-center font-mono transition-colors duration-200"
      >
        ← {dict.home}
      </Link>
    </main>
  );
}
