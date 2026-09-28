export const MAX_PLANT_STAGE = 12;

export type PlantVisualState = "seed" | "sprout" | "leaves" | "bloom";

export function nextStage(current: number): number {
  return Math.min(current + 1, MAX_PLANT_STAGE);
}

export function plantState(stage: number): PlantVisualState {
  if (stage >= 10) return "bloom";
  if (stage >= 6) return "leaves";
  if (stage >= 3) return "sprout";
  return "seed";
}

export function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function startOfToday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
