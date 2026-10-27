"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const LETTER_STAGGER = 0.04;
const WORD_GAP = 0.08;

type Props = { first: string; last: string };

/** The name, revealed letter by letter rising out of a mask. */
export function HeroName({ first, last }: Props) {
  const reduce = useReducedMotion();

  const word = (text: string, startDelay: number, italic: boolean) => (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className={italic ? "inline-block italic" : "inline-block"}
          initial={reduce ? false : { y: "105%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: startDelay + i * LETTER_STAGGER }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );

  return (
    <h1 className="font-serif text-display-xl font-normal tracking-[-0.02em]">
      <span className="sr-only">{`${first} ${last}`}</span>
      <span className="flex flex-wrap gap-x-[0.22em]">
        {word(first, 0, false)}
        {word(last, first.length * LETTER_STAGGER + WORD_GAP, true)}
      </span>
    </h1>
  );
}
