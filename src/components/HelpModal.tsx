import React from 'react';
import { HelpCircle, X, Cloud, BookOpen, Compass, LayoutGrid, Users, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Welcome to Inkling Studio</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '0.94rem', color: 'var(--ink)', lineHeight: 1.5 }}>
            Inkling is an all-in-one novel writing and worldbuilding studio tailored for authors. Unlike co-writer tools, <b>the words are always, only yours</b>. Inkling is your memory and organization assistant.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                <Cloud size={16} style={{ color: '#4285F4' }} />
                <span>Google Drive Storage</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Your drafts and worldbuilding documents are saved directly to your personal Google Drive in the <code>Inkling Stories</code> folder.
              </p>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                <LayoutGrid size={16} style={{ color: '#8a5cc0' }} />
                <span>Visual Storyboard</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Drag index cards for scenes, beats, and ideas on a digital corkboard and link them with threads.
              </p>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                <Users size={16} style={{ color: '#B0567A' }} />
                <span>Character Builder</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Track wounds, fears, internal lies, wants vs needs, and character arcs for your entire cast.
              </p>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                <Compass size={16} style={{ color: '#3E7A8C' }} />
                <span>Fantasy Map Maker</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Stamp castles, towers, beasts, and colorize realm territories with hand-drawn ink plates.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--accent-soft)', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <b>Keyboard shortcuts:</b> Press <kbd style={{ padding: '2px 6px', background: 'var(--panel)', borderRadius: '4px' }}>⌘K</kbd> or <kbd style={{ padding: '2px 6px', background: 'var(--panel)', borderRadius: '4px' }}>Ctrl+K</kbd> to open the Command Palette from anywhere in the app.
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn-primary" onClick={onClose}>
            Got it, let's write!
          </button>
        </div>
      </div>
    </div>
  );
};
