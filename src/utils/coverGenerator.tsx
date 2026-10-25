import React from 'react';

export type CoverPalette =
  | 'clay'
  | 'gold'
  | 'night'
  | 'forest'
  | 'rose'
  | 'ocean'
  | 'obsidian'
  | 'amethyst';

export type CoverMotif =
  | 'landscape'
  | 'citadel'
  | 'heraldry'
  | 'celestial'
  | 'forest'
  | 'clothbound'
  | 'custom';

export type CoverFrame = 'dustjacket' | 'vintage-frame' | 'minimalist' | 'fullbleed';
export type CoverOrnament = 'fleur' | 'stars' | 'swords' | 'diamond' | 'laurel' | 'line' | 'none';

export interface CoverConfig {
  seed?: string;
  palette?: CoverPalette;
  motif?: CoverMotif;
  frame?: CoverFrame;
  fontFamily?: string;
  ornament?: CoverOrnament;
  title?: string;
  subtitle?: string;
  author?: string;
  byline?: string;
  foil?: boolean;
  customImageUrl?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  showDetails?: boolean;
}

export function parseCoverConfig(data?: string | CoverConfig): CoverConfig {
  if (!data) return { palette: 'clay', motif: 'landscape' };
  if (typeof data === 'object') return data;
  try {
    if (data.startsWith('{')) {
      return JSON.parse(data);
    }
  } catch (e) {}
  // Legacy string palette
  return { palette: data as CoverPalette, motif: 'landscape' };
}

// Generate deterministic pseudo-random number from string seed
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const StoryCoverSvg: React.FC<CoverConfig & { coverData?: string | CoverConfig }> = (props) => {
  const parsed = props.coverData ? parseCoverConfig(props.coverData) : {};
  const seed = props.seed || parsed.seed || 'story';
  const palette: CoverPalette = props.palette || parsed.palette || 'clay';
  const motif: CoverMotif = props.motif || parsed.motif || 'landscape';
  const frame: CoverFrame = props.frame || parsed.frame || 'dustjacket';
  const fontFamily = props.fontFamily || parsed.fontFamily || 'Cinzel';
  const ornament: CoverOrnament = props.ornament || parsed.ornament || 'fleur';
  const title = props.title || parsed.title || '';
  const subtitle = props.subtitle !== undefined ? props.subtitle : (parsed.subtitle || '');
  const author = props.author || parsed.author || '';
  const byline = props.byline || parsed.byline || 'Written By';
  const foil = props.foil !== undefined ? props.foil : (parsed.foil ?? true);
  const customImageUrl = props.customImageUrl || parsed.customImageUrl;
  const showDetails = props.showDetails !== undefined ? props.showDetails : true;

  const h = hashSeed(seed + title);

  // Palettes matching fantasy dust jackets & clothbound editions
  const palettes = {
    clay: {
      bg: '#25211c',
      panel: '#353028',
      skyTop: '#d8d3c5',
      skyMid: '#8e8a7c',
      skyBottom: '#555146',
      accent: '#c9a874',
      foil: '#e6c88b',
      text: '#faf6ee',
      muted: '#c4b59f',
      silhouette: '#1d1915',
    },
    gold: {
      bg: '#262013',
      panel: '#3b311e',
      skyTop: '#faedd0',
      skyMid: '#b89f5f',
      skyBottom: '#7a6538',
      accent: '#dfb75c',
      foil: '#ffd700',
      text: '#fffdf5',
      muted: '#d9c693',
      silhouette: '#1f190e',
    },
    night: {
      bg: '#111520',
      panel: '#1b2233',
      skyTop: '#2b364d',
      skyMid: '#161c29',
      skyBottom: '#0e121a',
      accent: '#60a5fa',
      foil: '#93c5fd',
      text: '#f8fafc',
      muted: '#94a3b8',
      silhouette: '#090c12',
    },
    forest: {
      bg: '#141e15',
      panel: '#203021',
      skyTop: '#d5e4d3',
      skyMid: '#698767',
      skyBottom: '#385037',
      accent: '#86efac',
      foil: '#ca8a04',
      text: '#f7fee7',
      muted: '#a3b899',
      silhouette: '#0d150e',
    },
    rose: {
      bg: '#261214',
      panel: '#3c1d20',
      skyTop: '#f7dede',
      skyMid: '#aa6067',
      skyBottom: '#612a30',
      accent: '#f43f5e',
      foil: '#fecdd3',
      text: '#fff1f2',
      muted: '#d4a5aa',
      silhouette: '#190a0c',
    },
    ocean: {
      bg: '#101c24',
      panel: '#1a2e3b',
      skyTop: '#d6ebf7',
      skyMid: '#5b89a6',
      skyBottom: '#2d5066',
      accent: '#38bdf8',
      foil: '#bae6fd',
      text: '#f0f9ff',
      muted: '#93b4c7',
      silhouette: '#0a1217',
    },
    obsidian: {
      bg: '#141416',
      panel: '#222226',
      skyTop: '#d4d4d8',
      skyMid: '#52525b',
      skyBottom: '#27272a',
      accent: '#e4e4e7',
      foil: '#ffffff',
      text: '#fafafa',
      muted: '#a1a1aa',
      silhouette: '#09090b',
    },
    amethyst: {
      bg: '#1d1226',
      panel: '#2f1d3d',
      skyTop: '#ebdcf5',
      skyMid: '#8655a6',
      skyBottom: '#4e2866',
      accent: '#c084fc',
      foil: '#fcd34d',
      text: '#faf5ff',
      muted: '#c4a6db',
      silhouette: '#130919',
    },
  };

  const pal = palettes[palette] || palettes.clay;
  const foilGrad = foil ? `url(#foil-grad-${palette})` : pal.foil;

  // Render Artwork motif based on selection
  const renderArtwork = () => {
    if (customImageUrl && motif === 'custom') {
      return (
        <image
          href={customImageUrl}
          x="0"
          y="0"
          width="400"
          height="600"
          preserveAspectRatio="xMidYMid slice"
        />
      );
    }

    switch (motif) {
      case 'citadel':
        return (
          <g>
            {/* Sky Background */}
            <rect width="400" height="600" fill={`url(#sky-grad-${palette})`} />

            {/* Stars */}
            <g fill={pal.foil} opacity="0.65">
              {[
                [60, 80, 1.5],
                [110, 130, 2],
                [160, 70, 1],
                [240, 95, 2],
                [310, 65, 1.5],
                [350, 140, 2],
                [80, 200, 1],
                [330, 220, 1.5],
                [200, 150, 2.5],
              ].map(([sx, sy, sr], i) => (
                <circle key={i} cx={sx} cy={sy} r={sr} />
              ))}
            </g>

            {/* Full Moon */}
            <circle cx="290" cy="160" r="38" fill={pal.skyTop} opacity="0.9" />
            <circle cx="290" cy="160" r="46" fill="none" stroke={pal.foil} strokeWidth="1" opacity="0.5" strokeDasharray="3 3" />

            {/* Distant Mountain Peaks */}
            <polygon points="-20,380 90,260 210,380" fill={pal.skyBottom} opacity="0.8" />
            <polygon points="170,380 280,240 420,380" fill={pal.skyBottom} opacity="0.9" />

            {/* Citadel & Spires */}
            <path
              d="
                M 120 460
                L 120 320 L 140 290 L 160 320 L 160 460
                L 180 460 L 180 250 L 200 210 L 220 250 L 220 460
                L 240 460 L 240 280 L 260 250 L 280 280 L 280 460
                Z
              "
              fill={pal.silhouette}
            />
            {/* Spire cross / finials */}
            <line x1="200" y1="210" x2="200" y2="195" stroke={pal.foil} strokeWidth="2.5" />
            <line x1="195" y1="202" x2="205" y2="202" stroke={pal.foil} strokeWidth="2" />

            {/* Lighted arched windows */}
            <rect x="195" y="270" width="10" height="20" rx="5" fill={pal.foil} opacity="0.85" />
            <rect x="135" y="340" width="8" height="16" rx="4" fill={pal.foil} opacity="0.75" />
            <rect x="255" y="320" width="8" height="16" rx="4" fill={pal.foil} opacity="0.75" />

            {/* Foreground cliff & rampart */}
            <path d="M -10 460 Q 200 430 410 460 L 410 610 L -10 610 Z" fill={pal.bg} />
          </g>
        );

      case 'heraldry':
        return (
          <g>
            <rect width="400" height="600" fill={pal.bg} />
            {/* Sunburst rays */}
            <g stroke={pal.panel} strokeWidth="1.5" opacity="0.6">
              {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
                <line
                  key={deg}
                  x1="200"
                  y1="300"
                  x2={200 + 260 * Math.cos((deg * Math.PI) / 180)}
                  y2={300 + 260 * Math.sin((deg * Math.PI) / 180)}
                />
              ))}
            </g>

            {/* Ornate Concentric Rings */}
            <circle cx="200" cy="300" r="140" fill="none" stroke={pal.panel} strokeWidth="6" />
            <circle cx="200" cy="300" r="126" fill="none" stroke={pal.foil} strokeWidth="2" strokeDasharray="6 3" />
            <circle cx="200" cy="300" r="116" fill="none" stroke={pal.foil} strokeWidth="1" />

            {/* Crossed Swords */}
            <g stroke={pal.foil} strokeWidth="4" strokeLinecap="round">
              <line x1="120" y1="220" x2="280" y2="380" />
              <line x1="280" y1="220" x2="120" y2="380" />
              {/* Guards & Pommels */}
              <line x1="135" y1="210" x2="155" y2="230" strokeWidth="5" />
              <line x1="265" y1="210" x2="245" y2="230" strokeWidth="5" />
            </g>

            {/* Center Royal Shield */}
            <path
              d="M 160 250 L 240 250 L 240 310 Q 240 360 200 375 Q 160 360 160 310 Z"
              fill={pal.panel}
              stroke={pal.foil}
              strokeWidth="3.5"
            />
            {/* Crown on top of shield */}
            <polygon points="175,248 185,225 200,240 215,225 225,248" fill={pal.foil} />
            <circle cx="200" cy="235" r="2.5" fill={pal.bg} />

            {/* Emblem inside shield (Rampant Dragon / Beast) */}
            <path
              d="M 188 320 Q 200 290 212 300 Q 218 315 205 330 Q 192 345 200 355"
              fill="none"
              stroke={pal.foil}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        );

      case 'celestial':
        return (
          <g>
            <rect width="400" height="600" fill={pal.bg} />
            {/* Nebula cloud */}
            <circle cx="200" cy="290" r="160" fill={pal.panel} opacity="0.6" filter="blur(30px)" />

            {/* Armillary Astronomical Rings */}
            <circle cx="200" cy="290" r="130" fill="none" stroke={pal.foil} strokeWidth="1.5" />
            <ellipse cx="200" cy="290" rx="130" ry="50" fill="none" stroke={pal.foil} strokeWidth="1.5" transform="rotate(-25, 200, 290)" />
            <ellipse cx="200" cy="290" rx="130" ry="50" fill="none" stroke={pal.foil} strokeWidth="1.5" transform="rotate(25, 200, 290)" />

            {/* Moon Phase Central Globe */}
            <circle cx="200" cy="290" r="42" fill={pal.skyTop} />
            <path d="M 200 248 A 42 42 0 0 1 200 332 A 28 42 0 0 0 200 248" fill={pal.silhouette} />

            {/* Constellation lines */}
            <g stroke={pal.foil} strokeWidth="1" opacity="0.6">
              <line x1="80" y1="180" x2="130" y2="150" />
              <line x1="130" y1="150" x2="170" y2="190" />
              <line x1="230" y1="390" x2="270" y2="430" />
              <line x1="270" y1="430" x2="330" y2="410" />
            </g>

            {/* Stars */}
            <g fill={pal.foil}>
              {[
                [80, 180, 3],
                [130, 150, 2.5],
                [170, 190, 2],
                [230, 390, 2],
                [270, 430, 3],
                [330, 410, 2.5],
                [90, 380, 1.5],
                [320, 170, 2],
              ].map(([cx, cy, cr], i) => (
                <circle key={i} cx={cx} cy={cy} r={cr} />
              ))}
            </g>
          </g>
        );

      case 'forest':
        return (
          <g>
            <rect width="400" height="600" fill={`url(#sky-grad-${palette})`} />
            {/* Luminous Moon behind canopy */}
            <circle cx="200" cy="210" r="50" fill={pal.skyTop} opacity="0.85" />

            {/* Silhouetted Ancient Trees */}
            <g fill={pal.silhouette}>
              {/* Left Trunk & Branches */}
              <path d="M -20 600 L 40 420 Q 70 320 30 200 L 10 190 Q 60 260 80 340 L 120 250 L 130 260 L 95 360 L 130 440 L 160 600 Z" />
              {/* Right Trunk & Branches */}
              <path d="M 420 600 L 360 400 Q 320 300 360 180 L 380 190 Q 330 250 310 330 L 270 230 L 260 240 L 295 350 L 260 450 L 240 600 Z" />
            </g>

            {/* Woodland Floor */}
            <path d="M -10 520 Q 200 480 410 520 L 410 610 L -10 610 Z" fill={pal.bg} />

            {/* Glowing Fireflies / Fairy Lights */}
            <g fill={pal.foil}>
              {[
                [140, 380, 2.5],
                [170, 340, 2],
                [220, 360, 3],
                [250, 320, 2],
                [190, 410, 2.5],
                [270, 390, 1.8],
                [120, 440, 2],
              ].map(([fx, fy, fr], i) => (
                <circle key={i} cx={fx} cy={fy} r={fr} filter="drop-shadow(0 0 4px #ffd700)" />
              ))}
            </g>
          </g>
        );

      case 'clothbound':
        return (
          <g>
            {/* Leathercloth Texture fill */}
            <rect width="400" height="600" fill={pal.bg} />
            <rect x="20" y="20" width="360" height="560" fill={pal.panel} rx="4" />

            {/* Gold foil embossed borders */}
            <rect x="28" y="28" width="344" height="544" fill="none" stroke={pal.foil} strokeWidth="2" rx="3" />
            <rect x="34" y="34" width="332" height="532" fill="none" stroke={pal.foil} strokeWidth="1" strokeDasharray="4 3" />

            {/* Ornate Corner Filigree */}
            <g stroke={pal.foil} strokeWidth="1.5" fill="none">
              {/* Top Left */}
              <path d="M 42 70 Q 42 42 70 42" />
              <path d="M 48 64 Q 48 48 64 48" />
              {/* Top Right */}
              <path d="M 358 70 Q 358 42 330 42" />
              <path d="M 352 64 Q 352 48 336 48" />
              {/* Bottom Left */}
              <path d="M 42 530 Q 42 558 70 558" />
              <path d="M 48 536 Q 48 552 64 552" />
              {/* Bottom Right */}
              <path d="M 358 530 Q 358 558 330 558" />
              <path d="M 352 536 Q 352 552 336 552" />
            </g>

            {/* Embossed Center Medallion */}
            <circle cx="200" cy="300" r="64" fill={pal.bg} stroke={pal.foil} strokeWidth="2" />
            <circle cx="200" cy="300" r="56" fill="none" stroke={pal.foil} strokeWidth="1" strokeDasharray="3 2" />
            {/* Central Quill & Stars */}
            <path d="M 180 320 Q 200 270 220 280 Q 210 310 180 320 Z" fill={pal.foil} />
            <circle cx="200" cy="265" r="2.5" fill={pal.foil} />
            <circle cx="200" cy="335" r="2.5" fill={pal.foil} />
          </g>
        );

      case 'landscape':
      default:
        return (
          <g>
            <rect width="400" height="600" fill={`url(#sky-grad-${palette})`} />

            {/* Sun / Moon */}
            <circle cx="200" cy="180" r="36" fill={pal.skyTop} />
            <circle cx="200" cy="180" r="48" fill="none" stroke={pal.foil} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />

            {/* Birds */}
            <g stroke={pal.silhouette} strokeWidth="2" fill="none" opacity="0.7">
              <path d="M 120 160 Q 128 152 136 160 Q 144 152 152 160" />
              <path d="M 150 140 Q 156 134 162 140 Q 168 134 174 140" />
            </g>

            {/* Layer 1 Mountains */}
            <polygon points="-20,380 90,260 210,380" fill={pal.skyBottom} opacity="0.85" />
            <polygon points="160,380 270,250 420,380" fill={pal.skyBottom} opacity="0.9" />

            {/* Layer 2 Foothills */}
            <path d="M -20 440 Q 110 360 240 430 Q 340 370 420 440 L 420 610 L -20 610 Z" fill={pal.panel} />

            {/* Pilgrim's Road */}
            <path d="M 175 600 Q 200 510 185 450 Q 195 440 205 450 Q 215 510 225 600 Z" fill={pal.accent} opacity="0.9" />

            {/* Foreground Edge */}
            <path d="M -10 520 Q 200 480 410 520 L 410 610 L -10 610 Z" fill={pal.silhouette} opacity="0.9" />
          </g>
        );
    }
  };

  // Render decorative ornament divider
  const renderOrnament = () => {
    switch (ornament) {
      case 'fleur':
        return (
          <g fill={foilGrad}>
            <path d="M 200 0 C 196 6 193 10 190 14 C 182 12 176 16 178 22 C 182 24 188 20 193 17 C 195 24 198 28 200 30 C 202 28 205 24 207 17 C 212 20 218 24 222 22 C 224 16 218 12 210 14 C 207 10 204 6 200 0 Z" transform="translate(0, -15) scale(0.7) translate(85, 0)" />
            <circle cx="200" cy="0" r="2" />
          </g>
        );
      case 'stars':
        return (
          <g fill={foilGrad}>
            <polygon points="200,-8 203,-2 209,0 203,2 200,8 197,2 191,0 197,-2" />
            <circle cx="180" cy="0" r="1.5" />
            <circle cx="220" cy="0" r="1.5" />
          </g>
        );
      case 'swords':
        return (
          <g stroke={foilGrad} strokeWidth="1.5" fill="none">
            <line x1="185" y1="-5" x2="215" y2="5" />
            <line x1="215" y1="-5" x2="185" y2="5" />
            <circle cx="200" cy="0" r="2" fill={foilGrad} />
          </g>
        );
      case 'diamond':
        return (
          <g fill={foilGrad}>
            <polygon points="200,-5 206,0 200,5 194,0" />
            <line x1="160" y1="0" x2="190" y2="0" stroke={foilGrad} strokeWidth="1" />
            <line x1="210" y1="0" x2="240" y2="0" stroke={foilGrad} strokeWidth="1" />
          </g>
        );
      case 'laurel':
        return (
          <g fill={foilGrad} opacity="0.9">
            <path d="M 188 0 Q 194 -6 200 0 Q 194 6 188 0" />
            <path d="M 212 0 Q 206 -6 200 0 Q 206 6 212 0" />
            <circle cx="200" cy="0" r="2" />
          </g>
        );
      case 'line':
        return <line x1="150" y1="0" x2="250" y2="0" stroke={foilGrad} strokeWidth="1.5" />;
      case 'none':
      default:
        return null;
    }
  };

  return (
    <svg
      id="art-board-cover-svg"
      viewBox="0 0 400 600"
      width={props.width || '100%'}
      height={props.height || '100%'}
      className={props.className || ''}
      style={{ display: 'block', borderRadius: '6px', overflow: 'hidden' }}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id={`sky-grad-${palette}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.skyTop} />
          <stop offset="50%" stopColor={pal.skyMid} />
          <stop offset="100%" stopColor={pal.skyBottom} />
        </linearGradient>

        {/* Shimmering Gold Foil Gradient */}
        <linearGradient id={`foil-grad-${palette}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="25%" stopColor="#fff2a3" />
          <stop offset="50%" stopColor="#c59b27" />
          <stop offset="75%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>

        {/* Dark Vignette shading for dustjacket */}
        <linearGradient id="vignette-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.bg} stopOpacity="0.95" />
          <stop offset="70%" stopColor={pal.bg} stopOpacity="0.8" />
          <stop offset="100%" stopColor={pal.bg} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="vignette-bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={pal.bg} stopOpacity="0.95" />
          <stop offset="70%" stopColor={pal.bg} stopOpacity="0.85" />
          <stop offset="100%" stopColor={pal.bg} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* BASE ARTWORK */}
      {renderArtwork()}

      {/* FRAME OVERLAYS */}
      {frame === 'dustjacket' && (
        <>
          {/* Top header shading */}
          <rect x="0" y="0" width="400" height="220" fill="url(#vignette-top)" />
          {/* Bottom footer shading */}
          <rect x="0" y="440" width="400" height="160" fill="url(#vignette-bottom)" />
          {/* Outer hairline border */}
          <rect x="14" y="14" width="372" height="572" fill="none" stroke={foilGrad} strokeWidth="1" opacity="0.65" />
        </>
      )}

      {frame === 'vintage-frame' && (
        <g stroke={foilGrad} fill="none">
          <rect x="16" y="16" width="368" height="568" strokeWidth="2.5" />
          <rect x="22" y="22" width="356" height="556" strokeWidth="1" strokeDasharray="4 3" />
          {/* Corner flourishes */}
          <path d="M 28 44 L 28 28 L 44 28" strokeWidth="2" />
          <path d="M 372 44 L 372 28 L 356 28" strokeWidth="2" />
          <path d="M 28 556 L 28 572 L 44 572" strokeWidth="2" />
          <path d="M 372 556 L 372 572 L 356 572" strokeWidth="2" />
        </g>
      )}

      {frame === 'minimalist' && (
        <rect x="24" y="24" width="352" height="552" fill="none" stroke={foilGrad} strokeWidth="1" opacity="0.5" />
      )}

      {/* TYPOGRAPHY & EMBELLISHMENTS */}
      {showDetails && (
        <g>
          {/* Subtitle / Series line */}
          {subtitle && (
            <text
              x="200"
              y="58"
              textAnchor="middle"
              fontFamily="Cinzel, serif"
              fontSize="10.5"
              fontWeight="600"
              letterSpacing="0.28em"
              fill={pal.muted}
            >
              {subtitle.toUpperCase()}
            </text>
          )}

          {/* Top Divider Ornament */}
          <g transform="translate(0, 78)">{renderOrnament()}</g>

          {/* Book Title */}
          {title && (
            <g transform="translate(200, 126)">
              {/* Drop shadow / glow */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily={fontFamily}
                fontSize={title.length > 24 ? '21' : title.length > 15 ? '25' : '29'}
                fontWeight="700"
                letterSpacing="0.06em"
                fill={pal.bg}
                stroke={pal.bg}
                strokeWidth="4"
                opacity="0.8"
              >
                {title.toUpperCase()}
              </text>
              {/* Foil Title */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily={fontFamily}
                fontSize={title.length > 24 ? '21' : title.length > 15 ? '25' : '29'}
                fontWeight="700"
                letterSpacing="0.06em"
                fill={pal.text}
              >
                {title.toUpperCase()}
              </text>
            </g>
          )}

          {/* Bottom Author Section */}
          {author && (
            <g transform="translate(200, 520)">
              {/* Byline */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily="Cinzel, serif"
                fontSize="9"
                letterSpacing="0.3em"
                fill={pal.muted}
              >
                {byline.toUpperCase()}
              </text>

              {/* Bottom Divider Ornament */}
              <g transform="translate(0, 14)">{renderOrnament()}</g>

              {/* Author Name */}
              <text
                x="0"
                y="38"
                textAnchor="middle"
                fontFamily={fontFamily}
                fontSize="18"
                fontWeight="600"
                letterSpacing="0.1em"
                fill={pal.text}
              >
                {author.toUpperCase()}
              </text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
