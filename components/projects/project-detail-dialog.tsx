"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import type { Project } from "@/lib/projects-data";
import { useLenis } from "@/lib/lenis-context";

const EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_DURATION_S = 0.4;

type ProjectDetailDialogProps = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectDetailDialog({
  project,
  onClose,
}: ProjectDetailDialogProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const [openProject, setOpenProject] = useState<Project | null>(null);

  const isClosing = Boolean(project) && openProject === null;

  const finishClose = useCallback((): void => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
    onClose();
  }, [onClose]);

  const handleRequestClose = useCallback((): void => {
    if (!project) return;

    if (prefersReducedMotion) {
      setOpenProject(null);
      finishClose();
      return;
    }

    setOpenProject(null);
  }, [project, prefersReducedMotion, finishClose]);

  const handleExitComplete = useCallback((): void => {
    if (project) {
      finishClose();
    }
  }, [project, finishClose]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>): void => {
      if (event.target !== dialogRef.current) return;
      handleRequestClose();
    },
    [handleRequestClose]
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !project) return;

    setOpenProject(project);
    if (!dialog.open) {
      dialog.showModal();
    }
    closeButtonRef.current?.focus();
  }, [project]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event): void => {
      event.preventDefault();
      handleRequestClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [handleRequestClose]);

  useLayoutEffect(() => {
    if (!project) return;

    lenis?.stop();

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [project, lenis]);

  const Icon = openProject?.icon;

  return (
    <dialog
      ref={dialogRef}
      closedby="closerequest"
      aria-labelledby={openProject ? "project-dialog-title" : undefined}
      data-lenis-prevent
      data-closing={isClosing ? "" : undefined}
      onClick={handleBackdropClick}
      className="project-dialog focus-ring:m-0 fixed inset-x-0 bottom-0 z-50 m-0 hidden h-[min(92vh,900px)] max-h-[min(92vh,900px)] w-full max-w-none rounded-t-4xl border border-foreground/8 bg-background p-0 shadow-2xl open:flex open:flex-col md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[min(88vh,820px)] md:w-[min(42rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-4xl lg:w-[min(48rem,calc(100vw-3rem))]"
    >
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {openProject ? (
          <motion.div
            key={openProject.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: EXIT_DURATION_S, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-foreground/15 md:hidden"
              aria-hidden="true"
            />

            <div className="border-foreground/8 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                {Icon ? (
                  <span className="border-foreground/10 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <Icon
                      className="size-3.5 text-foreground"
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium tracking-tight text-foreground">
                    {openProject.iconLabel}
                  </span>
                  <span className="text-foreground/50 text-[12px] tracking-tight">
                    {openProject.detail.role}
                  </span>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleRequestClose}
                aria-label="Close project details"
                className="focus-ring border-foreground/8 hover:bg-foreground/5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-foreground transition-colors"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
            >
              <div
                className="ring-foreground/5 relative mx-4 mt-4 overflow-hidden rounded-2xl bg-foreground/5 ring-1 sm:mx-5"
                style={{ aspectRatio: openProject.imageRatio }}
              >
                <Image
                  src={openProject.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex flex-col gap-6 px-4 py-6 sm:px-5 sm:py-7">
                <div className="flex flex-col gap-3">
                  <h2
                    id="project-dialog-title"
                    className="font-serif text-[1.65rem] font-medium leading-[1.15] tracking-tight text-foreground sm:text-[1.85rem]"
                  >
                    {openProject.detail.tagline}
                  </h2>
                  <p className="text-[15px] leading-relaxed tracking-tight text-foreground/70">
                    {openProject.title}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <DetailStat label="Timeline" value={openProject.detail.timeline} />
                  <DetailStat label="Period" value={openProject.meta} />
                  {openProject.detail.highlights[0] ? (
                    <DetailStat
                      label="Highlight"
                      value={openProject.detail.highlights[0]}
                      className="col-span-2 sm:col-span-1"
                    />
                  ) : null}
                </dl>

                <StorySection
                  index="01"
                  title="The problem"
                  body={openProject.detail.problem}
                />
                <StorySection
                  index="02"
                  title="What I built"
                  body={openProject.detail.approach}
                />
                <StorySection
                  index="03"
                  title="Outcome"
                  body={openProject.detail.outcome}
                />

                {openProject.detail.highlights.length > 1 ? (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[13px] font-semibold tracking-tight text-foreground/50 uppercase">
                      Key results
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {openProject.detail.highlights.map((item) => (
                        <li
                          key={item}
                          className="border-foreground/8 bg-foreground/2 flex gap-2 rounded-2xl border px-3 py-2.5 text-[14px] leading-normal tracking-tight text-foreground/75"
                        >
                          <span
                            className="text-foreground/30 mt-0.5 shrink-0"
                            aria-hidden="true"
                          >
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[13px] font-semibold tracking-tight text-foreground/50 uppercase">
                    Stack
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {openProject.detail.stack.map((tech) => (
                      <li key={tech}>
                        <span className="rounded-full border border-foreground/8 bg-background px-3 py-1.5 text-[13px] tracking-tight text-foreground/85">
                          {tech}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-foreground/8 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
              <p className="text-foreground/45 text-[12px] tracking-tight">
                Esc to close
              </p>
              {openProject.links && openProject.links.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {openProject.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring border-foreground/8 hover:bg-foreground/5 inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-[13px] font-medium tracking-tight text-foreground transition-colors"
                      >
                        {link.label}
                        <ExternalLink
                          className="size-3.5 text-foreground/50"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}

function DetailStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}): ReactNode {
  return (
    <div
      className={`border-foreground/8 bg-foreground/2 flex flex-col gap-1 rounded-2xl border px-3 py-2.5 ${className}`}
    >
      <dt className="text-[11px] font-medium tracking-tight text-foreground/45 uppercase">
        {label}
      </dt>
      <dd className="text-[13px] leading-snug font-medium tracking-tight text-foreground/80">
        {value}
      </dd>
    </div>
  );
}

function StorySection({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}): ReactNode {
  return (
    <div className="flex gap-4">
      <span
        className="font-serif text-[1.75rem] leading-none font-medium tracking-tight text-foreground/15"
        aria-hidden="true"
      >
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-[15px] leading-[1.65] tracking-tight text-foreground/70">
          {body}
        </p>
      </div>
    </div>
  );
}
