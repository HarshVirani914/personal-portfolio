"use client";

import { useRef, type ReactNode } from "react";
import { translateAlong } from "@/components/iso/iso-kit";
import { useScrub } from "@/components/figures/shared/use-scrub";
import { bridgeAt } from "./frame";
import {
  COINS,
  END,
  REST,
  clockOf,
  poseOf,
  readoutOf,
  tourAt,
  type Locale,
} from "./model";
import {
  DROP_FROM,
  HEIGHT,
  P,
  PHONE_X,
  RAIL_TOP,
  SERVER_X,
  WIDTH,
  at,
  coinZ,
} from "./view";

const poseAt = (t: number) => poseOf(t, coinZ, DROP_FROM, RAIL_TOP);
const FIRST = poseAt(REST);
const FIRST_BRIDGE = bridgeAt(FIRST.bridge);
const LAMP = at([-18, 12, 62]);

interface Props {
  locale: Locale;
  testId?: string | undefined;
  aria: string;
  label: string;
  halo: string;
  bench: ReactNode;
  pads: ReactNode;
  racks: ReactNode;
  strips: ReactNode;
  column: ReactNode;
  phoneCoins: ReactNode[];
  serverCoins: ReactNode[];
  flying: ReactNode;
  railLeft: ReactNode;
  railRight: ReactNode;
  funnel: ReactNode;
}

export function PocketLive(props: Props) {
  const { locale } = props;
  const phone = useRef<(SVGGElement | null)[]>([]);
  const server = useRef<(SVGGElement | null)[]>([]);
  const flying = useRef<SVGGElement | null>(null);
  const top = useRef<SVGPathElement | null>(null);
  const side = useRef<SVGPathElement | null>(null);
  const end = useRef<SVGPathElement | null>(null);
  const lamp = useRef<SVGCircleElement | null>(null);

  const { root, target, steer, say, hold } = useScrub({
    rest: REST,
    most: 3,
    tourAt,
    clockOf,
    frame: (t) => {
      const pose = poseAt(t);
      phone.current.forEach((node, index) =>
        node?.setAttribute("opacity", index < pose.phone ? "1" : "0")
      );
      server.current.forEach((node, index) =>
        node?.setAttribute(
          "opacity",
          index < pose.server ? `${1 - pose.fade}` : "0"
        )
      );
      const { flight } = pose;
      flying.current?.setAttribute("opacity", flight.shown ? "1" : "0");
      flying.current?.setAttribute(
        "transform",
        translateAlong(P, [
          flight.across * (SERVER_X - PHONE_X),
          0,
          flight.z - coinZ(0),
        ])
      );
      const bridge = bridgeAt(pose.bridge);
      top.current?.setAttribute("d", bridge.top);
      side.current?.setAttribute("d", bridge.side);
      end.current?.setAttribute("d", bridge.end);
      lamp.current?.setAttribute("data-on", `${pose.online}`);
      say(readoutOf(pose, locale), Math.round(t));
      return false;
    },
  });

  const toggle = () => steer(target.current < COINS + 0.3 ? END : REST);

  return (
    <div
      ref={root}
      className="fig"
      role="slider"
      tabIndex={0}
      data-testid={props.testId}
      aria-label={props.aria}
      aria-valuemin={0}
      aria-valuemax={Math.ceil(END)}
      aria-valuenow={REST}
      {...hold}
      onClick={toggle}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        if (box.width)
          steer(
            Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) *
              END
          );
      }}
      onKeyDown={(event) => {
        const now = Math.round(target.current);
        if (event.key === "ArrowRight" || event.key === "ArrowUp")
          steer(Math.min(END, now + 1));
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          steer(Math.max(0, now - 1));
        else if (event.key === "Home") steer(0);
        else if (event.key === "End") steer(END);
        else if (event.key === " " || event.key === "Enter") toggle();
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
        {props.pads}
        {props.strips}
        {props.column}
        {props.racks}
        {props.phoneCoins.map((coin, index) => (
          <g
            key={index}
            ref={(node) => {
              phone.current[index] = node;
            }}
            opacity={index < FIRST.phone ? 1 : 0}
          >
            {coin}
          </g>
        ))}
        {props.railLeft}
        <path ref={end} className="fig-paper" d={FIRST_BRIDGE.end} />
        <path ref={side} className="fig-paper" d={FIRST_BRIDGE.side} />
        <path ref={top} className="fig-paper fig-deck" d={FIRST_BRIDGE.top} />
        <circle
          ref={lamp}
          className="fig-lamp"
          data-on="false"
          cx={LAMP[0]}
          cy={LAMP[1]}
          r={1.5}
        />
        {props.railRight}
        {props.serverCoins.map((coin, index) => (
          <g
            key={index}
            ref={(node) => {
              server.current[index] = node;
            }}
            opacity={0}
          >
            {coin}
          </g>
        ))}
        <g ref={flying} opacity={0}>
          {props.flying}
        </g>
        {props.funnel}
      </svg>
    </div>
  );
}
