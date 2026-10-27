"use client";

import { Download } from "lucide-react";
import type { ReactNode } from "react";

import { siteLinks } from "@/lib/site-content";

type CvDownloadButtonProps = {
  variant?: "primary" | "secondary";
  className?: string;
};

export function CvDownloadButton({
  variant = "secondary",
  className = "",
}: CvDownloadButtonProps): ReactNode {
  const base =
    variant === "primary"
      ? "bg-foreground text-background"
      : "border border-foreground/8 bg-background text-foreground hover:bg-foreground/5";

  return (
    <a
      href={siteLinks.cvPath}
      download={siteLinks.cvDownloadName}
      className={`focus-ring inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors ${base} ${className}`}
    >
      <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
      Download CV
    </a>
  );
}
