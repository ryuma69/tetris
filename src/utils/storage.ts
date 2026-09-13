declare const chrome: any;

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  iconName?: string;
}

export interface UserPreferences {
  highScore: number;
  totalLines: number;
  soundMuted: boolean;
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave';
  shortcuts: ShortcutItem[];
  theme: 'light' | 'dark';
}

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', iconName: 'github' },
  { id: '2', title: 'YouTube', url: 'https://youtube.com', iconName: 'youtube' },
  { id: '3', title: 'Gmail', url: 'https://mail.google.com', iconName: 'mail' },
  { id: '4', title: 'Reddit', url: 'https://reddit.com', iconName: 'globe' },
  { id: '5', title: 'ChatGPT', url: 'https://chatgpt.com', iconName: 'bot' },
  { id: '6', title: 'Twitter / X', url: 'https://x.com', iconName: 'message-circle' },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  highScore: 0,
  totalLines: 0,
  soundMuted: false,
  searchEngine: 'google',
  shortcuts: DEFAULT_SHORTCUTS,
  theme: 'dark',
};

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['tetris_prefs'], (result: any) => {
          if (result && result.tetris_prefs) {
            resolve({ ...DEFAULT_PREFERENCES, ...result.tetris_prefs });
          } else {
            resolve(DEFAULT_PREFERENCES);
          }
        });
      });
    } else {
      const raw = localStorage.getItem('tetris_newtab_prefs');
      if (raw) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      }
    }
  } catch (e) {
    console.warn('Storage read error, using defaults', e);
  }
  return DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  try {
    const current = await loadPreferences();
    const updated = { ...current, ...prefs };

    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.set({ tetris_prefs: updated });
    } else {
      localStorage.setItem('tetris_newtab_prefs', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Storage write error', e);
  }
}
