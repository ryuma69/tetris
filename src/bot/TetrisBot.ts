import type { TetrominoType, Rotation, BoardMatrix } from '../game/types';
import { ROTATED_MATRICES } from '../game/Tetromino';
import { BOARD_COLS, BOARD_ROWS, checkCollision, mergePiece, findFullRows, clearRows } from '../game/Board';

export interface BestMove {
  rotation: Rotation;
  x: number;
  score: number;
  useHold?: boolean;
}

export class TetrisBot {
  // Pierre Dellacherie / heuristic weights
  private static WEIGHT_LANDING_HEIGHT = -4.5;
  private static WEIGHT_CLEARED_LINES = 3.4;
  private static WEIGHT_ROW_TRANSITIONS = -3.2;
  private static WEIGHT_COL_TRANSITIONS = -9.8;
  private static WEIGHT_HOLES = -7.9;
  private static WEIGHT_WELLS = -3.4;
  private static WEIGHT_BUMPINESS = -1.6;

  /**
   * Evaluates all legal placements for the given tetromino and board.
   */
  public static findBestPlacement(
    board: BoardMatrix,
    type: TetrominoType
  ): { rotation: Rotation; x: number; score: number } | null {
    let bestScore = -Infinity;
    let bestPlacement: { rotation: Rotation; x: number; score: number } | null = null;

    const rotations: Rotation[] = type === 'O' ? [0] : [0, 1, 2, 3];

    for (const rot of rotations) {
      const matrix = ROTATED_MATRICES[type][rot];
      const width = matrix.length;

      // Scan horizontal positions from left to right
      for (let x = -3; x < BOARD_COLS; x++) {
        // Initial check: is it in bounds horizontally?
        let isHorizValid = true;
        for (let r = 0; r < width; r++) {
          for (let c = 0; c < width; c++) {
            if (matrix[r][c] !== 0) {
              const bx = x + c;
              if (bx < 0 || bx >= BOARD_COLS) {
                isHorizValid = false;
                break;
              }
            }
          }
          if (!isHorizValid) break;
        }
        if (!isHorizValid) continue;

        // Drop piece to bottom
        let y = -2;
        // Find highest y where it doesn't collide
        if (checkCollision(board, matrix, { x, y })) {
          continue;
        }

        while (!checkCollision(board, matrix, { x, y: y + 1 })) {
          y++;
        }

        // If landing position is fully above the board, invalid
        if (y < 0) continue;

        // Simulate board after merge
        const testPiece = {
          type,
          rotation: rot,
          x,
          y,
          matrix,
          color: '#ffffff',
        };

        const simulatedBoard = mergePiece(board, testPiece);
        const fullRows = findFullRows(simulatedBoard);
        const clearedBoard = clearRows(simulatedBoard, fullRows);

        const score = this.evaluateBoard(
          board,
          clearedBoard,
          fullRows.length,
          y,
          matrix
        );

        if (score > bestScore) {
          bestScore = score;
          bestPlacement = { rotation: rot, x, score };
        }
      }
    }

    return bestPlacement;
  }

  private static evaluateBoard(
    _prevBoard: BoardMatrix,
    board: BoardMatrix,
    linesCleared: number,
    landingY: number,
    matrix: number[][]
  ): number {
    // 1. Landing Height: distance from bottom of board to piece center
    const pieceHeight = matrix.length;
    const landingHeight = BOARD_ROWS - landingY - pieceHeight / 2;

    // 2. Column heights & bumpiness
    const colHeights: number[] = new Array(BOARD_COLS).fill(0);
    for (let c = 0; c < BOARD_COLS; c++) {
      for (let r = 0; r < BOARD_ROWS; r++) {
        if (board[r][c] !== null) {
          colHeights[c] = BOARD_ROWS - r;
          break;
        }
      }
    }

    let bumpiness = 0;
    for (let c = 0; c < BOARD_COLS - 1; c++) {
      bumpiness += Math.abs(colHeights[c] - colHeights[c + 1]);
    }

    // 3. Holes (empty cells under a filled cell)
    let holes = 0;
    for (let c = 0; c < BOARD_COLS; c++) {
      let blockSeen = false;
      for (let r = 0; r < BOARD_ROWS; r++) {
        if (board[r][c] !== null) {
          blockSeen = true;
        } else if (blockSeen) {
          holes++;
        }
      }
    }

    // 4. Row Transitions
    let rowTransitions = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS - 1; c++) {
        const c1 = board[r][c] !== null ? 1 : 0;
        const c2 = board[r][c + 1] !== null ? 1 : 0;
        if (c1 !== c2) rowTransitions++;
      }
      if (board[r][0] === null) rowTransitions++;
      if (board[r][BOARD_COLS - 1] === null) rowTransitions++;
    }

    // 5. Column Transitions
    let colTransitions = 0;
    for (let c = 0; c < BOARD_COLS; c++) {
      for (let r = 0; r < BOARD_ROWS - 1; r++) {
        const r1 = board[r][c] !== null ? 1 : 0;
        const r2 = board[r + 1][c] !== null ? 1 : 0;
        if (r1 !== r2) colTransitions++;
      }
      if (board[BOARD_ROWS - 1][c] === null) colTransitions++;
    }

    // 6. Cumulative Wells
    let cumulativeWells = 0;
    for (let c = 0; c < BOARD_COLS; c++) {
      const leftHeight = c === 0 ? BOARD_ROWS : colHeights[c - 1];
      const rightHeight = c === BOARD_COLS - 1 ? BOARD_ROWS : colHeights[c + 1];
      const wellDepth = Math.min(leftHeight, rightHeight) - colHeights[c];
      if (wellDepth > 0) {
        cumulativeWells += (wellDepth * (wellDepth + 1)) / 2;
      }
    }

    return (
      landingHeight * this.WEIGHT_LANDING_HEIGHT +
      linesCleared * this.WEIGHT_CLEARED_LINES +
      rowTransitions * this.WEIGHT_ROW_TRANSITIONS +
      colTransitions * this.WEIGHT_COL_TRANSITIONS +
      holes * this.WEIGHT_HOLES +
      cumulativeWells * this.WEIGHT_WELLS +
      bumpiness * this.WEIGHT_BUMPINESS
    );
  }
}
