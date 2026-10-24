import React, { useState, useRef } from 'react';
import {
  Plus,
  Cloud,
  FileText,
  Share2,
  Trash2,
  Move,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { StoryboardData, StoryboardCard, CardKind } from '../types';

interface StoryboardViewProps {
  boardData: StoryboardData;
  onUpdateBoard: (newBoard: StoryboardData) => void;
  onExportToDrive: (title: string, data: StoryboardData) => Promise<void>;
  driveFolderName: string;
}

const CARD_COLORS: Record<CardKind, { label: string; color: string; tint: string }> = {
  note: { label: 'Note', color: '#ECE4D7', tint: '#8C7C69' },
  beat: { label: 'Scene', color: '#DCE9EE', tint: '#467B92' },
  character: { label: 'Character', color: '#F1E2E0', tint: '#B0567A' },
  place: { label: 'Place', color: '#DFEAE4', tint: '#3F7B5E' },
  idea: { label: 'Idea', color: '#E7E1F0', tint: '#735099' },
  map: { label: 'Map', color: '#F3ECDC', tint: '#8C7C69' },
};

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  boardData,
  onUpdateBoard,
  onExportToDrive,
  driveFolderName,
}) => {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Add a new card to the canvas
  const handleAddCard = (kind: CardKind) => {
    const newId = `sb-${Date.now()}`;
    const newCard: StoryboardCard = {
      id: newId,
      kind,
      title: `New ${CARD_COLORS[kind].label}`,
      body: 'Write a note, plot twist, or scene description here...',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 240,
      color: CARD_COLORS[kind].color,
    };

    onUpdateBoard({
      ...boardData,
      cards: [...boardData.cards, newCard],
    });
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    onUpdateBoard({
      cards: boardData.cards.filter((c) => c.id !== cardId),
      links: boardData.links.filter((l) => l.fromId !== cardId && l.toId !== cardId),
    });
  };

  // Update card content
  const handleCardChange = (cardId: string, updates: Partial<StoryboardCard>) => {
    onUpdateBoard({
      ...boardData,
      cards: boardData.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    });
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent, card: StoryboardCard) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingCardId(card.id);
  };

  // Dragging on canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingCardId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(10, e.clientX - boardRect.left - dragOffset.x);
    const newY = Math.max(10, e.clientY - boardRect.top - dragOffset.y);

    onUpdateBoard({
      ...boardData,
      cards: boardData.cards.map((c) =>
        c.id === draggingCardId ? { ...c, x: newX, y: newY } : c
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
      const newLink = {
        id: `link-${Date.now()}`,
        fromId: connectingFromId,
        toId: cardId,
      };
      onUpdateBoard({
        ...boardData,
        links: [...boardData.links, newLink],
      });
      setConnectingFromId(null);
    } else {
      setConnectingFromId(null);
    }
  };

  // Export board to Google Drive
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExportToDrive('Main Storyboard', boardData);
      alert(`Storyboard outline exported to Google Drive folder: ${driveFolderName}`);
    } catch (err) {
      console.error(err);
      alert('Failed to export to Google Drive.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-content" onMouseUp={handleMouseUp}>
      {/* Top Header & Chip Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Storyboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Plot scenes, connect narrative threads, and rearrange cards on your visual canvas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Add buttons */}
          {(['note', 'beat', 'character', 'place', 'idea'] as CardKind[]).map((k) => (
            <button
              key={k}
              className="chip"
              onClick={() => handleAddCard(k)}
              style={{
                background: CARD_COLORS[k].color,
                color: '#26221d',
                borderColor: CARD_COLORS[k].tint,
                fontWeight: 600,
              }}
            >
              + {CARD_COLORS[k].label}
            </button>
          ))}

          {/* Export to Google Drive */}
          <button
            className="action-btn-secondary"
            onClick={handleExport}
            disabled={isExporting}
            style={{ marginLeft: '12px' }}
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} style={{ color: '#4285F4' }} />}
            <span>Export to Drive Doc</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={boardRef}
        className="storyboard-board"
        onMouseMove={handleMouseMove}
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

          {boardData.links.map((link) => {
            const fromCard = boardData.cards.find((c) => c.id === link.fromId);
            const toCard = boardData.cards.find((c) => c.id === link.toId);
            if (!fromCard || !toCard) return null;

            const x1 = fromCard.x + 240;
            const y1 = fromCard.y + 40;
            const x2 = toCard.x;
            const y2 = toCard.y + 40;
            const cx1 = x1 + (x2 - x1) * 0.5;
            const cx2 = x1 + (x2 - x1) * 0.5;

            return (
              <g key={link.id}>
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                  markerEnd="url(#sb-arrow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Cards */}
        {boardData.cards.map((card) => {
          const cfg = CARD_COLORS[card.kind] || CARD_COLORS.note;
          const isConnecting = connectingFromId === card.id;

          return (
            <div
              key={card.id}
              className="cork-card"
              style={{
                left: `${card.x}px`,
                top: `${card.y}px`,
                backgroundColor: card.color || cfg.color,
                zIndex: draggingCardId === card.id ? 20 : 5,
                border: isConnecting ? '2px solid var(--accent)' : '1px solid var(--line)',
              }}
              onMouseDown={(e) => handleMouseDown(e, card)}
            >
              <div className="cork-card-header">
                <span style={{ color: cfg.tint }}>{cfg.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Connect port */}
                  <button
                    onClick={() => handlePortClick(card.id)}
                    title={isConnecting ? 'Cancel link' : 'Click to connect thread to another card'}
                    style={{ color: cfg.tint }}
                  >
                    <LinkIcon size={12} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    title="Delete card"
                    style={{ color: '#888' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                className="cork-card-title"
                value={card.title}
                onChange={(e) => handleCardChange(card.id, { title: e.target.value })}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                }}
              />

              {/* Content textarea */}
              <textarea
                className="cork-card-body"
                value={card.body}
                onChange={(e) => handleCardChange(card.id, { body: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
