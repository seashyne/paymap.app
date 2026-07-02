// payMap logo component — uses the official SVG mark
export function LogoIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  const s = Math.round(size / 4)   // each square size
  const g = Math.round(s * 0.375)  // gap between squares
  const total = s * 3 + g * 2
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} xmlns="http://www.w3.org/2000/svg" className={className} aria-label="payMap logo" role="img">
      {[0,1,2].map(row =>
        [0,1,2].map(col => {
          const isCenter = row === 1 && col === 1
          return (
            <rect
              key={`${row}-${col}`}
              x={col * (s + g)}
              y={row * (s + g)}
              width={s}
              height={s}
              fill={isCenter ? "currentColor" : "#2563eb"}
            />
          )
        })
      )}
    </svg>
  )
}

export function LogoFull({ height = 28, className = "" }: { height?: number; className?: string }) {
  const s = Math.round(height * 0.3)    // square size
  const g = Math.round(s * 0.4)         // gap
  const iconW = s * 3 + g * 2
  const iconH = iconW
  const totalH = iconH
  // position text so it's vertically centered
  const textY = iconH * 0.72
  const fontSize = Math.round(iconH * 0.58)
  return (
    <svg
      width={iconW + fontSize * 4.2}
      height={totalH}
      viewBox={`0 0 ${iconW + fontSize * 4.2} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="payMap logo"
      role="img"
    >
      {[0,1,2].map(row =>
        [0,1,2].map(col => {
          const isCenter = row === 1 && col === 1
          const isOuter = !(row === 1 && col === 1)
          return (
            <rect
              key={`${row}-${col}`}
              x={col * (s + g)}
              y={row * (s + g)}
              width={s}
              height={s}
              fill={isOuter ? "#2563eb" : "currentColor"}
            />
          )
        })
      )}
      {/* Wordmark */}
      <text
        x={iconW + Math.round(s * 0.7)}
        y={textY}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={fontSize}
        fontWeight="800"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        payMap
      </text>
    </svg>
  )
}

export default LogoIcon
