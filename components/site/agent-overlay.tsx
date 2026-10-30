"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AgentHandoff } from "@/components/site/agent-handoff";
import { accentStyle } from "@/components/site/project-accent";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trace, TraceLine, TraceTitle } from "@/components/ui/trace";
import {
  answerReducer,
  initialAnswer,
  toTokens,
  traceStage,
  type AnswerToken,
  type TraceStage,
} from "@/lib/agent/answer";
import { askAgent } from "@/lib/agent/client";
import type { Dictionary } from "@/lib/dictionary";
import type {
  ContactDetails,
  SiteSettings,
  Suggestion,
} from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Groq outruns reading speed, so the overlay paces the reveal itself. */
const WORD_MS = 32;
const NOTICE_KEY = "agent-notice-dismissed";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  dict: Dictionary["agent"];
  suggestions: Suggestion[];
  name: SiteSettings["name"];
  contact: Pick<ContactDetails, "email" | "linkedinUrl">;
  /** A question asked from outside the overlay. A new id asks it. */
  asked: { id: number; question: string } | null;
};

const sourceCount = (count: number, dict: Dictionary["agent"]) =>
  `${count} ${count === 1 ? dict.source : dict.sources}`;

function traceLabel(trace: TraceStage, dict: Dictionary["agent"]) {
  switch (trace.stage) {
    case "reading":
      return `${dict.reading} ${trace.projects} ${dict.projects}, ${trace.research} ${dict.research}`;
    case "answering":
      return dict.answering;
    case "answered":
      return dict.answered;
    case "sources":
      return sourceCount(trace.count, dict);
    case "cached":
      return trace.count > 0
        ? `${dict.answeredBefore} · ${sourceCount(trace.count, dict)}`
        : dict.answeredBefore;
  }
}

function readDismissed() {
  try {
    return window.localStorage.getItem(NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

function CitationChip({
  token,
  onFollow,
}: {
  token: Extract<AnswerToken, { kind: "citation" }>;
  onFollow: () => void;
}) {
  return (
    <Link
      href={token.item.href}
      onClick={onFollow}
      style={accentStyle(token.item.accent)}
      className={cn(
        buttonVariants({ variant: "outline", size: "xs" }),
        "project-accent animate-word mx-0.5 h-auto rounded-full border-[color-mix(in_srgb,var(--project-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--project-accent)_7%,transparent)] px-2.5 py-0.5 align-[2px] font-mono text-[11px] font-normal tracking-normal text-(--project-accent) normal-case hover:bg-[color-mix(in_srgb,var(--project-accent)_14%,transparent)] hover:text-(--project-accent) lg:text-xs"
      )}
    >
      {token.item.label}
    </Link>
  );
}

export function AgentOverlay({
  open,
  onOpenChange,
  locale,
  dict,
  suggestions,
  name,
  contact,
  asked,
}: Props) {
  const [answer, dispatch] = useReducer(answerReducer, initialAnswer);
  const [question, setQuestion] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [noticeDismissed, setNoticeDismissed] = useState(readDismissed);
  const reduce = useReducedMotion();
  const request = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const handled = useRef<number | null>(null);

  const ask = useCallback(
    (next: string) => {
      const text = next.trim();
      if (!text) return;
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      dispatch({ type: "reset" });
      setRevealed(0);
      setQuestion(text);
      setDraft("");
      askAgent(text, locale, controller.signal, (event) => {
        if (!controller.signal.aborted) dispatch(event);
      }).catch(() => {
        if (!controller.signal.aborted) dispatch({ type: "error" });
      });
    },
    [locale]
  );

  useEffect(() => {
    if (!asked || handled.current === asked.id) return;
    handled.current = asked.id;
    ask(asked.question);
  }, [asked, ask]);

  // Closing stops the model. An answer cut short is not worth coming back to.
  useEffect(() => {
    if (open || !request.current) return;
    request.current.abort();
    request.current = null;
    dispatch({ type: "reset" });
    setQuestion(null);
  }, [open]);

  const tokens = useMemo(() => toTokens(answer.parts), [answer.parts]);
  const shown = reduce ? tokens.length : Math.min(revealed, tokens.length);
  const revealing = shown < tokens.length;

  useEffect(() => {
    if (reduce || !revealing) return;
    const timer = setInterval(() => setRevealed((n) => n + 1), WORD_MS);
    return () => clearInterval(timer);
  }, [reduce, revealing]);

  const running =
    answer.status === "reading" ||
    answer.status === "answering" ||
    (question !== null && answer.status === "idle");
  const stage =
    answer.status === "done" && revealing && !answer.cached
      ? ({ stage: "answering" } as const)
      : traceStage(answer);
  const message =
    answer.status === "unknown"
      ? dict.unknown
      : answer.status === "refused"
        ? dict.refused
        : answer.status === "limited"
          ? dict.limited
          : answer.status === "error"
            ? dict.unavailable
            : null;
  const handoff =
    answer.status === "unknown" ||
    answer.status === "limited" ||
    answer.status === "error";

  const dismissNotice = () => {
    setNoticeDismissed(true);
    try {
      window.localStorage.setItem(NOTICE_KEY, "1");
    } catch {
      // The notice simply shows again next time.
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        data-agent-overlay=""
        data-lenis-prevent=""
        initialFocus={() =>
          window.matchMedia("(pointer: fine)").matches ? input.current : true
        }
        className="bg-background text-foreground border-0 px-5 pt-5 pb-5 shadow-none data-[side=top]:h-dvh lg:px-16 lg:pt-10 lg:pb-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 top-[30%] hidden font-serif text-[200px] leading-[0.9] whitespace-nowrap opacity-5 blur-[6px] select-none lg:block"
        >
          {name.first} <em>{name.last}</em>
        </div>

        <div className="relative flex items-center justify-between">
          <SheetTitle className="text-agent font-mono text-xs font-normal tracking-normal normal-case">
            ● {dict.title}
          </SheetTitle>
          <SheetClose
            aria-label={dict.close}
            className="text-mono text-muted-ink hover:text-ink flex min-h-11 min-w-11 cursor-pointer items-center justify-end font-mono transition-colors"
          >
            <span className="hidden lg:inline">{dict.esc}&nbsp;✕</span>
            <span className="lg:hidden">{dict.close}&nbsp;✕</span>
          </SheetClose>
        </div>

        <div className="relative mx-auto flex min-h-0 w-full flex-1 flex-col lg:w-2/3">
          <div className="flex min-h-0 flex-1 overflow-y-auto pt-10 lg:pt-0">
            <div className="flex w-full flex-col gap-5 lg:my-auto lg:gap-7">
              <h2 className="font-serif text-[2.5rem] leading-[1.05] font-normal text-balance lg:text-[4rem] lg:leading-[1.02]">
                {question ?? dict.idle}
              </h2>

              {stage && (
                <Trace>
                  <TraceLine
                    {...(running ? { status: "running" as const } : {})}
                    className="text-agent font-mono text-xs lg:text-[13px]"
                  >
                    <TraceTitle>
                      <span aria-hidden="true">&gt;&nbsp;</span>
                      {traceLabel(stage, dict)}
                    </TraceTitle>
                  </TraceLine>
                </Trace>
              )}

              <p
                aria-live="polite"
                aria-busy={running || revealing}
                className="m-0 min-h-37 text-[17px] leading-[1.6] font-light lg:text-[22px]"
              >
                {tokens.slice(0, shown).map((token, index) =>
                  token.kind === "word" ? (
                    <span key={index} className="animate-word">
                      {token.text}
                    </span>
                  ) : (
                    <CitationChip
                      key={index}
                      token={token}
                      onFollow={() => onOpenChange(false)}
                    />
                  )
                )}
                {(running || revealing) && (
                  <span aria-hidden="true" className="animate-caret text-agent">
                    ▍
                  </span>
                )}
                {message}
              </p>

              {question !== null && (handoff || answer.status === "done") && (
                <AgentHandoff
                  question={question}
                  contact={contact}
                  dict={dict}
                  quiet={!handoff}
                  hidden={revealing}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 lg:gap-4">
            {!noticeDismissed && (
              <p className="text-mono text-muted-ink flex items-start justify-between gap-3 font-mono">
                <span>{dict.notice}</span>
                <button
                  type="button"
                  aria-label={dict.dismiss}
                  onClick={dismissNotice}
                  className="hover:text-ink -mt-3 -mr-3 flex size-11 shrink-0 cursor-pointer items-center justify-center transition-colors lg:-mt-1 lg:-mr-1 lg:size-6"
                >
                  ✕
                </button>
              </p>
            )}

            {suggestions.length > 0 && (
              <div className="flex scrollbar-none gap-2 overflow-x-auto overscroll-x-contain lg:flex-wrap lg:gap-2.5">
                {suggestions.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => ask(item.question)}
                    className="text-muted-ink hover:border-agent hover:text-agent focus-visible:border-agent focus-visible:text-agent shrink-0 rounded-full px-3 font-mono text-[11px] font-normal tracking-normal normal-case hover:bg-transparent lg:text-xs"
                  >
                    <span className="lg:hidden">{item.label}</span>
                    <span className="hidden lg:inline">{item.question}</span>
                  </Button>
                ))}
              </div>
            )}

            <form onSubmit={submit}>
              <InputGroup className="border-ink h-13 rounded-full border pr-2 pl-4.5 lg:h-auto lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:pb-3">
                <InputGroupAddon className="hidden p-0 pr-3.5 lg:flex">
                  <span className="text-mono text-muted-ink font-mono font-normal">
                    {dict.ask}
                  </span>
                </InputGroupAddon>
                <InputGroupInput
                  ref={input}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={300}
                  autoComplete="off"
                  aria-label={dict.ask}
                  placeholder={
                    question ? dict.placeholderAgain : dict.placeholder
                  }
                  className={cn(
                    "h-auto rounded-none border-0 p-0 font-serif text-xl tracking-normal shadow-none focus-visible:ring-0 lg:text-3xl",
                    "placeholder:text-muted-ink"
                  )}
                />
                <InputGroupAddon align="inline-end" className="p-0">
                  <InputGroupButton
                    type="submit"
                    aria-label={dict.send}
                    className="bg-agent hover:bg-agent/80 lg:text-agent size-9.5 rounded-full text-base text-white lg:size-auto lg:bg-transparent lg:hover:bg-transparent"
                  >
                    <span className="lg:hidden">↑</span>
                    <span className="hidden font-mono text-xs lg:inline">
                      ↵
                    </span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
