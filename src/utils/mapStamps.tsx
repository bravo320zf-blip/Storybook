import React from 'react';

interface StampProps {
  type: string;
  size?: number;
  color?: string;
  className?: string;
}

export const MapStampIcon: React.FC<StampProps> = ({
  type,
  size = 28,
  color = '#26221d',
  className = '',
}) => {
  switch (type) {
    case 'castle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <rect x="25" y="45" width="50" height="45" fill={color} />
          <rect x="15" y="30" width="18" height="60" fill={color} />
          <rect x="67" y="30" width="18" height="60" fill={color} />
          <polygon points="12,30 24,10 36,30" fill={color} />
          <polygon points="64,30 76,10 88,30" fill={color} />
          <rect x="38" y="25" width="24" height="20" fill={color} />
          {/* Gate */}
          <path d="M 42 90 A 8 8 0 0 1 58 90 Z" fill="#fffdf9" />
          {/* Windows */}
          <rect x="21" y="42" width="6" height="10" rx="3" fill="#fffdf9" />
          <rect x="73" y="42" width="6" height="10" rx="3" fill="#fffdf9" />
        </svg>
      );

    case 'city':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="15,60 25,40 35,60" fill={color} />
          <rect x="18" y="60" width="14" height="30" fill={color} />
          <polygon points="35,50 48,25 61,50" fill={color} />
          <rect x="38" y="50" width="20" height="40" fill={color} />
          <polygon points="62,55 75,35 88,55" fill={color} />
          <rect x="66" y="55" width="18" height="35" fill={color} />
          <rect x="10" y="78" width="80" height="14" fill={color} opacity="0.85" />
          <path d="M 44 92 A 6 6 0 0 1 56 92 Z" fill="#fffdf9" />
        </svg>
      );

    case 'tower':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <path d="M 38 90 L 42 35 L 58 35 L 62 90 Z" fill={color} />
          <polygon points="36,35 50,10 64,35" fill={color} />
          <circle cx="50" cy="8" r="4" fill={color} />
          <circle cx="50" cy="45" r="4" fill="#fffdf9" />
          <rect x="47" y="60" width="6" height="12" rx="3" fill="#fffdf9" />
          <path d="M 46 90 A 4 4 0 0 1 54 90 Z" fill="#fffdf9" />
        </svg>
      );

    case 'tavern':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="20,50 50,22 80,50" fill={color} />
          <rect x="25" y="50" width="50" height="40" fill={color} />
          <rect x="65" y="20" width="8" height="18" fill={color} />
          <path d="M 44 90 A 6 6 0 0 1 56 90 Z" fill="#fffdf9" />
          <rect x="30" y="60" width="8" height="10" fill="#fffdf9" />
          <rect x="62" y="60" width="8" height="10" fill="#fffdf9" />
          <line x1="75" y1="46" x2="88" y2="46" stroke={color} strokeWidth="3" />
          <rect x="80" y="48" width="10" height="12" fill={color} />
        </svg>
      );

    case 'fort':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="20,40 50,20 80,40" fill={color} />
          <rect x="24" y="40" width="52" height="48" fill={color} />
          <rect x="14" y="52" width="16" height="36" fill={color} />
          <rect x="70" y="52" width="16" height="36" fill={color} />
          <polygon points="12,52 22,38 32,52" fill={color} />
          <polygon points="68,52 78,38 88,52" fill={color} />
          <path d="M 44 88 A 6 6 0 0 1 56 88 Z" fill="#fffdf9" />
        </svg>
      );

    case 'port':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          {/* Pier */}
          <rect x="15" y="68" width="70" height="8" fill={color} />
          <line x1="25" y1="76" x2="25" y2="92" stroke={color} strokeWidth="4" />
          <line x1="50" y1="76" x2="50" y2="92" stroke={color} strokeWidth="4" />
          <line x1="75" y1="76" x2="75" y2="92" stroke={color} strokeWidth="4" />
          {/* Lighthouse / Port Tower */}
          <path d="M 40 68 L 44 25 L 56 25 L 60 68 Z" fill={color} />
          <polygon points="40,25 50,12 60,25" fill={color} />
          <circle cx="50" cy="36" r="3" fill="#fffdf9" />
        </svg>
      );

    case 'ruins':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          {/* Fallen pillars */}
          <rect x="20" y="35" width="10" height="50" fill={color} />
          <rect x="18" y="30" width="14" height="6" fill={color} />
          <rect x="45" y="48" width="10" height="37" fill={color} />
          <rect x="70" y="38" width="10" height="47" fill={color} />
          <rect x="68" y="33" width="14" height="6" fill={color} />
          <line x1="12" y1="85" x2="88" y2="85" stroke={color} strokeWidth="5" />
          <rect x="35" y="60" width="22" height="6" transform="rotate(25, 35, 60)" fill={color} />
        </svg>
      );

    case 'mountain':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="50,18 15,85 85,85" fill={color} />
          <polygon points="50,18 38,44 50,40 62,44" fill="#fffdf9" opacity="0.85" />
          <polygon points="72,38 46,88 98,88" fill={color} opacity="0.9" />
        </svg>
      );

    case 'hills':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <path d="M 10 82 Q 35 40 60 82 Z" fill={color} opacity="0.9" />
          <path d="M 45 82 Q 70 48 95 82 Z" fill={color} opacity="0.8" />
        </svg>
      );

    case 'tree':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="40" r="24" fill={color} />
          <circle cx="38" cy="46" r="16" fill={color} />
          <circle cx="62" cy="46" r="16" fill={color} />
          <rect x="46" y="58" width="8" height="32" fill={color} />
        </svg>
      );

    case 'pine':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="50,16 34,42 66,42" fill={color} />
          <polygon points="50,34 30,62 70,62" fill={color} />
          <polygon points="50,52 26,82 74,82" fill={color} />
          <rect x="46" y="82" width="8" height="12" fill={color} />
        </svg>
      );

    case 'volcano':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="50,36 15,85 85,85" fill={color} />
          {/* Crater */}
          <ellipse cx="50" cy="36" rx="10" ry="4" fill="#b91c1c" />
          {/* Smoke plumes */}
          <path d="M 47 32 Q 42 18 52 10 Q 60 18 53 32" fill="none" stroke="#ef4444" strokeWidth="2.5" />
        </svg>
      );

    case 'cave':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          {/* Mountain rock */}
          <polygon points="50,22 15,85 85,85" fill={color} />
          {/* Dark cavern mouth */}
          <path d="M 38 85 A 12 18 0 0 1 62 85 Z" fill="#0f172a" />
        </svg>
      );

    case 'dragon':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <path
            d="M 20 65 Q 35 40 50 50 Q 65 30 80 40 Q 60 55 55 70 Q 35 75 20 65 Z"
            fill={color}
          />
          <polygon points="45,50 65,15 58,48 85,32 55,56" fill={color} />
          <circle cx="24" cy="62" r="2" fill="#fffdf9" />
        </svg>
      );

    case 'serpent':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <path
            d="M 15 65 Q 28 45 40 65 T 65 65 T 90 65"
            stroke={color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="85,60 98,62 88,72" fill={color} />
          <circle cx="92" cy="64" r="1.5" fill="#fffdf9" />
        </svg>
      );

    case 'ship':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          {/* Hull */}
          <path d="M 18 68 Q 50 78 82 68 L 76 82 Q 50 88 24 82 Z" fill={color} />
          {/* Masts */}
          <line x1="38" y1="30" x2="38" y2="70" stroke={color} strokeWidth="3" />
          <line x1="56" y1="20" x2="56" y2="70" stroke={color} strokeWidth="3" />
          {/* Sails */}
          <path d="M 38 34 Q 48 42 38 52 Z" fill={color} opacity="0.9" />
          <path d="M 56 24 Q 70 34 56 46 Z" fill={color} opacity="0.9" />
          <path d="M 56 48 Q 68 56 56 65 Z" fill={color} opacity="0.9" />
        </svg>
      );

    case 'monolith':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="44,20 56,16 60,82 40,82" fill={color} />
          <line x1="50" y1="30" x2="50" y2="70" stroke="#fffdf9" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    case 'campfire':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          {/* Logs */}
          <line x1="25" y1="80" x2="75" y2="68" stroke={color} strokeWidth="6" strokeLinecap="round" />
          <line x1="25" y1="68" x2="75" y2="80" stroke={color} strokeWidth="6" strokeLinecap="round" />
          {/* Flame */}
          <path d="M 50 25 Q 65 55 50 65 Q 35 55 50 25 Z" fill="#d97706" />
          <path d="M 50 40 Q 58 55 50 62 Q 42 55 50 40 Z" fill="#fef08a" />
        </svg>
      );

    case 'compass':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="2.5" />
          <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
          {/* Points */}
          <polygon points="50,14 55,50 50,45 45,50" fill={color} />
          <polygon points="50,86 55,50 50,55 45,50" fill={color} opacity="0.6" />
          <polygon points="86,50 50,55 55,50 50,45" fill={color} opacity="0.6" />
          <polygon points="14,50 50,55 45,50 50,45" fill={color} opacity="0.6" />
          <text x="50" y="10" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color} fontFamily="Cinzel, serif">
            N
          </text>
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};
