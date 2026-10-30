"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { asksForStillness } from "@/components/iso/react/live";

const TOUR_FIRST = 1200;
const TOUR_BACK = 3600;

interface Options {
  /** Where the figure rests before any script runs. */
  rest: number;
  /** Fastest the machine may catch up with the reader, in units a second. */
  most: number;
  tourAt: (clock: number) => number;
  clockOf: (t: number) => number;
  /** Draws one frame; true keeps the loop running after `t` has arrived. */
  frame: (t: number, dt: number, calm: boolean, touring: boolean) => boolean;
}

/** One figure's loop: `t` follows the reader, or the idle tour when nobody is there. */
export function useScrub({ rest, most, tourAt, clockOf, frame }: Options) {
  const root = useRef<HTMLDivElement | null>(null);
  const t = useRef(rest);
  const target = useRef(rest);
  const clock = useRef(0);
  const touring = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const draw = useRef(frame);
  const [visible, setVisible] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [poke, setPoke] = useState(0);

  useEffect(() => {
    draw.current = frame;
  });

  const run = useCallback(() => {
    if (raf.current) return;
    last.current = 0;
    const tick = (now: number) => {
      const dt = last.current
        ? Math.min((now - last.current) / 1000, 1 / 30)
        : 1 / 60;
      last.current = now;
      const calm = asksForStillness();
      if (touring.current) {
        clock.current += dt;
        t.current = tourAt(clock.current);
        target.current = t.current;
      } else {
        const gap = target.current - t.current;
        const step = Math.min(
          Math.abs(gap),
          most * dt,
          Math.max(Math.abs(gap) * (1 - Math.exp(-dt / 0.12)), 0.004)
        );
        t.current = calm ? target.current : t.current + Math.sign(gap) * step;
      }
      const moving = draw.current(t.current, dt, calm, touring.current);
      raf.current =
        touring.current || moving || t.current !== target.current
          ? requestAnimationFrame(tick)
          : 0;
    };
    raf.current = requestAnimationFrame(tick);
  }, [most, tourAt]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(Boolean(entries.at(-1)?.isIntersecting)),
      { rootMargin: "120px 0px" }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!visible) {
      touring.current = false;
      stop();
      return;
    }
    if (engaged || asksForStillness()) return;
    const timer = window.setTimeout(
      () => {
        clock.current = clockOf(t.current);
        touring.current = true;
        run();
      },
      poke ? TOUR_BACK : TOUR_FIRST
    );
    return () => {
      window.clearTimeout(timer);
      touring.current = false;
    };
  }, [visible, engaged, poke, run, stop, clockOf]);

  const take = useCallback(() => {
    touring.current = false;
    setPoke((count) => count + 1);
  }, []);

  const steer = useCallback(
    (next: number) => {
      take();
      target.current = next;
      run();
    },
    [take, run]
  );

  /** Writes the band's readout; the screen-reader value only when the reader chose it. */
  const say = useCallback((text: string, value: number) => {
    const slot = root.current
      ?.closest("figure")
      ?.querySelector("[data-readout]");
    if (slot && slot.textContent !== text) slot.textContent = text;
    if (touring.current) return;
    root.current?.setAttribute("aria-valuenow", `${value}`);
    root.current?.setAttribute("aria-valuetext", text);
  }, []);

  const hold = {
    onPointerEnter: (event: { pointerType: string }) => {
      if (event.pointerType === "mouse") setEngaged(true);
    },
    onPointerLeave: (event: { pointerType: string }) => {
      if (event.pointerType === "mouse") setEngaged(false);
    },
    onFocus: () => setEngaged(true),
    onBlur: () => setEngaged(false),
  };

  return { root, target, run, take, steer, say, hold };
}
