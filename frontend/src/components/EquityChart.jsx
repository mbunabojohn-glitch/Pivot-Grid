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
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
      <div style={{ marginBottom: 8 }}>Growth Curve</div>
      <svg width={width} height={height}>
        <polyline points={d} fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
    </div>
  )
}
