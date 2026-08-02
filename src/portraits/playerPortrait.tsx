import type { CSSProperties } from 'react'

interface PlayerPortraitProps {
  initials: string
  accent: string
  shirt?: string | number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  pose?: 'front' | 'three-quarter'
  className?: string
  style?: CSSProperties
}

/**
 * Layered SVG portrait: pitch background, shoulders silhouette, head outline,
 * ear + shadow, shirt number. Designed as a stylized "3D-style" placeholder
 * for EA FC 27-style portraits without bundled headshot assets.
 */
export function PlayerPortrait({ initials, accent, shirt, size = 'lg', pose = 'front', className, style }: PlayerPortraitProps) {
  const dims = sizeMap[size]
  const tilt = pose === 'three-quarter' ? -6 : 0
  return (
    <svg
      viewBox="0 0 320 360"
      width={dims.w}
      height={dims.h}
      className={`player-portrait ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`pg-${initials}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#04161a" stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`ps-${initials}`} x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={`pn-${initials}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#002a30" />
        </linearGradient>
      </defs>

      <rect width="320" height="360" rx="14" fill={`url(#pg-${initials})`} />

      {/* Pitch-base reflection */}
      <g opacity="0.18">
        <rect x="0" y="260" width="320" height="100" fill={`url(#ps-${initials})`} />
        <rect x="20" y="270" width="280" height="3" fill="rgba(255,255,255,0.4)" />
        <circle cx="160" cy="290" r="30" fill="none" stroke="rgba(255,255,255,0.4)" />
      </g>

      {/* Shoulders silhouette */}
      <g transform={`rotate(${tilt} 160 220)`}>
        <path d="M40 360 Q90 240 160 230 Q230 240 280 360 Z" fill="rgba(0,0,0,0.55)" />
        <path d="M50 360 Q100 250 160 240 Q220 250 270 360 Z" fill={`url(#pn-${initials})`} />
      </g>

      {/* Head */}
      <g transform={`rotate(${tilt} 160 160)`}>
        <ellipse cx="160" cy="135" rx="68" ry="80" fill="#0c2c33" />
        <ellipse cx="160" cy="130" rx="62" ry="74" fill="rgba(255,255,255,0.04)" />
        {/* Highlight */}
        <ellipse cx="138" cy="105" rx="22" ry="30" fill="rgba(255,255,255,0.06)" />
        {/* Hair area */}
        <path d="M95 120 Q160 60 225 115 Q220 95 195 88 Q160 75 125 90 Q105 100 95 120 Z" fill="rgba(0,0,0,0.5)" />
        {/* Ear */}
        <ellipse cx="98" cy="150" rx="8" ry="14" fill="rgba(0,0,0,0.5)" />
        <ellipse cx="222" cy="150" rx="8" ry="14" fill="rgba(0,0,0,0.5)" />
        {/* Neck shadow */}
        <rect x="138" y="200" width="44" height="22" fill="rgba(0,0,0,0.55)" />
      </g>

      {/* Subscriber accent dot on cheek */}
      <circle cx="196" cy="155" r="3" fill={accent} />

      {/* Initials watermark */}
      <text
        x="160"
        y="170"
        textAnchor="middle"
        fontFamily="Inter"
        fontWeight="800"
        fontSize="84"
        fill="rgba(255,255,255,0.18)"
        style={{ letterSpacing: '-0.02em' }}
      >
        {initials}
      </text>

      {/* Shirt number */}
      {shirt !== undefined && (
        <text
          x="160"
          y="330"
          textAnchor="middle"
          fontFamily="Inter"
          fontWeight="900"
          fontSize="76"
          fill="#00d4ff"
          style={{ letterSpacing: '-0.04em' }}
        >
          {shirt}
        </text>
      )}
    </svg>
  )
}

const sizeMap = {
  sm: { w: 96, h: 108 },
  md: { w: 144, h: 162 },
  lg: { w: 220, h: 248 },
  xl: { w: 320, h: 360 },
}
