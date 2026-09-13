import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { savePreferences } from '../../utils/storage';

interface SearchWidgetProps {
  initialEngine?: 'google' | 'duckduckgo' | 'bing' | 'brave';
}

const ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=' },
};

export const SearchWidget: React.FC<SearchWidgetProps> = ({ initialEngine = 'google' }) => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'google' | 'duckduckgo' | 'bing' | 'brave'>(initialEngine);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEngine(initialEngine);
  }, [initialEngine]);

  // Press "/" to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const targetUrl = ENGINES[engine].url + encodeURIComponent(query.trim());
    window.location.href = targetUrl;
  };

  const handleEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEngine = e.target.value as 'google' | 'duckduckgo' | 'bing' | 'brave';
    setEngine(newEngine);
    savePreferences({ searchEngine: newEngine });
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <select
          className="engine-select"
          value={engine}
          onChange={handleEngineChange}
          title="Change search engine"
        >
          <option value="google">Google</option>
          <option value="duckduckgo">DuckDuckGo</option>
          <option value="bing">Bing</option>
          <option value="brave">Brave</option>
        </select>

        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }} />

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search the web or type a URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={false}
        />

        <div className="search-shortcut-badge">/</div>
      </form>
    </div>
  );
};
