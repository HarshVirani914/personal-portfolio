"use client";

import { useState } from "react";
import { accentStyle } from "@/components/site/project-accent";
import type { Dictionary } from "@/lib/dictionary";
import type { Skill, SkillGroup } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { groups: SkillGroup[]; dict: Dictionary["skills"] };

const mono = "font-mono text-mono text-muted-ink";

/** The note's colour: the linked item's accent, or the muted ink when the skill links to nothing. */
const tint = (skill: Skill) =>
  skill.accent ? "project-accent text-(--project-accent)" : "text-muted-ink";

/**
 * Skills by group. Hovering, focusing or tapping a skill shows one line about
 * where it was used. Desktop shows the line in one shared panel under the
 * columns; mobile shows it inline under the group of the tapped chip.
 */
export function Skills({ groups, dict }: Props) {
  const [active, setActive] = useState<{
    groupId: string;
    skill: Skill;
  } | null>(null);
  if (groups.length === 0) return null;

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="scroll-mt-24 py-24 lg:py-30"
    >
      <div className="border-ink mb-3 border-t pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>
          04 — {dict.kicker}
        </span>
        <h2 id="skills-heading" className="text-h2 font-serif lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>
      <p className={cn(mono, "mb-8 lg:hidden")}>{dict.hintTap}</p>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="flex flex-col gap-9 lg:col-span-10 lg:col-start-3 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-0">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-3.5">
              <h3
                className={cn(
                  mono,
                  "border-hairline border-b pb-2 font-normal lg:pb-2.5"
                )}
              >
                {group.title}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0 lg:flex-col lg:gap-0">
                {group.skills.map((skill) => {
                  const selected =
                    active?.skill.id === skill.id &&
                    active.groupId === group.id;
                  const show = () => setActive({ groupId: group.id, skill });
                  return (
                    <li key={skill.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onMouseEnter={show}
                        onFocus={show}
                        onClick={show}
                        className={cn(
                          "border-hairline text-ink-2 focus-visible:outline-agent flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 text-[14px] outline-offset-3 transition-colors duration-200 focus-visible:outline",
                          "aria-pressed:border-ink aria-pressed:text-ink",
                          "lg:min-h-0 lg:w-fit lg:rounded-none lg:border-0 lg:px-0 lg:py-0 lg:text-[17px] lg:leading-[1.9]",
                          "lg:ease-out-expo lg:hover:text-ink lg:focus-visible:text-ink lg:transition-[color,translate] lg:duration-350 lg:hover:translate-x-1.5 lg:focus-visible:translate-x-1.5 lg:aria-pressed:translate-x-1.5",
                          "motion-reduce:transition-none motion-reduce:lg:hover:translate-x-0 motion-reduce:lg:focus-visible:translate-x-0 motion-reduce:lg:aria-pressed:translate-x-0"
                        )}
                      >
                        {skill.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {active?.groupId === group.id && (
                <Note skill={active.skill} className="lg:hidden" inline />
              )}
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          className="border-hairline mt-14 hidden min-h-15 border-t pt-4.5 lg:col-span-10 lg:col-start-3 lg:block"
        >
          {active ? (
            <Note skill={active.skill} />
          ) : (
            <p className={cn(mono, "m-0")}>{dict.hintHover}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Note({
  skill,
  inline = false,
  className,
}: {
  skill: Skill;
  inline?: boolean;
  className?: string;
}) {
  if (!skill.note) return null;
  return (
    <p
      key={skill.id}
      style={skill.accent ? accentStyle(skill.accent) : undefined}
      className={cn(
        "m-0 flex animate-[note-in_400ms_var(--ease-out-expo)_both] motion-reduce:animate-none",
        inline
          ? "flex-col gap-1.5 border-l border-current pl-3.5"
          : "items-baseline gap-4.5",
        tint(skill),
        className
      )}
    >
      <span className="lg:text-mono font-mono text-[11px]">● {skill.name}</span>
      <span
        className={cn(
          "text-ink font-serif leading-[1.15]",
          inline ? "text-[24px]" : "text-[32px] leading-[1.1]"
        )}
      >
        {skill.note}
      </span>
    </p>
  );
}
