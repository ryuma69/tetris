import type {
  TetrominoType,
  Rotation,
  ActivePiece,
  BoardMatrix,
  GameEngineState,
  GameListener,
} from './types';
import {
  ROTATED_MATRICES,
  TETROMINO_COLORS,
  getWallKicks,
} from './Tetromino';
import {
  BOARD_COLS,
  createEmptyBoard,
  checkCollision,
  mergePiece,
  getGhostPiece,
  findFullRows,
  clearRows,
} from './Board';
import { calculateLineScore, getDropIntervalMs } from './Scoring';

const ALL_PIECES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export type EngineEvent =
  | { type: 'MOVE' }
  | { type: 'ROTATE' }
  | { type: 'DROP' }
  | { type: 'LOCK' }
  | { type: 'HOLD' }
  | { type: 'CLEAR'; lines: number }
  | { type: 'GAME_OVER' };

export class GameEngine {
  private board: BoardMatrix = createEmptyBoard();
  private currentPiece: ActivePiece | null = null;
  private holdPiece: TetrominoType | null = null;
  private canHold: boolean = true;
  private bag: TetrominoType[] = [];
  private nextQueue: TetrominoType[] = [];
  private score: number = 0;
  private level: number = 1;
  private lines: number = 0;
  private combo: number = -1;
  private highScore: number = 0;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private clearingRows: number[] = [];
  private listeners: Set<GameListener> = new Set();
  private eventSubscribers: Set<(event: EngineEvent) => void> = new Set();

  constructor(highScore: number = 0) {
    this.highScore = highScore;
    this.init();
  }

  public init() {
    this.board = createEmptyBoard();
    this.bag = [];
    this.nextQueue = [];
    this.fillBagIfNeeded();
    while (this.nextQueue.length < 5) {
      this.nextQueue.push(this.drawNextFromBag());
    }
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.combo = -1;
    this.holdPiece = null;
    this.canHold = true;
    this.isGameOver = false;
    this.isPaused = false;
    this.clearingRows = [];
    this.spawnNextPiece();
    this.notify();
  }

  public subscribe(listener: GameListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public onEvent(callback: (event: EngineEvent) => void): () => void {
    this.eventSubscribers.add(callback);
    return () => this.eventSubscribers.delete(callback);
  }

  private emitEvent(event: EngineEvent) {
    for (const sub of this.eventSubscribers) {
      sub(event);
    }
  }

  private fillBagIfNeeded() {
    if (this.bag.length === 0) {
      const shuffled = [...ALL_PIECES];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.bag = shuffled;
    }
  }

  private drawNextFromBag(): TetrominoType {
    this.fillBagIfNeeded();
    return this.bag.shift()!;
  }

  private spawnNextPiece(): boolean {
    const type = this.nextQueue.shift()!;
    this.fillBagIfNeeded();
    this.nextQueue.push(this.drawNextFromBag());

    const matrix = ROTATED_MATRICES[type][0];
    const width = matrix.length;
    const spawnX = Math.floor((BOARD_COLS - width) / 2);
    const spawnY = type === 'I' ? -1 : 0;

    const piece: ActivePiece = {
      type,
      rotation: 0,
      x: spawnX,
      y: spawnY,
      matrix,
      color: TETROMINO_COLORS[type].fill,
    };

    if (checkCollision(this.board, matrix, { x: spawnX, y: spawnY })) {
      this.currentPiece = piece;
      this.isGameOver = true;
      this.emitEvent({ type: 'GAME_OVER' });
      this.notify();
      return false;
    }

    this.currentPiece = piece;
    this.canHold = true;
    return true;
  }

  public moveLeft(): boolean {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    const newPos = { x: this.currentPiece.x - 1, y: this.currentPiece.y };
    if (!checkCollision(this.board, this.currentPiece.matrix, newPos)) {
      this.currentPiece.x = newPos.x;
      this.emitEvent({ type: 'MOVE' });
      this.notify();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    const newPos = { x: this.currentPiece.x + 1, y: this.currentPiece.y };
    if (!checkCollision(this.board, this.currentPiece.matrix, newPos)) {
      this.currentPiece.x = newPos.x;
      this.emitEvent({ type: 'MOVE' });
      this.notify();
      return true;
    }
    return false;
  }

  public rotateCW(): boolean {
    return this.rotate(1);
  }


  private rotate(direction: 1 | -1): boolean {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    const { type, rotation } = this.currentPiece;
    const nextRot = (((rotation + direction) % 4) + 4) % 4 as Rotation;
    const candidateMatrix = ROTATED_MATRICES[type][nextRot];

    const kicks = getWallKicks(type, rotation, nextRot);
    for (const kick of kicks) {
      const testPos = {
        x: this.currentPiece.x + kick.x,
        y: this.currentPiece.y - kick.y,
      };
      if (!checkCollision(this.board, candidateMatrix, testPos)) {
        this.currentPiece.rotation = nextRot;
        this.currentPiece.matrix = candidateMatrix;
        this.currentPiece.x = testPos.x;
        this.currentPiece.y = testPos.y;
        this.emitEvent({ type: 'ROTATE' });
        this.notify();
        return true;
      }
    }
    return false;
  }

  public softDrop(): boolean {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    const newPos = { x: this.currentPiece.x, y: this.currentPiece.y + 1 };
    if (!checkCollision(this.board, this.currentPiece.matrix, newPos)) {
      this.currentPiece.y = newPos.y;
      this.score += 1;
      this.updateHighScore();
      this.notify();
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  public hardDrop(): number {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return 0;
    const ghost = getGhostPiece(this.board, this.currentPiece);
    const dropDistance = ghost.y - this.currentPiece.y;
    this.currentPiece.y = ghost.y;
    this.score += dropDistance * 2;
    this.updateHighScore();
    this.emitEvent({ type: 'DROP' });
    this.lockPiece();
    return dropDistance;
  }

  public hold(): boolean {
    if (!this.currentPiece || !this.canHold || this.isGameOver || this.isPaused) return false;
    const currentType = this.currentPiece.type;

    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnNextPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = currentType;
      const matrix = ROTATED_MATRICES[temp][0];
      const width = matrix.length;
      const spawnX = Math.floor((BOARD_COLS - width) / 2);
      const spawnY = temp === 'I' ? -1 : 0;

      this.currentPiece = {
        type: temp,
        rotation: 0,
        x: spawnX,
        y: spawnY,
        matrix,
        color: TETROMINO_COLORS[temp].fill,
      };
    }

    this.canHold = false;
    this.emitEvent({ type: 'HOLD' });
    this.notify();
    return true;
  }

  public tick(): void {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return;
    const newPos = { x: this.currentPiece.x, y: this.currentPiece.y + 1 };
    if (!checkCollision(this.board, this.currentPiece.matrix, newPos)) {
      this.currentPiece.y = newPos.y;
      this.notify();
    } else {
      this.lockPiece();
    }
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;

    this.board = mergePiece(this.board, this.currentPiece);
    this.emitEvent({ type: 'LOCK' });

    const fullRows = findFullRows(this.board);
    if (fullRows.length > 0) {
      this.combo++;
      const gainedScore = calculateLineScore(fullRows.length, this.level, this.combo);
      this.score += gainedScore;
      this.lines += fullRows.length;
      this.level = Math.floor(this.lines / 10) + 1;
      this.updateHighScore();

      this.clearingRows = fullRows;
      this.emitEvent({ type: 'CLEAR', lines: fullRows.length });
      this.notify();

      this.board = clearRows(this.board, fullRows);
      this.clearingRows = [];
    } else {
      this.combo = -1;
    }

    this.spawnNextPiece();
    this.notify();
  }

  private updateHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  public togglePause(): void {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.notify();
  }

  public restart(): void {
    this.init();
  }

  public setHighScore(score: number): void {
    this.highScore = Math.max(this.highScore, score);
    this.notify();
  }

  public getState(): GameEngineState {
    const ghost = this.currentPiece
      ? getGhostPiece(this.board, this.currentPiece)
      : null;

    return {
      board: this.board,
      currentPiece: this.currentPiece ? { ...this.currentPiece } : null,
      ghostPiece: ghost,
      holdPiece: this.holdPiece,
      canHold: this.canHold,
      nextQueue: [...this.nextQueue],
      stats: {
        score: this.score,
        level: this.level,
        lines: this.lines,
        combo: this.combo,
        highScore: this.highScore,
      },
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      clearingRows: [...this.clearingRows],
    };
  }

  public getDropInterval(): number {
    return getDropIntervalMs(this.level);
  }

  public getRawBoard(): BoardMatrix {
    return this.board;
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
