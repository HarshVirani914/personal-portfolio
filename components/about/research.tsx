import { Download } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { researchPapers } from "@/lib/site-content";

const ROW_HEIGHT = 64;

export function Research(): ReactNode {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
        Research
      </h3>
      <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative rounded-4xl border p-2 sm:p-4">
        <ul className="flex flex-col gap-2">
          {researchPapers.map((entry) => (
            <li
              key={entry.id}
              className="bg-background border-foreground/5 flex items-center gap-4 rounded-3xl border p-2"
              style={{ minHeight: ROW_HEIGHT }}
            >
              <span
                className="border-foreground/15 inline-flex h-12 w-12 shrink-0 items-center justify-center border"
                aria-hidden="true"
                style={{ borderRadius: 14 }}
              >
                <span className="text-foreground/60 text-[18px] font-semibold tracking-tight">
                  R
                </span>
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground text-[17px] font-semibold tracking-tight sm:text-[18px]">
                  {entry.title}
                </span>
                <span className="text-foreground/65 mt-0.5 text-[14px] tracking-tight sm:text-[15px]">
                  {entry.period}
                </span>
              </div>
              <Link
                href={entry.paperPath}
                download
                className="focus-ring text-foreground/55 hover:text-foreground inline-flex shrink-0 items-center gap-1 text-[14px] font-medium tracking-tight transition-colors"
                aria-label={`Download ${entry.title}`}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Paper
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
