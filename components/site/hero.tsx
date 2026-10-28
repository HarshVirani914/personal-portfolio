import { HeroName } from "@/components/site/hero-name";
import { HeroTerminal } from "@/components/site/hero-terminal";
import type { Dictionary } from "@/lib/dictionary";
import type { Hero as HeroContent, SiteSettings } from "@/lib/content/types";

type Props = { hero: HeroContent; name: SiteSettings["name"]; dict: Dictionary };

export function Hero({ hero, name, dict }: Props) {
  return (
    <section className="flex min-h-dvh flex-col justify-center pt-32 pb-16 lg:pt-24">
      <div className="grid gap-y-5.5 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-9">
        <div className="lg:col-span-9">
          <HeroName first={name.first} last={name.last} />
        </div>
        <ul className="animate-fade-in flex list-none flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-[11px] text-muted-ink [animation-delay:0.9s] lg:col-span-3 lg:flex-col lg:justify-end lg:gap-y-2.5 lg:pb-7 lg:text-mono">
          {hero.annotations.map((item) => (
            <li key={item.id}>
              {item.marker} {item.text}
            </li>
          ))}
        </ul>
        <div className="animate-draw h-px w-3/5 bg-ink [animation-delay:0.4s] lg:col-span-5 lg:w-auto" />
        <div className="lg:col-span-9 lg:col-start-1">
          <HeroTerminal scripts={hero.terminal} label={dict.terminal.label} runLabel={dict.terminal.run} />
        </div>
      </div>
    </section>
  );
}
