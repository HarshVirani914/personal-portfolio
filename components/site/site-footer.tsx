import type { Dictionary } from "@/lib/dictionary";

type Props = {
  name: { first: string; last: string; full: string };
  coordinates: string;
  dict: Dictionary["footer"];
};

const mono = "font-mono text-mono text-muted-ink";

/** Copyright and coordinates, then the name set large so it sits on the bottom edge of the page. */
export function SiteFooter({ name, coordinates, dict }: Props) {
  return (
    <footer className="overflow-hidden px-5 md:px-10 lg:px-16">
      <div className="border-hairline flex justify-between gap-4 border-t py-3 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:py-3.5">
        <span className={`${mono} lg:col-span-3`}>
          © {new Date().getFullYear()} {name.full}
        </span>
        <span className={`${mono} lg:col-span-4 lg:col-start-5`}>
          {coordinates}
        </span>
        <span
          className={`${mono} hidden text-right lg:col-span-3 lg:col-start-10 lg:block`}
        >
          {dict.builtWith}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="block pb-[0.03em] font-serif text-[20vw] leading-[0.8] tracking-[-0.03em] whitespace-nowrap lg:text-[17.5vw]"
      >
        {name.first} <em>{name.last}</em>
      </span>
    </footer>
  );
}
