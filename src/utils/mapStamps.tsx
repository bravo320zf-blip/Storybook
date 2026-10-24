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
          {/* Roofs and buildings */}
          <polygon points="15,60 25,40 35,60" fill={color} />
          <rect x="18" y="60" width="14" height="30" fill={color} />
          <polygon points="35,50 48,25 61,50" fill={color} />
          <rect x="38" y="50" width="20" height="40" fill={color} />
          <polygon points="62,55 75,35 88,55" fill={color} />
          <rect x="66" y="55" width="18" height="35" fill={color} />
          {/* Wall */}
          <rect x="10" y="78" width="80" height="14" fill={color} opacity="0.8" />
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
          {/* Signboard */}
          <line x1="75" y1="46" x2="88" y2="46" stroke={color} strokeWidth="3" />
          <rect x="80" y="48" width="10" height="12" fill={color} />
        </svg>
      );

    case 'mountain':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <polygon points="50,20 15,85 85,85" fill={color} />
          <polygon points="50,20 38,45 50,42 62,45" fill="#fffdf9" opacity="0.8" />
          <polygon points="70,40 45,90 95,90" fill={color} opacity="0.9" />
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

    case 'dragon':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <path
            d="M 20 65 Q 35 40 50 50 Q 65 30 80 40 Q 60 55 55 70 Q 35 75 20 65 Z"
            fill={color}
          />
          {/* Wing */}
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
          {/* Head */}
          <polygon points="85,60 98,62 88,72" fill={color} />
        </svg>
      );

    case 'compass':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="3" />
          <polygon points="50,15 56,50 50,45 44,50" fill={color} />
          <polygon points="50,85 56,50 50,55 44,50" fill={color} opacity="0.6" />
          <polygon points="85,50 50,56 55,50 50,44" fill={color} opacity="0.6" />
          <polygon points="15,50 50,56 45,50 50,44" fill={color} opacity="0.6" />
          <text x="50" y="11" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
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
