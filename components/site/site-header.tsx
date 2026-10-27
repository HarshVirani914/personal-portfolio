"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** The header waits for the hero name to land before it appears. */
const ENTER_DELAY = 0.9;

type Props = {
  locale: Locale;
  dict: Dictionary;
  name: string;
  coordinates: string;
};

export function SiteHeader({ locale, dict, name, coordinates }: Props) {
  const reduce = useReducedMotion();
  const [showCity, setShowCity] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: localizedPath("/#work", locale), label: dict.nav.work },
    { href: localizedPath("/#research", locale), label: dict.nav.research },
    { href: localizedPath("/about", locale), label: dict.nav.about },
    { href: localizedPath("/#contact", locale), label: dict.nav.contact },
  ];

  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: ENTER_DELAY }}
      className="fixed inset-x-0 top-0 z-40 px-5 pt-5 md:px-10 md:pt-8 lg:px-16 lg:pt-10"
    >
      <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <button
          type="button"
          onClick={() => setShowCity((v) => !v)}
          aria-expanded={showCity}
          className="group/loc flex min-h-11 cursor-default items-center gap-2.5 font-mono text-mono text-muted-ink lg:col-span-4"
        >
          <span>{coordinates}</span>
          <span
            data-shown={showCity}
            className="-translate-x-1.5 opacity-0 blur-[4px] transition duration-400 ease-out-expo group-hover/loc:translate-x-0 group-hover/loc:text-ink group-hover/loc:opacity-100 group-hover/loc:blur-none group-focus-visible/loc:translate-x-0 group-focus-visible/loc:opacity-100 group-focus-visible/loc:blur-none data-[shown=true]:translate-x-0 data-[shown=true]:text-ink data-[shown=true]:opacity-100 data-[shown=true]:blur-none"
          >
            {dict.location}
          </span>
        </button>

        <nav aria-label="Primary" className="hidden lg:col-span-4 lg:col-start-6 lg:flex lg:gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-ui whitespace-nowrap text-ink transition-colors duration-200 hover:text-muted-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-5 lg:col-span-3 lg:col-start-10 lg:flex">
          <ThemeToggle labels={dict.theme} />
          <LocaleSwitch current={locale} labels={dict.locale} />
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="flex min-h-11 min-w-11 cursor-pointer items-center justify-end gap-2 text-ui lg:hidden">
            {dict.menu.open}
            <span aria-hidden="true" className="flex flex-col gap-1">
              <span className="block h-px w-4.5 bg-ink" />
              <span className="ml-1.5 block h-px w-3 bg-ink" />
            </span>
          </SheetTrigger>
          <SheetContent
            side="top"
            showCloseButton={false}
            className="dark border-0 bg-background p-5 text-foreground data-[side=top]:h-dvh"
          >
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-2xl font-normal tracking-normal normal-case">
                {name}
              </SheetTitle>
              <SheetClose className="flex min-h-11 min-w-11 cursor-pointer items-center justify-end gap-2 text-ui">
                {dict.menu.close} <span aria-hidden="true">✕</span>
              </SheetClose>
            </div>
            <nav aria-label="Primary" className="mt-24 flex flex-col border-t border-border">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline justify-between border-b border-border py-4"
                >
                  <span className={i === 2 ? "font-serif text-[3.25rem] leading-none italic" : "font-serif text-[3.25rem] leading-none"}>
                    {link.label}
                  </span>
                  <span aria-hidden="true" className="font-mono text-mono text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center justify-between">
              <ThemeToggle labels={dict.theme} />
              <LocaleSwitch current={locale} labels={dict.locale} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
