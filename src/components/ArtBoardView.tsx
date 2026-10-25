import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Download,
  Check,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Layers,
  FileImage,
  RefreshCw,
  Sliders,
  Type,
} from 'lucide-react';
import { Story } from '../types';
import {
  StoryCoverSvg,
  CoverPalette,
  CoverMotif,
  CoverFrame,
  CoverOrnament,
  CoverConfig,
  parseCoverConfig,
} from '../utils/coverGenerator';

interface ArtBoardViewProps {
  stories: Story[];
  onAssignCoverToStory: (storyId: string, coverData: string) => void;
}

export const ArtBoardView: React.FC<ArtBoardViewProps> = ({
  stories,
  onAssignCoverToStory,
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState(stories[0]?.id || '');
  const activeStory = stories.find((s) => s.id === selectedStoryId) || stories[0];

  const initialCover = parseCoverConfig(activeStory?.cover);

  const [title, setTitle] = useState(activeStory?.title || 'A Vow of Ash and Wing');
  const [subtitle, setSubtitle] = useState(initialCover.subtitle || 'A Novel of the High Eyrie');
  const [author, setAuthor] = useState(initialCover.author || 'Rhea Voss');
  const [byline, setByline] = useState(initialCover.byline || 'Written By');
  const [palette, setPalette] = useState<CoverPalette>(initialCover.palette || 'clay');
  const [motif, setMotif] = useState<CoverMotif>(initialCover.motif || 'citadel');
  const [frame, setFrame] = useState<CoverFrame>(initialCover.frame || 'dustjacket');
  const [fontFamily, setFontFamily] = useState(initialCover.fontFamily || 'Cinzel');
  const [ornament, setOrnament] = useState<CoverOrnament>(initialCover.ornament || 'fleur');
  const [foil, setFoil] = useState<boolean>(initialCover.foil ?? true);
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(initialCover.customImageUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When story selection changes, load its title and cover settings
  const handleStoryChange = (storyId: string) => {
    setSelectedStoryId(storyId);
    const s = stories.find((item) => item.id === storyId);
    if (!s) return;
    setTitle(s.title);
    if (s.cover) {
      const cfg = parseCoverConfig(s.cover);
      if (cfg.palette) setPalette(cfg.palette);
      if (cfg.motif) setMotif(cfg.motif);
      if (cfg.frame) setFrame(cfg.frame);
      if (cfg.fontFamily) setFontFamily(cfg.fontFamily);
      if (cfg.ornament) setOrnament(cfg.ornament);
      if (cfg.subtitle !== undefined) setSubtitle(cfg.subtitle);
      if (cfg.author) setAuthor(cfg.author);
      if (cfg.byline) setByline(cfg.byline);
      if (cfg.foil !== undefined) setFoil(cfg.foil);
      if (cfg.customImageUrl) setCustomImageUrl(cfg.customImageUrl);
    }
  };

  const handleApplyToStory = () => {
    if (!selectedStoryId) return;
    const coverData = JSON.stringify({
      palette,
      motif,
      frame,
      fontFamily,
      ornament,
      title,
      subtitle,
      author,
      byline,
      foil,
      customImageUrl,
    });
    onAssignCoverToStory(selectedStoryId, coverData);
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

  const handleDownloadPng = () => {
    const svgEl = document.getElementById('art-board-cover-svg') as unknown as SVGSVGElement;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1200, 1800);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${title.replace(/\s+/g, '_')}_Cover.png`;
      a.click();
    };
    img.src = url;
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImageUrl(dataUrl);
      setMotif('custom');
    };
    reader.readAsDataURL(file);
  };

  const palettesList: { id: CoverPalette; label: string; swatch: string }[] = [
    { id: 'gold', label: 'Imperial Gold', swatch: '#d97706' },
    { id: 'night', label: 'Midnight Starlight', swatch: '#1e293b' },
    { id: 'clay', label: 'Sepia Earth', swatch: '#78716c' },
    { id: 'forest', label: 'Deep Emerald', swatch: '#15803d' },
    { id: 'rose', label: 'Velvet Rose', swatch: '#be123c' },
    { id: 'ocean', label: 'Abyssal Ocean', swatch: '#0369a1' },
    { id: 'obsidian', label: 'Obsidian Noir', swatch: '#18181b' },
    { id: 'amethyst', label: 'Royal Amethyst', swatch: '#7e22ce' },
  ];

  const motifsList: { id: CoverMotif; label: string; icon: string }[] = [
    { id: 'citadel', label: 'Mythic Citadel', icon: '🏰' },
    { id: 'landscape', label: 'Misty Mountains', icon: '🌄' },
    { id: 'heraldry', label: 'Royal Heraldry', icon: '⚔️' },
    { id: 'celestial', label: 'Celestial Orbit', icon: '🌌' },
    { id: 'forest', label: 'Enchanted Forest', icon: '🌲' },
    { id: 'clothbound', label: 'Clothbound Edition', icon: '📖' },
    { id: 'custom', label: 'Custom Artwork', icon: '🖼️' },
  ];

  const framesList: { id: CoverFrame; label: string }[] = [
    { id: 'dustjacket', label: 'Dustjacket' },
    { id: 'vintage-frame', label: 'Gilded Frame' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'fullbleed', label: 'Full-Bleed' },
  ];

  const ornamentsList: { id: CoverOrnament; label: string }[] = [
    { id: 'fleur', label: '⚜️ Fleur-de-lis' },
    { id: 'stars', label: '✦ Starburst' },
    { id: 'swords', label: '⚔️ Swords' },
    { id: 'diamond', label: '❖ Diamond' },
    { id: 'laurel', label: '🌿 Laurel' },
    { id: 'line', label: '── Line' },
    { id: 'none', label: 'None' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
          Art Board · Book Cover Studio
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Design book covers that evoke classic fantasy dust jackets, foil-stamped editions, and modern publishing standards.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', alignItems: 'start' }}>
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
          {/* Select Story */}
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Design Cover For Story
            </label>
            <select
              value={selectedStoryId}
              onChange={(e) => handleStoryChange(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.92rem',
                color: 'var(--ink)',
              }}
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Book Titles & Metadata */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Book Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Vow of Ash and Wing"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.92rem',
                color: 'var(--ink)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Subtitle / Series Line
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Book One"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  color: 'var(--ink)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Byline Label
              </label>
              <input
                type="text"
                value={byline}
                onChange={(e) => setByline(e.target.value)}
                placeholder="e.g. Written By"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  color: 'var(--ink)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Author Name
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Rhea Voss"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.92rem',
                color: 'var(--ink)',
              }}
            />
          </div>

          {/* Cover Art Motif Selection */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
              Cover Artwork Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {motifsList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMotif(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: motif === m.id ? 'var(--accent-soft)' : 'var(--bg)',
                    border: motif === m.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                    color: motif === m.id ? 'var(--accent)' : 'var(--ink)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Custom image upload button if motif is custom */}
            {motif === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px dashed var(--line)',
                    background: 'var(--bg)',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: 'var(--accent)',
                  }}
                >
                  <Upload size={16} />
                  <span>{customImageUrl ? 'Change Uploaded Artwork' : 'Upload Illustration (PNG/JPG)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
              Color Harmony
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {palettesList.map((p) => (
                <button
                  key={p.id}
                  className={`chip ${palette === p.id ? 'active' : ''}`}
                  onClick={() => setPalette(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    fontSize: '0.74rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: p.swatch,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{p.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Style & Ornaments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Frame Border
              </label>
              <select
                value={frame}
                onChange={(e) => setFrame(e.target.value as CoverFrame)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '7px 8px',
                  fontSize: '0.82rem',
                  color: 'var(--ink)',
                }}
              >
                {framesList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Foil Ornament
              </label>
              <select
                value={ornament}
                onChange={(e) => setOrnament(e.target.value as CoverOrnament)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '7px 8px',
                  fontSize: '0.82rem',
                  color: 'var(--ink)',
                }}
              >
                {ornamentsList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Typography */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Title Typography Font
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
                color: 'var(--ink)',
              }}
            >
              <option value="Cinzel">Cinzel (Epic Regal Fantasy)</option>
              <option value="Cormorant Garamond">Cormorant Garamond (Gothic Literary)</option>
              <option value="Courier Prime">Courier Prime (Vintage Manuscript)</option>
              <option value="Josefin Sans">Josefin Sans (Clean Modern)</option>
              <option value="Caveat">Caveat (Poetic Script / Memoir)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="action-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              onClick={handleApplyToStory}
            >
              {savedSuccess ? <Check size={16} /> : <BookOpen size={16} />}
              <span>{savedSuccess ? 'Cover Attached to Story!' : `Set as Cover for "${activeStory?.title || 'Story'}"`}</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                className="action-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}
                onClick={handleDownloadSvg}
                title="Download scalable vector SVG for print and high-res editing"
              >
                <Download size={14} />
                <span>Vector SVG</span>
              </button>

              <button
                className="action-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}
                onClick={handleDownloadPng}
                title="Download 1200x1800 high-res PNG image"
              >
                <FileImage size={14} />
                <span>High-Res PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Area (Standard 2:3 book aspect ratio) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              aspectRatio: '2 / 3',
              borderRadius: '10px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#1a1815',
              border: '1px solid var(--line)',
            }}
          >
            <StoryCoverSvg
              palette={palette}
              motif={motif}
              frame={frame}
              fontFamily={fontFamily}
              ornament={ornament}
              title={title}
              subtitle={subtitle}
              author={author}
              byline={byline}
              foil={foil}
              customImageUrl={customImageUrl}
              showDetails={true}
            />
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '12px' }}>
            Book Dustjacket Preview · 2:3 Standard Publishing Ratio
          </span>
        </div>
      </div>
    </div>
  );
};
