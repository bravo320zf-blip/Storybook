import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Cloud,
  FileText,
  Sparkles,
  Book,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  FolderSync,
  Trash2,
  Plus,
  StickyNote,
  PanelLeftClose,
  PanelLeftOpen,
  Edit2,
  Layers,
  Layout,
  Columns,
  Split,
  X,
  Upload,
  Compass,
  MapPin,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Story, Character, StoryboardData, WorldMap, BookChapter, BookPage, StoryStatus } from '../types';
import { MapStampIcon } from '../utils/mapStamps';
import {
  ensureStoryChapters,
  calculateBookWords,
  calculateChapterWords,
  countWords,
  compileBookManuscript,
  splitTextIntoLetterPages,
} from '../utils/chapterHelpers';
import { ExportModal } from './ExportModal';
import { UploadChapterModal } from './UploadChapterModal';
import { saveStoryToDrive } from '../services/googleDrive';

interface EditorViewProps {
  story: Story;
  characters: Character[];
  storyboard?: StoryboardData;
  storyboards?: StoryboardData[];
  maps: WorldMap[];
  onBack: () => void;
  onUpdateStory: (updatedStory: Story) => void;
  onSaveToDrive: (story: Story) => Promise<void>;
  onDeleteStory: (storyId: string) => void;
  driveFolderName: string;
  googleAccessToken?: string;
  driveFolderId?: string;
  onNavigateToStoryboard?: (storyboardId: string) => void;
  onCreateStoryboardForContext?: (initial: Partial<StoryboardData>) => void;
  onNavigateToMap?: (mapId: string) => void;
  onCreateMapForContext?: (initial: Partial<WorldMap>) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  story,
  characters,
  storyboard,
  storyboards = [],
  maps,
  onBack,
  onUpdateStory,
  onSaveToDrive,
  onDeleteStory,
  driveFolderName,
  googleAccessToken,
  driveFolderId,
  onNavigateToStoryboard,
  onCreateStoryboardForContext,
  onNavigateToMap,
  onCreateMapForContext,
}) => {
  // Book Metadata
  const [bookTitle, setBookTitle] = useState(story.title || 'Untitled Book');
  const [bookNotes, setBookNotes] = useState(story.notes || '');
  const [bookStatus, setBookStatus] = useState<StoryStatus>(story.status || 'drafting');
  const [bookSummary, setBookSummary] = useState(story.summary || '');

  // Chapters & Pages Hierarchy
  const [chapters, setChapters] = useState<BookChapter[]>(() => ensureStoryChapters(story));

  // Active Chapter and Page Selection
  const initialChapters = ensureStoryChapters(story);
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    return story.activeChapterId && initialChapters.some((c) => c.id === story.activeChapterId)
      ? story.activeChapterId
      : initialChapters[0].id;
  });

  const [activePageId, setActivePageId] = useState<string>(() => {
    const chap =
      initialChapters.find((c) => c.id === (story.activeChapterId || initialChapters[0].id)) ||
      initialChapters[0];
    return story.activePageId && chap.pages.some((p: BookPage) => p.id === story.activePageId)
      ? story.activePageId
      : chap.pages[0]?.id || '';
  });

  // UI Panels (auto-closed on mobile for full-screen writing)
  const isMobileScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobileScreen);
  const [activeDrawerTab, setActiveDrawerTab] = useState<
    'notes' | 'recap' | 'characters' | 'storyboard' | 'map' | null
  >(isMobileScreen ? null : 'notes');
  const [notesSubTab, setNotesSubTab] = useState<'page' | 'chapter' | 'book'>('page');
  const [layoutMode, setLayoutMode] = useState<'word-pages' | 'single-sheet'>('word-pages');
  const [fullScreen, setFullScreen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUploadChapterOpen, setIsUploadChapterOpen] = useState(false);

  // Sync state
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve current active chapter and page
  const activeChapterIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapterId)
  );
  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  const activePageIndex = Math.max(
    0,
    (activeChapter?.pages || []).findIndex((p) => p.id === activePageId)
  );
  const activePage = activeChapter?.pages[activePageIndex] || activeChapter?.pages[0];

  // Calculated Word Counts
  const pageWords = countWords(activePage?.body || '');
  const chapterWords = calculateChapterWords(activeChapter);
  const bookTotalWords = calculateBookWords(chapters);
  const readingTime = Math.ceil(bookTotalWords / 220);

  // Auto-save local draft across all chapter and page changes
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const compiledBody = compileBookManuscript(bookTitle, chapters);
      const updated: Story = {
        ...story,
        title: bookTitle,
        notes: bookNotes,
        status: bookStatus,
        summary: bookSummary,
        chapters,
        body: compiledBody,
        words: bookTotalWords,
        edited: Date.now(),
        activeChapterId,
        activePageId,
      };
      onUpdateStory(updated);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    bookTitle,
    bookNotes,
    bookStatus,
    bookSummary,
    chapters,
    bookTotalWords,
    activeChapterId,
    activePageId,
  ]);

  // Update currently active page
  const handleUpdateActivePage = (partial: Partial<BookPage>) => {
    setChapters((prev) =>
      prev.map((chap) => {
        if (chap.id !== activeChapter.id) return chap;
        return {
          ...chap,
          pages: chap.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            const updated = { ...p, ...partial };
            if (partial.body !== undefined) {
              updated.words = countWords(partial.body);
            }
            return updated;
          }),
        };
      })
    );
  };

  // Update currently active chapter
  const handleUpdateActiveChapter = (partial: Partial<BookChapter>) => {
    setChapters((prev) =>
      prev.map((chap) => (chap.id === activeChapter.id ? { ...chap, ...partial } : chap))
    );
  };

  // Update page by index in active chapter (for multi-page Word layout)
  const handleUpdatePageByIndex = (pageIdx: number, newBody: string) => {
    setChapters((prev) =>
      prev.map((chap) => {
        if (chap.id !== activeChapter.id) return chap;
        return {
          ...chap,
          pages: chap.pages.map((p, idx) => {
            if (idx !== pageIdx) return p;
            return {
              ...p,
              body: newBody,
              words: countWords(newBody),
            };
          }),
        };
      })
    );
  };

  // Split current page at cursor into next letter page (Ctrl+Enter)
  const handleSplitOrInsertNextPage = (pIdx: number, cursorIndex: number) => {
    const targetChap = activeChapter;
    const curPage = targetChap.pages[pIdx];
    const fullText = curPage.body || '';
    const beforeText = fullText.slice(0, cursorIndex);
    const afterText = fullText.slice(cursorIndex).trim();

    const newPages = [...targetChap.pages];
    newPages[pIdx] = {
      ...curPage,
      body: beforeText,
      words: countWords(beforeText),
    };

    const newPageId = `page-${Date.now()}`;
    const newPage: BookPage = {
      id: newPageId,
      title: `Page ${pIdx + 2}`,
      order: pIdx + 2,
      body: afterText,
      notes: '',
      words: countWords(afterText),
    };

    newPages.splice(pIdx + 1, 0, newPage);
    newPages.forEach((p, idx) => {
      p.order = idx + 1;
      if (p.title.startsWith('Page ')) {
        p.title = `Page ${idx + 1}`;
      }
    });

    setChapters((prev) =>
      prev.map((c) => (c.id === targetChap.id ? { ...c, pages: newPages } : c))
    );
    setActivePageId(newPageId);
  };

  // Automatically balance and paginate all text in current chapter into ~300-word Letter Pages
  const handleAutoPaginateCurrentChapter = () => {
    const allText = activeChapter.pages.map((p) => p.body || '').join('\n\n').trim();
    if (!allText) return;
    const slices = splitTextIntoLetterPages(allText, 300);
    const newPages: BookPage[] = slices.map((slice, sIdx) => ({
      id: sIdx < activeChapter.pages.length ? activeChapter.pages[sIdx].id : `page-${Date.now()}-${sIdx}`,
      title: `Page ${sIdx + 1}`,
      order: sIdx + 1,
      body: slice,
      notes: sIdx < activeChapter.pages.length ? activeChapter.pages[sIdx].notes : '',
      words: countWords(slice),
    }));

    setChapters((prev) =>
      prev.map((c) => (c.id === activeChapter.id ? { ...c, pages: newPages } : c))
    );
    if (newPages[0]) {
      setActivePageId(newPages[0].id);
    }
  };

  // Chapter Management
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newChapId = `chap-${Date.now()}`;
    const newPageId = `page-${Date.now()}`;
    const newChapter: BookChapter = {
      id: newChapId,
      title: `Chapter ${nextNum}`,
      order: nextNum,
      notes: '',
      pages: [
        {
          id: newPageId,
          title: 'Page 1',
          order: 1,
          body: '',
          notes: '',
          words: 0,
        },
      ],
    };
    setChapters([...chapters, newChapter]);
    setActiveChapterId(newChapId);
    setActivePageId(newPageId);
  };

  const handleChapterUploaded = (newChapter: BookChapter) => {
    const updated = [...chapters, newChapter];
    setChapters(updated);
    setActiveChapterId(newChapter.id);
    if (newChapter.pages.length > 0) {
      setActivePageId(newChapter.pages[0].id);
    }
    const newBody = compileBookManuscript(bookTitle, updated);
    const newTotalWords = calculateBookWords(updated);
    const updatedStory: Story = {
      ...story,
      body: newBody,
      words: newTotalWords,
      chapters: updated,
      activeChapterId: newChapter.id,
      activePageId: newChapter.pages[0]?.id,
      edited: Date.now(),
    };
    onUpdateStory(updatedStory);
  };

  const handleDeleteChapter = (chapId: string, chapTitle: string) => {
    if (chapters.length <= 1) {
      alert('Your book must have at least one chapter.');
      return;
    }
    if (
      !window.confirm(
        `Delete "${chapTitle}" and all its pages? This action will remove this chapter.`
      )
    ) {
      return;
    }
    const remaining = chapters.filter((c) => c.id !== chapId);
    setChapters(remaining);
    if (activeChapterId === chapId) {
      setActiveChapterId(remaining[0].id);
      setActivePageId(remaining[0].pages[0]?.id || '');
    }
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    const newChaps = [...chapters];
    const temp = newChaps[index];
    newChaps[index] = newChaps[targetIndex];
    newChaps[targetIndex] = temp;
    newChaps.forEach((c, idx) => (c.order = idx + 1));
    setChapters(newChaps);
  };

  const handleRenameChapter = (chapId: string, currentTitle: string) => {
    const newTitle = prompt('Rename chapter:', currentTitle);
    if (newTitle && newTitle.trim()) {
      setChapters((prev) =>
        prev.map((c) => (c.id === chapId ? { ...c, title: newTitle.trim() } : c))
      );
    }
  };

  // Page Management
  const handleAddPage = (chapId: string) => {
    const targetChap = chapters.find((c) => c.id === chapId);
    if (!targetChap) return;
    const nextOrder = (targetChap.pages || []).length + 1;
    const newPageId = `page-${Date.now()}`;
    const newPage: BookPage = {
      id: newPageId,
      title: `Page ${nextOrder}`,
      order: nextOrder,
      body: '',
      notes: '',
      words: 0,
    };
    setChapters((prev) =>
      prev.map((c) => (c.id === chapId ? { ...c, pages: [...c.pages, newPage] } : c))
    );
    setActiveChapterId(chapId);
    setActivePageId(newPageId);
  };

  const handleDeletePage = (chapId: string, pageId: string, pageTitle: string) => {
    const targetChap = chapters.find((c) => c.id === chapId);
    if (!targetChap) return;
    if (targetChap.pages.length <= 1) {
      if (window.confirm(`Clear content of "${pageTitle}"?`)) {
        handleUpdateActivePage({ body: '', words: 0 });
      }
      return;
    }
    if (!window.confirm(`Delete "${pageTitle}"?`)) return;

    const remainingPages = targetChap.pages.filter((p) => p.id !== pageId);
    setChapters((prev) =>
      prev.map((c) => (c.id === chapId ? { ...c, pages: remainingPages } : c))
    );
    if (activePageId === pageId) {
      setActivePageId(remainingPages[0]?.id || '');
    }
  };

  const handleMovePage = (chapId: string, pageIdx: number, direction: 'up' | 'down') => {
    const targetChap = chapters.find((c) => c.id === chapId);
    if (!targetChap) return;
    const targetIdx = direction === 'up' ? pageIdx - 1 : pageIdx + 1;
    if (targetIdx < 0 || targetIdx >= targetChap.pages.length) return;

    const newPages = [...targetChap.pages];
    const temp = newPages[pageIdx];
    newPages[pageIdx] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    newPages.forEach((p, idx) => (p.order = idx + 1));

    setChapters((prev) =>
      prev.map((c) => (c.id === chapId ? { ...c, pages: newPages } : c))
    );
  };

  // Google Drive Save
  const handleManualDriveSave = async () => {
    setIsSavingDrive(true);
    setSaveSuccess(false);
    try {
      const compiledBody = compileBookManuscript(bookTitle, chapters);
      const currentStory: Story = {
        ...story,
        title: bookTitle,
        notes: bookNotes,
        status: bookStatus,
        summary: bookSummary,
        chapters,
        body: compiledBody,
        words: bookTotalWords,
        edited: Date.now(),
        activeChapterId,
        activePageId,
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

  // Custom document export to Drive from ExportModal
  const handleSaveExportToDrive = async (exportTitle: string, exportContent: string) => {
    if (!googleAccessToken || googleAccessToken === 'demo-token') {
      alert(`Connected to demo storage. Document "${exportTitle}" prepared.`);
      return;
    }
    const tempStory: Story = {
      ...story,
      title: exportTitle,
      body: exportContent,
      words: countWords(exportContent),
      edited: Date.now(),
    };
    await saveStoryToDrive(googleAccessToken, driveFolderId || 'root', tempStory);
  };

  // Recap synthesizer
  const generateRecap = () => {
    const allBody = activePage?.body || '';
    const sentences = allBody.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 15);
    if (sentences.length === 0) {
      setBookSummary('A fresh page waiting for your words.');
      return;
    }
    const firstSentence = sentences[0];
    const lastSentence = sentences[sentences.length - 1];
    setBookSummary(`${firstSentence}. Later, ${lastSentence.toLowerCase()}.`);
  };

  return (
    <div className={`editor-desk ${fullScreen ? 'fixed inset-0 z-50 bg-[var(--bg)]' : ''}`}>
      {/* Chapter & Page Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="editor-drawer-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="editor-chapters-sidebar">
            {/* Sidebar Header */}
            <div className="sidebar-toc-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>
                  Chapters & Pages
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                  {chapters.length} chapter{chapters.length > 1 ? 's' : ''} · {bookTotalWords.toLocaleString()} words
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <button
                  className="action-btn-secondary"
                  style={{ padding: '5px 7px', fontSize: '0.76rem', gap: '4px' }}
                  onClick={() => setIsUploadChapterOpen(true)}
                  title="Upload a document (.pdf, .docx, .doc, .md, .txt) as a new chapter"
                >
                  <Upload size={12} />
                  <span>Upload</span>
                </button>
                <button
                  className="action-btn-primary"
                  style={{ padding: '5px 8px', fontSize: '0.76rem', gap: '4px' }}
                  onClick={handleAddChapter}
                  title="Add a new blank Chapter document"
                >
                  <Plus size={12} />
                  <span>Chapter</span>
                </button>
                <button
                  className="icon-btn mobile-close-btn"
                  onClick={() => setIsSidebarOpen(false)}
                  title="Close chapters panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

          {/* Chapters & Pages Accordion Tree */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapters.map((chap, cIdx) => {
              const isChapActive = chap.id === activeChapter.id;
              const chapWordTotal = calculateChapterWords(chap);

              return (
                <div key={chap.id} className="chapter-node" style={{ borderRadius: '8px', border: '1px solid var(--line)' }}>
                  {/* Chapter Header Row */}
                  <div
                    className={`chapter-header-row ${isChapActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      if (chap.pages.length > 0) {
                        setActivePageId(chap.pages[0].id);
                      }
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <Book size={15} style={{ color: isChapActive ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: isChapActive ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: isChapActive ? 'var(--accent)' : 'var(--ink)',
                        }}
                        title={chap.title}
                      >
                        {chap.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginRight: '2px' }}>
                        {chapWordTotal > 1000 ? `${(chapWordTotal / 1000).toFixed(1)}k` : chapWordTotal}w
                      </span>

                      {/* Sort Chapter Up/Down */}
                      <button
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(cIdx, 'up');
                        }}
                        disabled={cIdx === 0}
                        title="Move Chapter Up"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(cIdx, 'down');
                        }}
                        disabled={cIdx === chapters.length - 1}
                        title="Move Chapter Down"
                      >
                        <ChevronDown size={13} />
                      </button>

                      {/* Rename Chapter */}
                      <button
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChapter(chap.id, chap.title);
                        }}
                        title="Rename Chapter"
                      >
                        <Edit2 size={12} />
                      </button>

                      {/* Add Page to Chapter */}
                      <button
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPage(chap.id);
                        }}
                        title="Add Page to this Chapter"
                      >
                        <Plus size={13} />
                      </button>

                      {/* Delete Chapter */}
                      <button
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(chap.id, chap.title);
                        }}
                        title="Delete Chapter"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Pages Inside Chapter */}
                  <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)', padding: '4px 0' }}>
                    {chap.pages.map((page, pIdx) => {
                      const isPageActive = isChapActive && page.id === activePage?.id;
                      const pWords = countWords(page.body || '');

                      return (
                        <div
                          key={page.id}
                          className={`page-node-item ${isPageActive ? 'active' : ''}`}
                          onClick={() => {
                            setActiveChapterId(chap.id);
                            setActivePageId(page.id);
                            if (window.innerWidth < 768) {
                              setIsSidebarOpen(false);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <FileText size={13} style={{ flexShrink: 0 }} />
                            <span>{page.title || `Page ${pIdx + 1}`}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                              {pWords}w
                            </span>

                            {/* Reorder Page */}
                            <button
                              className="reorder-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePage(chap.id, pIdx, 'up');
                              }}
                              disabled={pIdx === 0}
                              title="Move Page Up"
                            >
                              <ChevronUp size={11} />
                            </button>
                            <button
                              className="reorder-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePage(chap.id, pIdx, 'down');
                              }}
                              disabled={pIdx === chap.pages.length - 1}
                              title="Move Page Down"
                            >
                              <ChevronDown size={11} />
                            </button>

                            {/* Delete Page */}
                            <button
                              className="reorder-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(chap.id, page.id, page.title);
                              }}
                              title="Delete Page"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </>
    )}

      {/* Writing Paper Area */}
      <div className="editor-main-paper">
        {/* Editor Top Navigation Bar */}
        <div className="editor-top-nav">
          <div className="editor-nav-left">
            <button className="jump-in-btn" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </button>

            {/* Sidebar toggle button */}
            <button
              className="icon-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Hide chapters sidebar' : 'Show chapters sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>

            {/* Breadcrumb path */}
            <div className="editor-breadcrumb">
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{bookTitle}</span>
              <ChevronRight size={13} />
              <span>{activeChapter?.title}</span>
              <ChevronRight size={13} />
              <span style={{ color: 'var(--accent)' }}>{activePage?.title}</span>
            </div>
          </div>

          <div className="editor-nav-right">
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {pageWords}w (page) · {bookTotalWords.toLocaleString()}w total
            </span>

            {/* Status dropdown */}
            <select
              value={bookStatus}
              onChange={(e) => setBookStatus(e.target.value as StoryStatus)}
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

            {/* Layout Mode Toggle */}
            <button
              className="action-btn-secondary"
              onClick={() => setLayoutMode(layoutMode === 'word-pages' ? 'single-sheet' : 'word-pages')}
              title={layoutMode === 'word-pages' ? 'Switch to Single Sheet Focus' : 'Switch to Word Multi-Page Layout'}
              style={{ gap: '6px', fontSize: '0.8rem' }}
            >
              <Layout size={14} />
              <span>{layoutMode === 'word-pages' ? 'Word Pages' : 'Single Page'}</span>
            </button>

            {/* Auto-Paginate Button */}
            <button
              className="action-btn-secondary"
              onClick={handleAutoPaginateCurrentChapter}
              title="Automatically divide chapter into standard letter-sized pages (~300 words each)"
              style={{ gap: '6px', fontSize: '0.8rem' }}
            >
              <Split size={14} />
              <span>Split Pages</span>
            </button>

            {/* Upload Chapter Button */}
            <button
              className="action-btn-secondary"
              onClick={() => setIsUploadChapterOpen(true)}
              title="Upload a document (.pdf, .docx, .doc, .md, .txt) as a new chapter"
              style={{ gap: '6px', fontSize: '0.8rem' }}
            >
              <Upload size={14} />
              <span>Upload Chapter</span>
            </button>

            {/* Multi-Scope Export Button */}
            <button
              className="action-btn-secondary"
              onClick={() => setIsExportModalOpen(true)}
              title="Export by Page, Chapter, or Whole Book"
            >
              <Download size={14} />
              <span>Export…</span>
            </button>

            {/* Delete Story */}
            <button
              className="icon-btn"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete "${bookTitle}"? This will permanently remove this book from your workspace and Google Drive.`
                  )
                ) {
                  onDeleteStory(story.id);
                }
              }}
              title="Delete this book"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e53e3e';
                e.currentTarget.style.backgroundColor = 'rgba(229, 62, 62, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 size={16} />
            </button>

            {/* Fullscreen toggle */}
            <button
              className="icon-btn"
              onClick={() => setFullScreen(!fullScreen)}
              title={fullScreen ? 'Exit full screen' : 'Full screen focus mode'}
            >
              {fullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Studio Peek & Notes Drawer Toggle */}
            <button
              className={`icon-btn ${activeDrawerTab ? 'active bg-[var(--accent-soft)]' : ''}`}
              onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'notes')}
              title="Toggle Notes & Studio drawer"
            >
              <StickyNote size={16} style={{ color: 'var(--accent)' }} />
            </button>
          </div>
        </div>

        {/* The Paper Sheets Area */}
        {layoutMode === 'word-pages' ? (
          <div style={{ width: '100%', maxWidth: '816px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {activeChapter.pages.map((page, pIdx) => {
              const isCur = page.id === activePageId;
              const curWords = countWords(page.body || '');

              return (
                <React.Fragment key={page.id}>
                  {pIdx > 0 && (
                    <div className="page-break-divider">
                      <div className="page-break-line" />
                      <span>Page Break · 8.5" × 11" Letter</span>
                      <div className="page-break-line" />
                    </div>
                  )}

                  <div
                    id={`letter-page-${page.id}`}
                    className={`word-letter-sheet ${isCur ? 'active' : ''}`}
                    onClick={() => setActivePageId(page.id)}
                  >
                    {/* Running Header */}
                    <div className="sheet-header-margin">
                      <span>{bookTitle}</span>
                      <span>
                        {activeChapter?.title} · Page {pIdx + 1} of {activeChapter.pages.length}
                      </span>
                    </div>

                    {/* Book & Chapter Title Heading on Page 1 */}
                    {pIdx === 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <input
                          type="text"
                          className="editor-title-input"
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          placeholder="Book Title…"
                          style={{ marginBottom: '6px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '1.15rem',
                              fontFamily: 'var(--serif)',
                              fontWeight: 600,
                              color: 'var(--accent)',
                            }}
                          >
                            {activeChapter?.title}
                          </span>
                          <input
                            type="text"
                            value={page.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateActivePage({ title: val });
                            }}
                            placeholder="Subtitle or scene name…"
                            style={{
                              fontFamily: 'var(--serif)',
                              fontSize: '1rem',
                              fontStyle: 'italic',
                              border: 'none',
                              background: 'transparent',
                              outline: 'none',
                              color: 'var(--muted)',
                              flex: 1,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {pIdx > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                        }}
                      >
                        <input
                          type="text"
                          value={page.title || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChapters((prev) =>
                              prev.map((c) => {
                                if (c.id !== activeChapter.id) return c;
                                return {
                                  ...c,
                                  pages: c.pages.map((p, idx) =>
                                    idx === pIdx ? { ...p, title: val } : p
                                  ),
                                };
                              })
                            );
                          }}
                          placeholder={`Page ${pIdx + 1} title…`}
                          style={{
                            fontFamily: 'var(--serif)',
                            fontSize: '0.95rem',
                            fontStyle: 'italic',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            color: 'var(--muted)',
                          }}
                        />
                      </div>
                    )}

                    {/* Letter Page Body Area */}
                    <textarea
                      className="editor-textarea"
                      value={page.body || ''}
                      onChange={(e) => handleUpdatePageByIndex(pIdx, e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSplitOrInsertNextPage(pIdx, e.currentTarget.selectionStart);
                        }
                      }}
                      placeholder={
                        pIdx === 0
                          ? 'Begin your manuscript on Page 1…'
                          : `Continue writing Page ${pIdx + 1}…`
                      }
                      style={{
                        minHeight: pIdx === 0 ? '600px' : '700px',
                        fontSize: '1.2rem',
                        lineHeight: '1.85',
                      }}
                    />

                    {/* Running Footer with Page Number & Word Gauge */}
                    <div className="sheet-footer-margin">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.74rem',
                          color: 'var(--muted)',
                        }}
                      >
                        <span>{curWords} / 300 words</span>
                        {curWords > 320 && (
                          <span style={{ color: 'var(--warn)', fontWeight: 600 }}>
                            · Page full (Press Ctrl+Enter for Page {pIdx + 2})
                          </span>
                        )}
                      </div>

                      <span className="sheet-page-badge">— {pIdx + 1} —</span>

                      <button
                        className="reorder-btn"
                        style={{ padding: '4px 8px', gap: '4px', fontSize: '0.72rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDrawerTab('notes');
                          setNotesSubTab('page');
                          setActivePageId(page.id);
                        }}
                        title="Open notes for this page"
                      >
                        <StickyNote
                          size={12}
                          style={{ color: page.notes ? 'var(--accent)' : 'var(--muted)' }}
                        />
                        <span>Page Notes</span>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Bottom Add Page Button */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', marginBottom: '60px' }}>
              <button
                className="action-btn-primary"
                onClick={() => handleAddPage(activeChapter.id)}
              >
                <Plus size={14} />
                <span>Add Page {activeChapter.pages.length + 1} (Letter Sheet)</span>
              </button>

              <button
                className="action-btn-secondary"
                onClick={handleAutoPaginateCurrentChapter}
                title="Evenly distributes all chapter words across standard ~300-word Letter Pages"
              >
                <Split size={14} />
                <span>Balance All Letter Pages</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Page Focus Mode */
          <div className="word-letter-sheet active" style={{ maxWidth: '816px' }}>
            <div className="sheet-header-margin">
              <span>{bookTitle}</span>
              <span>
                {activeChapter?.title} · Page {activePageIndex + 1} of {activeChapter?.pages.length}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="editor-title-input"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Book Title…"
                style={{ marginBottom: '6px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontFamily: 'var(--serif)',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  {activeChapter?.title}:
                </span>
                <input
                  type="text"
                  value={activePage?.title || ''}
                  onChange={(e) => handleUpdateActivePage({ title: e.target.value })}
                  placeholder="Page title or scene…"
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '1rem',
                    fontStyle: 'italic',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    color: 'var(--muted)',
                    flex: 1,
                  }}
                />
              </div>
            </div>

            <textarea
              className="editor-textarea"
              value={activePage?.body || ''}
              onChange={(e) => handleUpdateActivePage({ body: e.target.value })}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSplitOrInsertNextPage(activePageIndex, e.currentTarget.selectionStart);
                }
              }}
              placeholder="Write this page or scene here. The words are always, only yours…"
              style={{ minHeight: '680px', fontSize: '1.2rem', lineHeight: '1.85' }}
            />

            <div className="sheet-footer-margin">
              <button
                className="action-btn-secondary"
                style={{ padding: '6px 12px' }}
                disabled={activePageIndex === 0}
                onClick={() => setActivePageId(activeChapter.pages[activePageIndex - 1].id)}
              >
                ← Previous Page
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sheet-page-badge">
                  — Page {activePageIndex + 1} of {activeChapter?.pages.length} —
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                  ({pageWords} / 300w)
                </span>
              </div>

              {activePageIndex < activeChapter?.pages.length - 1 ? (
                <button
                  className="action-btn-secondary"
                  style={{ padding: '6px 12px' }}
                  onClick={() => setActivePageId(activeChapter.pages[activePageIndex + 1].id)}
                >
                  Next Page →
                </button>
              ) : (
                <button
                  className="action-btn-primary"
                  style={{ padding: '6px 12px' }}
                  onClick={() => handleAddPage(activeChapter.id)}
                >
                  <Plus size={13} />
                  <span>Next Page</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Drawer: Notes & Studio Peek */}
      {activeDrawerTab && (
        <>
          <div
            className="editor-drawer-backdrop"
            onClick={() => setActiveDrawerTab(null)}
          />
          <aside className="editor-studio-drawer">
            {/* Drawer tab headers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
              <button
                className={`chip ${activeDrawerTab === 'notes' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => setActiveDrawerTab('notes')}
              >
                Notes
              </button>
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
              <button
                className="icon-btn mobile-close-btn"
                style={{ marginLeft: 'auto' }}
                onClick={() => setActiveDrawerTab(null)}
                title="Close studio drawer"
              >
                <X size={16} />
              </button>
            </div>

          {/* NOTES TAB: Page Notes, Chapter Notes, and Book Notes */}
          {activeDrawerTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Scope Selector: Page / Chapter / Book */}
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '6px', padding: '3px', border: '1px solid var(--line)' }}>
                <button
                  className={`chip ${notesSubTab === 'page' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.74rem', padding: '4px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => setNotesSubTab('page')}
                >
                  Page Notes
                </button>
                <button
                  className={`chip ${notesSubTab === 'chapter' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.74rem', padding: '4px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => setNotesSubTab('chapter')}
                >
                  Chapter Notes
                </button>
                <button
                  className={`chip ${notesSubTab === 'book' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.74rem', padding: '4px', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => setNotesSubTab('book')}
                >
                  Book Notes
                </button>
              </div>

              {/* SubTab 1: Page Notes */}
              {notesSubTab === 'page' && (
                <div className="notes-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                      📄 {activePage?.title || 'Page'} Notes
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Margin & Scene</span>
                  </div>
                  <textarea
                    className="notes-textarea"
                    style={{ minHeight: '220px' }}
                    value={activePage?.notes || ''}
                    onChange={(e) => handleUpdateActivePage({ notes: e.target.value })}
                    placeholder="Jot down sensory cues, dialogue ideas, beats, or secrets for this specific page/scene…"
                  />
                </div>
              )}

              {/* SubTab 2: Chapter Notes */}
              {notesSubTab === 'chapter' && (
                <div className="notes-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                      📑 {activeChapter?.title || 'Chapter'} Outline
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Goals & Stakes</span>
                  </div>
                  <textarea
                    className="notes-textarea"
                    style={{ minHeight: '220px' }}
                    value={activeChapter?.notes || ''}
                    onChange={(e) => handleUpdateActiveChapter({ notes: e.target.value })}
                    placeholder="Chapter arc, pacing, character motivations, cliffhanger, and key revelations for this chapter…"
                  />
                </div>
              )}

              {/* SubTab 3: Book Notes */}
              {notesSubTab === 'book' && (
                <div className="notes-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                      📚 {bookTitle || 'Book'} Master Notes
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>World & Premise</span>
                  </div>
                  <textarea
                    className="notes-textarea"
                    style={{ minHeight: '220px' }}
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    placeholder="Master lore, overarching theme, character arcs, rules of magic, series outline…"
                  />
                </div>
              )}
            </div>
          )}

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
                value={bookSummary}
                onChange={(e) => setBookSummary(e.target.value)}
                style={{
                  width: '100%',
                  height: '140px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                }}
                placeholder="A brief recap of the story so far…"
              />
            </div>
          )}

          {/* Cast Tab */}
          {activeDrawerTab === 'characters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Cast of Characters
              </span>
              {characters.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  No characters created yet. Visit Character Builder to forge your cast.
                </p>
              ) : (
                characters.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase' }}>
                        {c.role}
                      </span>
                    </div>
                    {c.wound && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                        <strong>Wound:</strong> {c.wound}
                      </div>
                    )}
                    {c.want && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                        <strong>Wants:</strong> {c.want}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Storyboard Tab */}
          {activeDrawerTab === 'storyboard' && (() => {
            const storyboardsList = storyboards.length > 0 ? storyboards : storyboard ? [storyboard] : [];
            const chapterStoryboard = storyboardsList.find(
              (sb) => sb.storyId === story.id && sb.chapterId === activeChapter?.id
            );
            const bookStoryboard = storyboardsList.find(
              (sb) => sb.storyId === story.id && !sb.chapterId
            );

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Active Chapter Storyboard Section */}
                <div style={{ padding: '10px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                        Chapter Storyboard: {activeChapter?.title}
                      </span>
                    </div>
                  </div>

                  {chapterStoryboard ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                          {chapterStoryboard.cards.length} planned beats
                        </span>
                        <button
                          className="action-btn-primary"
                          onClick={() => onNavigateToStoryboard && onNavigateToStoryboard(chapterStoryboard.id)}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px' }}
                        >
                          <span>Open Storyboard</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {chapterStoryboard.cards.length === 0 ? (
                          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            No cards in this chapter storyboard yet.
                          </p>
                        ) : (
                          chapterStoryboard.cards.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                padding: '6px 8px',
                                background: 'var(--bg)',
                                border: '1px solid var(--line)',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${c.color || 'var(--accent)'}`,
                              }}
                            >
                              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.title}</div>
                              {c.body && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                                  {c.body}
                                </div>
                              )}
                              {c.tag && (
                                <span style={{ fontSize: '0.68rem', background: 'var(--panel)', padding: '1px 5px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                  {c.tag}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '8px' }}>
                        No dedicated storyboard attached to this chapter yet.
                      </p>
                      <button
                        className="action-btn-secondary"
                        onClick={() => {
                          if (onCreateStoryboardForContext) {
                            onCreateStoryboardForContext({
                              title: `${activeChapter?.title || 'Chapter'} - Storyboard`,
                              storyId: story.id,
                              chapterId: activeChapter?.id,
                            });
                          }
                        }}
                        style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center', gap: '4px' }}
                      >
                        <Plus size={13} />
                        <span>Create Chapter Storyboard</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Book Master Storyboard Section */}
                <div style={{ padding: '10px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Book size={14} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                        Book Storyboard: {story.title}
                      </span>
                    </div>
                  </div>

                  {bookStoryboard ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                          {bookStoryboard.cards.length} story beats
                        </span>
                        <button
                          className="action-btn-secondary"
                          onClick={() => onNavigateToStoryboard && onNavigateToStoryboard(bookStoryboard.id)}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px' }}
                        >
                          <span>Open Storyboard</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {bookStoryboard.cards.slice(0, 5).map((c) => (
                          <div
                            key={c.id}
                            style={{
                              padding: '6px 8px',
                              background: 'var(--bg)',
                              border: '1px solid var(--line)',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.title}</div>
                            {c.body && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>
                                {c.body.slice(0, 80)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '8px' }}>
                        No full book storyboard attached yet.
                      </p>
                      <button
                        className="action-btn-secondary"
                        onClick={() => {
                          if (onCreateStoryboardForContext) {
                            onCreateStoryboardForContext({
                              title: `${story.title} - Main Storyboard`,
                              storyId: story.id,
                            });
                          }
                        }}
                        style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center', gap: '4px' }}
                      >
                        <Plus size={13} />
                        <span>Create Book Storyboard</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Map Tab */}
          {activeDrawerTab === 'map' && (() => {
            const chapterMaps = maps.filter((m) => m.storyId === story.id && m.chapterId === activeChapter?.id);
            const bookMaps = maps.filter((m) => m.storyId === story.id && !m.chapterId);
            const otherMaps = maps.filter((m) => m.storyId !== story.id);
            const attachedMaps = [...chapterMaps, ...bookMaps];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Attached Maps ({attachedMaps.length})
                  </span>
                  <button
                    className="action-btn-secondary"
                    onClick={() => {
                      if (onCreateMapForContext) {
                        onCreateMapForContext({
                          name: `${story.title} Realm Map`,
                          storyId: story.id,
                          chapterId: activeChapter?.id,
                        });
                      }
                    }}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px' }}
                  >
                    <Plus size={11} />
                    <span>New Map</span>
                  </button>
                </div>

                {attachedMaps.length === 0 ? (
                  <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '8px' }}>
                      No maps attached to "{story.title}" yet.
                    </p>
                    <button
                      className="action-btn-primary"
                      onClick={() => {
                        if (onCreateMapForContext) {
                          onCreateMapForContext({
                            name: `${story.title} Atlas`,
                            storyId: story.id,
                          });
                        }
                      }}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', margin: '0 auto' }}
                    >
                      <Plus size={12} />
                      <span>Create Map for this Book</span>
                    </button>
                  </div>
                ) : (
                  attachedMaps.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.name}</div>
                        <button
                          className="action-btn-primary"
                          onClick={() => onNavigateToMap && onNavigateToMap(m.id)}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px' }}
                        >
                          <span>Open Map</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '4px' }}>
                        {(m.stamps || []).length} landmark stamps · {m.style} style
                        {m.chapterId && ' · Attached to Chapter'}
                      </div>
                    </div>
                  ))
                )}

                {/* Other World Maps */}
                {otherMaps.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                      Other World Maps:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {otherMaps.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onNavigateToMap && onNavigateToMap(m.id)}
                          style={{
                            padding: '6px 8px',
                            background: 'var(--panel)',
                            border: '1px solid var(--line)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: '0.8rem' }}>{m.name}</span>
                          <ArrowRight size={12} style={{ color: 'var(--muted)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          </aside>
        </>
      )}

      {/* Export Modal (Page, Chapter, or Whole Book) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        bookTitle={bookTitle}
        chapters={chapters}
        activeChapter={activeChapter}
        activePage={activePage}
        bookNotes={bookNotes}
        onSaveToDrive={handleSaveExportToDrive}
        driveFolderName={driveFolderName}
      />

      {/* Upload Chapter Modal (.pdf, .docx, .doc, .md, .txt) */}
      <UploadChapterModal
        isOpen={isUploadChapterOpen}
        onClose={() => setIsUploadChapterOpen(false)}
        nextChapterOrder={chapters.length + 1}
        onChapterUploaded={handleChapterUploaded}
      />
    </div>
  );
};
