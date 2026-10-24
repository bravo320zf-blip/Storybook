import React from 'react';

interface CoverProps {
  seed?: string;
  palette?: 'clay' | 'gold' | 'night' | 'forest' | 'rose' | 'ocean';
  title?: string;
  showTitle?: boolean;
  className?: string;
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

export const StoryCoverSvg: React.FC<CoverProps> = ({
  seed = 'story',
  palette = 'clay',
  title = '',
  showTitle = false,
  className = '',
}) => {
  const h = hashSeed(seed);

  // Palettes matching Inkling landscape art
  const palettes = {
    clay: {
      skyTop: '#E5E2DB',
      skyMid: '#888679',
      skyBottom: '#524F46',
      sunGlow: '#9A7A4C',
      sun: '#E5E2DB',
      mountains: '#524F46',
      foreground: '#9A7A4C',
      river: '#E5E2DB',
    },
    gold: {
      skyTop: '#EBE2C9',
      skyMid: '#AC9760',
      skyBottom: '#766237',
      sunGlow: '#9C7339',
      sun: '#EBE2C9',
      mountains: '#766237',
      foreground: '#9C7339',
      river: '#EBE2C9',
    },
    night: {
      skyTop: '#252a36',
      skyMid: '#161920',
      skyBottom: '#0e1015',
      sunGlow: '#4a607a',
      sun: '#dce6f0',
      mountains: '#1b202c',
      foreground: '#2e3749',
      river: '#8ea8c4',
    },
    forest: {
      skyTop: '#dfe8de',
      skyMid: '#7a8c79',
      skyBottom: '#485747',
      sunGlow: '#a8ba9a',
      sun: '#f2f7f0',
      mountains: '#3f4f3e',
      foreground: '#5a6e59',
      river: '#d2ded0',
    },
    rose: {
      skyTop: '#f2e4e2',
      skyMid: '#ab7e80',
      skyBottom: '#664547',
      sunGlow: '#d48a84',
      sun: '#fcf3f2',
      mountains: '#573739',
      foreground: '#8a5c60',
      river: '#edd6d4',
    },
    ocean: {
      skyTop: '#deebf2',
      skyMid: '#6a8b9c',
      skyBottom: '#344e5c',
      sunGlow: '#70acc9',
      sun: '#f0f7fb',
      mountains: '#2b414f',
      foreground: '#456678',
      river: '#cbe0ed',
    },
  };

  const selectedPalette = palettes[palette] || palettes.clay;
  const sunX = 80 + (h % 180);
  const sunY = 35 + (h % 30);
  const sunR = 18 + (h % 10);

  const gradId = `sky-${h}`;
  const glowId = `glow-${h}`;

  return (
    <svg
      viewBox="0 0 340 166"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={selectedPalette.skyTop} />
          <stop offset="48%" stopColor={selectedPalette.skyMid} />
          <stop offset="100%" stopColor={selectedPalette.skyBottom} stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={selectedPalette.sunGlow} stopOpacity="0.6" />
          <stop offset="100%" stopColor={selectedPalette.skyMid} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect width="340" height="166" fill={`url(#${gradId})`} />

      {/* Celestial body (Sun/Moon) */}
      <circle cx={sunX} cy={sunY} r={sunR * 2.2} fill={`url(#${glowId})`} />
      <circle cx={sunX} cy={sunY} r={sunR} fill={selectedPalette.sun} opacity="0.95" />

      {/* Distant Clouds */}
      <g fill={selectedPalette.sun} opacity="0.35">
        <ellipse cx={(sunX + 90) % 300} cy={sunY + 10} rx="26" ry="6" />
        <ellipse cx={(sunX - 70 + 340) % 300} cy={sunY - 8} rx="34" ry="7" />
      </g>

      {/* Distant Mountain Range */}
      <path
        d="M0 98 Q 80 82 170 94 T 340 92 L 340 166 L 0 166 Z"
        fill={selectedPalette.mountains}
        opacity="0.6"
      />

      {/* River or Road */}
      <path
        d={`M ${sunX - 10} 98 C ${sunX - 30} 120, ${sunX + 40} 136, ${sunX - 20} 166 L ${
          sunX + 30
        } 166 C ${sunX + 50} 136, ${sunX + 10} 118, ${sunX} 98 Z`}
        fill={selectedPalette.river}
        opacity="0.5"
      />

      {/* Foreground Mountain Ridges */}
      <path
        d="M0 118 Q 95 106 175 118 T 340 112 L 340 166 L 0 166 Z"
        fill={selectedPalette.foreground}
        opacity="0.55"
      />

      {/* Flying Birds */}
      <g stroke="rgba(40,35,30,0.4)" strokeWidth="1.2" fill="none">
        <path d="M 60 48 Q 65 44 70 48 Q 75 44 80 48" />
        <path d="M 85 40 Q 89 37 93 40 Q 97 37 101 40" />
      </g>

      {/* Optional Title Overlay */}
      {showTitle && title && (
        <g>
          <rect y="115" width="340" height="51" fill="rgba(20,18,15,0.7)" />
          <text
            x="170"
            y="146"
            textAnchor="middle"
            fill="#f5f0e8"
            fontFamily="Cormorant Garamond, serif"
            fontSize="15"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            {title.length > 32 ? title.slice(0, 30) + '…' : title}
          </text>
        </g>
      )}
    </svg>
  );
};
