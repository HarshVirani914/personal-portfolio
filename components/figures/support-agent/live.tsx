"use client";

import { useRef, type ReactNode } from "react";
import { translateAlong, type Flat } from "@/components/iso/iso-kit";
import { useScrub } from "@/components/figures/shared/use-scrub";
import { SHANK, keyPath, springAt } from "./frame";
import {
  END,
  PINS,
  QUESTION_ENDS,
  REST,
  clockOf,
  poseOf,
  readoutOf,
  tourAt,
  type Locale,
  type Pose,
} from "./model";
import { CARD_TRAVEL, GATE_LIFT, HEIGHT, P, WIDTH, at } from "./view";

const FIRST = poseOf(REST);
const KEYS = Array.from({ length: END }, (_, attempt) => keyPath(attempt));
const pinsUp = (drift: number) => translateAlong(P, [0, 0, drift]);
const keyMove = (key: number) => translateAlong(P, [key, 0, 0]);
const LAMP_Z = 80;

interface Props {
  locale: Locale;
  testId?: string | undefined;
  aria: string;
  label: string;
  halo: string;
  bellLamp: Flat;
  bench: ReactNode;
  tray: ReactNode;
  lock: ReactNode;
  keyPins: ReactNode[];
  drivers: ReactNode[];
  bar: ReactNode;
  guideBack: ReactNode;
  answer: ReactNode;
  gate: ReactNode;
  guideFront: ReactNode;
  bell: ReactNode;
}

export function SupportLive(props: Props) {
  const { locale } = props;
  const key = useRef<SVGGElement | null>(null);
  const blade = useRef<SVGPathElement | null>(null);
  const pins = useRef<(SVGGElement | null)[]>([]);
  const springs = useRef<(SVGPathElement | null)[]>([]);
  const lamps = useRef<(SVGCircleElement | null)[]>([]);
  const gate = useRef<SVGGElement | null>(null);
  const answer = useRef<SVGGElement | null>(null);
  const bell = useRef<SVGCircleElement | null>(null);

  const { root, target, steer, say, hold } = useScrub({
    rest: REST,
    most: 1.6,
    tourAt,
    clockOf,
    frame: (t) => {
      const pose: Pose = poseOf(t);
      key.current?.setAttribute("transform", keyMove(pose.key));
      if (
        blade.current &&
        blade.current.getAttribute("d") !== KEYS[pose.attempt]
      )
        blade.current.setAttribute("d", KEYS[pose.attempt]!);
      pose.drift.forEach((drift, index) => {
        pins.current[index]?.setAttribute("transform", pinsUp(drift));
        springs.current[index]?.setAttribute("d", springAt(index, drift));
        lamps.current[index]?.setAttribute(
          "data-on",
          `${Math.abs(drift) < 0.3}`
        );
      });
      gate.current?.setAttribute(
        "transform",
        translateAlong(P, [0, 0, pose.gate * GATE_LIFT])
      );
      answer.current?.setAttribute(
        "transform",
        translateAlong(P, [-pose.card * CARD_TRAVEL, 0, 0])
      );
      answer.current?.setAttribute("opacity", `${pose.shown}`);
      bell.current?.setAttribute("data-on", `${pose.human}`);
      say(readoutOf(pose, locale), pose.question);
      return false;
    },
  });

  const next = () => {
    const now = target.current;
    const after = QUESTION_ENDS.find((end) => end > now + 0.01);
    steer(after ?? QUESTION_ENDS[0]!);
  };

  return (
    <div
      ref={root}
      className="fig"
      role="slider"
      tabIndex={0}
      data-testid={props.testId}
      aria-label={props.aria}
      aria-valuemin={0}
      aria-valuemax={QUESTION_ENDS.length - 1}
      aria-valuenow={0}
      {...hold}
      onClick={next}
      onKeyDown={(event) => {
        if (
          [
            " ",
            "Enter",
            "ArrowRight",
            "ArrowUp",
            "ArrowLeft",
            "ArrowDown",
          ].includes(event.key)
        ) {
          next();
          event.preventDefault();
        }
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
        {props.tray}
        <g
          ref={answer}
          opacity={FIRST.shown}
          transform={translateAlong(P, [-FIRST.card * CARD_TRAVEL, 0, 0])}
        >
          {props.answer}
        </g>
        {props.guideBack}
        <g
          ref={gate}
          transform={translateAlong(P, [0, 0, FIRST.gate * GATE_LIFT])}
        >
          {props.gate}
        </g>
        {props.guideFront}
        {props.lock}
        {Array.from({ length: PINS }, (_, index) => (
          <circle
            key={index}
            ref={(node) => {
              lamps.current[index] = node;
            }}
            className="fig-lamp"
            data-on={`${Math.abs(FIRST.drift[index]!) < 0.3}`}
            r={1.5}
            cx={at([-48 + index * 24, -13, LAMP_Z])[0]}
            cy={at([-48 + index * 24, -13, LAMP_Z])[1]}
          />
        ))}
        {props.keyPins.map((pin, index) => (
          <g key={index}>
            <path
              ref={(node) => {
                springs.current[index] = node;
              }}
              className="iso-line"
              data-tone="mid"
              d={springAt(index, FIRST.drift[index]!)}
            />
            <g
              ref={(node) => {
                pins.current[index] = node;
              }}
              transform={pinsUp(FIRST.drift[index]!)}
            >
              {pin}
              {props.drivers[index]}
            </g>
          </g>
        ))}
        <g ref={key} transform={keyMove(FIRST.key)}>
          <path
            ref={blade}
            className="fig-paper fig-deck fig-key"
            d={KEYS[FIRST.attempt]}
          />
          <path className="fig-paper fig-deck fig-key" d={SHANK} />
        </g>
        {props.bar}
        {props.bell}
        <circle
          ref={bell}
          className="fig-lamp"
          data-on="false"
          cx={props.bellLamp[0]}
          cy={props.bellLamp[1]}
          r={1.5}
        />
      </svg>
    </div>
  );
}
