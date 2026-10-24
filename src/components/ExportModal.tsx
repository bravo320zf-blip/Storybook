import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Book,
  FileCode,
  Cloud,
  FolderSync,
} from 'lucide-react';
import { BookChapter, BookPage } from '../types';
import {
  compileBookManuscript,
  compileChapterText,
  compilePageText,
  countWords,
} from '../utils/chapterHelpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  chapters: BookChapter[];
  activeChapter: BookChapter;
  activePage: BookPage;
  bookNotes?: string;
  onSaveToDrive?: (title: string, content: string) => Promise<void>;
  driveFolderName?: string;
}

type ExportScope = 'page' | 'chapter' | 'book';
type ExportFormat = 'md' | 'txt';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  chapters,
  activeChapter,
  activePage,
  bookNotes,
  onSaveToDrive,
  driveFolderName = 'Inkling Stories',
}) => {
  const [scope, setScope] = useState<ExportScope>('book');
  const [format, setFormat] = useState<ExportFormat>('md');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);

  if (!isOpen) return null;

  // Generate the content according to current scope
  let content = '';
  let filename = '';
  let wordCount = 0;

  if (scope === 'page') {
    content = compilePageText(activePage, activeChapter.title, includeNotes);
    filename = `${bookTitle || 'Book'} - ${activeChapter.title} - ${activePage.title || 'Page'}.${format}`;
    wordCount = countWords(activePage.body || '');
  } else if (scope === 'chapter') {
    content = compileChapterText(activeChapter, includeNotes);
    filename = `${bookTitle || 'Book'} - ${activeChapter.title}.${format}`;
    wordCount = (activeChapter.pages || []).reduce((acc, p) => acc + countWords(p.body || ''), 0);
  } else {
    content = compileBookManuscript(bookTitle, chapters, includeNotes);
    if (includeNotes && bookNotes) {
      content = `> **Book Premise & Master Notes:**\n> ${bookNotes.replace(/\n/g, '\n> ')}\n\n` + content;
    }
    filename = `${bookTitle || 'Book'} - Full Manuscript.${format}`;
    wordCount = chapters.reduce(
      (acc, c) => acc + (c.pages || []).reduce((pAcc, p) => pAcc + countWords(p.body || ''), 0),
      0
    );
  }

  const handleDownload = () => {
    const mime = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDriveExport = async () => {
    if (!onSaveToDrive) return;
    setSavingDrive(true);
    setDriveSaved(false);
    try {
      await onSaveToDrive(filename.replace(/\.(md|txt)$/i, ''), content);
      setDriveSaved(true);
      setTimeout(() => setDriveSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Could not export to Google Drive. Check connection in Setup.');
    } finally {
      setSavingDrive(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 style={{ margin: 0 }}>Export Manuscript</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                Export by page, chapter, or as a single complete book document.
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scope Selector: Page, Chapter, Book */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              What would you like to export?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                className={`chip ${scope === 'page' ? 'active' : ''}`}
                style={{
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: scope === 'page' ? 'var(--accent-soft)' : 'var(--panel)',
                }}
                onClick={() => setScope('page')}
              >
                <FileText size={18} style={{ color: scope === 'page' ? 'var(--accent)' : 'var(--muted)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Current Page</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {activePage.title || 'Page'} ({countWords(activePage.body || '')}w)
                </span>
              </button>

              <button
                type="button"
                className={`chip ${scope === 'chapter' ? 'active' : ''}`}
                style={{
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: scope === 'chapter' ? 'var(--accent-soft)' : 'var(--panel)',
                }}
                onClick={() => setScope('chapter')}
              >
                <Book size={18} style={{ color: scope === 'chapter' ? 'var(--accent)' : 'var(--muted)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Current Chapter</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {activeChapter.title || 'Chapter'} ({activeChapter.pages.length} pgs)
                </span>
              </button>

              <button
                type="button"
                className={`chip ${scope === 'book' ? 'active' : ''}`}
                style={{
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: scope === 'book' ? 'var(--accent-soft)' : 'var(--panel)',
                }}
                onClick={() => setScope('book')}
              >
                <Book size={18} style={{ color: scope === 'book' ? 'var(--accent)' : 'var(--muted)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Whole Book</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  All {chapters.length} Chapters
                </span>
              </button>
            </div>
          </div>

          {/* Format & Options */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>Format:</span>
              <div style={{ display: 'inline-flex', gap: '8px', marginLeft: '12px' }}>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="format"
                    checked={format === 'md'}
                    onChange={() => setFormat('md')}
                  />
                  <span>Markdown (.md)</span>
                </label>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="format"
                    checked={format === 'txt'}
                    onChange={() => setFormat('txt')}
                  />
                  <span>Plain Text (.txt)</span>
                </label>
              </div>
            </div>

            <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
              />
              <span>Include Notes</span>
            </label>
          </div>

          {/* Manuscript Preview snippet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Document Preview ({wordCount.toLocaleString()} words)
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {filename}
              </span>
            </div>
            <pre
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.82rem',
                fontFamily: 'var(--mono)',
                maxHeight: '160px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--ink)',
              }}
            >
              {content || '(Empty document)'}
            </pre>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="action-btn-secondary"
              onClick={handleCopy}
              title="Copy compiled document to clipboard"
            >
              {copied ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {onSaveToDrive && (
              <button
                className="action-btn-secondary"
                onClick={handleDriveExport}
                disabled={savingDrive}
                title={`Export document to Google Drive folder: ${driveFolderName}`}
              >
                {driveSaved ? (
                  <Check size={14} style={{ color: 'var(--good)' }} />
                ) : savingDrive ? (
                  <FolderSync size={14} className="animate-spin" />
                ) : (
                  <Cloud size={14} style={{ color: '#4285F4' }} />
                )}
                <span>{driveSaved ? 'Saved to Drive' : savingDrive ? 'Saving...' : 'Drive Export'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="action-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="action-btn-primary" onClick={handleDownload}>
              <Download size={15} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
