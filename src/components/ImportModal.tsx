import React, { useState } from 'react';
import { Upload, X, FileText, Check } from 'lucide-react';
import { Story } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (story: Story) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const fileNameWithoutExt = selected.name.replace(/\.[^/.]+$/, '');
    setTitle(fileNameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(selected);
  };

  const handleFinishImport = () => {
    if (!content.trim()) return;

    const words = (content.match(/\S+/g) || []).length;
    const firstSentence = content.slice(0, 160).split(/[.!?]/)[0] || '';

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: title || 'Imported Draft',
      status: 'drafting',
      words,
      edited: Date.now(),
      body: content,
      summary: firstSentence ? `${firstSentence}.` : 'Imported draft waiting for your next scene.',
    };

    onImportComplete(newStory);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Import Draft</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            Choose any <code>.txt</code> or <code>.md</code> manuscript file from your computer or Google Drive. Storyboard preserves all headings and word counts.
          </p>

          <label
            style={{
              border: '2px dashed var(--line)',
              borderRadius: '8px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Upload size={24} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {file ? file.name : 'Click to select a .txt or .md file'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Plain text or markdown manuscripts
            </span>
            <input
              type="file"
              accept=".txt,.md,.markdown"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          {content && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Draft Title
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
                  fontSize: '0.9rem',
                }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>
                Detected {(content.match(/\S+/g) || []).length.toLocaleString()} words in this draft.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="action-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="action-btn-primary"
            onClick={handleFinishImport}
            disabled={!content.trim()}
          >
            <Check size={16} />
            <span>Import to Storyboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
