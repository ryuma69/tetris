import type { TetrominoType, Rotation, Point } from './types';

export const TETROMINO_COLORS: Record<TetrominoType, { fill: string; border: string; glow: string }> = {
  I: { fill: 'oklch(0.75 0.16 210)', border: 'oklch(0.85 0.14 210)', glow: 'rgba(0, 195, 230, 0.4)' }, // Cyan
  J: { fill: 'oklch(0.55 0.22 264.53)', border: 'oklch(0.68 0.20 264.53)', glow: 'rgba(50, 100, 255, 0.4)' }, // Chart-2 Cobalt
  L: { fill: 'oklch(0.81 0.17 75.35)', border: 'oklch(0.88 0.15 75.35)', glow: 'rgba(255, 145, 0, 0.4)' }, // Chart-1 Amber
  O: { fill: 'oklch(0.86 0.18 95)', border: 'oklch(0.92 0.14 95)', glow: 'rgba(255, 215, 0, 0.4)' }, // Yellow
  S: { fill: 'oklch(0.72 0.18 145)', border: 'oklch(0.82 0.15 145)', glow: 'rgba(50, 210, 100, 0.4)' }, // Emerald
  T: { fill: 'oklch(0.65 0.22 310)', border: 'oklch(0.75 0.19 310)', glow: 'rgba(195, 75, 240, 0.4)' }, // Magenta/Purple
  Z: { fill: 'oklch(0.63 0.19 23.03)', border: 'oklch(0.72 0.18 23.03)', glow: 'rgba(235, 60, 60, 0.4)' }, // Destructive Red
};

export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export function rotateMatrixCW(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

export const ROTATED_MATRICES: Record<TetrominoType, Record<Rotation, number[][]>> = (() => {
  const res: any = {};
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (const type of types) {
    const rot0 = TETROMINO_SHAPES[type];
    const rot1 = rotateMatrixCW(rot0);
    const rot2 = rotateMatrixCW(rot1);
    const rot3 = rotateMatrixCW(rot2);
    res[type] = { 0: rot0, 1: rot1, 2: rot2, 3: rot3 };
  }
  return res;
})();

export const SRS_KICKS: Record<string, Point[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],

  'I:0->1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  'I:1->0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  'I:1->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
  'I:2->1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  'I:2->3': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  'I:3->2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  'I:3->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  'I:0->3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
};

export function getWallKicks(type: TetrominoType, fromRot: Rotation, toRot: Rotation): Point[] {
  if (type === 'O') return [{ x: 0, y: 0 }];
  const key = `${fromRot}->${toRot}`;
  if (type === 'I') {
    return SRS_KICKS[`I:${key}`] || [{ x: 0, y: 0 }];
  }
  return SRS_KICKS[key] || [{ x: 0, y: 0 }];
}
