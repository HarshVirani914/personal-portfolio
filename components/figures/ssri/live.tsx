"use client";

import { useRef, type ReactNode } from "react";
import { translateAlong } from "@/components/iso/iso-kit";
import { useScrub } from "@/components/figures/shared/use-scrub";
import { beamAt, hangersAt, panDrop, pointerAt } from "./frame";
import {
  QUESTIONS,
  REPORTED,
  clockOf,
  poseOf,
  readoutOf,
  tourAt,
  type Locale,
  type Pose,
} from "./model";
import { DROP, HEIGHT, P, REPORT_RISE, WIDTH } from "./view";

const FIRST = poseOf(REPORTED);
const FIRST_BEAM = beamAt(FIRST.tilt);
const lifted = (z: number) => translateAlong(P, [0, 0, z]);
const reportAt = (share: number) => lifted((share - 1) * REPORT_RISE);

interface Props {
  locale: Locale;
  testId?: string | undefined;
  aria: string;
  label: string;
  halo: string;
  bench: ReactNode;
  pillar: ReactNode;
  scale: ReactNode;
  panA: ReactNode;
  panB: ReactNode;
  weightsA: ReactNode[];
  weightsB: ReactNode[];
  printer: ReactNode;
  sheets: ReactNode[];
  sheetClip: string;
}

export function SsriLive(props: Props) {
  const { locale } = props;
  const panA = useRef<SVGGElement | null>(null);
  const panB = useRef<SVGGElement | null>(null);
  const hangA = useRef<SVGPathElement | null>(null);
  const hangB = useRef<SVGPathElement | null>(null);
  const top = useRef<SVGPathElement | null>(null);
  const side = useRef<SVGPathElement | null>(null);
  const end = useRef<SVGPathElement | null>(null);
  const pointer = useRef<SVGPathElement | null>(null);
  const weights = useRef<(SVGGElement | null)[]>([]);
  const sheets = useRef<(SVGGElement | null)[]>([]);

  const { root, target, steer, say, hold } = useScrub({
    rest: REPORTED,
    most: 2.6,
    tourAt,
    clockOf,
    frame: (t) => {
      const pose: Pose = poseOf(t);
      panA.current?.setAttribute("transform", lifted(panDrop(pose.tilt, -1)));
      panB.current?.setAttribute("transform", lifted(panDrop(pose.tilt, 1)));
      hangA.current?.setAttribute("d", hangersAt(pose.tilt, -1));
      hangB.current?.setAttribute("d", hangersAt(pose.tilt, 1));
      const beam = beamAt(pose.tilt);
      top.current?.setAttribute("d", beam.top);
      side.current?.setAttribute("d", beam.side);
      end.current?.setAttribute("d", beam.end);
      pointer.current?.setAttribute("d", pointerAt(pose.tilt));
      weights.current.forEach((node, index) => {
        const landed = pose.landed[index % QUESTIONS]!;
        node?.setAttribute(
          "opacity",
          `${landed > 0 ? Math.min(1, landed * 3) * (1 - pose.fade) : 0}`
        );
        node?.setAttribute("transform", lifted((1 - landed) * DROP));
      });
      sheets.current.forEach((node) => {
        node?.setAttribute("opacity", `${Math.min(1, pose.report * 4)}`);
        node?.setAttribute("transform", reportAt(pose.report));
      });
      say(readoutOf(pose, locale), pose.question);
      return false;
    },
  });

  return (
    <div
      ref={root}
      className="fig"
      role="slider"
      tabIndex={0}
      data-testid={props.testId}
      aria-label={props.aria}
      aria-valuemin={0}
      aria-valuemax={QUESTIONS}
      aria-valuenow={QUESTIONS}
      {...hold}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" && !event.buttons) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (box.width)
          steer(
            Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) *
              REPORTED
          );
      }}
      onKeyDown={(event) => {
        const now = Math.round(target.current);
        if (
          event.key === "ArrowRight" ||
          event.key === "ArrowUp" ||
          event.key === " "
        )
          steer(Math.min(REPORTED, now + 1));
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          steer(Math.max(0, now - 1));
        else if (event.key === "Home") steer(0);
        else if (event.key === "End") steer(REPORTED);
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
        <path
          ref={hangA}
          className="iso-line"
          data-tone="mid"
          d={hangersAt(FIRST.tilt, -1)}
        />
        <g ref={panA} transform={lifted(panDrop(FIRST.tilt, -1))}>
          {props.panA}
          {props.weightsA.map((item, index) => (
            <g
              key={index}
              ref={(node) => {
                weights.current[index] = node;
              }}
            >
              {item}
            </g>
          ))}
        </g>
        {props.pillar}
        <path ref={top} className="fig-paper fig-deck" d={FIRST_BEAM.top} />
        <path ref={side} className="fig-paper" d={FIRST_BEAM.side} />
        <path ref={end} className="fig-paper" d={FIRST_BEAM.end} />
        {props.scale}
        <path
          ref={pointer}
          className="iso-line fig-pointer"
          data-free="end"
          d={pointerAt(FIRST.tilt)}
        />
        <path
          ref={hangB}
          className="iso-line"
          data-tone="mid"
          d={hangersAt(FIRST.tilt, 1)}
        />
        <g ref={panB} transform={lifted(panDrop(FIRST.tilt, 1))}>
          {props.panB}
          {props.weightsB.map((item, index) => (
            <g
              key={index}
              ref={(node) => {
                weights.current[QUESTIONS + index] = node;
              }}
            >
              {item}
            </g>
          ))}
        </g>
        {props.printer}
        <clipPath id="ssri-sheets">
          <path d={props.sheetClip} />
        </clipPath>
        <g clipPath="url(#ssri-sheets)">
          {props.sheets.map((sheet, index) => (
            <g
              key={index}
              ref={(node) => {
                sheets.current[index] = node;
              }}
              transform={reportAt(FIRST.report)}
            >
              {sheet}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
