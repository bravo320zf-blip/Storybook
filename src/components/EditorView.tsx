import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Download,
  Cloud,
  FileText,
  Sparkles,
  Users,
  Compass,
  LayoutGrid,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  FolderSync,
} from 'lucide-react';
import { Story, Character, StoryboardData, WorldMap } from '../types';
import { MapStampIcon } from '../utils/mapStamps';

interface EditorViewProps {
  story: Story;
  characters: Character[];
  storyboard: StoryboardData;
  maps: WorldMap[];
  onBack: () => void;
  onUpdateStory: (updatedStory: Story) => void;
  onSaveToDrive: (story: Story) => Promise<void>;
  driveFolderName: string;
}

export const EditorView: React.FC<EditorViewProps> = ({
  story,
  characters,
  storyboard,
  maps,
  onBack,
  onUpdateStory,
  onSaveToDrive,
  driveFolderName,
}) => {
  const [title, setTitle] = useState(story.title);
  const [body, setBody] = useState(story.body);
  const [status, setStatus] = useState(story.status);
  const [summary, setSummary] = useState(story.summary);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'recap' | 'characters' | 'storyboard' | 'map' | null>('recap');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Word count & reading time calculation
  const words = (body.match(/\S+/g) || []).length;
  const readingTime = Math.ceil(words / 220);

  // Auto-save local draft
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const updated: Story = {
        ...story,
        title,
        body,
        status,
        summary,
        words,
        edited: Date.now(),
      };
      onUpdateStory(updated);
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, body, status, summary, words]);

  // Generate lightweight recap summary from the text
  const generateRecap = () => {
    const sentences = body.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 15);
    if (sentences.length === 0) {
      setSummary('A fresh page waiting for your words.');
      return;
    }
    // Pick opening tone and key turning point
    const firstSentence = sentences[0];
    const lastSentence = sentences[sentences.length - 1];
    setSummary(`${firstSentence}. Later, ${lastSentence.toLowerCase()}.`);
  };

  const handleManualDriveSave = async () => {
    setIsSavingDrive(true);
    setSaveSuccess(false);
    try {
      const currentStory: Story = {
        ...story,
        title,
        body,
        status,
        summary,
        words,
        edited: Date.now(),
      };
      await onSaveToDrive(currentStory);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save to Google Drive. Check connection in Setup.');
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'story'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`editor-desk ${fullScreen ? 'fixed inset-0 z-50 bg-[var(--bg)]' : ''}`}>
      {/* Writing Paper Area */}
      <div className="editor-main-paper">
        {/* Editor Top Navigation Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <button className="jump-in-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              {words.toLocaleString()} words · {readingTime} min read
            </span>

            {/* Status dropdown */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            >
              <option value="drafting">Drafting</option>
              <option value="stuck">Stuck</option>
              <option value="needs-ending">Needs ending</option>
              <option value="resting">Resting</option>
              <option value="finished">Finished</option>
            </select>

            {/* Google Drive Save Button */}
            <button
              className="action-btn-secondary"
              onClick={handleManualDriveSave}
              disabled={isSavingDrive}
              title={`Save to Google Drive folder: ${driveFolderName}`}
            >
              {saveSuccess ? (
                <Check size={14} style={{ color: 'var(--good)' }} />
              ) : isSavingDrive ? (
                <FolderSync size={14} className="animate-spin" />
              ) : (
                <Cloud size={14} style={{ color: '#4285F4' }} />
              )}
              <span>{saveSuccess ? 'Saved in Drive' : isSavingDrive ? 'Saving...' : 'Sync to Drive'}</span>
            </button>

            {/* Export */}
            <button
              className="icon-btn"
              onClick={handleExportMarkdown}
              title="Download Markdown file"
            >
              <Download size={16} />
            </button>

            {/* Fullscreen toggle */}
            <button
              className="icon-btn"
              onClick={() => setFullScreen(!fullScreen)}
              title={fullScreen ? 'Exit full screen' : 'Full screen focus mode'}
            >
              {fullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Studio Peek Toggle */}
            <button
              className={`icon-btn ${activeDrawerTab ? 'active bg-[var(--accent-soft)]' : ''}`}
              onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'recap')}
              title="Toggle Studio Peek drawer"
            >
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            </button>
          </div>
        </div>

        {/* The Paper Sheet */}
        <div className="paper-sheet">
          <input
            type="text"
            className="editor-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title…"
          />

          <textarea
            className="editor-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Begin your draft here. The words are always, only yours…"
          />
        </div>
      </div>

      {/* Studio Peek Drawer (Characters, Map, Storyboard, and Recap right beside your draft) */}
      {activeDrawerTab && (
        <aside className="editor-studio-drawer">
          {/* Drawer tab headers */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <button
              className={`chip ${activeDrawerTab === 'recap' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setActiveDrawerTab('recap')}
            >
              Recap
            </button>
            <button
              className={`chip ${activeDrawerTab === 'characters' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setActiveDrawerTab('characters')}
            >
              Cast ({characters.length})
            </button>
            <button
              className={`chip ${activeDrawerTab === 'storyboard' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setActiveDrawerTab('storyboard')}
            >
              Board
            </button>
            <button
              className={`chip ${activeDrawerTab === 'map' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setActiveDrawerTab('map')}
            >
              Map
            </button>
          </div>

          {/* Recap Tab */}
          {activeDrawerTab === 'recap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Previously…
                </span>
                <button
                  className="jump-in-btn"
                  style={{ fontSize: '0.75rem' }}
                  onClick={generateRecap}
                  title="Generate recap from manuscript"
                >
                  <Sparkles size={12} />
                  <span>Synthesize</span>
                </button>
              </div>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What happened before? A quick one-sentence recap so you jump back in with momentum..."
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  minHeight: '120px',
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                This recap appears on your dashboard card to give you instant memory re-entry.
              </p>
            </div>
          )}

          {/* Characters Tab */}
          {activeDrawerTab === 'characters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Character Cast
              </span>
              {characters.map((char) => (
                <div
                  key={char.id}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: char.avatarColor,
                      }}
                    />
                    <b style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{char.name}</b>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                      {char.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink)', marginBottom: '4px' }}>
                    {char.tagline}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <b>Wound:</b> {char.wound || 'None'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <b>Lie:</b> {char.lie || 'None'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Storyboard Tab */}
          {activeDrawerTab === 'storyboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Storyboard Cards
              </span>
              {storyboard.cards.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: c.color || 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#26221d',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>
                    {c.kind}
                  </div>
                  <b style={{ fontSize: '0.88rem' }}>{c.title || 'Untitled Card'}</b>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.85 }}>{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Map Tab */}
          {activeDrawerTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                World Places ({maps[0]?.stamps.length || 0})
              </span>
              {maps[0]?.stamps.map((st) => (
                <div
                  key={st.id}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <MapStampIcon type={st.type} size={20} />
                  <div>
                    <b style={{ fontSize: '0.88rem' }}>{st.label || st.type}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      Location: X {st.x}, Y {st.y}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}
    </div>
  );
};
