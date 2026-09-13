export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Rotation = 0 | 1 | 2 | 3;

export interface Point {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: Rotation;
  x: number;
  y: number;
  matrix: number[][];
  color: string;
}

export type CellValue = string | null;
export type BoardMatrix = CellValue[][]; // 20 rows x 10 columns

export interface GameStats {
  score: number;
  level: number;
  lines: number;
  combo: number;
  highScore: number;
}

export type ControllerMode = 'BOT' | 'PLAYER';

export interface GameEngineState {
  board: BoardMatrix;
  currentPiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  stats: GameStats;
  isGameOver: boolean;
  isPaused: boolean;
  clearingRows: number[];
  lastAction?: string;
}

export type GameListener = (state: GameEngineState) => void;
