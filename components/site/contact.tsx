"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import type { ContactDetails } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { contact: ContactDetails; dict: Dictionary["contact"] };

type CopyState = "idle" | "copied" | "failed";

const mono = "font-mono text-mono text-muted-ink";
const COPIED_MS = 2200;

const linkClass =
  "flex min-h-12 items-center justify-between gap-2 border-b border-hairline font-mono text-[13px] outline-offset-3 transition-colors duration-200 hover:text-agent focus-visible:outline focus-visible:outline-agent lg:min-h-0 lg:justify-end lg:border-0";

/**
 * A huge "Let's talk." that copies the email on click or tap and confirms with
 * "copied". When the clipboard is unavailable the address is shown selected
 * instead, so it can still be copied by hand.
 */
export function Contact({ contact, dict }: Props) {
  const { email, availability, linkedinUrl, githubUrl, cvUrl } = contact;
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const address = useRef<HTMLSpanElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (state !== "failed" || !address.current) return;
    const range = document.createRange();
    range.selectNodeContents(address.current);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [state]);

  if (!email && !availability && !linkedinUrl && !githubUrl && !cvUrl) return null;

  const copy = async () => {
    if (!email) return;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
      timer.current = setTimeout(() => setState("idle"), COPIED_MS);
    } catch {
      setState("failed");
    }
  };

  const links = [
    { href: linkedinUrl, label: dict.linkedin, arrow: "↗", external: true },
    { href: githubUrl, label: dict.github, arrow: "↗", external: true },
    { href: cvUrl, label: dict.cv, arrow: "↓", external: false },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 pt-24 pb-16 lg:pt-30 lg:pb-20">
      <h2 id="contact-heading" className="sr-only">
        {dict.kicker}
      </h2>
      <div className="flex flex-col gap-2.5 border-t border-ink pt-3.5 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "lg:col-span-2")}>07 — {dict.kicker}</span>
        {availability && (
          <span className="flex items-center gap-2 font-mono text-mono text-ink lg:col-span-6">
            <span aria-hidden="true" className="inline-block size-[7px] shrink-0 animate-pulse-dot rounded-full bg-agent" />
            {availability}
          </span>
        )}
      </div>

      <div className="mt-14 lg:mt-16 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <div className="flex flex-col gap-4.5 lg:col-span-9">
          {email ? (
            <button
              type="button"
              onClick={copy}
              aria-label={dict.copyEmail}
              className="flex w-fit cursor-pointer flex-wrap gap-x-[0.22em] text-left font-serif text-[clamp(7rem,15.3vw,13.75rem)] leading-[0.9] tracking-[-0.02em] outline-offset-8 focus-visible:outline focus-visible:outline-agent lg:[&:hover>*]:translate-x-4"
            >
              <span className="transition-transform duration-500 ease-out-expo">{dict.letsTalkBefore}</span>
              <em className="text-agent transition-transform duration-500 ease-out-expo">{dict.letsTalkEmphasis}</em>
            </button>
          ) : (
            <p className="font-serif text-[clamp(7rem,15.3vw,13.75rem)] leading-[0.9] tracking-[-0.02em]">
              {dict.letsTalkBefore} <em>{dict.letsTalkEmphasis}</em>
            </p>
          )}
          {email && (
            <div role="status" className="min-h-5 overflow-hidden font-mono text-xs text-muted-ink lg:text-[13px]">
              {state === "copied" && (
                <span key="copied" className="inline-block animate-swap text-agent">
                  ✓ {dict.copied}
                </span>
              )}
              {state === "failed" && (
                <span key="failed" className="inline-block animate-swap">
                  {dict.copyFailed}{" "}
                  <span ref={address} className="text-ink select-all">
                    {email}
                  </span>
                </span>
              )}
              {state === "idle" && (
                <span key="idle" className="inline-block animate-swap">
                  {email} · <span className="lg:hidden">{dict.tapToCopy}</span>
                  <span className="hidden lg:inline">{dict.clickToCopy}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {links.length > 0 && (
          <nav aria-label={dict.kicker} className="mt-9 flex flex-col border-t border-hairline lg:col-span-3 lg:mt-0 lg:gap-2.5 lg:border-0 lg:pb-10">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={linkClass}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { download: "", "aria-label": `${link.label}. ${dict.download}` })}
              >
                <span>{link.label}</span>
                <span aria-hidden="true">{link.arrow}</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
