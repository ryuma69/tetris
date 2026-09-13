import React from 'react';
import type { GameEngineState } from '../../game/types';
import { BOARD_ROWS, BOARD_COLS } from '../../game/Board';
import { RotateCcw } from 'lucide-react';

interface TetrisBoardProps {
  state: GameEngineState;
  onRestart: () => void;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({ state, onRestart }) => {
  const { board, currentPiece, ghostPiece, isGameOver, clearingRows } = state;

  // Build 20x10 render matrix
  const displayCells: {
    color: string | null;
    isFilled: boolean;
    isGhost: boolean;
    isClearing: boolean;
  }[][] = Array.from({ length: BOARD_ROWS }, (_, r) =>
    Array.from({ length: BOARD_COLS }, (_, c) => {
      const isClearing = clearingRows.includes(r);
      const cellColor = board[r][c];
      return {
        color: cellColor,
        isFilled: cellColor !== null,
        isGhost: false,
        isClearing,
      };
    })
  );

  // Overlay Ghost piece if available
  if (ghostPiece && currentPiece) {
    const size = ghostPiece.matrix.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (ghostPiece.matrix[r][c] !== 0) {
          const by = ghostPiece.y + r;
          const bx = ghostPiece.x + c;
          if (by >= 0 && by < BOARD_ROWS && bx >= 0 && bx < BOARD_COLS) {
            if (!displayCells[by][bx].isFilled) {
              displayCells[by][bx].isGhost = true;
            }
          }
        }
      }
    }
  }

  // Overlay Active falling piece
  if (currentPiece) {
    const size = currentPiece.matrix.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentPiece.matrix[r][c] !== 0) {
          const by = currentPiece.y + r;
          const bx = currentPiece.x + c;
          if (by >= 0 && by < BOARD_ROWS && bx >= 0 && bx < BOARD_COLS) {
            displayCells[by][bx].isFilled = true;
            displayCells[by][bx].color = currentPiece.color;
            displayCells[by][bx].isGhost = false;
          }
        }
      }
    }
  }

  return (
    <div className="board-container">
      <div className="board-grid">
        {displayCells.flatMap((row, r) =>
          row.map((cell, c) => {
            let className = 'board-cell';
            let style: React.CSSProperties = {};

            if (cell.isClearing) {
              className += ' clearing';
            } else if (cell.isFilled && cell.color) {
              className += ' filled';
              style = {
                backgroundColor: cell.color,
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.5), 0 0 8px ${cell.color}88`,
              };
            } else if (cell.isGhost) {
              className += ' ghost';
            }

            return <div key={`${r}-${c}`} className={className} style={style} />;
          })
        )}
      </div>

      {isGameOver && (
        <div className="game-overlay">
          <div className="overlay-title">GAME OVER</div>
          <button className="btn-primary" onClick={onRestart}>
            <RotateCcw size={16} /> Restart
          </button>
        </div>
      )}
    </div>
  );
};
