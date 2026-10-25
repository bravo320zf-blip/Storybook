import React, { useState } from 'react';
import { Upload, X, FileText, Check, Loader2, FileCode, BookOpen, AlertCircle } from 'lucide-react';
import { Story } from '../types';
import { parseDocumentFile, ParsedDocument } from '../utils/documentParser';
import { ensureStoryChapters } from '../utils/chapterHelpers';

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
  const [format, setFormat] = useState<ParsedDocument['detectedFormat']>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsed = await parseDocumentFile(selected);
      setTitle(parsed.title);
      setContent(parsed.content);
      setFormat(parsed.detectedFormat);
    } catch (err: any) {
      console.error('Failed to parse document:', err);
      setErrorMessage(
        err?.message || 'Could not parse document. Please check if the file is password-protected or try saving as .txt/.docx.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishImport = () => {
    if (!content.trim()) return;

    const words = (content.match(/\S+/g) || []).length;
    const firstSentence = content.slice(0, 160).split(/[.!?]/)[0] || '';

    const baseStory: Story = {
      id: `story-${Date.now()}`,
      title: title.trim() || 'Imported Draft',
      status: 'drafting',
      words,
      edited: Date.now(),
      body: content,
      summary: firstSentence ? `${firstSentence}.` : 'Imported draft waiting for your next scene.',
    };

    // Auto-organize into chapters and letter-sized pages
    const chapters = ensureStoryChapters(baseStory);
    const structuredStory: Story = {
      ...baseStory,
      chapters,
      activeChapterId: chapters[0]?.id,
      activePageId: chapters[0]?.pages[0]?.id,
    };

    onImportComplete(structuredStory);
    onClose();
  };

  const formatBadges = [
    { ext: '.txt', label: 'Plain Text' },
    { ext: '.md', label: 'Markdown' },
    { ext: '.docx / .doc', label: 'Word' },
    { ext: '.pdf', label: 'PDF' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
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
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            Import your existing manuscript from your computer or Google Drive. Headings and word counts are preserved and paginated into standard letter-sized pages.
          </p>

          {/* Supported formats row */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {formatBadges.map((badge) => (
              <span
                key={badge.ext}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--muted)',
                  fontWeight: 600,
                }}
              >
                {badge.ext} · {badge.label}
              </span>
            ))}
          </div>

          <label
            style={{
              border: '2px dashed var(--line)',
              borderRadius: '8px',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: isProcessing ? 'wait' : 'pointer',
              background: 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={26} className="animate-spin" style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Extracting text and pages…
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Parsing {file?.name}
                </span>
              </>
            ) : (
              <>
                <Upload size={26} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                  {file ? file.name : 'Click or drop a file to import'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Supports .pdf, .docx, .doc, .md, .txt
                </span>
              </>
            )}
            <input
              type="file"
              accept=".txt,.md,.markdown,.docx,.doc,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={isProcessing}
              style={{ display: 'none' }}
            />
          </label>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(217, 83, 79, 0.1)',
                border: '1px solid rgba(217, 83, 79, 0.3)',
                borderRadius: '6px',
                color: '#d9534f',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {content && !isProcessing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
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
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Detected Format: <strong style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{format}</strong>
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {(content.match(/\S+/g) || []).length.toLocaleString()} words
                </span>
              </div>

              {/* Preview snippet */}
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '8px 12px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--muted)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {content.slice(0, 400)}
                {content.length > 400 ? '…' : ''}
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
            disabled={!content.trim() || isProcessing}
          >
            <Check size={16} />
            <span>Import to Storyboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

