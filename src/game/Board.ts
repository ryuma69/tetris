import type { BoardMatrix, CellValue, ActivePiece, Point } from './types';

export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) => [...row]);
}

export function checkCollision(
  board: BoardMatrix,
  matrix: number[][],
  pos: Point
): boolean {
  const size = matrix.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] !== 0) {
        const boardX = pos.x + c;
        const boardY = pos.y + r;

        // Check horizontal boundaries
        if (boardX < 0 || boardX >= BOARD_COLS) {
          return true;
        }

        // Check floor
        if (boardY >= BOARD_ROWS) {
          return true;
        }

        // Check board cells (ignore blocks above board ceiling)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

export function mergePiece(board: BoardMatrix, piece: ActivePiece): BoardMatrix {
  const newBoard = cloneBoard(board);
  const size = piece.matrix.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (piece.matrix[r][c] !== 0) {
        const boardY = piece.y + r;
        const boardX = piece.x + c;
        if (boardY >= 0 && boardY < BOARD_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }

  return newBoard;
}

export function getGhostPiece(board: BoardMatrix, piece: ActivePiece): ActivePiece {
  let ghostY = piece.y;
  while (!checkCollision(board, piece.matrix, { x: piece.x, y: ghostY + 1 })) {
    ghostY++;
  }
  return {
    ...piece,
    y: ghostY,
  };
}

export function findFullRows(board: BoardMatrix): number[] {
  const fullRows: number[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    if (board[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }
  return fullRows;
}

export function clearRows(board: BoardMatrix, rowIndices: number[]): BoardMatrix {
  if (rowIndices.length === 0) return board;

  const rowsSet = new Set(rowIndices);
  const remainingRows = board.filter((_, idx) => !rowsSet.has(idx));
  const newEmptyRows: CellValue[][] = Array.from({ length: rowIndices.length }, () =>
    Array(BOARD_COLS).fill(null)
  );

  return [...newEmptyRows, ...remainingRows];
}
