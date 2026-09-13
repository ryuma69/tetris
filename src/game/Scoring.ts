export const LINE_POINTS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export function calculateLineScore(linesCleared: number, level: number, combo: number): number {
  if (linesCleared <= 0) return 0;
  const basePoints = LINE_POINTS[linesCleared] || 800;
  const comboBonus = combo > 0 ? 50 * combo * level : 0;
  return basePoints * level + comboBonus;
}

export function getDropIntervalMs(level: number): number {
  // Relaxed, calm pace: level 1 is 1100ms, scaling gently down to minimum 300ms
  const ms = Math.max(300, Math.floor(1100 * Math.pow(0.93, level - 1)));
  return ms;
}
