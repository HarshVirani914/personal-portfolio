"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, isLocale, localizedPath } from "@/lib/i18n";

const LINE_DELAY = 300;

export default function NotFound() {
  const param = useParams().locale;
  const locale =
    typeof param === "string" && isLocale(param) ? param : defaultLocale;
  const dict = getDictionary(locale).notFound;

  return (
    <main
      id="main"
      className="flex min-h-svh flex-col justify-center gap-8 px-5 md:px-10 lg:px-16"
    >
      <p className="text-display-xl flex w-fit overflow-hidden font-serif tracking-[-0.03em]">
        {["4", "0", "4"].map((digit, index) => (
          <span
            key={index}
            className="animate-mask-rise inline-block"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {digit}
          </span>
        ))}
      </p>
      {/* The dot draws the line, then stops where the page would have been. */}
      <div aria-hidden="true" className="relative h-px w-full max-w-md">
        <div
          className="animate-draw bg-hairline absolute inset-0"
          style={{ animationDelay: `${LINE_DELAY}ms` }}
        />
        <div
          className="animate-ride absolute inset-0"
          style={{ animationDelay: `${LINE_DELAY}ms` }}
        >
          <span
            className="animate-pulse-dot bg-agent absolute top-1/2 -right-0.75 size-1.75 -translate-y-1/2 rounded-full"
            style={{ animationDelay: `${LINE_DELAY + 900}ms` }}
          />
        </div>
      </div>
      <div
        className="animate-out-in flex flex-col gap-3"
        style={{ animationDelay: `${LINE_DELAY}ms` }}
      >
        <h1 className="text-h3 font-serif tracking-[-0.015em]">{dict.title}</h1>
        <Link
          href={localizedPath("/", locale)}
          className="text-mono text-ink hover:text-agent group flex min-h-11 w-fit items-center gap-[1ch] font-mono transition-colors duration-200"
        >
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-x-1"
          >
            ←
          </span>
          {dict.home}
        </Link>
      </div>
    </main>
  );
}
