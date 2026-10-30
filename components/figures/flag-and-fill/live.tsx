"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translateAlong, type Flat } from "@/components/iso/iso-kit";
import { asksForStillness, follow } from "@/components/iso/react/live";
import { turnAbout } from "./flag-turn";
import { FEED_TRAVEL, flagArt, needleAt, stemAt } from "./frame";
import {
  COUNT,
  FIELDS,
  UNSURE,
  poseOf,
  readoutOf,
  tourAt,
  TOUR_RATE,
  type Locale,
  type Pose,
} from "./model";
import {
  CARD_Z,
  HEIGHT,
  LIFT,
  READER_TOP,
  READER_X,
  WIDTH,
  P,
  at,
  slotX,
} from "./view";

const RISE = READER_TOP - CARD_Z;
const poseAt = (t: number) => poseOf(t, slotX, READER_X, LIFT, RISE);
const FLAGS = FIELDS.map((_, index) => flagArt(index));
const PICK_FROM = at([slotX(0) - 9, 0, 0])[0];
const PICK_TO = at([slotX(COUNT - 1) + 9, 0, 0])[0];
const MOST_RATE = 2.6;
const TOUR_FIRST = 1.2;
const TOUR_BACK = 3600;
const NO_CHECKS = FIELDS.map(() => false);
const FINAL = poseAt(COUNT);

interface Props {
  locale: Locale;
  testId?: string | undefined;
  aria: string;
  label: string;
  halo: string;
  thresholdMark: Flat;
  lampAt: Flat;
  bench: ReactNode;
  gantry: ReactNode;
  hopper: ReactNode;
  hopperFront: ReactNode;
  cheekBack: ReactNode;
  sheet: ReactNode;
  cheekFront: ReactNode;
  block: ReactNode;
  dial: ReactNode;
  trayBack: ReactNode;
  dividers: ReactNode[];
  cards: ReactNode[];
  trayFront: ReactNode;
  jaw: ReactNode;
  shuttle: ReactNode;
  stopFront: ReactNode;
}

export function FlagAndFillLive(props: Props) {
  const root = useRef<HTMLDivElement | null>(null);
  const sheet = useRef<SVGGElement | null>(null);
  const needle = useRef<SVGPathElement | null>(null);
  const lamp = useRef<SVGCircleElement | null>(null);
  const jaw = useRef<SVGGElement | null>(null);
  const stem = useRef<SVGPathElement | null>(null);
  const stemFill = useRef<SVGPathElement | null>(null);
  const shuttle = useRef<SVGGElement | null>(null);
  const cards = useRef<(SVGGElement | null)[]>([]);
  const flags = useRef<(SVGGElement | null)[]>([]);

  const clock = useRef(0);
  const t = useRef(COUNT);
  const target = useRef(COUNT);
  const checked = useRef<boolean[]>(NO_CHECKS.slice());
  const shownFlags = useRef<number[]>(FINAL.raised.slice());
  const fade = useRef(0);
  const touring = useRef(false);
  const frame = useRef(0);
  const last = useRef(0);
  const [visible, setVisible] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [poke, setPoke] = useState(0);
  const { locale } = props;

  const draw = useCallback(
    (pose: Pose) => {
      sheet.current?.setAttribute(
        "transform",
        translateAlong(P, [pose.sheet * FEED_TRAVEL, 0, 0])
      );
      needle.current?.setAttribute("d", needleAt(pose.needle));
      lamp.current?.setAttribute(
        "data-on",
        pose.stage === "read" ? "true" : "false"
      );
      const travel = pose.shuttle - READER_X;
      const carried = translateAlong(P, [travel, 0, pose.jaw]);
      jaw.current?.setAttribute("transform", carried);
      shuttle.current?.setAttribute(
        "transform",
        translateAlong(P, [travel, 0, 0])
      );
      const d = stemAt(pose.jaw);
      for (const node of [stem.current, stemFill.current]) {
        node?.setAttribute("d", d);
        node?.setAttribute("transform", translateAlong(P, [travel, 0, 0]));
      }
      pose.cards.forEach((card, index) => {
        const node = cards.current[index];
        if (!node) return;
        node.setAttribute(
          "transform",
          translateAlong(P, [card.x, 0, card.z - 6 * fade.current])
        );
        node.setAttribute(
          "opacity",
          `${Math.round(card.shown * (1 - fade.current) * 100) / 100}`
        );
      });
      shownFlags.current.forEach((value, index) => {
        const node = flags.current[index];
        if (!node) return;
        node.setAttribute("transform", turnAbout(FLAGS[index]!.pivot, value));
        node.dataset.up = value > 0.5 ? "true" : "false";
      });
      const slot = root.current
        ?.closest("figure")
        ?.querySelector("[data-readout]");
      const text = readoutOf(pose, checked.current, locale);
      if (slot && slot.textContent !== text) slot.textContent = text;
    },
    [locale]
  );

  const run = useCallback(() => {
    if (frame.current) return;
    last.current = 0;
    const tick = (now: number) => {
      const dt = last.current
        ? Math.min((now - last.current) / 1000, 1 / 30)
        : 1 / 60;
      last.current = now;
      const calm = asksForStillness();
      if (touring.current) {
        clock.current += dt;
        const tour = tourAt(clock.current);
        t.current = tour.t;
        target.current = tour.t;
        checked.current = tour.checked;
        fade.current = tour.fade;
      } else {
        fade.current = 0;
        const gap = target.current - t.current;
        const step = Math.min(
          Math.abs(gap),
          MOST_RATE * dt,
          Math.max(Math.abs(gap) * (1 - Math.exp(-dt / 0.12)), 0.004)
        );
        t.current = calm ? target.current : t.current + Math.sign(gap) * step;
      }
      const pose = poseAt(t.current);
      checked.current = checked.current.map(
        (value, index) => value && pose.raised[index]! > 0.5
      );
      let flagsMoving = false;
      shownFlags.current = shownFlags.current.map((value, index) => {
        const goal = checked.current[index] ? 0 : pose.raised[index]!;
        const next = follow(value, goal, dt, 0.14, calm);
        if (next !== goal) flagsMoving = true;
        return next;
      });
      draw(pose);
      if (!touring.current) {
        const node = root.current;
        node?.setAttribute("aria-valuenow", `${Math.round(target.current)}`);
        node?.setAttribute(
          "aria-valuetext",
          readoutOf(poseAt(target.current), checked.current, locale)
        );
      }
      const settled =
        !touring.current && t.current === target.current && !flagsMoving;
      frame.current = settled ? 0 : requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [draw, locale]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
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
        clock.current = t.current / TOUR_RATE;
        touring.current = true;
        run();
      },
      poke ? TOUR_BACK : TOUR_FIRST * 1000
    );
    return () => {
      window.clearTimeout(timer);
      touring.current = false;
    };
  }, [visible, engaged, poke, run, stop]);

  const take = () => {
    touring.current = false;
    fade.current = 0;
    setPoke((count) => count + 1);
  };

  const steer = (next: number) => {
    take();
    target.current = Math.min(COUNT, Math.max(0, next));
    run();
  };

  const review = () => {
    take();
    const next = UNSURE.find(
      (index) => shownFlags.current[index]! > 0.5 && !checked.current[index]
    );
    if (next === undefined) return;
    checked.current = checked.current.map(
      (value, index) => value || index === next
    );
    run();
  };

  const fieldAt = (clientX: number) => {
    const box = root.current?.querySelector("svg")?.getBoundingClientRect();
    if (!box?.width) return null;
    const sx = ((clientX - box.left) / box.width) * WIDTH;
    return Math.round(((sx - PICK_FROM) / (PICK_TO - PICK_FROM)) * COUNT);
  };

  const rest = useMemo(() => FINAL, []);
  const restStem = stemAt(rest.jaw);
  const restTravel = rest.shuttle - READER_X;

  return (
    <div
      ref={root}
      className="fig"
      role="slider"
      tabIndex={0}
      data-testid={props.testId}
      aria-label={props.aria}
      aria-valuemin={0}
      aria-valuemax={COUNT}
      aria-valuenow={COUNT}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setEngaged(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setEngaged(false);
      }}
      onPointerMove={(event) => {
        const field = fieldAt(event.clientX);
        if (field !== null && (event.pointerType === "mouse" || event.buttons))
          steer(field);
      }}
      onClick={review}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      onKeyDown={(event) => {
        const by = event.shiftKey ? 3 : 1;
        const now = Math.round(target.current);
        if (event.key === "ArrowRight" || event.key === "ArrowUp")
          steer(now + by);
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          steer(now - by);
        else if (event.key === "Home") steer(0);
        else if (event.key === "End") steer(COUNT);
        else if (event.key === " " || event.key === "Enter") review();
        else return;
        event.preventDefault();
      }}
    >
      <svg
        className="iso-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={props.label}
        focusable="false"
      >
        <path className="iso-halo" d={props.halo} />
        {props.bench}
        {props.gantry}
        {props.cheekBack}
        {props.hopper}
        <g ref={sheet}>{props.sheet}</g>
        {props.hopperFront}
        {props.cheekFront}
        <circle
          ref={lamp}
          className="ff-lamp"
          cx={props.lampAt[0]}
          cy={props.lampAt[1]}
          r={2}
          data-on="false"
        />
        {props.block}
        {props.dial}
        <circle
          className="ff-mark"
          cx={props.thresholdMark[0]}
          cy={props.thresholdMark[1]}
          r={1.1}
        />
        <path
          ref={needle}
          className="iso-line ff-needle"
          data-tone="hi"
          data-free=""
          d={needleAt(rest.needle)}
        />
        {props.trayBack}
        {props.cards.map((card, index) => (
          <g key={index}>
            {index > 0 ? props.dividers[index - 1] : null}
            <g
              ref={(node) => {
                cards.current[index] = node;
              }}
              className="ff-card"
            >
              {card}
            </g>
          </g>
        ))}
        {props.trayFront}
        <g ref={jaw} transform={translateAlong(P, [restTravel, 0, rest.jaw])}>
          {props.jaw}
        </g>
        <path
          ref={stemFill}
          className="iso-fill"
          d={restStem}
          transform={translateAlong(P, [restTravel, 0, 0])}
        />
        <path
          ref={stem}
          className="iso-line"
          data-tone="mid"
          d={restStem}
          transform={translateAlong(P, [restTravel, 0, 0])}
        />
        <g ref={shuttle} transform={translateAlong(P, [restTravel, 0, 0])}>
          {props.shuttle}
        </g>
        {props.stopFront}
        {FLAGS.map((flag, index) => (
          <g key={index}>
            <g
              ref={(node) => {
                flags.current[index] = node;
              }}
              className="ff-flag"
              data-up={FINAL.raised[index]! > 0.5 ? "true" : "false"}
              transform={turnAbout(flag.pivot, FINAL.raised[index]!)}
            >
              <path className="iso-line" data-tone="mid" d={flag.staff} />
              <path className="ff-flag-plate" d={flag.plate} />
            </g>
            <circle
              className="ff-pivot"
              cx={flag.pivot[0]}
              cy={flag.pivot[1]}
              r={1.3}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
