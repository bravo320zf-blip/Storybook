import React, { useState, useEffect } from 'react';
import {
  Search,
  Book,
  Users,
  Compass,
  LayoutGrid,
  Sparkles,
  Palette,
  Timer,
  Cloud,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { Story, Character } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  characters: Character[];
  onNavigate: (view: string) => void;
  onOpenStory: (story: Story) => void;
  onOpenSprint: () => void;
  onToggleDarkMode: () => void;
  onTriggerDriveSync: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  stories,
  characters,
  onNavigate,
  onOpenStory,
  onOpenSprint,
  onToggleDarkMode,
  onTriggerDriveSync,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStories = stories.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '580px', maxHeight: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)', gap: '10px' }}>
          <Search size={18} style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Type a story title, character, or command…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--ink)',
            }}
          />
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Stories section */}
          {filteredStories.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 12px' }}>
                Stories & Manuscripts
              </div>
              {filteredStories.map((story) => (
                <button
                  key={story.id}
                  className="nav-item"
                  onClick={() => {
                    onClose();
                    onOpenStory(story);
                  }}
                  style={{ gap: '12px' }}
                >
                  <Book size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{story.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {story.words} words
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Characters section */}
          {filteredCharacters.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 12px' }}>
                Cast & Characters
              </div>
              {filteredCharacters.map((char) => (
                <button
                  key={char.id}
                  className="nav-item"
                  onClick={() => {
                    onClose();
                    onNavigate('characters');
                  }}
                  style={{ gap: '12px' }}
                >
                  <Users size={16} style={{ color: char.avatarColor }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{char.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {char.role}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Tools & Actions */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 12px' }}>
              Studio Tools & Quick Actions
            </div>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onNavigate('storyboard');
              }}
            >
              <LayoutGrid size={16} style={{ color: '#8a5cc0' }} />
              <span>Open Storyboard Canvas</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onNavigate('maps');
              }}
            >
              <Compass size={16} style={{ color: '#3E7A8C' }} />
              <span>Open Map Maker</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onNavigate('art');
              }}
            >
              <Palette size={16} style={{ color: '#1D9E75' }} />
              <span>Design Book Cover in Art Board</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onNavigate('muse');
              }}
            >
              <Sparkles size={16} style={{ color: '#BA7517' }} />
              <span>Ask Muse for Inspiration Spark</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onOpenSprint();
              }}
            >
              <Timer size={16} style={{ color: 'var(--accent)' }} />
              <span>Start 15-Minute Writing Sprint</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onTriggerDriveSync();
              }}
            >
              <Cloud size={16} style={{ color: '#4285F4' }} />
              <span>Sync All to Google Drive</span>
            </button>

            <button
              className="nav-item"
              onClick={() => {
                onClose();
                onToggleDarkMode();
              }}
            >
              <Moon size={16} />
              <span>Toggle Dark / Light Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
