"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

const EMAIL = "harshvirani.91@gmail.com";
const EASE = [0.22, 1, 0.36, 1] as const;
const WIDTH_COLLAPSED = 118;
const WIDTH_EXPANDED = 278;

export function ContactButton(): ReactNode {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpanded = open || copied;

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {}
      document.body.removeChild(ta);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-label={
        copied ? "Email copied" : isExpanded ? `Copy ${EMAIL}` : "Show email"
      }
      initial={false}
      animate={{ width: isExpanded ? WIDTH_EXPANDED : WIDTH_COLLAPSED }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ borderRadius: 12 }}
      className="focus-ring bg-foreground text-background relative inline-flex h-11 max-w-full shrink-0 cursor-pointer items-center justify-start overflow-hidden px-0 text-sm font-medium"
    >
      <span className="relative inline-flex h-full w-full items-center justify-center px-5">
        <AnimatePresence initial={false} mode="wait">
          {isExpanded ? (
            <motion.span
              key="email"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: EASE }}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                <AnimatePresence initial={false} mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="tabular-nums">{EMAIL}</span>
            </motion.span>
          ) : (
            <motion.span
              key="contact"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: EASE }}
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Contact</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
