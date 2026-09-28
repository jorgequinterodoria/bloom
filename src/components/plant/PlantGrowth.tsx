"use client";

import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { MAX_PLANT_STAGE, plantState } from "@/lib/utils";

interface Props {
  stage: number;
}

export function PlantGrowth({ stage }: Props) {
  const state = plantState(stage);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const progress = Math.min(stage / MAX_PLANT_STAGE, 1);

  const spring = useSpring({
    from: { stem: 0 },
    stem: mounted ? progress : 0,
    config: { tension: 120, friction: 20 },
    reset: false,
  });

  const showSprout = state !== "seed";
  const showLeaves = state === "leaves" || state === "bloom";
  const showBloom = state === "bloom";

  return (
    <svg
      role="img"
      aria-label="Planta de Bloom"
      viewBox="0 0 200 220"
      className="h-64 w-full max-w-[280px]"
    >
      {/* maceta */}
      <path
        d="M70 180 L130 180 L124 210 L76 210 Z"
        fill="var(--color-sage-300)"
      />
      <rect x="66" y="172" width="68" height="12" rx="6" fill="var(--color-sage-500)" />

      {/* tallo creciente */}
      <animated.path
        d="M100 175 C 98 140, 104 110, 100 70"
        fill="none"
        stroke="var(--color-sage-600)"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={spring.stem.to((v) => 1 - v)}
      />

      {/* brote */}
      {showSprout && (
        <ellipse cx="88" cy="140" rx="14" ry="8" fill="var(--color-sage-500)" transform="rotate(-25 88 140)" />
      )}

      {/* hojas */}
      {showLeaves && (
        <g data-testid="leaves">
          <ellipse cx="116" cy="115" rx="18" ry="9" fill="var(--color-sage-500)" transform="rotate(20 116 115)" />
          <ellipse cx="84" cy="95" rx="16" ry="8" fill="var(--color-sage-600)" transform="rotate(-20 84 95)" />
          <ellipse cx="115" cy="80" rx="14" ry="7" fill="var(--color-sage-500)" transform="rotate(15 115 80)" />
        </g>
      )}

      {/* flor */}
      {showBloom && (
        <g data-testid="bloom">
          <circle cx="100" cy="62" r="9" fill="var(--color-bloom)" />
          <ellipse cx="100" cy="46" rx="8" ry="12" fill="var(--color-accent)" />
          <ellipse cx="100" cy="78" rx="8" ry="12" fill="var(--color-accent)" />
          <ellipse cx="84" cy="62" rx="12" ry="8" fill="var(--color-accent)" />
          <ellipse cx="116" cy="62" rx="12" ry="8" fill="var(--color-accent)" />
          <circle cx="100" cy="62" r="5" fill="var(--color-lavender-100)" />
        </g>
      )}
    </svg>
  );
}
