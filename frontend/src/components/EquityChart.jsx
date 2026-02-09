import React from 'react'
function scalePoints(data, width, height) {
  if (!data.length) return []
  const xs = data.map((d) => d.t || Date.now())
  const ys = data.map((d) => d.equity)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return data.map((d) => {
    const x = ((d.t - minX) / Math.max(1, maxX - minX)) * width
    const y = height - ((d.equity - minY) / Math.max(1, maxY - minY)) * height
    return [x, y]
  })
}

export default function EquityChart({ data }) {
  const width = 800
  const height = 240
  const pts = scalePoints(data, width, height)
  const d = pts.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <polyline points={d} fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
    </svg>
  )
}
