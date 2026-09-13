import React from 'react';
import type { TetrominoType, GameStats } from '../../game/types';
import { MiniPiece } from './MiniPiece';

interface LeftSidePanelProps {
  holdPiece: TetrominoType | null;
  stats: GameStats;
}

export const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ holdPiece, stats }) => {
  return (
    <div className="side-panel">
      {/* Hold Box */}
      <div className="panel-card">
        <div className="panel-title">HOLD [C]</div>
        <MiniPiece type={holdPiece} />
      </div>

      {/* Arcade Scorecard */}
      <div className="panel-card stats-display">
        <div className="stat-item">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{stats.score.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">LEVEL</span>
          <span className="stat-value">{stats.level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">LINES</span>
          <span className="stat-value">{stats.lines}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">HIGH</span>
          <span className="stat-value">{stats.highScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

interface RightSidePanelProps {
  nextQueue: TetrominoType[];
}

export const RightSidePanel: React.FC<RightSidePanelProps> = ({ nextQueue }) => {
  const previewPieces = nextQueue.slice(0, 3);

  return (
    <div className="side-panel">
      <div className="panel-card">
        <div className="panel-title">NEXT</div>
        {previewPieces.map((piece, idx) => (
          <div key={idx} style={{ marginBottom: idx < previewPieces.length - 1 ? '0.5rem' : 0 }}>
            <MiniPiece type={piece} />
          </div>
        ))}
      </div>
    </div>
  );
};
