# Tetris New Tab Extension

A Chrome/Chromium new tab page extension featuring an autonomous live Tetris game and a clean productivity dashboard.

---

## What is this?

Every time you open a new tab in your browser, you get:
- **Autonomous AI Tetris Bot**: An intelligent bot plays Tetris live in the background using heuristic piece evaluation.
- **Instant Player Takeover**: Press any arrow key or `Space` to jump into the game yourself.
- **15-Second Inactivity Handover**: If you stop playing for 15 seconds, the bot resumes playing automatically.
- **Unified Productivity Hub**:
  - Quick Search bar supporting Google, DuckDuckGo, Bing, and Brave.
  - Quick-launch shortcuts with Add/Remove support.
  - Live clock and dynamic greeting.
  - Light and Dark theme toggle.
  - Web Audio sound effects with mute toggle.
- **Zero-Scroll Dynamic Sizing**: The Tetris board mathematically scales to fit any screen size without scrollbars.

---

## How to Install and Load the Extension in Chrome / Brave / Edge

### Step 1: Install dependencies and build
Make sure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# 1. Install dependencies
npm install

# 2. Build the production extension
npm run build
```

This compiles TypeScript and Vite into the `dist/` directory, including the `manifest.json`.

### Step 2: Load into your browser

1. Open your Chromium-based browser (Google Chrome, Brave, Microsoft Edge, Arc, etc.).
2. Go to the Extensions page:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
3. Toggle on **Developer mode** in the top-right corner.
4. Click the **Load unpacked** button in the top-left.
5. In the file picker, select the **`dist`** folder inside this project directory (`c:\Users\omar\code\tetris\dist`).
6. Open a new tab (`Ctrl + T` on Windows / `Cmd + T` on Mac) — your Tetris dashboard is now live!

---

## How to Use

### Tetris Game Controls
- **← / A**: Move Left
- **→ / D**: Move Right
- **↑ / W / X**: Rotate Clockwise
- **↓ / S**: Soft Drop (fast descent)
- **Space**: Hard Drop (instant drop to bottom)
- **C**: Hold Piece
- **P**: Pause / Unpause Game
- **Bot Mode / Player Mode Pill**: Click the status pill below the board at any time to toggle between human play and bot auto-play.

### Productivity Features
- **Search Bar**: Type any query and hit Enter to search. Click the dropdown icon to switch between Google, DuckDuckGo, Bing, or Brave.
- **Shortcuts**: Click any shortcut to launch the site. Click the `+ Add` card to save a new shortcut, or hover over a card and click `✕` to remove it.
- **Theme Toggle**: Click the Sun/Moon icon in the top header to switch between Light and Dark mode.
- **Sound Toggle**: Click the Volume icon in the top header to mute or unmute game sound effects.
- **Restart Game**: Click the Refresh icon in the top header to reset the board.

---

## Local Development

To run the application with live hot-reloading in the browser:

```bash
npm run dev
```

Then visit `http://localhost:5173/` in your browser.

---

## Project Structure

```
tetris/
├── public/
│   ├── icons/            # Extension icon assets (16x16, 48x48, 128x128)
│   └── manifest.json     # Chrome Extension Manifest V3 configuration
├── src/
│   ├── bot/              # Pierre Dellacherie Tetris AI algorithm & bot runner
│   ├── components/
│   │   ├── Dashboard/    # Header, Search, Shortcuts, Productivity Hub
│   │   └── Tetris/       # Tetris board, hold/next preview panels, status pill
│   ├── game/             # Guidelines Tetris engine (SRS kicks, 7-bag, scoring)
│   ├── hooks/            # useTetris game state hook, useClock
│   ├── styles/           # CSS design system (Geist, OKLCH, responsive layout)
│   └── utils/            # Web Audio sound manager, Chrome storage persistence
├── index.html            # New tab HTML entrypoint
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

MIT
