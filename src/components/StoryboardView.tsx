import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Cloud,
  FileText,
  Share2,
  Trash2,
  Move,
  Link as LinkIcon,
  RefreshCw,
  Image as ImageIcon,
  Video,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Sparkles,
  Tag,
  Palette,
  Play,
  BookOpen,
  Compass,
  MapPin,
  ChevronDown,
  Copy,
  Sliders,
  Layers,
  ArrowRight,
  Check,
  Search,
  Link2,
} from 'lucide-react';
import { StoryboardData, StoryboardCard, StoryboardLink, CardKind, Story, WorldMap } from '../types';

interface StoryboardViewProps {
  boardData?: StoryboardData;
  onUpdateBoard?: (newBoard: StoryboardData) => void;
  storyboards?: StoryboardData[];
  activeStoryboardId?: string;
  onSelectStoryboard?: (id: string) => void;
  onCreateStoryboard?: (initial?: Partial<StoryboardData>) => void;
  onUpdateStoryboard?: (updated: StoryboardData) => void;
  onDeleteStoryboard?: (id: string) => void;
  stories?: Story[];
  maps?: WorldMap[];
  onNavigateToStory?: (storyId: string, chapterId?: string) => void;
  onNavigateToMap?: (mapId: string, stampId?: string) => void;
  onExportToDrive?: (title: string, data: StoryboardData) => Promise<void>;
  driveFolderName?: string;
}

const CARD_COLORS: Record<CardKind, { label: string; color: string; tint: string }> = {
  note: { label: 'Note', color: '#ECE4D7', tint: '#8C7C69' },
  beat: { label: 'Scene', color: '#DCE9EE', tint: '#467B92' },
  character: { label: 'Character', color: '#F1E2E0', tint: '#B0567A' },
  place: { label: 'Place', color: '#DFEAE4', tint: '#3F7B5E' },
  idea: { label: 'Idea', color: '#E7E1F0', tint: '#735099' },
  map: { label: 'Map', color: '#F3ECDC', tint: '#8C7C69' },
  media: { label: 'Media', color: '#FAF1D6', tint: '#B38B34' },
};

const PALETTE_OPTIONS = [
  '#ECE4D7', // Parchment
  '#DCE9EE', // Sky Blue
  '#F1E2E0', // Rose
  '#DFEAE4', // Sage Green
  '#E7E1F0', // Lavender
  '#FAF1D6', // Pale Gold
  '#2C2723', // Dark Slate
];

const ACT_TAGS = [
  'Act I · Beginning',
  'Inciting Incident',
  'Plot Point 1',
  'Act II · Rising Action',
  'Midpoint Shift',
  'All is Lost',
  'Act III · Climax',
  'Resolution',
];

// Authentic YouTube Icon component
const YoutubeIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 16, className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Helper to extract YouTube video ID from standard or shortened URLs
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  boardData,
  onUpdateBoard,
  storyboards = [],
  activeStoryboardId,
  onSelectStoryboard,
  onCreateStoryboard,
  onUpdateStoryboard,
  onDeleteStoryboard,
  stories = [],
  maps = [],
  onNavigateToStory,
  onNavigateToMap,
  onExportToDrive,
  driveFolderName,
}) => {
  // Resolve list of boards: prefer storyboards prop, fallback to boardData, fallback to default
  const fallbackBoard: StoryboardData = {
    id: 'sb-default',
    title: 'Main Storyboard',
    description: 'Master plot threads, beats, and scene cards',
    cards: [],
    links: [],
    updatedAt: Date.now(),
  };

  const boardsList: StoryboardData[] =
    storyboards.length > 0
      ? storyboards
      : boardData
      ? [boardData]
      : [fallbackBoard];

  const currentBoardId = activeStoryboardId || boardsList[0]?.id || 'sb-default';
  const currentBoard: StoryboardData =
    boardsList.find((b) => b.id === currentBoardId) || boardsList[0] || fallbackBoard;

  const saveBoard = (updates: Partial<StoryboardData>) => {
    const updated: StoryboardData = {
      ...currentBoard,
      ...updates,
      updatedAt: Date.now(),
    };
    if (onUpdateStoryboard) {
      onUpdateStoryboard(updated);
    }
    if (onUpdateBoard) {
      onUpdateBoard(updated);
    }
  };

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // Active tools & modals
  const [zoomScale, setZoomScale] = useState(1.0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [activeMediaInput, setActiveMediaInput] = useState<{ cardId: string; type: 'youtube' | 'image' } | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Multi-Storyboard Management State
  const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);
  const [boardFilter, setBoardFilter] = useState<'all' | 'books' | 'maps' | 'standalone'>('all');
  const [boardSearch, setBoardSearch] = useState('');

  // New Board Modal
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStoryId, setNewStoryId] = useState('');
  const [newChapterId, setNewChapterId] = useState('');
  const [newMapId, setNewMapId] = useState('');
  const [newLocationId, setNewLocationId] = useState('');

  // Attachment / Link Modal
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTitle, setAttachTitle] = useState(currentBoard.title || '');
  const [attachStoryId, setAttachStoryId] = useState(currentBoard.storyId || '');
  const [attachChapterId, setAttachChapterId] = useState(currentBoard.chapterId || '');
  const [attachMapId, setAttachMapId] = useState(currentBoard.mapId || '');
  const [attachLocationId, setAttachLocationId] = useState(currentBoard.locationId || '');

  // Keep attach modal in sync when board changes
  useEffect(() => {
    setAttachTitle(currentBoard.title || '');
    setAttachStoryId(currentBoard.storyId || '');
    setAttachChapterId(currentBoard.chapterId || '');
    setAttachMapId(currentBoard.mapId || '');
    setAttachLocationId(currentBoard.locationId || '');
  }, [currentBoard.id]);

  const boardRef = useRef<HTMLDivElement>(null);

  // Resolved context attachments
  const attachedStory = stories.find((s) => s.id === currentBoard.storyId);
  const attachedChapter = attachedStory?.chapters?.find((c) => c.id === currentBoard.chapterId);
  const attachedMap = maps.find((m) => m.id === currentBoard.mapId);
  const attachedStamp = attachedMap?.stamps?.find((st) => st.id === currentBoard.locationId);

  // Create a new Storyboard
  const handleCreateBoard = () => {
    if (!newTitle.trim()) return;
    const newId = `sb-${Date.now()}`;
    const newBoard: StoryboardData = {
      id: newId,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      cards: [],
      links: [],
      updatedAt: Date.now(),
      storyId: newStoryId || undefined,
      chapterId: newChapterId || undefined,
      mapId: newMapId || undefined,
      locationId: newLocationId || undefined,
    };
    if (onCreateStoryboard) {
      onCreateStoryboard(newBoard);
    }
    if (onSelectStoryboard) {
      onSelectStoryboard(newId);
    }
    setIsNewBoardModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewStoryId('');
    setNewChapterId('');
    setNewMapId('');
    setNewLocationId('');
  };

  // Duplicate current Storyboard
  const handleDuplicateBoard = () => {
    const newId = `sb-${Date.now()}`;
    const duplicated: StoryboardData = {
      ...currentBoard,
      id: newId,
      title: `${currentBoard.title} (Copy)`,
      updatedAt: Date.now(),
    };
    if (onCreateStoryboard) {
      onCreateStoryboard(duplicated);
    }
    if (onSelectStoryboard) {
      onSelectStoryboard(newId);
    }
    setIsBoardSelectorOpen(false);
  };

  // Delete current Storyboard
  const handleDeleteCurrentBoard = () => {
    if (boardsList.length <= 1) {
      alert('You must keep at least one Storyboard.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete storyboard "${currentBoard.title}"?`)) {
      if (onDeleteStoryboard) {
        onDeleteStoryboard(currentBoard.id);
      }
      setIsBoardSelectorOpen(false);
    }
  };

  // Save attachments
  const handleSaveAttachments = () => {
    saveBoard({
      title: attachTitle.trim() || currentBoard.title,
      storyId: attachStoryId || undefined,
      chapterId: attachChapterId || undefined,
      mapId: attachMapId || undefined,
      locationId: attachLocationId || undefined,
    });
    setIsAttachModalOpen(false);
  };

  // Add a new card to the canvas
  const handleAddCard = (kind: CardKind) => {
    const newId = `sb-${Date.now()}`;
    const newCard: StoryboardCard = {
      id: newId,
      kind,
      title: `New ${CARD_COLORS[kind]?.label || 'Card'}`,
      body: 'Write a note, plot twist, or scene description here...',
      x: 100 + Math.random() * 260,
      y: 100 + Math.random() * 200,
      width: 260,
      color: CARD_COLORS[kind]?.color || '#ECE4D7',
    };

    saveBoard({
      cards: [...currentBoard.cards, newCard],
    });
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    saveBoard({
      cards: currentBoard.cards.filter((c) => c.id !== cardId),
      links: currentBoard.links.filter((l) => l.fromId !== cardId && l.toId !== cardId),
    });
  };

  // Delete specific connection link
  const handleDeleteLink = (linkId: string) => {
    saveBoard({
      links: currentBoard.links.filter((l) => l.id !== linkId),
    });
  };

  // Update card content
  const handleCardChange = (cardId: string, updates: Partial<StoryboardCard>) => {
    saveBoard({
      cards: currentBoard.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    });
  };

  // Handle Image Upload from disk
  const handleImageUpload = (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleCardChange(cardId, { imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Handle YouTube URL submit
  const handleSaveMediaUrl = () => {
    if (!activeMediaInput) return;
    const { cardId, type } = activeMediaInput;

    if (type === 'youtube') {
      const ytId = extractYouTubeId(mediaUrlInput.trim());
      if (ytId) {
        handleCardChange(cardId, { youtubeUrl: mediaUrlInput.trim() });
      } else if (mediaUrlInput.trim()) {
        alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
      } else {
        handleCardChange(cardId, { youtubeUrl: undefined });
      }
    } else if (type === 'image') {
      handleCardChange(cardId, { imageUrl: mediaUrlInput.trim() || undefined });
    }

    setActiveMediaInput(null);
    setMediaUrlInput('');
  };

  // Toggle checklist item
  const handleToggleChecklist = (cardId: string, itemIndex: number) => {
    const targetCard = currentBoard.cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const checklist = [...(targetCard.checklist || [])];
    if (checklist[itemIndex]) {
      checklist[itemIndex].done = !checklist[itemIndex].done;
      handleCardChange(cardId, { checklist });
    }
  };

  // Add checklist item
  const handleAddChecklistItem = (cardId: string) => {
    const targetCard = currentBoard.cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const checklist = [
      ...(targetCard.checklist || []),
      { id: `chk-${Date.now()}`, text: 'Key scene beat / requirement', done: false },
    ];
    handleCardChange(cardId, { checklist });
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent, card: StoryboardCard) => {
    if (
      (e.target as HTMLElement).tagName === 'TEXTAREA' ||
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).closest('.card-btn-action') ||
      (e.target as HTMLElement).closest('iframe')
    ) {
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoomScale,
      y: (e.clientY - rect.top) / zoomScale,
    });
    setDraggingCardId(card.id);
  };

  // Dragging on canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingCardId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(10, (e.clientX - boardRect.left) / zoomScale - dragOffset.x);
    const newY = Math.max(10, (e.clientY - boardRect.top) / zoomScale - dragOffset.y);

    saveBoard({
      cards: currentBoard.cards.map((c) =>
        c.id === draggingCardId ? { ...c, x: Math.round(newX), y: Math.round(newY) } : c
      ),
    });
  };

  const handleMouseUp = () => {
    setDraggingCardId(null);
  };

  // Connect cards
  const handlePortClick = (cardId: string) => {
    if (!connectingFromId) {
      setConnectingFromId(cardId);
    } else if (connectingFromId !== cardId) {
      const alreadyLinked = currentBoard.links.some(
        (l) => (l.fromId === connectingFromId && l.toId === cardId) || (l.fromId === cardId && l.toId === connectingFromId)
      );

      if (!alreadyLinked) {
        const newLink: StoryboardLink = {
          id: `link-${Date.now()}`,
          fromId: connectingFromId,
          toId: cardId,
        };
        saveBoard({
          links: [...currentBoard.links, newLink],
        });
      }
      setConnectingFromId(null);
    } else {
      setConnectingFromId(null);
    }
  };

  // Apply Plot Outline Templates
  const handleApplyTemplate = (template: 'three-act' | 'mystery') => {
    let templateCards: StoryboardCard[] = [];
    let templateLinks: StoryboardLink[] = [];

    if (template === 'three-act') {
      templateCards = [
        {
          id: `sb-1`,
          kind: 'beat',
          title: 'Act I: The Hook & Inciting Incident',
          body: 'Protagonist status quo is disrupted by a major event or discovery that forces them into action.',
          tag: 'Act I · Beginning',
          x: 60,
          y: 120,
          width: 260,
          color: '#DCE9EE',
        },
        {
          id: `sb-2`,
          kind: 'beat',
          title: 'Plot Point 1: Crossing the Threshold',
          body: 'There is no going back. The protagonist leaves their comfort zone and enters the special world.',
          tag: 'Plot Point 1',
          x: 370,
          y: 120,
          width: 260,
          color: '#DCE9EE',
        },
        {
          id: `sb-3`,
          kind: 'beat',
          title: 'Midpoint: Reversal or False Victory',
          body: 'A critical reveal or devastating reversal changes the stakes from passive survival to active attack.',
          tag: 'Midpoint Shift',
          x: 680,
          y: 120,
          width: 260,
          color: '#E7E1F0',
        },
        {
          id: `sb-4`,
          kind: 'beat',
          title: 'All is Lost / Dark Night of the Soul',
          body: 'The lowest emotional point where the original plan crumbles. A breakthrough realization happens.',
          tag: 'All is Lost',
          x: 370,
          y: 340,
          width: 260,
          color: '#F1E2E0',
        },
        {
          id: `sb-5`,
          kind: 'beat',
          title: 'Act III: Climax & Resolution',
          body: 'Final confrontation using everything learned. The core conflict is resolved and a new status quo emerges.',
          tag: 'Act III · Climax',
          x: 680,
          y: 340,
          width: 260,
          color: '#DFEAE4',
        },
      ];

      templateLinks = [
        { id: 'l-1', fromId: 'sb-1', toId: 'sb-2' },
        { id: 'l-2', fromId: 'sb-2', toId: 'sb-3' },
        { id: 'l-3', fromId: 'sb-3', toId: 'sb-4' },
        { id: 'l-4', fromId: 'sb-4', toId: 'sb-5' },
      ];
    } else if (template === 'mystery') {
      templateCards = [
        {
          id: `sb-1`,
          kind: 'beat',
          title: 'The Crime & The Enigma',
          body: 'An unexpected crime or disappearance takes place under impossible circumstances.',
          tag: 'Act I · Beginning',
          x: 80,
          y: 140,
          width: 260,
          color: '#ECE4D7',
        },
        {
          id: `sb-2`,
          kind: 'character',
          title: 'Prime Suspect & Secret',
          body: 'Has a compelling motive and false alibi that points suspicion away from the true culprit.',
          tag: 'Rising Action',
          x: 380,
          y: 80,
          width: 260,
          color: '#F1E2E0',
        },
        {
          id: `sb-3`,
          kind: 'idea',
          title: 'The Red Herring Clue',
          body: 'A planted piece of evidence designed to deceive investigators and the reader.',
          tag: 'Midpoint Shift',
          x: 380,
          y: 300,
          width: 260,
          color: '#FAF1D6',
        },
        {
          id: `sb-4`,
          kind: 'beat',
          title: 'The Twist & Unmasking',
          body: 'The real clue was hiding in plain sight from chapter one. The parlor room revelation.',
          tag: 'Act III · Climax',
          x: 690,
          y: 180,
          width: 260,
          color: '#DCE9EE',
        },
      ];

      templateLinks = [
        { id: 'l-1', fromId: 'sb-1', toId: 'sb-2' },
        { id: 'l-2', fromId: 'sb-1', toId: 'sb-3' },
        { id: 'l-3', fromId: 'sb-2', toId: 'sb-4' },
        { id: 'l-4', fromId: 'sb-3', toId: 'sb-4' },
      ];
    }

    saveBoard({
      cards: [...currentBoard.cards, ...templateCards],
      links: [...currentBoard.links, ...templateLinks],
    });
  };

  // Export board to Google Drive
  const handleExport = async () => {
    if (!onExportToDrive) return;
    setIsExporting(true);
    try {
      await onExportToDrive(currentBoard.title || 'Main Storyboard', currentBoard);
      alert(`Storyboard outline exported to Google Drive folder: ${driveFolderName}`);
    } catch (err) {
      console.error(err);
      alert('Failed to export to Google Drive.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Natural 360-Degree Line Path Calculator
   * Connects from the closest logical side (left, right, top, bottom)
   * so lines never look weird or loop backward through cards!
   */
  const calculateConnectionCurve = (fromCard: StoryboardCard, toCard: StoryboardCard) => {
    const cardWidth = 260;
    const estHeight1 = fromCard.imageUrl || fromCard.youtubeUrl ? 260 : 160;
    const estHeight2 = toCard.imageUrl || toCard.youtubeUrl ? 260 : 160;

    const c1x = fromCard.x + cardWidth / 2;
    const c1y = fromCard.y + estHeight1 / 2;
    const c2x = toCard.x + cardWidth / 2;
    const c2y = toCard.y + estHeight2 / 2;

    const dx = c2x - c1x;
    const dy = c2y - c1y;

    let x1: number, y1: number, x2: number, y2: number;
    let ctrl1x: number, ctrl1y: number, ctrl2x: number, ctrl2y: number;

    // Check if horizontal or vertical distance is greater
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx >= 0) {
        // Target is to the RIGHT: exit right edge, enter left edge
        x1 = fromCard.x + cardWidth;
        y1 = c1y;
        x2 = toCard.x;
        y2 = c2y;
        const offset = Math.max(30, (x2 - x1) * 0.5);
        ctrl1x = x1 + offset;
        ctrl1y = y1;
        ctrl2x = x2 - offset;
        ctrl2y = y2;
      } else {
        // Target is to the LEFT: exit left edge, enter right edge
        x1 = fromCard.x;
        y1 = c1y;
        x2 = toCard.x + cardWidth;
        y2 = c2y;
        const offset = Math.max(30, (x1 - x2) * 0.5);
        ctrl1x = x1 - offset;
        ctrl1y = y1;
        ctrl2x = x2 + offset;
        ctrl2y = y2;
      }
    } else {
      if (dy >= 0) {
        // Target is BELOW: exit bottom edge, enter top edge
        x1 = c1x;
        y1 = fromCard.y + estHeight1;
        x2 = c2x;
        y2 = toCard.y;
        const offset = Math.max(30, (y2 - y1) * 0.5);
        ctrl1x = x1;
        ctrl1y = y1 + offset;
        ctrl2x = x2;
        ctrl2y = y2 - offset;
      } else {
        // Target is ABOVE: exit top edge, enter bottom edge
        x1 = c1x;
        y1 = fromCard.y;
        x2 = c2x;
        y2 = toCard.y + estHeight2;
        const offset = Math.max(30, (y1 - y2) * 0.5);
        ctrl1x = x1;
        ctrl1y = y1 - offset;
        ctrl2x = x2;
        ctrl2y = y2 + offset;
      }
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const pathData = `M ${x1} ${y1} C ${ctrl1x} ${ctrl1y}, ${ctrl2x} ${ctrl2y}, ${x2} ${y2}`;
    return { pathData, midX, midY };
  };

  return (
    <div className="page-content" onMouseUp={handleMouseUp} style={{ paddingBottom: '60px' }}>
      {/* Top Header & Multi-Storyboard Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Storyboard Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="action-btn-secondary"
                onClick={() => setIsBoardSelectorOpen(!isBoardSelectorOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: 'var(--serif)',
                  padding: '6px 14px',
                  background: 'var(--panel)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Layers size={17} style={{ color: 'var(--accent)' }} />
                <span>{currentBoard.title}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  {currentBoard.cards.length} cards
                </span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>

              {/* Storyboard Switcher Popover */}
              {isBoardSelectorOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '320px',
                    maxHeight: '440px',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <Search
                        size={13}
                        style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--muted)' }}
                      />
                      <input
                        type="text"
                        placeholder="Search storyboards..."
                        value={boardSearch}
                        onChange={(e) => setBoardSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 8px 5px 26px',
                          fontSize: '0.8rem',
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          color: 'var(--ink)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['all', 'books', 'maps', 'standalone'] as const).map((filter) => (
                        <button
                          key={filter}
                          className={`chip ${boardFilter === filter ? 'active' : ''}`}
                          onClick={() => setBoardFilter(filter)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                    {boardsList
                      .filter((b) => {
                        if (boardFilter === 'books' && !b.storyId) return false;
                        if (boardFilter === 'maps' && !b.mapId) return false;
                        if (boardFilter === 'standalone' && (b.storyId || b.mapId)) return false;
                        if (boardSearch.trim()) {
                          const q = boardSearch.toLowerCase();
                          const matchTitle = b.title.toLowerCase().includes(q);
                          const matchDesc = b.description?.toLowerCase().includes(q);
                          const bStory = stories.find((s) => s.id === b.storyId)?.title.toLowerCase();
                          const bMap = maps.find((m) => m.id === b.mapId)?.name.toLowerCase();
                          return matchTitle || matchDesc || (bStory && bStory.includes(q)) || (bMap && bMap.includes(q));
                        }
                        return true;
                      })
                      .map((b) => {
                        const bStory = stories.find((s) => s.id === b.storyId);
                        const bChap = bStory?.chapters?.find((c) => c.id === b.chapterId);
                        const bMap = maps.find((m) => m.id === b.mapId);
                        const bStamp = bMap?.stamps?.find((st) => st.id === b.locationId);
                        const isCurrent = b.id === currentBoard.id;

                        return (
                          <div
                            key={b.id}
                            onClick={() => {
                              if (onSelectStoryboard) onSelectStoryboard(b.id);
                              setIsBoardSelectorOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: isCurrent ? 'var(--accent-soft)' : 'transparent',
                              marginBottom: '2px',
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCurrent ? 'var(--accent)' : 'var(--ink)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {b.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '2px',
                                }}
                              >
                                {bStory ? (
                                  <>
                                    <BookOpen size={10} />
                                    <span>{bStory.title}{bChap ? ` · ${bChap.title}` : ''}</span>
                                  </>
                                ) : bMap ? (
                                  <>
                                    <Compass size={10} />
                                    <span>{bMap.name}{bStamp ? ` · ${bStamp.label || 'Marker'}` : ''}</span>
                                  </>
                                ) : (
                                  <span>Standalone</span>
                                )}
                                <span>· {b.cards.length} cards</span>
                              </div>
                            </div>
                            {isCurrent && <Check size={14} style={{ color: 'var(--accent)', marginLeft: '6px' }} />}
                          </div>
                        );
                      })}
                  </div>

                  <div
                    style={{
                      padding: '8px 10px',
                      borderTop: '1px solid var(--line)',
                      background: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <button
                      className="action-btn-primary"
                      onClick={() => {
                        setIsBoardSelectorOpen(false);
                        setIsNewBoardModalOpen(true);
                      }}
                      style={{ fontSize: '0.78rem', padding: '4px 10px', flex: 1, justifyContent: 'center' }}
                    >
                      <Plus size={13} />
                      <span>New Storyboard</span>
                    </button>
                    <button
                      className="icon-btn"
                      onClick={handleDuplicateBoard}
                      title="Duplicate current Storyboard"
                      style={{ padding: '6px' }}
                    >
                      <Copy size={14} />
                    </button>
                    {boardsList.length > 1 && (
                      <button
                        className="icon-btn"
                        onClick={handleDeleteCurrentBoard}
                        title="Delete current Storyboard"
                        style={{ padding: '6px', color: '#c53030' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Attachment Badge */}
            <button
              className="chip"
              onClick={() => setIsAttachModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                background: currentBoard.storyId || currentBoard.mapId ? 'var(--panel)' : 'var(--bg)',
                borderColor: currentBoard.storyId || currentBoard.mapId ? 'var(--accent)' : 'var(--line)',
                color: currentBoard.storyId || currentBoard.mapId ? 'var(--ink)' : 'var(--muted)',
                cursor: 'pointer',
              }}
              title="Click to attach this Storyboard to a Book, Chapter, Map, or Location"
            >
              {attachedStory ? (
                <>
                  <BookOpen size={13} style={{ color: 'var(--accent)' }} />
                  <span>
                    Book: <b>{attachedStory.title}</b>
                    {attachedChapter ? ` › ${attachedChapter.title}` : ''}
                  </span>
                </>
              ) : attachedMap ? (
                <>
                  <Compass size={13} style={{ color: '#3E7A8C' }} />
                  <span>
                    Map: <b>{attachedMap.name}</b>
                    {attachedStamp ? ` › 📍 ${attachedStamp.label || 'Marker'}` : ''}
                  </span>
                </>
              ) : (
                <>
                  <Link2 size={13} />
                  <span>Attach to Book or Map</span>
                </>
              )}
              <Sliders size={11} style={{ opacity: 0.5, marginLeft: '2px' }} />
            </button>

            {/* Quick jump link if attached to Story */}
            {attachedStory && onNavigateToStory && (
              <button
                className="icon-btn"
                onClick={() => onNavigateToStory(attachedStory.id, attachedChapter?.id)}
                title={attachedChapter ? `Open ${attachedChapter.title} in Editor` : `Open ${attachedStory.title} in Editor`}
                style={{ fontSize: '0.74rem', gap: '4px', padding: '4px 8px', color: 'var(--accent)' }}
              >
                <span>Edit Manuscript</span>
                <ArrowRight size={12} />
              </button>
            )}

            {/* Quick jump link if attached to Map */}
            {attachedMap && onNavigateToMap && (
              <button
                className="icon-btn"
                onClick={() => onNavigateToMap(attachedMap.id, attachedStamp?.id)}
                title={`Open ${attachedMap.name} in Map Maker`}
                style={{ fontSize: '0.74rem', gap: '4px', padding: '4px 8px', color: '#3E7A8C' }}
              >
                <span>View Map</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          {currentBoard.description && (
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0 0 0 2px' }}>
              {currentBoard.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--panel)', padding: '2px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            <button
              className="icon-btn"
              onClick={() => setZoomScale((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))}
              title="Zoom Out"
              style={{ padding: '5px' }}
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '0.74rem', padding: '0 4px', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              className="icon-btn"
              onClick={() => setZoomScale((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))}
              title="Zoom In"
              style={{ padding: '5px' }}
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Templates */}
          <button
            className="action-btn-secondary"
            onClick={() => handleApplyTemplate('three-act')}
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            title="Insert 3-Act Structure Cards"
          >
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            <span>3-Act Outline</span>
          </button>

          <button
            className="action-btn-secondary"
            onClick={() => handleApplyTemplate('mystery')}
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            title="Insert Mystery Plot Cards"
          >
            <span>Mystery Beat</span>
          </button>

          {/* Export to Google Drive */}
          <button
            className="action-btn-secondary"
            onClick={handleExport}
            disabled={isExporting}
            style={{ fontSize: '0.82rem' }}
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} style={{ color: '#4285F4' }} />}
            <span>Export to Drive Doc</span>
          </button>
        </div>
      </div>

      {/* Add Card Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          + Add Card:
        </span>
        {(['note', 'beat', 'character', 'place', 'idea', 'media'] as CardKind[]).map((k) => (
          <button
            key={k}
            className="chip"
            onClick={() => handleAddCard(k)}
            style={{
              background: CARD_COLORS[k]?.color,
              color: '#26221d',
              borderColor: CARD_COLORS[k]?.tint,
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '4px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            + {CARD_COLORS[k]?.label}
          </button>
        ))}

        {connectingFromId && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.78rem',
              color: 'var(--accent)',
              background: 'var(--accent-soft)',
              padding: '3px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LinkIcon size={12} />
            <span>Click any other card to connect thread</span>
            <button
              onClick={() => setConnectingFromId(null)}
              style={{ cursor: 'pointer', padding: '0 2px' }}
            >
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {/* Canvas Corkboard Area */}
      <div
        ref={boardRef}
        className="storyboard-board"
        onMouseMove={handleMouseMove}
        style={{
          minHeight: '78vh',
          position: 'relative',
          overflow: 'auto',
          borderRadius: '12px',
          transformOrigin: 'top left',
        }}
      >
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top left',
            width: '2600px',
            height: '1800px',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* SVG Thread Lines */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <defs>
              <marker
                id="sb-arrow"
                markerWidth="10"
                markerHeight="10"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
              </marker>
            </defs>

            {currentBoard.links.map((link) => {
              const fromCard = currentBoard.cards.find((c) => c.id === link.fromId);
              const toCard = currentBoard.cards.find((c) => c.id === link.toId);
              if (!fromCard || !toCard) return null;

              const { pathData, midX, midY } = calculateConnectionCurve(fromCard, toCard);

              return (
                <g key={link.id} style={{ pointerEvents: 'auto' }}>
                  {/* Outer transparent hit area for easy hover/delete */}
                  <path
                    d={pathData}
                    stroke="transparent"
                    strokeWidth="18"
                    fill="none"
                    style={{ cursor: 'pointer' }}
                  />

                  {/* Visible thread line */}
                  <path
                    d={pathData}
                    stroke="var(--accent)"
                    strokeWidth="2.2"
                    strokeDasharray="5 4"
                    fill="none"
                    markerEnd="url(#sb-arrow)"
                    opacity="0.9"
                  />

                  {/* Clickable delete link button at midpoint */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    onClick={() => handleDeleteLink(link.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>Click to remove connection</title>
                    <circle cx="0" cy="0" r="9" fill="var(--panel)" stroke="var(--accent)" strokeWidth="1.5" />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="var(--accent)"
                      style={{ userSelect: 'none' }}
                    >
                      ×
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Cards */}
          {currentBoard.cards.map((card) => {
            const cfg = CARD_COLORS[card.kind] || CARD_COLORS.note;
            const isConnecting = connectingFromId === card.id;
            const cardBg = card.color || cfg.color;
            const isDarkCard = cardBg === '#2C2723';
            const ytId = card.youtubeUrl ? extractYouTubeId(card.youtubeUrl) : null;

            return (
              <div
                key={card.id}
                className="cork-card"
                onMouseDown={(e) => handleMouseDown(e, card)}
                style={{
                  left: `${card.x}px`,
                  top: `${card.y}px`,
                  width: `${card.width || 260}px`,
                  backgroundColor: cardBg,
                  color: isDarkCard ? '#f8fafc' : '#26221d',
                  borderColor: isConnecting ? 'var(--accent)' : 'var(--line)',
                  boxShadow: isConnecting
                    ? '0 0 0 3px var(--accent-soft), var(--shadow-lg)'
                    : 'var(--shadow)',
                  position: 'absolute',
                  zIndex: isConnecting ? 10 : 2,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Optional Attached Picture */}
                {card.imageUrl && (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      maxHeight: '140px',
                      marginBottom: '4px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'zoom-in',
                    }}
                    onClick={() => setLightboxImage(card.imageUrl!)}
                    title="Click to view full image"
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      className="card-btn-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardChange(card.id, { imageUrl: undefined });
                      }}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Optional YouTube Video Embed */}
                {ytId && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 9',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '4px',
                      background: '#000',
                    }}
                  >
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                      title={card.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      className="card-btn-action"
                      onClick={() => handleCardChange(card.id, { youtubeUrl: undefined })}
                      title="Remove video"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 5,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Card Header & Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isDarkCard ? '#94a3b8' : cfg.tint,
                      }}
                    >
                      {cfg.label}
                    </span>

                    {/* Act Tag Badge if present */}
                    {card.tag && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isDarkCard ? '#334155' : 'rgba(0,0,0,0.06)',
                          color: isDarkCard ? '#cbd5e1' : '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {card.tag}
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {/* Add Image File Button */}
                    <label
                      className="card-btn-action"
                      title="Attach image from computer"
                      style={{
                        cursor: 'pointer',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.7,
                      }}
                    >
                      <ImageIcon size={13} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(card.id, e)}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* Add YouTube Video Link */}
                    <button
                      className="card-btn-action"
                      onClick={() => {
                        setActiveMediaInput({ cardId: card.id, type: 'youtube' });
                        setMediaUrlInput(card.youtubeUrl || '');
                      }}
                      title="Attach YouTube music / video"
                      style={{ opacity: 0.7, padding: '3px' }}
                    >
                      <YoutubeIcon size={13} style={{ color: '#dc2626' }} />
                    </button>

                    {/* Connect Link Port */}
                    <button
                      className="card-btn-action"
                      onClick={() => handlePortClick(card.id)}
                      title={isConnecting ? 'Cancel link' : 'Connect thread to another card'}
                      style={{
                        padding: '3px',
                        color: isConnecting ? 'var(--accent)' : 'inherit',
                        opacity: isConnecting ? 1 : 0.7,
                      }}
                    >
                      <LinkIcon size={13} />
                    </button>

                    {/* Delete Card */}
                    <button
                      className="card-btn-action"
                      onClick={() => handleDeleteCard(card.id)}
                      title="Delete card"
                      style={{ opacity: 0.7, padding: '3px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Title Input */}
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleCardChange(card.id, { title: e.target.value })}
                  placeholder="Card title…"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    color: isDarkCard ? '#fff' : '#1e1b18',
                    outline: 'none',
                    padding: '2px 0',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Card Body Textarea */}
                <textarea
                  value={card.body}
                  onChange={(e) => handleCardChange(card.id, { body: e.target.value })}
                  placeholder="Scene notes, dialogue, lore, or beat summary…"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.85rem',
                    color: isDarkCard ? '#cbd5e1' : '#444',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: 1.45,
                    fontFamily: 'inherit',
                    minHeight: '44px',
                  }}
                />

                {/* Optional Checklist */}
                {card.checklist && card.checklist.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: '6px' }}>
                    {card.checklist.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => handleToggleChecklist(card.id, idx)}
                      >
                        {item.done ? (
                          <CheckSquare size={14} style={{ color: 'var(--good)' }} />
                        ) : (
                          <Square size={14} style={{ opacity: 0.5 }} />
                        )}
                        <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Footer / Extras Drawer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '6px', marginTop: '2px' }}>
                  {/* Color Swatches */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {PALETTE_OPTIONS.map((c) => (
                      <span
                        key={c}
                        onClick={() => handleCardChange(card.id, { color: c })}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: cardBg === c ? '1.5px solid var(--accent)' : '1px solid rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>

                  {/* Add Checklist button */}
                  <button
                    className="card-btn-action"
                    onClick={() => handleAddChecklistItem(card.id)}
                    title="Add checklist item"
                    style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.7 }}
                  >
                    <CheckSquare size={11} />
                    <span>+ Item</span>
                  </button>

                  {/* Tag Selector */}
                  <select
                    value={card.tag || ''}
                    onChange={(e) => handleCardChange(card.id, { tag: e.target.value || undefined })}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      outline: 'none',
                      color: isDarkCard ? '#cbd5e1' : '#475569',
                      maxWidth: '85px',
                    }}
                  >
                    <option value="">No tag</option>
                    {ACT_TAGS.map((t) => (
                      <option key={t} value={t} style={{ background: 'var(--panel)', color: 'var(--ink)' }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media URL Input Modal */}
      {activeMediaInput && (
        <div className="modal-overlay" onClick={() => setActiveMediaInput(null)}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeMediaInput.type === 'youtube' ? (
                  <>
                    <YoutubeIcon size={18} style={{ color: '#dc2626' }} />
                    <h3 style={{ fontSize: '1.15rem' }}>Attach YouTube Video / Audio</h3>
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '1.15rem' }}>Attach Image URL</h3>
                  </>
                )}
              </div>
              <button className="icon-btn" onClick={() => setActiveMediaInput(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {activeMediaInput.type === 'youtube' ? 'YouTube URL' : 'Image Web Link'}
              </label>
              <input
                type="text"
                placeholder={activeMediaInput.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/picture.jpg'}
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  color: 'var(--ink)',
                }}
              />
              <p style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '6px' }}>
                {activeMediaInput.type === 'youtube'
                  ? 'Embeds a playable soundtrack or video directly on your storyboard card.'
                  : 'Displays the image atop the card.'}
              </p>
            </div>

            <div className="modal-footer">
              <button className="action-btn-secondary" onClick={() => setActiveMediaInput(null)}>
                Cancel
              </button>
              <button className="action-btn-primary" onClick={handleSaveMediaUrl}>
                Save to Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image Zoom */}
      {lightboxImage && (
        <div
          className="modal-overlay"
          onClick={() => setLightboxImage(null)}
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 120, cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={lightboxImage}
              alt="Expanded preview"
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-36px',
                right: '0',
                color: '#fff',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* New Storyboard Modal */}
      {isNewBoardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewBoardModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.15rem' }}>Create New Storyboard</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsNewBoardModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  Storyboard Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 - The Citadel Infiltration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
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

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Short note or purpose for this board"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              {/* Book & Chapter Attachment */}
              <div style={{ padding: '10px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <BookOpen size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Attach to Book & Chapter</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={newStoryId}
                    onChange={(e) => {
                      setNewStoryId(e.target.value);
                      setNewChapterId('');
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="">-- No Book (Standalone) --</option>
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>

                  {newStoryId && (
                    <select
                      value={newChapterId}
                      onChange={(e) => setNewChapterId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: 'var(--ink)',
                      }}
                    >
                      <option value="">Whole Book (All Chapters)</option>
                      {(stories.find((s) => s.id === newStoryId)?.chapters || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          Chapter: {c.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Map & Location Attachment */}
              <div style={{ padding: '10px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Compass size={14} style={{ color: '#3E7A8C' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Attach to World Map & Location</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={newMapId}
                    onChange={(e) => {
                      setNewMapId(e.target.value);
                      setNewLocationId('');
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="">-- No Map (Standalone) --</option>
                    {maps.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  {newMapId && (
                    <select
                      value={newLocationId}
                      onChange={(e) => setNewLocationId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: 'var(--ink)',
                      }}
                    >
                      <option value="">Entire Map (General Realm)</option>
                      {(maps.find((m) => m.id === newMapId)?.stamps || []).map((st) => (
                        <option key={st.id} value={st.id}>
                          📍 {st.label || st.type} ({Math.round(st.x)}, {Math.round(st.y)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn-secondary" onClick={() => setIsNewBoardModalOpen(false)}>
                Cancel
              </button>
              <button
                className="action-btn-primary"
                onClick={handleCreateBoard}
                disabled={!newTitle.trim()}
              >
                Create Storyboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Attachment & Settings Modal */}
      {isAttachModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAttachModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.15rem' }}>Storyboard Settings & Attachments</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsAttachModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  Storyboard Title
                </label>
                <input
                  type="text"
                  value={attachTitle}
                  onChange={(e) => setAttachTitle(e.target.value)}
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

              {/* Book & Chapter Attachment */}
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <BookOpen size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Attached Book & Chapter</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={attachStoryId}
                    onChange={(e) => {
                      setAttachStoryId(e.target.value);
                      setAttachChapterId('');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="">-- No Book (Standalone) --</option>
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        📖 {s.title}
                      </option>
                    ))}
                  </select>

                  {attachStoryId && (
                    <select
                      value={attachChapterId}
                      onChange={(e) => setAttachChapterId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: 'var(--ink)',
                      }}
                    >
                      <option value="">Whole Book (All Chapters)</option>
                      {(stories.find((s) => s.id === attachStoryId)?.chapters || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          📑 Chapter: {c.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Map & Location Attachment */}
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Compass size={15} style={{ color: '#3E7A8C' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Attached World Map & Location</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={attachMapId}
                    onChange={(e) => {
                      setAttachMapId(e.target.value);
                      setAttachLocationId('');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="">-- No Map (Standalone) --</option>
                    {maps.map((m) => (
                      <option key={m.id} value={m.id}>
                        🗺️ {m.name}
                      </option>
                    ))}
                  </select>

                  {attachMapId && (
                    <select
                      value={attachLocationId}
                      onChange={(e) => setAttachLocationId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: 'var(--ink)',
                      }}
                    >
                      <option value="">Entire Map (General Realm)</option>
                      {(maps.find((m) => m.id === attachMapId)?.stamps || []).map((st) => (
                        <option key={st.id} value={st.id}>
                          📍 {st.label || st.type} ({Math.round(st.x)}, {Math.round(st.y)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="action-btn-secondary"
                onClick={() => {
                  setAttachStoryId('');
                  setAttachChapterId('');
                  setAttachMapId('');
                  setAttachLocationId('');
                }}
                style={{ fontSize: '0.78rem', color: 'var(--muted)' }}
              >
                Unlink (Make Standalone)
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="action-btn-secondary" onClick={() => setIsAttachModalOpen(false)}>
                  Cancel
                </button>
                <button className="action-btn-primary" onClick={handleSaveAttachments}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
