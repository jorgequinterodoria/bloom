"use client";

import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { MAX_PLANT_STAGE, plantState } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Props { stage: number; compact?: boolean; large?: boolean; }

export function PlantGrowth({ stage, compact = false, large = false }: Props) {
  const { t } = useI18n();
  const state = plantState(stage);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const progress = Math.min(stage / MAX_PLANT_STAGE, 1);
  const spring = useSpring({ from: { stem: 0, float: 0 }, stem: mounted ? progress : 0, float: mounted ? 1 : 0, config: { tension: 120, friction: 20 } });
  const showSprout = state !== "seed";
  const showLeaves = state === "leaves" || state === "bloom";
  const showBloom = state === "bloom";
  const viewClass = compact ? "h-32 w-full" : large ? "h-[300px] w-full" : "h-64 w-full max-w-[280px]";

  return (
    <svg role="img" aria-label={t("plantAlt", { stage, max: MAX_PLANT_STAGE })} viewBox="0 0 200 220" className={viewClass}>
      <defs>
        <radialGradient id="bloom-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="var(--color-lavender-100)" stopOpacity=".85" /><stop offset="100%" stopColor="var(--color-lavender-100)" stopOpacity="0" /></radialGradient>
        <linearGradient id="pot-gradient" x1="0" x2="1"><stop offset="0%" stopColor="var(--color-sage-300)" /><stop offset="100%" stopColor="var(--color-sage-500)" /></linearGradient>
      </defs>
      <animated.g style={{ transform: spring.float.to((value) => `translateY(${Math.sin(value * Math.PI) * -1.5}px)`) }}>
        <ellipse cx="100" cy="207" rx="44" ry="7" fill="var(--color-sage-200)" opacity=".55" />
        <path d="M68 180 L132 180 L124 210 L76 210 Z" fill="url(#pot-gradient)" />
        <rect x="64" y="172" width="72" height="12" rx="6" fill="var(--color-sage-600)" />
        <animated.path d="M100 175 C98 140 104 110 100 70" fill="none" stroke="var(--color-sage-600)" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={spring.stem.to((value) => 1 - value)} />
        {showSprout && <ellipse data-testid="sprout" cx="88" cy="140" rx="14" ry="8" fill="var(--color-sage-500)" transform="rotate(-25 88 140)" />}
        {showLeaves && <g data-testid="leaves"><ellipse cx="116" cy="115" rx="18" ry="9" fill="var(--color-sage-500)" transform="rotate(20 116 115)" /><ellipse cx="84" cy="95" rx="16" ry="8" fill="var(--color-sage-600)" transform="rotate(-20 84 95)" /><ellipse cx="115" cy="80" rx="14" ry="7" fill="var(--color-sage-500)" transform="rotate(15 115 80)" /><ellipse cx="82" cy="120" rx="12" ry="6" fill="var(--color-sage-500)" transform="rotate(-25 82 120)" /></g>}
        {showBloom && <g data-testid="bloom"><circle cx="100" cy="62" r="25" fill="url(#bloom-glow)" /><circle cx="100" cy="62" r="9" fill="var(--color-bloom)" /><ellipse cx="100" cy="46" rx="8" ry="12" fill="var(--color-accent)" /><ellipse cx="100" cy="78" rx="8" ry="12" fill="var(--color-accent)" /><ellipse cx="84" cy="62" rx="12" ry="8" fill="var(--color-accent)" /><ellipse cx="116" cy="62" rx="12" ry="8" fill="var(--color-accent)" /><circle cx="100" cy="62" r="5" fill="var(--color-lavender-100)" /></g>}
      </animated.g>
    </svg>
  );
}
