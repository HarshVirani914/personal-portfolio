import type { Dictionary } from "@/lib/dictionary";
import type { EducationContent } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { data: EducationContent; dict: Dictionary["education"] };

const mono = "font-mono text-mono text-muted-ink";
const tagClass = "rounded-full border border-hairline px-3.5 py-1.5 font-mono text-mono text-ink";

/** Both degrees with their tags, then the certifications as links to verify them. */
export function EducationAchievements({ data, dict }: Props) {
  const { education, certifications } = data;
  if (education.length === 0 && certifications.length === 0) return null;

  return (
    <section id="education" aria-labelledby="education-heading" className="scroll-mt-24 py-24 lg:py-30">
      <div className="mb-10 border-t border-ink pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>06 — {dict.kicker}</span>
        <h2 id="education-heading" className="font-serif text-h2 lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>

      {education.length > 0 && (
        <ul aria-label={dict.degrees} className="m-0 list-none border-b border-hairline p-0">
          {education.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-2 border-t border-hairline py-6 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:py-9"
            >
              <span className={cn(mono, "lg:col-span-2")}>{row.years}</span>
              <span className="flex flex-col gap-1.5 lg:col-span-5">
                <span className="font-serif text-[32px] leading-none lg:text-[44px]">{row.degree}</span>
                <span className="text-[15px] text-ink-2 lg:text-[17px]">{row.institution}</span>
              </span>
              {row.tags.length > 0 && (
                <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0 lg:col-span-5 lg:mt-0">
                  {row.tags.map((tag) => (
                    <li key={tag.id}>
                      {tag.url ? (
                        <a
                          href={tag.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${tag.label}. ${dict.verify}`}
                          className={cn(tagClass, "flex min-h-11 items-center gap-1.5 outline-offset-3 transition-colors duration-200 hover:border-ink focus-visible:outline focus-visible:outline-agent lg:min-h-0")}
                        >
                          {tag.label} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className={cn(tagClass, "inline-block")}>{tag.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {certifications.length > 0 && (
        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <h3 className={cn(mono, "mb-4 font-normal lg:col-span-2 lg:mb-0")}>{dict.certifications}</h3>
          <ul className="m-0 list-none p-0 lg:col-span-10 lg:col-start-3">
            {certifications.map((cert) => (
              <li key={cert.id} className="border-b border-hairline first:border-t">
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${cert.name}, ${cert.issuer}. ${dict.verify}`}
                  className="group flex min-h-11 flex-col gap-1 py-4 outline-offset-4 focus-visible:outline focus-visible:outline-agent lg:grid lg:grid-cols-10 lg:items-baseline lg:gap-x-6 lg:py-5"
                >
                  <span className="text-[19px] leading-snug transition-transform duration-350 ease-out-expo group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 lg:col-span-6 lg:text-[24px]">
                    {cert.name}
                  </span>
                  <span className={cn(mono, "lg:col-span-4 lg:text-right")}>
                    {cert.issuer} · {dict.verify} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
