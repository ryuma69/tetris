import React from 'react';
import type { GameEngineState, ControllerMode } from '../../game/types';
import { TetrisBoard } from './TetrisBoard';
import { LeftSidePanel, RightSidePanel } from './SidePanels';
import { Bot, User } from 'lucide-react';

interface TetrisSectionProps {
  state: GameEngineState | null;
  controllerMode: ControllerMode;
  idleSecondsLeft: number;
  onToggleMode: () => void;
  onRestart: () => void;
}

export const TetrisSection: React.FC<TetrisSectionProps> = ({
  state,
  controllerMode,
  idleSecondsLeft,
  onToggleMode,
  onRestart,
}) => {
  if (!state) return null;

  return (
    <div className="tetris-arena">
      <div className="game-wrapper">
        <LeftSidePanel holdPiece={state.holdPiece} stats={state.stats} />
        <TetrisBoard state={state} onRestart={onRestart} />
        <RightSidePanel nextQueue={state.nextQueue} />
      </div>

      {/* Bot / Player Mode Toggle Pill */}
      <button
        className={`status-pill ${
          controllerMode === 'BOT' ? 'bot-mode' : 'player-mode'
        }`}
        onClick={onToggleMode}
        title="Click to toggle between Bot auto-play and Human player"
      >
        <div className="pulsing-dot" />
        {controllerMode === 'BOT' ? (
          <>
            <Bot size={14} />
            <span>BOT PLAYING</span>
          </>
        ) : (
          <>
            <User size={14} />
            <span>PLAYER MODE ({idleSecondsLeft}s)</span>
          </>
        )}
      </button>

      {/* Keyboard Controls Hint */}
      <div className="controls-hint">
        {controllerMode === 'BOT'
          ? 'Press any arrow key or Space to take over'
          : '←/→ Move • ↑ Rotate • ↓ Soft • Space Drop • C Hold'}
      </div>
    </div>
  );
};
