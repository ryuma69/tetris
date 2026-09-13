import { useState, useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import { Header } from './components/Dashboard/Header';
import { TetrisSection } from './components/Tetris/TetrisSection';
import { ProductivityHub } from './components/Dashboard/ProductivityHub';
import { loadPreferences, savePreferences } from './utils/storage';
import type { ShortcutItem, UserPreferences } from './utils/storage';

export function App() {
  const {
    gameState,
    controllerMode,
    isMuted,
    idleSecondsLeft,
    switchToPlayer,
    switchToBot,
    toggleSound,
    restartGame,
  } = useTetris();

  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefs(p);
      if (p.theme) {
        setTheme(p.theme);
      }
    });
  }, []);

  const handleToggleMode = () => {
    if (controllerMode === 'BOT') {
      switchToPlayer();
    } else {
      switchToBot();
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    savePreferences({ theme: nextTheme });
    if (prefs) {
      setPrefs({ ...prefs, theme: nextTheme });
    }
  };

  const handleShortcutsChange = (shortcuts: ShortcutItem[]) => {
    if (prefs) {
      setPrefs({ ...prefs, shortcuts });
    }
  };

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <Header
        isMuted={isMuted}
        theme={theme}
        onToggleSound={toggleSound}
        onToggleTheme={handleToggleTheme}
        onRestartGame={restartGame}
      />

      <main className="main-content">
        <div className="unified-card">
          <TetrisSection
            state={gameState}
            controllerMode={controllerMode}
            idleSecondsLeft={idleSecondsLeft}
            onToggleMode={handleToggleMode}
            onRestart={restartGame}
          />

          <ProductivityHub
            shortcuts={prefs?.shortcuts || []}
            onShortcutsChange={handleShortcutsChange}
            searchEngine={prefs?.searchEngine}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
