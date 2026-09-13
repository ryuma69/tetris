import { GameEngine } from '../game/GameEngine';
import { TetrisBot } from './TetrisBot';

export type BotCommentaryCallback = (text: string) => void;

export class BotRunner {
  private engine: GameEngine;
  private timer: any = null;
  private isRunning: boolean = false;
  private currentPlan: { targetRot: number; targetX: number } | null = null;
  private onCommentary?: BotCommentaryCallback;
  private speedMs: number = 280; // Slower, relaxed step cadence in ms

  private static COMMENTARY_PHRASES = [
    'Scanning board permutations...',
    'Found optimal low-hole placement.',
    'Aligning surface heights...',
    'Building stack for a clean line clear.',
    'Minimizing column transitions.',
    'Keeping the board level.',
    'Executing calculated rotation...',
    'Looking ahead for upcoming pieces.',
  ];

  constructor(engine: GameEngine, onCommentary?: BotCommentaryCallback) {
    this.engine = engine;
    this.onCommentary = onCommentary;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextStep(100);
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.currentPlan = null;
  }

  public setSpeed(speedMs: number) {
    this.speedMs = Math.max(50, speedMs);
  }

  private scheduleNextStep(delay: number) {
    if (!this.isRunning) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.step(), delay);
  }

  private emitRandomCommentary() {
    if (!this.onCommentary) return;
    if (Math.random() < 0.15) {
      const idx = Math.floor(Math.random() * BotRunner.COMMENTARY_PHRASES.length);
      this.onCommentary(BotRunner.COMMENTARY_PHRASES[idx]);
    }
  }

  private step() {
    if (!this.isRunning) return;

    const state = this.engine.getState();

    // Handle game over: wait 2.5s and restart
    if (state.isGameOver) {
      if (this.onCommentary) this.onCommentary('Game over! Rebooting neural matrix in 2s...');
      this.currentPlan = null;
      this.timer = setTimeout(() => {
        if (!this.isRunning) return;
        this.engine.restart();
        if (this.onCommentary) this.onCommentary('New game initialized. Analyzing drop paths.');
        this.scheduleNextStep(500);
      }, 2500);
      return;
    }

    if (state.isPaused || !state.currentPiece) {
      this.scheduleNextStep(300);
      return;
    }

    // If no plan, compute best placement for current piece
    if (!this.currentPlan) {
      const best = TetrisBot.findBestPlacement(state.board, state.currentPiece.type);
      if (best) {
        this.currentPlan = { targetRot: best.rotation, targetX: best.x };
        this.emitRandomCommentary();
      } else {
        // Fallback: just drop
        this.engine.softDrop();
        this.scheduleNextStep(this.speedMs);
        return;
      }
    }

    const { targetRot, targetX } = this.currentPlan;
    const piece = state.currentPiece;

    // Step 1: Rotate to target orientation
    if (piece.rotation !== targetRot) {
      const rotated = this.engine.rotateCW();
      if (!rotated) {
        this.currentPlan = null;
        this.engine.softDrop();
      }
      this.scheduleNextStep(this.speedMs);
      return;
    }

    // Step 2: Move horizontally towards targetX
    if (piece.x < targetX) {
      const moved = this.engine.moveRight();
      if (!moved) {
        this.currentPlan = null;
        this.engine.softDrop();
      }
      this.scheduleNextStep(this.speedMs);
      return;
    } else if (piece.x > targetX) {
      const moved = this.engine.moveLeft();
      if (!moved) {
        this.currentPlan = null;
        this.engine.softDrop();
      }
      this.scheduleNextStep(this.speedMs);
      return;
    }

    // Step 3: Piece is aligned. Brief deliberate pause before dropping
    this.scheduleNextStep(200);
    this.engine.hardDrop();
    this.currentPlan = null;

    // Post-drop breathing delay so user can calmly watch
    this.scheduleNextStep(550);
  }
}
