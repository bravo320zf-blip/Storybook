import React, { useState } from 'react';
import {
  Library as LibraryIcon,
  Book,
  Plus,
  ArrowRight,
  Upload,
  Download,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Story } from '../types';

interface LibraryViewProps {
  stories: Story[];
  onOpenStory: (story: Story) => void;
  onNewStory: () => void;
  onDeleteStory: (storyId: string) => void;
  onImportDraft: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  onOpenStory,
  onNewStory,
  onDeleteStory,
  onImportDraft,
}) => {
  const [shelfFilter, setShelfFilter] = useState<string>('all');

  // Book spine color mapping
  const spineColors = ['#5a4632', '#3d5240', '#633946', '#2b4154', '#665134', '#443850'];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Library & Bookshelf
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            All your novels, poetry manuscripts, and drafts bound in one library.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="action-btn-secondary" onClick={onImportDraft}>
            <Upload size={14} />
            <span>Import Draft (.md / .txt)</span>
          </button>
          <button className="action-btn-primary" onClick={onNewStory}>
            <Plus size={14} />
            <span>New story</span>
          </button>
        </div>
      </div>

      {/* The Physical Bookshelf Display */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '40px 30px 20px',
          boxShadow: 'var(--shadow)',
          marginBottom: '36px',
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px' }}>
          Active Bookshelf
        </div>

        {/* Shelf Rack */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '14px',
            borderBottom: '16px solid #4a3c2c',
            boxShadow: '0 8px 12px rgba(0,0,0,0.15)',
            paddingBottom: '2px',
            overflowX: 'auto',
            minHeight: '220px',
          }}
        >
          {stories.map((story, i) => {
            const height = 170 + (i % 4) * 15;
            const spineBg = spineColors[i % spineColors.length];

            return (
              <div
                key={story.id}
                onClick={() => onOpenStory(story)}
                style={{
                  width: '54px',
                  height: `${height}px`,
                  backgroundColor: spineBg,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: '2px 0 6px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.18s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-12px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                title={`${story.title} (${story.words} words)`}
              >
                {/* Gold Foil Title on Spine */}
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    color: '#e5d7ba',
                    fontFamily: 'var(--serif)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxHeight: `${height - 30}px`,
                  }}
                >
                  {story.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Table / List Details */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>
          All Manuscripts
        </div>

        <div>
          {stories.map((s) => (
            <div
              key={s.id}
              onClick={() => onOpenStory(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Book size={18} style={{ color: 'var(--accent)' }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 600 }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {s.summary || 'No summary yet.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className={`status-badge ${s.status}`}>{s.status}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {s.words.toLocaleString()} words
                </span>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Delete "${s.title}"? This will permanently remove this story from your studio and Google Drive.`
                      )
                    ) {
                      onDeleteStory(s.id);
                    }
                  }}
                  title="Delete manuscript"
                  style={{
                    padding: '4px',
                    color: 'var(--muted)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e53e3e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--muted)';
                  }}
                >
                  <Trash2 size={15} />
                </button>
                <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
