import React, { useState } from 'react';
import type { ShortcutItem } from '../../utils/storage';
import { savePreferences } from '../../utils/storage';
import {
  Mail,
  Globe,
  Bot,
  MessageCircle,
  Plus,
  X,
  Code2,
  Tv,
} from 'lucide-react';

interface ShortcutsGridProps {
  shortcuts: ShortcutItem[];
  onShortcutsChange: (shortcuts: ShortcutItem[]) => void;
}

const SHORTCUT_THEMES: Record<string, { bg: string; icon: React.ReactNode }> = {
  github: {
    bg: 'linear-gradient(135deg, #24292e 0%, #16181b 100%)',
    icon: <Code2 size={15} color="#fff" />,
  },
  youtube: {
    bg: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
    icon: <Tv size={15} color="#fff" />,
  },
  mail: {
    bg: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)',
    icon: <Mail size={15} color="#fff" />,
  },
  globe: {
    bg: 'linear-gradient(135deg, #ff4500 0%, #e03d00 100%)',
    icon: <Globe size={15} color="#fff" />,
  },
  bot: {
    bg: 'linear-gradient(135deg, #10a37f 0%, #0c7a5f 100%)',
    icon: <Bot size={15} color="#fff" />,
  },
  'message-circle': {
    bg: 'linear-gradient(135deg, #000000 0%, #1c1c1e 100%)',
    icon: <MessageCircle size={15} color="#fff" />,
  },
};

function getShortcutTheme(item: ShortcutItem) {
  const urlLower = item.url.toLowerCase();
  const iconName = item.iconName || '';
  if (iconName === 'github' || urlLower.includes('github')) return SHORTCUT_THEMES.github;
  if (iconName === 'youtube' || urlLower.includes('youtube')) return SHORTCUT_THEMES.youtube;
  if (iconName === 'mail' || urlLower.includes('mail') || urlLower.includes('gmail')) return SHORTCUT_THEMES.mail;
  if (iconName === 'bot' || urlLower.includes('chatgpt') || urlLower.includes('openai') || urlLower.includes('claude')) return SHORTCUT_THEMES.bot;
  if (iconName === 'message-circle' || urlLower.includes('x.com') || urlLower.includes('twitter')) return SHORTCUT_THEMES['message-circle'];
  if (iconName === 'globe' || urlLower.includes('reddit')) return SHORTCUT_THEMES.globe;
  return {
    bg: 'linear-gradient(135deg, #007aff 0%, #0056b3 100%)',
    icon: <Globe size={15} color="#fff" />,
  };
}

export const ShortcutsGrid: React.FC<ShortcutsGridProps> = ({
  shortcuts,
  onShortcutsChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let validUrl = newUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newItem: ShortcutItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: validUrl,
      iconName: 'globe',
    };

    const updated = [...shortcuts, newItem];
    onShortcutsChange(updated);
    savePreferences({ shortcuts: updated });

    setNewTitle('');
    setNewUrl('');
    setIsModalOpen(false);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = shortcuts.filter((item) => item.id !== id);
    onShortcutsChange(updated);
    savePreferences({ shortcuts: updated });
  };

  return (
    <>
      <div className="shortcuts-grid">
        {shortcuts.map((item) => {
          const theme = getShortcutTheme(item);

          return (
            <a
              key={item.id}
              href={item.url}
              className="shortcut-card"
              target="_self"
              rel="noopener noreferrer"
            >
              <div
                className="shortcut-icon-squircle"
                style={{ background: theme.bg }}
              >
                {theme.icon}
              </div>
              <span className="shortcut-title">{item.title}</span>
              <button
                className="shortcut-remove-btn"
                title="Remove shortcut"
                onClick={(e) => handleRemove(e, item.id)}
              >
                <X size={12} />
              </button>
            </a>
          );
        })}

        {/* Add shortcut button */}
        <button
          className="shortcut-card add-card"
          onClick={() => setIsModalOpen(true)}
          title="Add shortcut"
        >
          <div className="shortcut-icon-squircle add-icon">
            <Plus size={14} />
          </div>
          <span className="shortcut-title add-title">
            Add
          </span>
        </button>
      </div>

      {/* Add Shortcut Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Add Shortcut</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddShortcut}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Notion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. notion.so"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.45rem 0.85rem', width: 'auto', height: 'auto' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
