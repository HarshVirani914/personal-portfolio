const LETTER_STAGGER = 0.04;
const WORD_GAP = 0.08;

type Props = { first: string; last: string };

/**
 * The name, revealed letter by letter rising out of a mask. Pure CSS, so the
 * reveal starts with the first paint instead of waiting for JavaScript.
 */
export function HeroName({ first, last }: Props) {
  const word = (text: string, startDelay: number, italic: boolean) => (
    <span
      className="inline-block overflow-hidden pb-[0.08em] align-bottom"
      aria-hidden="true"
    >
      {Array.from(text).map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={
            italic
              ? "animate-mask-rise inline-block italic"
              : "animate-mask-rise inline-block"
          }
          style={{ animationDelay: `${startDelay + i * LETTER_STAGGER}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <h1 className="text-display-xl font-serif font-normal tracking-[-0.02em]">
      <span className="sr-only">{`${first} ${last}`}</span>
      <span className="flex flex-wrap gap-x-[0.22em]">
        {word(first, 0, false)}
        {word(last, first.length * LETTER_STAGGER + WORD_GAP, true)}
      </span>
    </h1>
  );
}
