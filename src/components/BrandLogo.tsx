import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 28, className = 'brand-logo' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      style={{ display: 'block', flexShrink: 0, borderRadius: '6px' }}
      aria-label="Storyboard"
    >
      <rect width="512" height="512" rx="104" fill="#A3B597" />
      {/* Sparkle */}
      <path
        d="M356 96 C361 124 374 137 402 142 C374 147 361 160 356 188 C351 160 338 147 310 142 C338 137 351 124 356 96 Z"
        fill="#FBF9F3"
      />
      {/* Book base & pages */}
      <path
        d="M256 322 C196 296 116 296 80 314 L80 388 C116 370 196 370 256 396 C316 370 396 370 432 388 L432 314 C396 296 316 296 256 322 Z"
        fill="#7E9070"
      />
      <path
        d="M250 314 C205 292 132 292 98 308 L98 370 C132 356 205 356 250 376 Z"
        fill="#F3EEE3"
      />
      <path
        d="M262 314 C307 292 380 292 414 308 L414 370 C380 356 307 356 262 376 Z"
        fill="#FBF8F1"
      />
      <g stroke="#CCC5B3" strokeWidth="4" strokeLinecap="round" opacity="0.7">
        <line x1="126" y1="320" x2="228" y2="328" />
        <line x1="122" y1="338" x2="226" y2="346" />
      </g>
      {/* Ink flourish */}
      <path
        d="M292 344 C 284 363 313 369 331 355 C 347 344 367 345 381 355"
        fill="none"
        stroke="#4A3D2E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Quill Pen */}
      <line x1="408" y1="118" x2="322" y2="300" stroke="#322A21" strokeWidth="30" strokeLinecap="round" />
      <line x1="408" y1="118" x2="372" y2="194" stroke="#231C15" strokeWidth="30" strokeLinecap="round" />
      <path d="M334 305 L309 294 L300 337 Z" fill="#3B3129" />
      <line x1="300" y1="337" x2="321" y2="299" stroke="#A3B597" strokeWidth="3.5" />
      <circle cx="318" cy="307" r="4.5" fill="#A3B597" />
    </svg>
  );
};
