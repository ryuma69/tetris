import React from 'react';
import { Volume2, VolumeX, RotateCcw, LayoutGrid, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  theme: 'light' | 'dark';
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onRestartGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  theme,
  onToggleSound,
  onToggleTheme,
  onRestartGame,
}) => {
  return (
    <header className="top-nav">
      <div className="brand-badge">
        <div className="logo-icon">
          <LayoutGrid size={15} />
        </div>
        <span>Tetris</span>
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          className="icon-button"
          onClick={onRestartGame}
          title="Restart Game"
        >
          <RotateCcw size={15} />
        </button>
        <button
          className="icon-button"
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </header>
  );
};
