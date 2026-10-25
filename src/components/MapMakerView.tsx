import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Download,
  Trash2,
  Cloud,
  Move,
  Layers,
  MapPin,
  RefreshCw,
  Undo2,
  Redo2,
  Plus,
  PenTool,
  Sparkles,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  FileDown,
} from 'lucide-react';
import { WorldMap, MapStamp, MapAspect, MapStyle, MapPath } from '../types';
import { MapStampIcon } from '../utils/mapStamps';

interface MapMakerViewProps {
  maps: WorldMap[];
  onUpdateMaps: (updatedMaps: WorldMap[]) => void;
  onSyncDrive: () => Promise<void>;
}

type ToolMode = 'stamp' | 'draw' | 'select';

interface StampCategory {
  name: string;
  items: { type: string; label: string }[];
}

const STAMP_CATEGORIES: StampCategory[] = [
  {
    name: 'Settlements',
    items: [
      { type: 'castle', label: 'Citadel' },
      { type: 'city', label: 'Walled City' },
      { type: 'tower', label: 'Wizard’s Spire' },
      { type: 'tavern', label: 'Cozy Tavern' },
      { type: 'fort', label: 'Fortress' },
      { type: 'port', label: 'Harbor Town' },
      { type: 'ruins', label: 'Ancient Ruins' },
    ],
  },
  {
    name: 'Terrain',
    items: [
      { type: 'mountain', label: 'High Mountains' },
      { type: 'hills', label: 'Rolling Hills' },
      { type: 'tree', label: 'Deep Forest' },
      { type: 'pine', label: 'Pine Woods' },
      { type: 'volcano', label: 'Volcano' },
      { type: 'cave', label: 'Cavern / Dungeon' },
    ],
  },
  {
    name: 'Beasts & Lore',
    items: [
      { type: 'dragon', label: 'Elder Dragon' },
      { type: 'serpent', label: 'Sea Leviathan' },
      { type: 'ship', label: 'Galleon Ship' },
      { type: 'monolith', label: 'Runestone' },
      { type: 'campfire', label: 'Campfire' },
    ],
  },
  {
    name: 'Atlas Accents',
    items: [
      { type: 'compass', label: 'Compass Rose' },
    ],
  },
];

export const MapMakerView: React.FC<MapMakerViewProps> = ({
  maps,
  onUpdateMaps,
  onSyncDrive,
}) => {
  const currentMap = maps[0] || {
    id: 'map-1',
    name: 'The Realms of Eldoria',
    kind: 'realm',
    style: 'wash',
    aspect: 'screen',
    stamps: [],
    paths: [],
    realms: [],
    updatedAt: Date.now(),
  };

  const [mode, setMode] = useState<ToolMode>('stamp');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeStampType, setActiveStampType] = useState<string>('castle');
  const [stampScale, setStampScale] = useState<number>(1.0);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);

  // Drawing tool state
  const [activePathType, setActivePathType] = useState<'coast' | 'river' | 'road' | 'border'>('river');
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Dragging state
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History for Undo/Redo
  const [history, setHistory] = useState<WorldMap[]>([currentMap]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Map settings
  const [style, setStyle] = useState<MapStyle>(currentMap.style || 'wash');
  const [aspect, setAspect] = useState<MapAspect>(currentMap.aspect || 'screen');
  const [mapName, setMapName] = useState(currentMap.name || 'The Realms of Eldoria');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const canvasRef = useRef<SVGSVGElement>(null);

  // Aspect ratio dimensions
  const aspectDimensions: Record<MapAspect, { width: number; height: number }> = {
    screen: { width: 840, height: 520 },
    wide: { width: 920, height: 480 },
    book: { width: 560, height: 760 },
    poster: { width: 600, height: 800 },
    square: { width: 640, height: 640 },
  };

  const dim = aspectDimensions[aspect] || aspectDimensions.screen;

  // Theme palettes
  const bgStyles: Record<
    MapStyle,
    {
      bg: string;
      line: string;
      accentLine: string;
      stampColor: string;
      oceanText: string;
      borderDashes: string;
      riverColor: string;
      roadColor: string;
      borderColor: string;
    }
  > = {
    wash: {
      bg: '#f6efe2',
      line: '#d5c4aa',
      accentLine: '#9c876b',
      stampColor: '#2b2319',
      oceanText: '#b3a084',
      borderDashes: '5 5',
      riverColor: '#4f7ea8',
      roadColor: '#8a6240',
      borderColor: '#9e3d3d',
    },
    parchment: {
      bg: '#ede0c4',
      line: '#bda682',
      accentLine: '#7c6543',
      stampColor: '#382a1b',
      oceanText: '#9c8461',
      borderDashes: '6 4',
      riverColor: '#3d6c96',
      roadColor: '#7a5432',
      borderColor: '#8f2d2d',
    },
    night: {
      bg: '#181e29',
      line: '#2d3848',
      accentLine: '#cbd5e1',
      stampColor: '#f1f5f9',
      oceanText: '#64748b',
      borderDashes: '4 4',
      riverColor: '#38bdf8',
      roadColor: '#fbbf24',
      borderColor: '#f43f5e',
    },
    sylvan: {
      bg: '#e8efe6',
      line: '#b5c8b2',
      accentLine: '#4e7049',
      stampColor: '#1c2e1b',
      oceanText: '#8fa88c',
      borderDashes: '5 5',
      riverColor: '#2563eb',
      roadColor: '#785634',
      borderColor: '#9333ea',
    },
  };

  const currentTheme = bgStyles[style] || bgStyles.wash;

  // Save map and add to undo stack
  const commitMapUpdate = (updated: WorldMap) => {
    onUpdateMaps([updated]);
    const newHist = history.slice(0, historyIndex + 1);
    setHistory([...newHist, updated]);
    setHistoryIndex(newHist.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateMaps([prev]);
      setSelectedStampId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateMaps([next]);
      setSelectedStampId(null);
    }
  };

  // Convert client mouse/touch to SVG coordinates
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = dim.width / rect.width;
    const scaleY = dim.height / rect.height;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  // Canvas Mouse Down / Pointer Down
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e.clientX, e.clientY);

    if (mode === 'draw') {
      setIsDrawing(true);
      setCurrentPathPoints([coords]);
      return;
    }

    if (mode === 'stamp') {
      // Check if clicked an existing stamp
      const target = (e.target as HTMLElement).closest('.map-stamp-container');
      if (target) return;

      const newStamp: MapStamp = {
        id: `stamp-${Date.now()}`,
        type: activeStampType,
        x: coords.x,
        y: coords.y,
        scale: stampScale,
        label: STAMP_CATEGORIES[activeCategoryIndex]?.items.find((i) => i.type === activeStampType)?.label || '',
      };

      const updated: WorldMap = {
        ...currentMap,
        stamps: [...(currentMap.stamps || []), newStamp],
        updatedAt: Date.now(),
      };
      commitMapUpdate(updated);
      setSelectedStampId(newStamp.id);
    }
  };

  // Canvas Mouse Move
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e.clientX, e.clientY);

    if (isDrawing && mode === 'draw') {
      const last = currentPathPoints[currentPathPoints.length - 1];
      if (!last || Math.hypot(last.x - coords.x, last.y - coords.y) > 6) {
        setCurrentPathPoints((prev) => [...prev, coords]);
      }
      return;
    }

    if (draggingStampId && (mode === 'select' || mode === 'stamp')) {
      const newX = Math.max(20, Math.min(dim.width - 20, coords.x - dragOffset.x));
      const newY = Math.max(20, Math.min(dim.height - 20, coords.y - dragOffset.y));

      const updatedStamps = (currentMap.stamps || []).map((s) =>
        s.id === draggingStampId ? { ...s, x: newX, y: newY } : s
      );

      onUpdateMaps([{ ...currentMap, stamps: updatedStamps, updatedAt: Date.now() }]);
    }
  };

  // Canvas Pointer Up
  const handlePointerUp = () => {
    if (isDrawing && mode === 'draw' && currentPathPoints.length > 2) {
      const newPath: MapPath = {
        id: `path-${Date.now()}`,
        type: activePathType,
        points: currentPathPoints,
      };

      const updated: WorldMap = {
        ...currentMap,
        paths: [...(currentMap.paths || []), newPath],
        updatedAt: Date.now(),
      };
      commitMapUpdate(updated);
      setCurrentPathPoints([]);
    }
    setIsDrawing(false);

    if (draggingStampId) {
      commitMapUpdate({ ...currentMap, updatedAt: Date.now() });
      setDraggingStampId(null);
    }
  };

  // Stamp selection & drag start
  const handleStampPointerDown = (e: React.PointerEvent, stamp: MapStamp) => {
    e.stopPropagation();
    setSelectedStampId(stamp.id);
    const coords = getSvgCoordinates(e.clientX, e.clientY);
    setDraggingStampId(stamp.id);
    setDragOffset({ x: coords.x - stamp.x, y: coords.y - stamp.y });
  };

  // Stamp actions
  const handleDeleteSelected = () => {
    if (!selectedStampId) return;
    const updated = {
      ...currentMap,
      stamps: (currentMap.stamps || []).filter((s) => s.id !== selectedStampId),
      updatedAt: Date.now(),
    };
    commitMapUpdate(updated);
    setSelectedStampId(null);
  };

  const handleUpdateSelectedScale = (delta: number) => {
    if (!selectedStampId) return;
    const updatedStamps = (currentMap.stamps || []).map((s) => {
      if (s.id === selectedStampId) {
        const next = Math.max(0.5, Math.min(2.5, +(s.scale + delta).toFixed(1)));
        return { ...s, scale: next };
      }
      return s;
    });
    commitMapUpdate({ ...currentMap, stamps: updatedStamps, updatedAt: Date.now() });
  };

  const handleUpdateSelectedLabel = (label: string) => {
    if (!selectedStampId) return;
    const updatedStamps = (currentMap.stamps || []).map((s) =>
      s.id === selectedStampId ? { ...s, label } : s
    );
    onUpdateMaps([{ ...currentMap, stamps: updatedStamps, updatedAt: Date.now() }]);
  };

  // Clear Map
  const handleClearMap = () => {
    if (!window.confirm('Clear all stamps and drawn paths from this map?')) return;
    const updated: WorldMap = {
      ...currentMap,
      stamps: [],
      paths: [],
      updatedAt: Date.now(),
    };
    commitMapUpdate(updated);
    setSelectedStampId(null);
  };

  // Landmass Preset Generators
  const applyPresetTemplate = (preset: 'archipelago' | 'highlands' | 'coastal') => {
    let newStamps: MapStamp[] = [];
    let newPaths: MapPath[] = [];

    const w = dim.width;
    const h = dim.height;

    if (preset === 'archipelago') {
      newStamps = [
        { id: `s-1`, type: 'compass', x: w - 80, y: 80, scale: 1.2 },
        { id: `s-2`, type: 'castle', x: Math.round(w * 0.45), y: Math.round(h * 0.42), scale: 1.2, label: 'Isle of Solitude' },
        { id: `s-3`, type: 'port', x: Math.round(w * 0.35), y: Math.round(h * 0.58), scale: 1.0, label: 'Windward Haven' },
        { id: `s-4`, type: 'tower', x: Math.round(w * 0.65), y: Math.round(h * 0.35), scale: 1.0, label: 'Star Spire' },
        { id: `s-5`, type: 'ship', x: Math.round(w * 0.22), y: Math.round(h * 0.28), scale: 1.1, label: 'The Galleon Dawn' },
        { id: `s-6`, type: 'serpent', x: Math.round(w * 0.78), y: Math.round(h * 0.72), scale: 1.2, label: 'The Abyssal Deep' },
        { id: `s-7`, type: 'pine', x: Math.round(w * 0.42), y: Math.round(h * 0.48), scale: 0.8 },
        { id: `s-8`, type: 'pine', x: Math.round(w * 0.48), y: Math.round(h * 0.46), scale: 0.8 },
      ];
    } else if (preset === 'highlands') {
      newStamps = [
        { id: `s-1`, type: 'compass', x: 80, y: 80, scale: 1.1 },
        { id: `s-2`, type: 'mountain', x: Math.round(w * 0.25), y: Math.round(h * 0.35), scale: 1.5, label: 'Dragon’s Spine' },
        { id: `s-3`, type: 'mountain', x: Math.round(w * 0.35), y: Math.round(h * 0.32), scale: 1.4 },
        { id: `s-4`, type: 'mountain', x: Math.round(w * 0.45), y: Math.round(h * 0.38), scale: 1.3 },
        { id: `s-5`, type: 'volcano', x: Math.round(w * 0.15), y: Math.round(h * 0.4), scale: 1.2, label: 'Mount Ash' },
        { id: `s-6`, type: 'castle', x: Math.round(w * 0.62), y: Math.round(h * 0.45), scale: 1.3, label: 'Capital of Valdor' },
        { id: `s-7`, type: 'city', x: Math.round(w * 0.75), y: Math.round(h * 0.6), scale: 1.1, label: 'Oakhaven' },
        { id: `s-8`, type: 'tree', x: Math.round(w * 0.55), y: Math.round(h * 0.55), scale: 0.9 },
        { id: `s-9`, type: 'tree', x: Math.round(w * 0.6), y: Math.round(h * 0.6), scale: 0.9 },
        { id: `s-10`, type: 'tavern', x: Math.round(w * 0.45), y: Math.round(h * 0.58), scale: 0.9, label: 'The Wayfarer’s Rest' },
      ];
      // River from mountains down to plains
      newPaths = [
        {
          id: `p-1`,
          type: 'river',
          points: [
            { x: Math.round(w * 0.35), y: Math.round(h * 0.38) },
            { x: Math.round(w * 0.42), y: Math.round(h * 0.46) },
            { x: Math.round(w * 0.5), y: Math.round(h * 0.52) },
            { x: Math.round(w * 0.68), y: Math.round(h * 0.72) },
            { x: Math.round(w * 0.85), y: Math.round(h * 0.88) },
          ],
        },
      ];
    } else if (preset === 'coastal') {
      newStamps = [
        { id: `s-1`, type: 'compass', x: w - 80, y: 80, scale: 1.1 },
        { id: `s-2`, type: 'port', x: Math.round(w * 0.48), y: Math.round(h * 0.48), scale: 1.3, label: 'Port Royal' },
        { id: `s-3`, type: 'ship', x: Math.round(w * 0.25), y: Math.round(h * 0.6), scale: 1.2, label: 'Merchant Fleet' },
        { id: `s-4`, type: 'tower', x: Math.round(w * 0.55), y: Math.round(h * 0.3), scale: 1.0, label: 'Beacon of Hope' },
        { id: `s-5`, type: 'dragon', x: Math.round(w * 0.75), y: Math.round(h * 0.25), scale: 1.3, label: 'Sky Terror' },
        { id: `s-6`, type: 'ruins', x: Math.round(w * 0.8), y: Math.round(h * 0.65), scale: 1.0, label: 'Sunken Temple' },
      ];
    }

    const updated: WorldMap = {
      ...currentMap,
      stamps: newStamps,
      paths: newPaths,
      updatedAt: Date.now(),
    };
    commitMapUpdate(updated);
  };

  // Google Drive Sync
  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      await onSyncDrive();
      alert('Map saved successfully to Google Drive!');
    } catch (err) {
      alert('Failed to sync map to Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const svgEl = canvasRef.current;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName.replace(/\s+/g, '_')}_Atlas.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedStamp = (currentMap.stamps || []).find((s) => s.id === selectedStampId);

  return (
    <div className="page-content" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Map Maker
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            Hand-drawn fantasy atlas plates with castles, beasts, towers, roads, and winding rivers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Undo / Redo */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--panel)', padding: '2px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            <button
              className="icon-btn"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo last change (Ctrl+Z)"
              style={{ padding: '6px' }}
            >
              <Undo2 size={15} />
            </button>
            <button
              className="icon-btn"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              style={{ padding: '6px' }}
            >
              <Redo2 size={15} />
            </button>
          </div>

          {/* Theme Palette Switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`chip ${style === 'wash' ? 'active' : ''}`}
              onClick={() => {
                setStyle('wash');
                commitMapUpdate({ ...currentMap, style: 'wash' });
              }}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
            >
              Classic Wash
            </button>
            <button
              className={`chip ${style === 'parchment' ? 'active' : ''}`}
              onClick={() => {
                setStyle('parchment');
                commitMapUpdate({ ...currentMap, style: 'parchment' });
              }}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
            >
              Parchment
            </button>
            <button
              className={`chip ${style === 'night' ? 'active' : ''}`}
              onClick={() => {
                setStyle('night');
                commitMapUpdate({ ...currentMap, style: 'night' });
              }}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
            >
              Gilded Night
            </button>
            <button
              className={`chip ${style === 'sylvan' ? 'active' : ''}`}
              onClick={() => {
                setStyle('sylvan');
                commitMapUpdate({ ...currentMap, style: 'sylvan' });
              }}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
            >
              Sylvan
            </button>
          </div>

          {/* Aspect Ratio */}
          <select
            value={aspect}
            onChange={(e) => {
              const val = e.target.value as MapAspect;
              setAspect(val);
              commitMapUpdate({ ...currentMap, aspect: val });
            }}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '5px 8px',
              fontSize: '0.8rem',
              color: 'var(--ink)',
            }}
          >
            <option value="screen">Widescreen (16:9)</option>
            <option value="book">Book Page (8.5×11)</option>
            <option value="poster">Atlas Poster</option>
            <option value="square">Square Plate</option>
          </select>

          {/* Sync to Drive */}
          <button className="action-btn-secondary" onClick={handleSyncDrive} disabled={isSyncing} style={{ fontSize: '0.82rem' }}>
            <Cloud size={14} style={{ color: '#4285F4' }} />
            <span>{isSyncing ? 'Syncing…' : 'Sync to Drive'}</span>
          </button>

          {/* Export SVG */}
          <button className="action-btn-primary" onClick={handleDownloadSvg} style={{ fontSize: '0.82rem' }}>
            <Download size={14} />
            <span>Download Plate</span>
          </button>
        </div>
      </div>

      {/* Preset Landmass & Template Toolbar */}
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
          Templates:
        </span>
        <button
          className="action-btn-secondary"
          onClick={() => applyPresetTemplate('highlands')}
          style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          🏔️ Highland Realm
        </button>
        <button
          className="action-btn-secondary"
          onClick={() => applyPresetTemplate('archipelago')}
          style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          🏝️ Sea Archipelago
        </button>
        <button
          className="action-btn-secondary"
          onClick={() => applyPresetTemplate('coastal')}
          style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          🌊 Coastal Port Bay
        </button>
        <button
          className="action-btn-secondary"
          onClick={handleClearMap}
          style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--crit)', marginLeft: 'auto', whiteSpace: 'nowrap' }}
        >
          <Trash2 size={13} />
          <span>Clear Plate</span>
        </button>
      </div>

      {/* Main Tools Drawer (Modes: Stamp / Draw / Select) */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <button
            className={`action-btn-secondary ${mode === 'stamp' ? 'active' : ''}`}
            onClick={() => setMode('stamp')}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              background: mode === 'stamp' ? 'var(--accent-soft)' : 'transparent',
              borderColor: mode === 'stamp' ? 'var(--accent)' : 'var(--line)',
              color: mode === 'stamp' ? 'var(--accent)' : 'var(--ink)',
            }}
          >
            <MapPin size={15} />
            <span>Place Stamps</span>
          </button>

          <button
            className={`action-btn-secondary ${mode === 'draw' ? 'active' : ''}`}
            onClick={() => setMode('draw')}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              background: mode === 'draw' ? 'var(--accent-soft)' : 'transparent',
              borderColor: mode === 'draw' ? 'var(--accent)' : 'var(--line)',
              color: mode === 'draw' ? 'var(--accent)' : 'var(--ink)',
            }}
          >
            <PenTool size={15} />
            <span>Draw Rivers & Roads</span>
          </button>

          <button
            className={`action-btn-secondary ${mode === 'select' ? 'active' : ''}`}
            onClick={() => setMode('select')}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              background: mode === 'select' ? 'var(--accent-soft)' : 'transparent',
              borderColor: mode === 'select' ? 'var(--accent)' : 'var(--line)',
              color: mode === 'select' ? 'var(--accent)' : 'var(--ink)',
            }}
          >
            <MousePointer size={15} />
            <span>Select & Move</span>
          </button>
        </div>

        {/* Mode 1: Stamps */}
        {mode === 'stamp' && (
          <div>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {STAMP_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  className={`chip ${activeCategoryIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveCategoryIndex(idx)}
                  style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                >
                  {cat.name}
                </button>
              ))}

              {/* Stamp Scale */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Stamp Size:
                </span>
                {[0.8, 1.0, 1.3, 1.6].map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setStampScale(sc)}
                    style={{
                      padding: '2px 7px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      background: stampScale === sc ? 'var(--accent)' : 'var(--bg)',
                      color: stampScale === sc ? '#fff' : 'var(--muted)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    {sc}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stamps list */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {STAMP_CATEGORIES[activeCategoryIndex]?.items.map((st) => {
                const isCur = activeStampType === st.type;
                return (
                  <button
                    key={st.type}
                    onClick={() => setActiveStampType(st.type)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isCur ? 'var(--accent-soft)' : 'var(--bg)',
                      border: isCur ? '1px solid var(--accent)' : '1px solid var(--line)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: '68px',
                    }}
                  >
                    <MapStampIcon type={st.type} size={28} color="var(--ink)" />
                    <span style={{ fontSize: '0.75rem', color: isCur ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>
              💡 Click anywhere on the map plate to place the selected stamp. Switch to <strong>Select & Move</strong> to drag or resize it.
            </div>
          </div>
        )}

        {/* Mode 2: Drawing Tools */}
        {mode === 'draw' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)' }}>
                Line Style:
              </span>
              {[
                { type: 'river', label: '💧 Blue River', color: currentTheme.riverColor },
                { type: 'road', label: '🛤️ Trade Road', color: currentTheme.roadColor },
                { type: 'border', label: '⚔️ Realm Border', color: currentTheme.borderColor },
                { type: 'coast', label: '🌊 Coastline Wave', color: currentTheme.accentLine },
              ].map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => setActivePathType(pt.type as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: activePathType === pt.type ? 'var(--accent-soft)' : 'var(--bg)',
                    border: activePathType === pt.type ? '1px solid var(--accent)' : '1px solid var(--line)',
                    fontSize: '0.8rem',
                    color: 'var(--ink)',
                    fontWeight: activePathType === pt.type ? 600 : 500,
                  }}
                >
                  {pt.label}
                </button>
              ))}

              <button
                className="action-btn-secondary"
                onClick={() => {
                  if ((currentMap.paths || []).length > 0) {
                    const updated = {
                      ...currentMap,
                      paths: (currentMap.paths || []).slice(0, -1),
                    };
                    commitMapUpdate(updated);
                  }
                }}
                style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '4px 10px' }}
                disabled={!(currentMap.paths && currentMap.paths.length > 0)}
              >
                Undo Last Line
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>
              ✍️ Click and drag across the plate to draw freehand waterways, trade tracks, and territorial borders.
            </div>
          </div>
        )}

        {/* Mode 3: Select & Move */}
        {mode === 'select' && (
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            🎯 Click any placed castle, mountain, beast, or label to drag it into position, resize it, or rename it.
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto', padding: '10px 0' }}>
        <div
          style={{
            position: 'relative',
            width: `${dim.width}px`,
            height: `${dim.height}px`,
            maxWidth: '100%',
            aspectRatio: `${dim.width} / ${dim.height}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <svg
            ref={canvasRef}
            id="world-map-svg"
            width={dim.width}
            height={dim.height}
            viewBox={`0 0 ${dim.width} ${dim.height}`}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: currentTheme.bg,
              cursor: mode === 'draw' ? 'crosshair' : mode === 'stamp' ? 'copy' : 'default',
              userSelect: 'none',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Background Parchment Fill */}
            <rect width="100%" height="100%" fill={currentTheme.bg} />

            {/* Vintage Atlas Plate Borders */}
            <rect
              x="10"
              y="10"
              width={dim.width - 20}
              height={dim.height - 20}
              fill="none"
              stroke={currentTheme.line}
              strokeWidth="2.5"
            />
            <rect
              x="16"
              y="16"
              width={dim.width - 32}
              height={dim.height - 32}
              fill="none"
              stroke={currentTheme.accentLine}
              strokeWidth="1"
              strokeDasharray={currentTheme.borderDashes}
              opacity="0.8"
            />

            {/* Corner Filigree Accents */}
            <g stroke={currentTheme.accentLine} strokeWidth="1.5" fill="none" opacity="0.7">
              <path d="M 22 36 L 22 22 L 36 22" />
              <path d={`M ${dim.width - 22} 36 L ${dim.width - 22} 22 L ${dim.width - 36} 22`} />
              <path d={`M 22 ${dim.height - 36} L 22 ${dim.height - 22} L 36 ${dim.height - 22}`} />
              <path d={`M ${dim.width - 22} ${dim.height - 36} L ${dim.width - 22} ${dim.height - 22} L ${dim.width - 36} ${dim.height - 22}`} />
            </g>

            {/* Ocean Coastline Waves & Currents */}
            <g stroke={currentTheme.line} strokeWidth="1.2" fill="none" opacity="0.6">
              <path d="M 30 180 Q 90 155 150 180 T 270 180 T 390 180" />
              <path d="M 45 205 Q 105 180 165 205 T 285 205" />
              <path d={`M ${dim.width - 280} ${dim.height - 120} Q ${dim.width - 200} ${dim.height - 140} ${dim.width - 120} ${dim.height - 120} T ${dim.width - 40} ${dim.height - 120}`} />
              <path d={`M ${dim.width - 240} ${dim.height - 95} Q ${dim.width - 170} ${dim.height - 115} ${dim.width - 100} ${dim.height - 95}`} />
            </g>

            {/* Sea Typography Embellishment */}
            <text
              x={Math.round(dim.width * 0.16)}
              y={Math.round(dim.height * 0.88)}
              fontFamily="Cinzel, serif"
              fontSize="12"
              letterSpacing="0.3em"
              fill={currentTheme.oceanText}
              fontStyle="italic"
            >
              MARE INCÓGNITUM
            </text>

            {/* Drawn Lines & Paths (Rivers, Roads, Borders) */}
            {(currentMap.paths || []).map((pth) => {
              if (!pth.points || pth.points.length < 2) return null;
              const d = pth.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

              let stroke = currentTheme.riverColor;
              let strokeWidth = 3;
              let dash = undefined;

              if (pth.type === 'river') {
                stroke = currentTheme.riverColor;
                strokeWidth = 3.5;
              } else if (pth.type === 'road') {
                stroke = currentTheme.roadColor;
                strokeWidth = 2.5;
                dash = '5 4';
              } else if (pth.type === 'border') {
                stroke = currentTheme.borderColor;
                strokeWidth = 2;
                dash = '3 3';
              } else if (pth.type === 'coast') {
                stroke = currentTheme.accentLine;
                strokeWidth = 1.5;
                dash = '8 4';
              }

              return (
                <path
                  key={pth.id}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              );
            })}

            {/* Live drawing preview line */}
            {isDrawing && currentPathPoints.length > 1 && (
              <path
                d={currentPathPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                fill="none"
                stroke={
                  activePathType === 'river'
                    ? currentTheme.riverColor
                    : activePathType === 'road'
                    ? currentTheme.roadColor
                    : activePathType === 'border'
                    ? currentTheme.borderColor
                    : currentTheme.accentLine
                }
                strokeWidth={activePathType === 'river' ? 3.5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
            )}

            {/* Placed Stamps */}
            {(currentMap.stamps || []).map((st) => {
              const isSelected = st.id === selectedStampId;
              const baseSize = 40;
              const size = Math.round(baseSize * (st.scale || 1.0));

              return (
                <g
                  key={st.id}
                  transform={`translate(${st.x - size / 2}, ${st.y - size / 2})`}
                  className="map-stamp-container"
                  onPointerDown={(e) => handleStampPointerDown(e, st)}
                  style={{ cursor: mode === 'select' ? 'grab' : 'pointer' }}
                >
                  {/* Selection indicator ring */}
                  {isSelected && (
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={size / 2 + 6}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}

                  <foreignObject width={size} height={size}>
                    <MapStampIcon type={st.type} size={size} color={currentTheme.stampColor} />
                  </foreignObject>

                  {/* Stamp Label */}
                  {st.label && (
                    <text
                      x={size / 2}
                      y={size + 14}
                      textAnchor="middle"
                      fontFamily="Cormorant Garamond, serif"
                      fontSize={Math.max(12, Math.round(13 * (st.scale || 1.0)))}
                      fontWeight="bold"
                      fill={currentTheme.stampColor}
                      style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}
                    >
                      {st.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Title Cartouche Banner */}
            <g
              transform={`translate(${dim.width / 2 - 160}, 24)`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer Cartouche Border */}
              <rect
                x="0"
                y="0"
                width="320"
                height="46"
                rx="4"
                fill={currentTheme.bg}
                stroke={currentTheme.accentLine}
                strokeWidth="1.5"
                opacity="0.95"
              />
              <rect
                x="3"
                y="3"
                width="314"
                height="40"
                rx="3"
                fill="none"
                stroke={currentTheme.line}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x="160"
                y="29"
                textAnchor="middle"
                fontFamily="Cinzel, serif"
                fontSize="16"
                fontWeight="bold"
                letterSpacing="0.08em"
                fill={currentTheme.stampColor}
              >
                {mapName}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Stamp Editing Inspector */}
      {selectedStamp && (
        <div
          style={{
            marginTop: '16px',
            background: 'var(--panel)',
            border: '1px solid var(--accent)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '680px',
            margin: '16px auto 0',
            boxShadow: 'var(--shadow-md)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
            <MapPin size={16} style={{ color: 'var(--accent)' }} />
            <input
              type="text"
              placeholder="Label this place…"
              value={selectedStamp.label || ''}
              onChange={(e) => handleUpdateSelectedLabel(e.target.value)}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.88rem',
                color: 'var(--ink)',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Size:</span>
            <button
              className="action-btn-secondary"
              onClick={() => handleUpdateSelectedScale(-0.2)}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Make smaller"
            >
              -
            </button>
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{selectedStamp.scale || 1.0}x</span>
            <button
              className="action-btn-secondary"
              onClick={() => handleUpdateSelectedScale(0.2)}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Make larger"
            >
              +
            </button>

            <button
              className="icon-btn"
              onClick={handleDeleteSelected}
              title="Delete stamp"
              style={{ color: 'var(--crit)', marginLeft: '6px' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Title Dialog */}
      {isEditingTitle && (
        <div className="modal-overlay" onClick={() => setIsEditingTitle(false)}>
          <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Map Atlas Title</h3>
            </div>
            <div className="modal-body">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Realm / World Name
              </label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.95rem',
                  fontFamily: 'Cinzel, serif',
                  color: 'var(--ink)',
                }}
              />
            </div>
            <div className="modal-footer">
              <button
                className="action-btn-primary"
                onClick={() => {
                  commitMapUpdate({ ...currentMap, name: mapName });
                  setIsEditingTitle(false);
                }}
              >
                Save Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
