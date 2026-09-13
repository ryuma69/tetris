import React from 'react';
import { useClock } from '../../hooks/useClock';
import { SearchWidget } from '../Search/SearchWidget';
import { ShortcutsGrid } from './ShortcutsGrid';
import type { ShortcutItem } from '../../utils/storage';

interface ProductivityHubProps {
  shortcuts: ShortcutItem[];
  onShortcutsChange: (shortcuts: ShortcutItem[]) => void;
  searchEngine?: 'google' | 'duckduckgo' | 'bing' | 'brave';
}

export const ProductivityHub: React.FC<ProductivityHubProps> = ({
  shortcuts,
  onShortcutsChange,
  searchEngine,
}) => {
  const { timeString, dateString, greeting } = useClock();

  return (
    <div className="productivity-hub">
      {/* Clock & Greeting */}
      <div className="clock-greeting-wrapper">
        <div className="clock-display">{timeString}</div>
        <div className="greeting-text">{greeting}</div>
        <div className="date-text">{dateString}</div>
      </div>

      {/* Omnibar Search */}
      <SearchWidget initialEngine={searchEngine} />

      {/* Shortcuts */}
      <ShortcutsGrid
        shortcuts={shortcuts}
        onShortcutsChange={onShortcutsChange}
      />
    </div>
  );
};
