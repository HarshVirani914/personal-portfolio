"use client";

import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { handoffHref } from "@/lib/agent/handoff";
import type { Dictionary } from "@/lib/dictionary";
import type { ContactDetails } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const COPIED_MS = 2200;

const pill =
  "h-9 rounded-full px-4 font-mono text-xs font-normal tracking-normal normal-case";

type Props = {
  question: string;
  contact: Pick<ContactDetails, "email" | "linkedinUrl">;
  dict: Dictionary["agent"];
  /** Under an answer: one soft link, not a card. */
  quiet: boolean;
  /** Waits for the answer to finish revealing. */
  hidden: boolean;
};

/** A prewritten email to Harsh, or his LinkedIn when no address is set. */
export function AgentHandoff({
  question,
  contact,
  dict,
  quiet,
  hidden,
}: Props) {
  const { email, linkedinUrl } = contact;
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const href = email
    ? handoffHref({
        email,
        question,
        copy: {
          subject: dict.mailSubject,
          greeting: dict.mailGreeting,
          signature: dict.mailSignature,
        },
      })
    : linkedinUrl;
  if (!href || hidden) return null;
  const external = email ? {} : { target: "_blank", rel: "noreferrer" };

  if (quiet) {
    return (
      <a
        href={href}
        {...external}
        className="text-mono text-muted-ink hover:text-agent focus-visible:outline-agent -mt-2 self-start font-mono outline-offset-3 transition-colors focus-visible:outline"
      >
        {dict.askHarsh} ↗
      </a>
    );
  }

  const copyEmail = async () => {
    if (!email) return;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopy("copied");
      timer.current = setTimeout(() => setCopy("idle"), COPIED_MS);
    } catch {
      setCopy("failed");
    }
  };

  return (
    <div
      data-agent-handoff=""
      className="border-hairline animate-word flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
    >
      <p className="text-mono text-muted-ink m-0 font-mono">
        {email ? dict.handoffHint : dict.askHarsh}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={href}
          {...external}
          className={cn(
            buttonVariants({ size: "sm" }),
            pill,
            "bg-agent hover:bg-agent/80 text-background"
          )}
        >
          {email ? dict.emailHarsh : dict.linkedin} ↗
        </a>
        {email && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyEmail}
            className={cn(pill, "text-muted-ink hover:bg-transparent")}
          >
            {copy === "copied" ? dict.copied : dict.copyEmail}
          </Button>
        )}
        {copy === "failed" && (
          <span className="text-mono text-ink font-mono select-all">
            {email}
          </span>
        )}
      </div>
    </div>
  );
}
