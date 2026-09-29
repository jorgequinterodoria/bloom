export function nextIndex(current: number, total: number): number | null {
  const next = current + 1;
  return next < total ? next : null;
}

export function timeLeftAfterTick(timeLeft: number): number {
  return timeLeft <= 1 ? 0 : timeLeft - 1;
}
