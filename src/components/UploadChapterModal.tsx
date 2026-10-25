import React, { useState } from 'react';
import { Upload, X, Check, Loader2, FileText, AlertCircle } from 'lucide-react';
import { BookChapter, BookPage } from '../types';
import { parseDocumentFile, ParsedDocument } from '../utils/documentParser';
import { splitTextIntoLetterPages, countWords } from '../utils/chapterHelpers';

interface UploadChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextChapterOrder: number;
  onChapterUploaded: (newChapter: BookChapter) => void;
}

export const UploadChapterModal: React.FC<UploadChapterModalProps> = ({
  isOpen,
  onClose,
  nextChapterOrder,
  onChapterUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [chapterTitle, setChapterTitle] = useState(`Chapter ${nextChapterOrder}`);
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
      setChapterTitle(parsed.title || `Chapter ${nextChapterOrder}`);
      setContent(parsed.content);
      setFormat(parsed.detectedFormat);
    } catch (err: any) {
      console.error('Failed to parse chapter document:', err);
      setErrorMessage(
        err?.message || 'Could not parse document. Please check if file is readable or try saving as .docx / .txt.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishUpload = () => {
    if (!content.trim()) return;

    // Split text into standard Letter-sized pages (~300 words each)
    const slices = splitTextIntoLetterPages(content, 300);
    const pages: BookPage[] = slices.map((slice, idx) => ({
      id: `page-${Date.now()}-${idx}`,
      title: `Page ${idx + 1}`,
      order: idx + 1,
      body: slice,
      words: countWords(slice),
    }));

    const finalPages = pages.length > 0 ? pages : [
      {
        id: `page-${Date.now()}-0`,
        title: 'Page 1',
        order: 1,
        body: content,
        words: countWords(content),
      },
    ];

    const firstSentence = content.slice(0, 160).split(/[.!?]/)[0] || '';

    const newChapter: BookChapter = {
      id: `chap-${Date.now()}`,
      title: chapterTitle.trim() || `Chapter ${nextChapterOrder}`,
      order: nextChapterOrder,
      summary: firstSentence ? `${firstSentence}.` : 'Uploaded chapter draft.',
      pages: finalPages,
    };

    onChapterUploaded(newChapter);
    onClose();
  };

  const wordCount = (content.match(/\S+/g) || []).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 300));

  const formatBadges = [
    { ext: '.docx / .doc', label: 'Word' },
    { ext: '.pdf', label: 'PDF' },
    { ext: '.md', label: 'Markdown' },
    { ext: '.txt', label: 'Plain Text' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Upload Chapter</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            Upload a document to insert as a new chapter into this book. It will be automatically paginated into standard letter-sized pages.
          </p>

          {/* Formats badges */}
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
              padding: '26px 18px',
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
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Extracting chapter text & pages…
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Reading {file?.name}
                </span>
              </>
            ) : (
              <>
                <Upload size={24} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {file ? file.name : 'Click to select a chapter file'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
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
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
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
                  Format: <strong style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{format}</strong>
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {wordCount.toLocaleString()} words · ~{estimatedPages} letter page{estimatedPages > 1 ? 's' : ''}
                </span>
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
            onClick={handleFinishUpload}
            disabled={!content.trim() || isProcessing}
          >
            <Check size={16} />
            <span>Add Chapter to Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};
