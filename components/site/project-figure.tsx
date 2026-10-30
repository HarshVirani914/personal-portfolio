import { cn } from "@/lib/utils";

/**
 * Styled stand-in for a project's interactive figure. The real figures
 * (ticket: anatomy figures) replace it by key; until then the slot keeps its
 * size and accent so the layouts do not shift when they arrive.
 */
export function ProjectFigure({
  variant,
  className,
  card,
}: {
  variant: "card" | "page";
  className?: string;
  /** A finished figure's dark still, for the hover card. */
  card?: string | undefined;
}) {
  if (variant === "card" && card) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- an animated SVG, served as is
      <img
        src={card}
        alt=""
        width={344}
        height={150}
        loading="lazy"
        decoding="async"
        className={cn(
          "mx-auto mt-1.5 block h-37.5 w-full max-w-86 object-contain",
          className
        )}
      />
    );
  }
  if (variant === "card") {
    return (
      <svg
        viewBox="-26 0 344 150"
        className={cn("mx-auto mt-1.5 block h-auto w-full max-w-86", className)}
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        >
          <path
            d="M146 22 L226 66 L146 110 L66 66 Z"
            fill="#ffffff"
            fillOpacity=".06"
          />
          <path
            d="M66 66 L66 92 L146 136 L146 110"
            fill="#ffffff"
            fillOpacity=".03"
          />
          <path d="M226 66 L226 92 L146 136" fill="#ffffff" fillOpacity=".09" />
          <path d="M146 40 L186 62 L146 84 L106 62 Z" strokeOpacity=".55" />
          <path d="M146 62 L146 30" stroke="var(--project-accent)" />
          <circle
            cx="146"
            cy="28"
            r="3.5"
            fill="var(--project-accent)"
            stroke="none"
          />
        </g>
      </svg>
    );
  }
  return (
    <svg
      data-testid="project-figure"
      viewBox="40 60 440 280"
      className={cn("block h-auto w-full max-w-130", className)}
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--project-accent)" strokeWidth="1.3">
        <path
          d="M260 70 L460 180 L260 290 L60 180 Z"
          fill="var(--bg)"
          fillOpacity=".6"
        />
        <path d="M60 180 L60 215 L260 325 L260 290 M460 180 L460 215 L260 325" />
        <path d="M150 150 L200 177 L200 137 L150 110 Z" fill="var(--bg)" />
        <path
          d="M240 195 L300 228 L300 188 L240 155 Z"
          fill="var(--project-accent)"
          fillOpacity=".18"
        />
        <path d="M330 150 L380 177 L380 137 L330 110 Z" fill="var(--bg)" />
        <path d="M200 160 L240 175 M300 208 L330 140" />
        <circle cx="355" cy="120" r="5.5" fill="var(--agent)" stroke="none" />
      </g>
    </svg>
  );
}
