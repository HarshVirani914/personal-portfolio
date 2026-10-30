"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { locales, switchLocale, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

/** EN / DE links that keep the visitor on the same page. */
export function LocaleSwitch({
  current,
  labels,
}: {
  current: Locale;
  labels: Dictionary["locale"];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={labels.label}
      className="text-mono text-muted-ink flex items-center gap-1.5 font-mono"
    >
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          <Link
            href={switchLocale(pathname, locale)}
            hrefLang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={cn(
              "hover:text-ink inline-flex min-h-11 items-center transition-colors duration-200",
              locale === current && "text-ink"
            )}
          >
            {labels[locale]}
          </Link>
        </span>
      ))}
    </nav>
  );
}
