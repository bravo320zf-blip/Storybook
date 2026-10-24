import React, { useState, useRef } from 'react';
import {
  Compass,
  Download,
  Trash2,
  Cloud,
  Move,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { WorldMap, MapStamp, MapAspect, MapStyle } from '../types';
import { MapStampIcon } from '../utils/mapStamps';

interface MapMakerViewProps {
  maps: WorldMap[];
  onUpdateMaps: (updatedMaps: WorldMap[]) => void;
  onSyncDrive: () => Promise<void>;
}

const STAMP_TYPES = [
  { type: 'castle', label: 'Castle' },
  { type: 'city', label: 'Walled City' },
  { type: 'tower', label: 'Wizard’s Tower' },
  { type: 'tavern', label: 'Tavern' },
  { type: 'mountain', label: 'Mountains' },
  { type: 'tree', label: 'Forest' },
  { type: 'dragon', label: 'Dragon' },
  { type: 'serpent', label: 'Sea Serpent' },
  { type: 'compass', label: 'Compass' },
];

export const MapMakerView: React.FC<MapMakerViewProps> = ({
  maps,
  onUpdateMaps,
  onSyncDrive,
}) => {
  const currentMap = maps[0] || {
    id: 'map-1',
    name: 'The Kingdoms of Varrow',
    kind: 'realm',
    style: 'wash',
    aspect: 'screen',
    stamps: [],
    realms: [],
    updatedAt: Date.now(),
  };

  const [activeStampType, setActiveStampType] = useState<string>('castle');
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [style, setStyle] = useState<MapStyle>(currentMap.style);
  const [aspect, setAspect] = useState<MapAspect>(currentMap.aspect);
  const [mapName, setMapName] = useState(currentMap.name);
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Aspect ratio dimensions
  const aspectDimensions: Record<MapAspect, { width: number; height: number }> = {
    screen: { width: 720, height: 480 },
    book: { width: 500, height: 750 },
    poster: { width: 540, height: 720 },
    square: { width: 600, height: 600 },
    wide: { width: 800, height: 450 },
  };

  const dim = aspectDimensions[aspect];

  // Map background colors based on style
  const bgStyles: Record<MapStyle, { bg: string; line: string; stampColor: string }> = {
    wash: { bg: '#f4ede2', line: '#c8b9a2', stampColor: '#26221d' },
    night: { bg: '#1c2128', line: '#2d3748', stampColor: '#e2e8f0' },
    parchment: { bg: '#e8dcbe', line: '#baa788', stampColor: '#362b20' },
  };

  const currentTheme = bgStyles[style];

  // Click on canvas to drop the active stamp
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-stamp-container')) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newStamp: MapStamp = {
      id: `stamp-${Date.now()}`,
      type: activeStampType,
      x,
      y,
      scale: 1,
      label: STAMP_TYPES.find((s) => s.type === activeStampType)?.label,
    };

    const updatedMap: WorldMap = {
      ...currentMap,
      name: mapName,
      style,
      aspect,
      stamps: [...currentMap.stamps, newStamp],
      updatedAt: Date.now(),
    };

    onUpdateMaps([updatedMap]);
    setSelectedStampId(newStamp.id);
  };

  const handleDeleteStamp = (stampId: string) => {
    const updatedMap: WorldMap = {
      ...currentMap,
      stamps: currentMap.stamps.filter((s) => s.id !== stampId),
      updatedAt: Date.now(),
    };
    onUpdateMaps([updatedMap]);
    setSelectedStampId(null);
  };

  const handleUpdateLabel = (stampId: string, label: string) => {
    const updatedMap: WorldMap = {
      ...currentMap,
      stamps: currentMap.stamps.map((s) => (s.id === stampId ? { ...s, label } : s)),
    };
    onUpdateMaps([updatedMap]);
  };

  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      await onSyncDrive();
      alert('Map saved to Google Drive!');
    } catch (err) {
      alert('Failed to sync map to Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('world-map-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName.replace(/\s+/g, '_')}_Map.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Map Maker
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Hand-drawn fantasy atlas plates with castles, beasts, towers, and realm borders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Style Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`chip ${style === 'wash' ? 'active' : ''}`}
              onClick={() => setStyle('wash')}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              Inkling Wash
            </button>
            <button
              className={`chip ${style === 'night' ? 'active' : ''}`}
              onClick={() => setStyle('night')}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              Gilded Night
            </button>
            <button
              className={`chip ${style === 'parchment' ? 'active' : ''}`}
              onClick={() => setStyle('parchment')}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              Parchment
            </button>
          </div>

          {/* Sync to Drive */}
          <button className="action-btn-secondary" onClick={handleSyncDrive} disabled={isSyncing}>
            <Cloud size={14} style={{ color: '#4285F4' }} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Drive'}</span>
          </button>

          {/* Download SVG */}
          <button className="action-btn-primary" onClick={handleDownloadSvg}>
            <Download size={14} />
            <span>Download Plate</span>
          </button>
        </div>
      </div>

      {/* Stamp Toolbar */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '20px',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
          Stamp Tool:
        </span>
        {STAMP_TYPES.map((st) => (
          <button
            key={st.type}
            onClick={() => setActiveStampType(st.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: activeStampType === st.type ? 'var(--accent-soft)' : 'transparent',
              border: activeStampType === st.type ? '1px solid var(--accent)' : '1px solid transparent',
              cursor: 'pointer',
              color: 'var(--ink)',
              fontSize: '0.86rem',
              fontWeight: 500,
            }}
          >
            <MapStampIcon type={st.type} size={20} color="var(--ink)" />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas Area */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            width: `${dim.width}px`,
            height: `${dim.height}px`,
            backgroundColor: currentTheme.bg,
            border: `2px solid ${currentTheme.line}`,
            borderRadius: '8px',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'crosshair',
            overflow: 'hidden',
          }}
        >
          {/* SVG Map Plate Rendering */}
          <svg
            id="world-map-svg"
            width={dim.width}
            height={dim.height}
            viewBox={`0 0 ${dim.width} ${dim.height}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {/* Background Paper Tint */}
            <rect width="100%" height="100%" fill={currentTheme.bg} />

            {/* Vintage Border Inset */}
            <rect
              x="12"
              y="12"
              width={dim.width - 24}
              height={dim.height - 24}
              fill="none"
              stroke={currentTheme.line}
              strokeWidth="2"
            />
            <rect
              x="18"
              y="18"
              width={dim.width - 36}
              height={dim.height - 36}
              fill="none"
              stroke={currentTheme.line}
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Ocean Coastline waves */}
            <g stroke={currentTheme.line} strokeWidth="1" fill="none" opacity="0.6">
              <path d="M 30 180 Q 80 160 130 180 T 230 180 T 330 180" />
              <path d="M 40 210 Q 90 190 140 210 T 240 210" />
              <path d="M 20 240 Q 70 220 120 240" />
            </g>

            {/* Title Banner */}
            <g>
              <rect
                x={dim.width / 2 - 140}
                y="26"
                width="280"
                height="44"
                fill={currentTheme.bg}
                stroke={currentTheme.line}
                strokeWidth="1.5"
              />
              <text
                x={dim.width / 2}
                y="54"
                textAnchor="middle"
                fontFamily="Cinzel, serif"
                fontSize="18"
                fontWeight="bold"
                letterSpacing="0.1em"
                fill={currentTheme.stampColor}
              >
                {mapName}
              </text>
            </g>

            {/* Placed Stamps */}
            {currentMap.stamps.map((st) => (
              <g
                key={st.id}
                transform={`translate(${st.x - 20}, ${st.y - 20})`}
                className="map-stamp-container"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStampId(st.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <foreignObject width="40" height="40">
                  <MapStampIcon type={st.type} size={36} color={currentTheme.stampColor} />
                </foreignObject>

                {/* Stamp Label */}
                {st.label && (
                  <text
                    x="20"
                    y="46"
                    textAnchor="middle"
                    fontFamily="Cormorant Garamond, serif"
                    fontSize="13"
                    fontWeight="bold"
                    fill={currentTheme.stampColor}
                  >
                    {st.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Selected Stamp Editing Overlay */}
      {selectedStampId && (
        <div
          style={{
            marginTop: '20px',
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '500px',
            margin: '20px auto 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--accent)' }} />
            <input
              type="text"
              placeholder="Label this place..."
              value={currentMap.stamps.find((s) => s.id === selectedStampId)?.label || ''}
              onChange={(e) => handleUpdateLabel(selectedStampId, e.target.value)}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <button
            className="icon-btn"
            onClick={() => handleDeleteStamp(selectedStampId)}
            title="Remove stamp"
            style={{ color: 'var(--crit)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
