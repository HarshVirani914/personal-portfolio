"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  city: string;
};

export function SiteHeader({ locale, dict, name, coordinates, city }: Props) {
  const reduce = useReducedMotion();
  const [showCity, setShowCity] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

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
      data-scrolled={scrolled}
      className="fixed inset-x-0 top-0 z-40 border-b border-transparent px-5 pt-5 pb-3 transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-hairline data-[scrolled=true]:bg-background/85 data-[scrolled=true]:backdrop-blur-md md:px-10 md:pt-8 lg:px-16 lg:pt-10 lg:pb-4"
    >
      <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <button
          type="button"
          onClick={() => setShowCity((v) => !v)}
          aria-expanded={showCity}
          className="group/loc text-mono text-muted-ink flex min-h-11 cursor-default items-center gap-2.5 font-mono lg:col-span-4"
        >
          <span>{coordinates}</span>
          <span
            data-shown={showCity}
            className="ease-out-expo group-hover/loc:text-ink data-[shown=true]:text-ink -translate-x-1.5 opacity-0 blur-xs transition duration-400 group-hover/loc:translate-x-0 group-hover/loc:opacity-100 group-hover/loc:blur-none group-focus-visible/loc:translate-x-0 group-focus-visible/loc:opacity-100 group-focus-visible/loc:blur-none data-[shown=true]:translate-x-0 data-[shown=true]:opacity-100 data-[shown=true]:blur-none"
          >
            {city}
          </span>
        </button>

        <nav
          aria-label="Primary"
          className="hidden lg:col-span-4 lg:col-start-6 lg:flex lg:gap-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ui text-ink hover:text-muted-ink whitespace-nowrap transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-5 lg:col-span-3 lg:col-start-10 lg:flex">
          <ThemeToggle labels={dict.theme} />
          <LocaleSwitch current={locale} labels={dict.locale} />
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="text-ui flex min-h-11 min-w-11 cursor-pointer items-center justify-end gap-2 lg:hidden">
            {dict.menu.open}
            <span aria-hidden="true" className="flex flex-col gap-1">
              <span className="bg-ink block h-px w-4.5" />
              <span className="bg-ink ml-1.5 block h-px w-3" />
            </span>
          </SheetTrigger>
          <SheetContent
            side="top"
            showCloseButton={false}
            className="bg-background text-foreground border-0 p-5 shadow-none data-[side=top]:h-dvh"
          >
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-2xl font-normal tracking-normal normal-case">
                {name}
              </SheetTitle>
              <SheetClose className="text-ui flex min-h-11 min-w-11 cursor-pointer items-center justify-end gap-2">
                {dict.menu.close} <span aria-hidden="true">✕</span>
              </SheetClose>
            </div>
            <nav
              aria-label="Primary"
              className="border-border mt-24 flex flex-col border-t"
            >
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-border flex items-baseline justify-between border-b py-4"
                >
                  <span
                    className={
                      i === 2
                        ? "font-serif text-[3.25rem] leading-none italic"
                        : "font-serif text-[3.25rem] leading-none"
                    }
                  >
                    {link.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-mono text-muted-foreground font-mono"
                  >
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
