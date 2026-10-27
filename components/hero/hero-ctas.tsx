"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ContactButton } from "@/components/contact/contact-button";
import { CvDownloadButton } from "@/components/ui/cv-download-button";

export function HeroCtas(): ReactNode {
  return (
    <div className="mt-2 flex w-full min-w-0 flex-col items-start gap-3">
      <div className="min-w-0 max-w-full">
        <ContactButton />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CvDownloadButton />
        <Link
          href="/projects"
          className="border border-foreground/5 focus-ring group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-background px-5 text-sm font-medium text-foreground shadow-2xl transition-colors hover:bg-foreground/4"
        >
          View My Work
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
