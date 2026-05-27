import type { ReactNode } from "react";

import { academicWorkEntries } from "@/lib/site-content";

const ROW_HEIGHT = 64;

export function AcademicWork(): ReactNode {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
        Academic work
      </h3>
      <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative rounded-4xl border p-2 sm:p-4">
        <ul className="flex flex-col gap-2">
          {academicWorkEntries.map((entry) => (
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
                  {entry.title.charAt(0)}
                </span>
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground text-[17px] font-semibold tracking-tight sm:text-[18px]">
                  {entry.title}
                </span>
                <span className="text-foreground/65 mt-0.5 text-[14px] tracking-tight sm:text-[15px]">
                  {entry.period}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
