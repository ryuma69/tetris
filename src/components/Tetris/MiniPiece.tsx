import React from 'react';
import type { TetrominoType } from '../../game/types';
import { TETROMINO_SHAPES, TETROMINO_COLORS } from '../../game/Tetromino';

interface MiniPieceProps {
  type: TetrominoType | null;
}

export const MiniPiece: React.FC<MiniPieceProps> = ({ type }) => {
  if (!type) {
    return (
      <div className="mini-grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="mini-cell" style={{ backgroundColor: 'transparent' }} />
        ))}
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type];
  const color = TETROMINO_COLORS[type];
  const size = shape.length;

  // Center pieces nicely in 4x4 grid
  const grid: boolean[][] = Array.from({ length: 4 }, () => Array(4).fill(false));
  const offsetRow = Math.floor((4 - size) / 2);
  const offsetCol = Math.floor((4 - size) / 2);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (shape[r][c] === 1) {
        grid[r + offsetRow][c + offsetCol] = true;
      }
    }
  }

  return (
    <div className="mini-grid">
      {grid.flatMap((row, r) =>
        row.map((filled, c) => (
          <div
            key={`${r}-${c}`}
            className="mini-cell"
            style={{
              backgroundColor: filled ? color.fill : 'transparent',
              border: filled ? `1px solid ${color.border}` : 'none',
              boxShadow: filled ? `0 0 6px ${color.glow}` : 'none',
            }}
          />
        ))
      )}
    </div>
  );
};
