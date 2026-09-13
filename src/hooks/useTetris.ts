import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameEngineState, ControllerMode } from '../game/types';
import { BotRunner } from '../bot/BotRunner';
import { soundManager } from '../utils/audio';
import { loadPreferences, savePreferences } from '../utils/storage';

const INACTIVITY_TAKEOVER_TIMEOUT = 15000; // 15s idle returns control to Bot

export function useTetris() {
  const engineRef = useRef<GameEngine | null>(null);
  const botRunnerRef = useRef<BotRunner | null>(null);
  const tickTimerRef = useRef<any>(null);

  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const [controllerMode, setControllerMode] = useState<ControllerMode>('BOT');
  const [botCommentary, setBotCommentary] = useState<string>('Autonomous neural matrix active.');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number>(0);

  // Initialize GameEngine and Bot
  useEffect(() => {
    const engine = new GameEngine();
    engineRef.current = engine;

    // Load initial high score and preferences
    loadPreferences().then((prefs) => {
      engine.setHighScore(prefs.highScore);
      setIsMuted(prefs.soundMuted);
      soundManager.setMuted(prefs.soundMuted);
    });

    const unsubscribe = engine.subscribe((state) => {
      setGameState(state);
      if (state.stats.score >= state.stats.highScore && state.stats.score > 0) {
        savePreferences({ highScore: state.stats.highScore });
      }
    });

    const unsubscribeEvents = engine.onEvent((event) => {
      switch (event.type) {
        case 'MOVE':
          soundManager.playMove();
          break;
        case 'ROTATE':
          soundManager.playRotate();
          break;
        case 'DROP':
          soundManager.playDrop();
          break;
        case 'CLEAR':
          soundManager.playLineClear(event.lines);
          break;
        case 'GAME_OVER':
          soundManager.playGameOver();
          break;
      }
    });

    const botRunner = new BotRunner(engine, (text) => {
      setBotCommentary(text);
    });
    botRunnerRef.current = botRunner;

    // Start in bot mode
    botRunner.start();

    return () => {
      unsubscribe();
      unsubscribeEvents();
      botRunner.stop();
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, []);

  const lastActivityRef = useRef<number>(Date.now());

  // Reset idle timestamp when player makes an action (zero re-render overhead on key spam)
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleSecondsLeft((prev) => (prev === 15 ? prev : 15));
  }, []);

  // Handover to Player
  const switchToPlayer = useCallback(() => {
    setControllerMode('PLAYER');
    if (botRunnerRef.current) {
      botRunnerRef.current.stop();
    }
    setBotCommentary('Human player taken control. Use arrow keys / space to play.');
    lastActivityRef.current = Date.now();
    setIdleSecondsLeft(15);
  }, []);

  // Handover to Bot
  const switchToBot = useCallback(() => {
    setControllerMode('BOT');
    setIdleSecondsLeft(0);
    if (botRunnerRef.current) {
      botRunnerRef.current.start();
    }
    setBotCommentary('Resuming autonomous bot control.');
  }, []);

  // Single robust idle countdown loop for Player mode (15s timeout)
  useEffect(() => {
    if (controllerMode !== 'PLAYER') {
      setIdleSecondsLeft(0);
      return;
    }

    lastActivityRef.current = Date.now();
    setIdleSecondsLeft(15);

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((INACTIVITY_TAKEOVER_TIMEOUT - elapsed) / 1000));
      
      // Only trigger React state update when the integer seconds actually changes
      setIdleSecondsLeft((prev) => (prev !== remaining ? remaining : prev));

      if (remaining <= 0) {
        clearInterval(timer);
        switchToBot();
      }
    }, 250);

    return () => clearInterval(timer);
  }, [controllerMode, switchToBot]);

  // Gravity tick loop for Player mode
  useEffect(() => {
    if (controllerMode !== 'PLAYER' || !engineRef.current || !gameState) return;

    if (gameState.isPaused || gameState.isGameOver) {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
      return;
    }

    const intervalMs = engineRef.current.getDropInterval();
    tickTimerRef.current = setInterval(() => {
      engineRef.current?.tick();
    }, intervalMs);

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [controllerMode, gameState?.isPaused, gameState?.isGameOver, gameState?.stats.level]);

  // Keyboard handler with takeover detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      const gameKeys = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'KeyA',
        'KeyD',
        'KeyW',
        'KeyS',
        'Space',
        'KeyC',
        'KeyP',
        'KeyX',
      ];

      if (gameKeys.includes(e.code)) {
        e.preventDefault();

        if (controllerMode === 'BOT') {
          switchToPlayer();
        } else {
          resetIdleTimer();
        }

        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            engine.moveLeft();
            break;
          case 'ArrowRight':
          case 'KeyD':
            engine.moveRight();
            break;
          case 'ArrowUp':
          case 'KeyW':
          case 'KeyX':
            engine.rotateCW();
            break;
          case 'ArrowDown':
          case 'KeyS':
            engine.softDrop();
            break;
          case 'Space':
            engine.hardDrop();
            break;
          case 'KeyC':
            engine.hold();
            break;
          case 'KeyP':
            engine.togglePause();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controllerMode, switchToPlayer, resetIdleTimer]);

  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      savePreferences({ soundMuted: next });
      return next;
    });
  }, []);

  const restartGame = useCallback(() => {
    engineRef.current?.restart();
    if (controllerMode === 'BOT') {
      botRunnerRef.current?.start();
    }
  }, [controllerMode]);

  return {
    gameState,
    controllerMode,
    botCommentary,
    isMuted,
    idleSecondsLeft,
    switchToPlayer,
    switchToBot,
    toggleSound,
    restartGame,
    engine: engineRef.current,
  };
}
