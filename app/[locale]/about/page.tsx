import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import type { AboutRow } from "@/lib/content/types";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Params = { locale: string };

const mono = "font-mono text-mono text-muted-ink";
const rule =
  "border-ink flex items-center justify-between gap-6 border-t pt-3.5 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [about, settings] = await Promise.all([
    content.getAbout(locale),
    content.getSiteSettings(locale),
  ]);
  return pageMetadata({
    locale,
    path: "/about",
    title: `${getDictionary(locale).about.kicker} — ${settings.name.full}`,
    description: about.story[0] ?? settings.description,
    siteName: settings.name.full,
  });
}

function formatMonth(iso: string, locale: Locale, month: "long" | "short") {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Desktop: rows split by hairlines with the note on the right. Mobile: a compact list. */
function RowList({
  id,
  title,
  rows,
  detailOnMobile,
}: {
  id: string;
  title: string;
  rows: AboutRow[];
  detailOnMobile: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 lg:gap-3.5">
      <h3 id={id} className="font-normal">
        {title}
      </h3>
      <dl aria-labelledby={id} className="m-0 flex flex-col gap-2 lg:gap-3.5">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              "border-hairline lg:flex lg:justify-between lg:gap-x-2 lg:border-t lg:pt-2.5",
              i === 0 && "border-t pt-2"
            )}
          >
            <dt className="text-ink inline lg:block">{row.name}</dt>
            {row.detail && (
              <dd
                className={cn(
                  "m-0 lg:block",
                  detailOnMobile
                    ? "text-ink lg:text-muted-ink inline"
                    : "hidden"
                )}
              >
                <span aria-hidden="true" className="lg:hidden">
                  {" · "}
                </span>
                {row.detail}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [about, settings] = await Promise.all([
    content.getAbout(locale),
    content.getSiteSettings(locale),
  ]);
  const dict = getDictionary(locale).about;
  const { portrait } = about;
  const updatedLong = formatMonth(about.nowUpdated, locale, "long");
  const updatedShort = formatMonth(about.nowUpdated, locale, "short");
  const cvUrl = settings.contact.cvUrl;

  return (
    <main
      id="main"
      className="px-5 pt-26 pb-18 md:px-10 lg:px-16 lg:pt-40 lg:pb-24"
    >
      <div className="text-mono font-mono lg:grid lg:grid-cols-12 lg:gap-x-6">
        <Link
          href={localizedPath("/", locale)}
          className="text-ink hover:text-agent flex min-h-11 w-fit items-center transition-colors duration-200 lg:col-span-3"
        >
          ← {settings.name.full}
        </Link>
      </div>

      <section className="mt-10 lg:mt-24 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <span
          className={cn(mono, "block lg:col-span-2 lg:self-start lg:pt-4.5")}
        >
          {dict.kicker}
        </span>
        <h1 className="text-display-m mt-3.5 font-serif tracking-[-0.015em] lg:col-span-6 lg:col-start-3 lg:mt-0">
          {about.headline.map((part, i) =>
            part.emphasis ? <em key={i}>{part.text}</em> : part.text
          )}
        </h1>
        <figure className="animate-wipe relative m-0 mt-9 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <div className="rounded-media bg-surface relative h-110 overflow-hidden lg:h-130">
            {portrait && (
              <Image
                src={portrait.url}
                alt={portrait.alt || `${dict.portraitOf} ${settings.name.full}`}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover contrast-105 grayscale"
              />
            )}
          </div>
          {portrait?.caption && (
            <figcaption
              className={cn(
                mono,
                "mt-2.5 lg:absolute lg:-bottom-7 lg:left-0 lg:mt-0"
              )}
            >
              {portrait.caption}
            </figcaption>
          )}
        </figure>
      </section>

      <section
        aria-labelledby="about-story"
        className="mt-18 lg:mt-40 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8"
      >
        <div className={cn(rule, "lg:col-span-12")}>
          <h2
            id="about-story"
            className={cn(mono, "font-normal lg:col-span-2")}
          >
            01 — {dict.story}
          </h2>
        </div>
        <div className="mt-6 flex flex-col gap-5.5 text-[18px] leading-[1.65] font-light lg:col-span-6 lg:col-start-3 lg:mt-0 lg:gap-7 lg:text-[21px] lg:leading-[1.6]">
          {about.story.map((paragraph, i) => (
            <p key={i} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
        <aside
          className={cn(
            mono,
            "mt-10 grid grid-cols-2 gap-x-4 gap-y-6 text-[11px] lg:col-span-3 lg:col-start-10 lg:mt-0 lg:flex lg:flex-col lg:gap-5.5 lg:text-[12px]"
          )}
        >
          <RowList
            id="about-languages"
            title={dict.languages}
            rows={about.languages}
            detailOnMobile
          />
          <RowList
            id="about-interests"
            title={dict.outsideWork}
            rows={about.interests}
            detailOnMobile={false}
          />
        </aside>
      </section>

      {about.now.length > 0 && (
        <section aria-labelledby="about-now" className="mt-18 lg:mt-40">
          <div className={rule}>
            <h2
              id="about-now"
              className={cn(mono, "font-normal lg:col-span-2")}
            >
              02 — {dict.now}
            </h2>
            {updatedLong && (
              <time
                dateTime={about.nowUpdated}
                className="text-mono text-ink flex items-center gap-2 font-mono lg:col-span-6 lg:col-start-3"
              >
                <span
                  aria-hidden="true"
                  className="animate-pulse-dot bg-agent inline-block size-[7px] shrink-0 rounded-full"
                />
                <span className="lg:hidden">{updatedShort}</span>
                <span className="hidden lg:inline">
                  {dict.updated} {updatedLong}
                </span>
              </time>
            )}
          </div>
          <dl className="m-0 mt-7 flex flex-col gap-7 lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-10">
            {about.now.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-1.5 lg:col-span-5 lg:gap-2",
                  i % 2 === 0 && "lg:col-start-3"
                )}
              >
                <dt
                  className={cn(
                    "text-mono font-mono",
                    item.highlight ? "text-agent" : "text-muted-ink"
                  )}
                >
                  {item.label}
                </dt>
                <dd className="m-0 font-serif text-[28px] leading-[1.12] lg:text-[34px] lg:leading-[1.1]">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <nav
        aria-labelledby="about-next"
        className="border-ink mt-18 flex flex-col gap-4.5 border-t pt-4 lg:mt-40 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:pt-5.5"
      >
        <h2 id="about-next" className={cn(mono, "font-normal lg:col-span-2")}>
          03 — {dict.next}
        </h2>
        <Link
          href={localizedPath("/#work", locale)}
          className="group hover:text-agent w-fit font-serif text-[44px] leading-none transition-colors duration-200 lg:col-span-7 lg:col-start-3 lg:text-[72px]"
        >
          {dict.seeWork}{" "}
          <span
            aria-hidden="true"
            className="ease-out-expo inline-block transition-transform duration-500 group-hover:translate-x-3 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          >
            →
          </span>
        </Link>
        {cvUrl && (
          <a
            href={cvUrl}
            download
            className="border-ink hover:text-agent flex min-h-12 items-center justify-between rounded-full border px-4.5 font-mono text-[13px] transition-colors duration-200 lg:col-span-3 lg:col-start-10 lg:min-h-11 lg:justify-self-end lg:rounded-none lg:border-0 lg:px-0"
          >
            {dict.downloadCv} <span aria-hidden="true">&nbsp;↓</span>
          </a>
        )}
      </nav>
    </main>
  );
}
