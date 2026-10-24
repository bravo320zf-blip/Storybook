import React, { useState } from 'react';
import { Palette, Download, Check, Cloud, Sparkles, BookOpen } from 'lucide-react';
import { Story } from '../types';
import { StoryCoverSvg } from '../utils/coverGenerator';

interface ArtBoardViewProps {
  stories: Story[];
  onAssignCoverToStory: (storyId: string, coverData: string) => void;
}

export const ArtBoardView: React.FC<ArtBoardViewProps> = ({
  stories,
  onAssignCoverToStory,
}) => {
  const [title, setTitle] = useState('A Vow of Ash and Wing');
  const [subtitle, setSubtitle] = useState('A Novel of the High Eyrie');
  const [author, setAuthor] = useState('Rhea Voss');
  const [palette, setPalette] = useState<'clay' | 'gold' | 'night' | 'forest' | 'rose' | 'ocean'>('clay');
  const [selectedStoryId, setSelectedStoryId] = useState(stories[0]?.id || '');
  const [fontFamily, setFontFamily] = useState('Cinzel');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyToStory = () => {
    if (!selectedStoryId) return;
    onAssignCoverToStory(selectedStoryId, palette);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('art-board-cover-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Cover.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
          Art Board
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Design book covers that evoke classic fantasy dust jackets and clothbound editions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '36px', alignItems: 'start' }}>
        {/* Controls Column */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Subtitle / Series Line
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Author Name
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Palette selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Landscape Art Palette
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['clay', 'gold', 'night', 'forest', 'rose', 'ocean'] as const).map((p) => (
                <button
                  key={p}
                  className={`chip ${palette === p ? 'active' : ''}`}
                  onClick={() => setPalette(p)}
                  style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '6px 4px', textAlign: 'center' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Title Typography
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.88rem',
              }}
            >
              <option value="Cinzel">Cinzel (Regal Classic)</option>
              <option value="Cormorant Garamond">Cormorant Garamond (Literary)</option>
              <option value="Caveat">Caveat (Poetic Script)</option>
              <option value="Courier Prime">Courier Prime (Typewriter)</option>
              <option value="Josefin Sans">Josefin Sans (Modern Clean)</option>
            </select>
          </div>

          {/* Attach to Story */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Set as Cover For
            </label>
            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.88rem',
                marginBottom: '12px',
              }}
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <button
              className="action-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleApplyToStory}
            >
              {savedSuccess ? <Check size={16} /> : <BookOpen size={16} />}
              <span>{savedSuccess ? 'Cover Attached!' : 'Set as Story Cover'}</span>
            </button>
          </div>

          {/* Export vector button */}
          <button
            className="action-btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleDownloadSvg}
          >
            <Download size={15} />
            <span>Download Vector SVG</span>
          </button>
        </div>

        {/* Real-time Cover Preview (2:3 Aspect ratio portrait book plate) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            id="art-board-cover-container"
            style={{
              width: '380px',
              height: '570px',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              position: 'relative',
              background: '#221f1b',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top Title Section */}
            <div
              style={{
                padding: '40px 24px 20px',
                textAlign: 'center',
                zIndex: 10,
                background: 'linear-gradient(to bottom, rgba(20,18,15,0.85) 60%, transparent)',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#d2c3ac',
                  marginBottom: '8px',
                }}
              >
                {subtitle}
              </div>
              <h2
                style={{
                  fontFamily: fontFamily,
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  color: '#fffdf9',
                  lineHeight: 1.2,
                  letterSpacing: '0.04em',
                }}
              >
                {title}
              </h2>
            </div>

            {/* Illustration Area */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div id="art-board-cover-svg" style={{ width: '100%', height: '100%' }}>
                <StoryCoverSvg seed={title + author} palette={palette} />
              </div>
            </div>

            {/* Author Footer */}
            <div
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                zIndex: 10,
                background: 'linear-gradient(to top, rgba(20,18,15,0.9) 60%, transparent)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#a99c88',
                  marginBottom: '4px',
                }}
              >
                Written By
              </div>
              <div
                style={{
                  fontFamily: fontFamily,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#f0ebe2',
                  letterSpacing: '0.08em',
                }}
              >
                {author}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
