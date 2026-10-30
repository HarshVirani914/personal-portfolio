"use client";

import { useRef, type ReactNode } from "react";
import { translateAlong } from "@/components/iso/iso-kit";
import { useScrub } from "@/components/figures/shared/use-scrub";
import { dialAt, rodAt } from "./frame";
import { LAST, clockOf, poseOf, readoutOf, tourAt, type Locale } from "./model";
import { COLUMN, HEIGHT, P, PRESS, ROW, WIDTH, at, columnX } from "./view";

const REST = poseOf(LAST);
const PICK_FROM = at([columnX(0), 0, 0])[0];
const PICK_TO = at([columnX(LAST), 0, 0])[0];
const bridgeAt = (t: number) => translateAlong(P, [t * COLUMN, 0, 0]);
const headAt = (t: number, row: number, z = 0) =>
  translateAlong(P, [t * COLUMN, (row - 2) * ROW, z]);

interface Props {
  locale: Locale;
  testId?: string | undefined;
  aria: string;
  label: string;
  halo: string;
  rangeCells: string[];
  writtenCell: string;
  bench: ReactNode;
  tiles: ReactNode;
  legs: ReactNode;
  bridgeBack: ReactNode;
  head: ReactNode;
  sleeve: ReactNode;
}

export function GridLive(props: Props) {
  const { locale } = props;
  const back = useRef<SVGGElement | null>(null);
  const legs = useRef<SVGGElement | null>(null);
  const head = useRef<SVGGElement | null>(null);
  const rod = useRef<SVGPathElement | null>(null);
  const rodFill = useRef<SVGPathElement | null>(null);
  const sleeve = useRef<SVGGElement | null>(null);
  const dial = useRef<SVGPathElement | null>(null);
  const lamp = useRef<SVGCircleElement | null>(null);
  const cells = useRef<(SVGPathElement | null)[]>([]);
  const written = useRef<SVGPathElement | null>(null);

  const { root, target, steer, say, hold } = useScrub({
    rest: LAST,
    most: 2.4,
    tourAt,
    clockOf,
    frame: (t) => {
      const pose = poseOf(t);
      const bridge = bridgeAt(t);
      back.current?.setAttribute("transform", bridge);
      legs.current?.setAttribute("transform", bridge);
      const carried = headAt(t, pose.row);
      head.current?.setAttribute("transform", carried);
      for (const node of [rod.current, rodFill.current]) {
        node?.setAttribute("d", rodAt(pose.press * PRESS));
        node?.setAttribute("transform", carried);
      }
      sleeve.current?.setAttribute(
        "transform",
        headAt(t, pose.row, -pose.press * PRESS)
      );
      dial.current?.setAttribute("d", dialAt(pose.thought));
      lamp.current?.setAttribute("data-on", `${pose.checked}`);
      cells.current.forEach((node, index) =>
        node?.setAttribute(
          "opacity",
          `${Math.min(1, Math.max(0, pose.read - index))}`
        )
      );
      written.current?.setAttribute("opacity", pose.written ? "1" : "0");
      say(readoutOf(pose, locale), pose.stage);
      return false;
    },
  });

  const toT = (clientX: number) => {
    const box = root.current?.querySelector("svg")?.getBoundingClientRect();
    if (!box?.width) return null;
    const sx = ((clientX - box.left) / box.width) * WIDTH;
    return Math.min(
      LAST,
      Math.max(0, ((sx - PICK_FROM) / (PICK_TO - PICK_FROM)) * LAST)
    );
  };

  const follow = (clientX: number) => {
    const next = toT(clientX);
    if (next !== null) steer(next);
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
      aria-valuemax={LAST}
      aria-valuenow={LAST}
      {...hold}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        follow(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse" || event.buttons)
          follow(event.clientX);
      }}
      onKeyDown={(event) => {
        const now = Math.round(target.current);
        if (event.key === "ArrowRight" || event.key === "ArrowUp")
          steer(Math.min(LAST, now + 1));
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          steer(Math.max(0, now - 1));
        else if (event.key === "Home") steer(0);
        else if (event.key === "End") steer(LAST);
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
        {props.tiles}
        {props.rangeCells.map((d, index) => (
          <path
            key={index}
            ref={(node) => {
              cells.current[index] = node;
            }}
            className="iso-line"
            data-tone="lit"
            d={d}
            opacity="1"
          />
        ))}
        <path ref={written} className="fig-lit" d={props.writtenCell} />
        <g ref={legs} transform={bridgeAt(LAST)}>
          {props.legs}
        </g>
        <g ref={back} transform={bridgeAt(LAST)}>
          {props.bridgeBack}
        </g>
        <g ref={sleeve} transform={headAt(LAST, REST.row)}>
          {props.sleeve}
        </g>
        <path
          ref={rodFill}
          className="iso-fill"
          d={rodAt(0)}
          transform={headAt(LAST, REST.row)}
        />
        <path
          ref={rod}
          className="iso-line"
          data-tone="mid"
          d={rodAt(0)}
          transform={headAt(LAST, REST.row)}
        />
        <g ref={head} transform={headAt(LAST, REST.row)}>
          {props.head}
          <path
            ref={dial}
            className="iso-line"
            data-tone="hi"
            data-free=""
            d={dialAt(REST.thought)}
          />
          <circle
            ref={lamp}
            className="fig-lamp"
            {...lampAt()}
            data-on="true"
          />
        </g>
      </svg>
    </div>
  );
}

function lampAt() {
  const [cx, cy] = at([columnX(0) + 2.4, -5.5, 55]);
  return { cx, cy, r: 1.3 };
}
